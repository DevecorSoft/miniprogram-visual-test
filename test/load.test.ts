import { describe, it, expect, afterEach } from 'vitest'
import * as process from "process";
import { launchDevTool, loadTestComponent } from "../src/devTool/launcher.ts";
import * as path from "path";
import type MiniProgram from "miniprogram-automator/out/MiniProgram";

const appId = process.env.APP_ID!

describe('load', () => {
  let miniProgram: MiniProgram

  afterEach(() => miniProgram.close())

  it('should able to load js test component', async () => {
    loadTestComponent(path.resolve('test/test-component-js/test-component'))
    const devTool = await launchDevTool(appId);
    miniProgram = devTool.miniProgram

    const view = await devTool.page.$("view");
    await expect(view!.text()).resolves.toBe('js component')
  }, {timeout: 60000})

  it('should able to load ts test component', async () => {
    loadTestComponent(path.resolve('test/test-component-ts/test-component'))
    const devTool = await launchDevTool(appId);
    miniProgram = devTool.miniProgram

    const view = await devTool.page.$("view");
    await expect(view!.text()).resolves.toBe('ts component')
  }, {timeout: 60000})
})
