import path from "path";
import fs from "fs";
import _ from "lodash";

export const projectPath = path.resolve(__dirname, './miniprogramProject');

function loadIncludeFiles(testProjectPath: string, src: string) {
  const relative = path.relative(testProjectPath, src)
  const dest = path.join(projectPath, relative);
  fs.mkdirSync(dest, {recursive: true})
  fs.cpSync(src, dest, {recursive: true})
  return dest;
}

function replaceFile(testProjectPath: string, src: string, content: string) {
  const relative = path.relative(testProjectPath, src)
  const dest = path.join(projectPath, relative);
  const destDir = path.dirname(dest)
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, {recursive: true})
  fs.writeFileSync(dest, content)
}

function loadTestConfigFile(testProjectPath: string, fileName: string) {
  const configFilePath = path.join(projectPath, fileName)
  const testConfigFilePath = path.join(testProjectPath, fileName)

  fs.copyFileSync(
    fs.existsSync(testConfigFilePath) ? testConfigFilePath : path.join(projectPath, `${fileName}.default`),
    configFilePath
  )
}

function rm(filePath: string) {
  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath)
  }
}

export type LoadOptions = {
  template?: string,
  includes?: string[],
  stubs?: Record<string, string>
}

type LoadOptionsForHandler = {
  readonly template: string | null,
  readonly includes: string[],
  readonly stubs: Record<string, string>
}

type Project = {
  readonly testComponentName: string
  readonly indexPagePath: string
  readonly testProjectPath: string
}

const optionHandlers: {[K in keyof LoadOptionsForHandler]: (option: LoadOptionsForHandler[K], project: Project) => void} = {
  template: (option, project) => {
    fs.writeFileSync(
      path.join(project.indexPagePath, 'index.wxml'),
      option ?? `<${project.testComponentName}/>`
    )
  },
  includes: (option, project) => {
    option.forEach((path) => {
      loadIncludeFiles(project.testProjectPath, path)
    })
  },
  stubs: (option, project) => {
    Object.keys(option).forEach((path) => {
      replaceFile(project.testProjectPath, path, option[path]!)
    })
  }
}

function convertToLoadOptionsForHandler(loadOptions: LoadOptions): LoadOptionsForHandler {
  return _.defaults(loadOptions, {
    template: null,
    includes: [],
    stubs: {}
  })
}

export function loadTestComponent(
  testComponentPath: string,
  testProjectPath: string,
  options?: LoadOptions
) {
  const basename = path.basename(testComponentPath)
  const dest = loadIncludeFiles(testProjectPath, path.dirname(testComponentPath));

  loadTestConfigFile(testProjectPath, 'tsconfig.json')
  loadTestConfigFile(testProjectPath, 'app.wxss')

  const testAppJsonFilePath = path.join(testProjectPath, 'app.json')
  const appJsonFilePath = path.join(projectPath, 'app.json')
  if (fs.existsSync(testAppJsonFilePath)) {
    const appJson = JSON.parse(fs.readFileSync(testAppJsonFilePath, {encoding: 'utf-8'}))
    fs.writeFileSync(appJsonFilePath, JSON.stringify({
      ...appJson,
      pages: [
        "pages/index/index",
      ]
    }, null, 2))
  } else {
    loadTestConfigFile(testProjectPath, 'app.json')
  }

  const testAppjsPath = path.join(testProjectPath, 'app.js')
  const appjsPath = path.join(projectPath, 'app.js')
  const appTsPath = path.join(projectPath, 'app.ts')
  rm(appjsPath)
  rm(appTsPath)
  if (fs.existsSync(testAppjsPath)) {
    loadTestConfigFile(testProjectPath, 'app.js')
  } else {
    loadTestConfigFile(testProjectPath, 'app.ts')
  }

  const pagePath = path.join(projectPath, 'pages/index')
  const testComponent = {
    "usingComponents": {
      [basename]: path.relative(pagePath, path.join(dest, basename))
    }
  }

  fs.writeFileSync(
    path.join(pagePath, 'index.json'),
    JSON.stringify(testComponent, null, 2)
  )

  if (!options) {
    return
  }

  const loadOptionsForHandler = convertToLoadOptionsForHandler(options);
  const project: Project = {
    indexPagePath: path.join(projectPath, 'pages/index'),
    testComponentName: basename,
    testProjectPath: testProjectPath
  }

  _.toPairs<LoadOptionsForHandler>(loadOptionsForHandler).forEach(([key, value]) => {
    optionHandlers[key as keyof LoadOptionsForHandler](value as any, project)
  })
}
