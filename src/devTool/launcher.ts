import * as path from "path";
import MiniProgram from "miniprogram-automator/out/MiniProgram";
import Page from "miniprogram-automator/out/Page";
import automator = require("miniprogram-automator");

import fs from "fs";

const config = {
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
    JSON.stringify({...config, appid: appId}, null, 2)
  )
}

function copy(testProjectPath: string, src: string) {
  const relative = path.relative(testProjectPath, src)
  const dest = path.join(projectPath, relative);
  fs.mkdirSync(dest, {recursive: true})
  fs.cpSync(src, dest, {recursive: true})
  return dest;
}

export function loadTestComponent(
  testComponentPath: string,
  testProjectPath: string,
  options?: {
    template?: string,
    includes?: string[]
  }
) {
  const basename = path.basename(testComponentPath)
  const dest = copy(testProjectPath, path.dirname(testComponentPath));

  if (options?.includes != null) {
    options.includes.forEach((path) => {
      copy(testProjectPath, path)
    })
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
