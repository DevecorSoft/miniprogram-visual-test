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

export function loadTestComponent(testComponentPath: string, testProjectPath: string, template?: string) {
  const basename = path.basename(testComponentPath)
  const relative = path.relative(testProjectPath, path.dirname(testComponentPath))
  const dest = path.join(projectPath, relative);
  const src = path.dirname(testComponentPath)
  fs.mkdirSync(dest, {recursive: true})
  fs.cpSync(src, dest, {recursive: true})
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
    template ?? `<${basename}/>`
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
