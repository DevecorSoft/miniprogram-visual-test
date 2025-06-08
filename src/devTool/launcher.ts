import * as path from "path";
import automator = require("miniprogram-automator");
import fs from "fs";
import MiniProgram from ".store/miniprogram-automator-npm-0.12.1-42a39423ce/package/out/MiniProgram";
import Page from ".store/miniprogram-automator-npm-0.12.1-42a39423ce/package/out/Page";

const config = {
  "libVersion": "3.7.12",
  "projectname": "miniprogramProject",
  "setting": {
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
    "useCompilerPlugins": false
  },
  "compileType": "miniprogram",
  "simulatorPluginLibVersion": {},
  "packOptions": {
    "ignore": [],
    "include": []
  },
  "editorSetting": {}
}

const configureProject = (appId: string): string => {
  const projectPath = path.resolve(__dirname, './miniprogramProject');
  fs.writeFileSync(
    path.join(projectPath, 'project.config.json'),
    JSON.stringify({...config, appId}, null, 2)
  )
  return projectPath
}

export async function launch(appId: string): Promise<{ miniProgram: MiniProgram, page: Page }> {
  const miniProgram = await automator.launch({
    projectPath: configureProject(appId),
  });
  const page = (await miniProgram.reLaunch("/pages/index/index"))!;

  return {miniProgram, page}
}
