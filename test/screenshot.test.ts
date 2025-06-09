import { describe, it, expect, afterEach } from 'vitest'
import * as process from "process";
import { launchDevTool, loadTestComponent } from "../src/devTool/launcher.ts";
import * as path from "path";
import type MiniProgram from "miniprogram-automator/out/MiniProgram";
import fs from "fs";

const appId = process.env.APP_ID!

describe('load', () => {
  let miniProgram: MiniProgram

  afterEach(() => miniProgram.close())

  it('should able to take screenshot for first running', async () => {
    const expectedImagePath = "test/__image_snapshots__/load  should able to take screenshot for first running.png";
    fs.rmSync(path.dirname(expectedImagePath), {recursive: true})

    loadTestComponent(path.resolve('test/test-component-js/test-component'))
    const devTool = await launchDevTool(appId);
    miniProgram = devTool.miniProgram

    const view = await devTool.page.$("view");
    await expect(view!.text()).resolves.toBe('js component')

    await expect(miniProgram).toMatchScreenshot({})
    expect(fs.existsSync(expectedImagePath)).toEqual(true)
  }, {timeout: 60000})
})
