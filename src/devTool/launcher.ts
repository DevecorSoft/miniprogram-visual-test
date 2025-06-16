import * as path from "path";
import MiniProgram from "miniprogram-automator/out/MiniProgram";
import Page from "miniprogram-automator/out/Page";

import fs from "fs";
import automator = require("miniprogram-automator");
import { projectPath } from "./loadTestComponent";
export { loadTestComponent } from './loadTestComponent';
import 'miniprogram-api-typings'

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
    "urlCheck": false
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

export async function launchDevTool(
  appId: string,
  options?: {
    forwardRequestTo?: string
  }): Promise<{ miniProgram: MiniProgram, page: Page }> {
  configureProject(appId)
  const miniProgram = await automator.launch({
    projectPath,
    trustProject: true
  });

  if (options?.forwardRequestTo != null) {
    const forwardRequestTo = options.forwardRequestTo
    await miniProgram.mockWxMethod(
      'request',
      function (requestOption: WechatMiniprogram.RequestOption, forwardRequestTo: string) {
        const forwardUrl = new URL(forwardRequestTo)
        const originUrl = new URL(requestOption.url)
        originUrl.protocol = forwardUrl.protocol
        originUrl.host = forwardUrl.host
        originUrl.pathname = forwardUrl.pathname === '/'
          ? originUrl.pathname
          : (forwardUrl.pathname + originUrl.pathname)
        requestOption.url = originUrl.href

        return new Promise((resolve, reject) => {
          requestOption.success = res => resolve(res)
          requestOption.fail = err => reject(err)
          // @ts-ignore
          this.origin(requestOption)
        })
      },
      forwardRequestTo,
    )
    await miniProgram.reLaunch("/pages/index/index")
  }

  return {miniProgram, page: (await miniProgram.currentPage())!!}
}
