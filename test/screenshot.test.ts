import { afterEach, describe, expect, it } from 'vitest'
import * as process from "process";
import { launchDevTool, loadTestComponent } from "../src/devTool/launcher.ts";
import * as path from "path";
import type MiniProgram from "miniprogram-automator/out/MiniProgram";
import fs from "fs";

const appId = process.env.APP_ID!

describe('screenshot', () => {
  let miniProgram: MiniProgram

  afterEach(() => miniProgram.close())

  it('should able to take screenshot for first running', async () => {
    const expectedImagePath = "test/__image_snapshots__/screenshot  should able to take screenshot for first running.png";
    if (fs.existsSync(expectedImagePath)) fs.rmSync(expectedImagePath)

    loadTestComponent(path.resolve('test/test-component-js/test-component'))
    const devTool = await launchDevTool(appId)
    miniProgram = devTool.miniProgram

    const view = await devTool.page.$("view")
    await expect(view!.text()).resolves.toBe('js component')

    await expect(miniProgram).toMatchScreenshot({maxDiffThreshold: 0})
    expect(fs.existsSync(expectedImagePath)).toEqual(true)
  }, {timeout: 60000})

  it('should not pass when the diff is higher than maxDiffThreshold', async () => {
    const expectedDiffImagePath = "test/__image_snapshots__/screenshot  should not pass when the diff is higher than maxDiffThreshold.diff.png";
    const expectedActualImagePath = "test/__image_snapshots__/screenshot  should not pass when the diff is higher than maxDiffThreshold.actual.png";

    loadTestComponent(path.resolve('test/test-component-ts/test-component'))
    const devTool = await launchDevTool(appId)
    miniProgram = devTool.miniProgram

    const view = await devTool.page.$("view")
    await expect(view!.text()).resolves.toBe('ts component')

    await expect(
      expect(miniProgram).toMatchScreenshot({maxDiffThreshold: 0})
    ).rejects.toThrowError(/Image diff factor \(\d\.\d+%\) is bigger than maximum threshold option 0\./)
    expect(fs.existsSync(expectedDiffImagePath)).toEqual(true)
    expect(fs.existsSync(expectedActualImagePath)).toEqual(true)
  }, {timeout: 60000})
})
