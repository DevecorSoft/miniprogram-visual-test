import * as path from "path";
import MiniProgram from "miniprogram-automator/out/MiniProgram";
import Page from "miniprogram-automator/out/Page";

import fs from "fs";
import automator = require("miniprogram-automator");

const projectConfig = {
  "libVersion": "3.7.12",
  "projectname": "miniprogramProject",
  "setting": {
    "useCompilerPlugins": [
      "typescript"
    ],
    "es6": true,
    "postcss": true,
    "minified": true,
    "uglifyFileName": false,
    "enhance": true,
    "packNpmRelationList": [],
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    },
  },
  "compileType": "miniprogram",
  "simulatorPluginLibVersion": {},
  "packOptions": {
    "ignore": [],
    "include": []
  },
  "editorSetting": {}
}

const projectPath = path.resolve(__dirname, './miniprogramProject');

const configureProject = (appId: string): void => {
  fs.writeFileSync(
    path.join(projectPath, 'project.config.json'),
    JSON.stringify({...projectConfig, appid: appId}, null, 2)
  )
}

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

export function loadTestComponent(
  testComponentPath: string,
  testProjectPath: string,
  options?: {
    template?: string,
    includes?: string[],
    stubs?: Record<string, string>
  }
) {
  const basename = path.basename(testComponentPath)
  const dest = loadIncludeFiles(testProjectPath, path.dirname(testComponentPath));

  if (options?.includes != null) {
    options.includes.forEach((path) => {
      loadIncludeFiles(testProjectPath, path)
    })
  }
  if(options?.stubs != null) {
    Object.keys(options.stubs).forEach((path) => {
      replaceFile(testProjectPath, path, options.stubs![path]!)
    })
  }

  loadTestConfigFile(testProjectPath, 'tsconfig.json')
  loadTestConfigFile(testProjectPath, 'app.wxss')

  const testAppJsonFilePath = path.join(testProjectPath, 'app.json')
  const appJsonFilePath = path.join(projectPath, 'app.json')
  if(fs.existsSync(testAppJsonFilePath)) {
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
  fs.writeFileSync(
    path.join(pagePath, 'index.wxml'),
    options?.template ?? `<${basename}/>`
  )
}

export async function launchDevTool(appId: string): Promise<{ miniProgram: MiniProgram, page: Page }> {
  configureProject(appId)
  const miniProgram = await automator.launch({
    projectPath,
  });
  const page = (await miniProgram.reLaunch("/pages/index/index"))!;

  return {miniProgram, page}
}
