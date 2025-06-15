import * as path from "path";
import MiniProgram from "miniprogram-automator/out/MiniProgram";
import Page from "miniprogram-automator/out/Page";

import fs from "fs";
import automator = require("miniprogram-automator");
import { projectPath } from "./loadTestComponent";
export { loadTestComponent } from './loadTestComponent';

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

const configureProject = (appId: string): void => {
  fs.writeFileSync(
    path.join(projectPath, 'project.config.json'),
    JSON.stringify({...projectConfig, appid: appId}, null, 2)
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
