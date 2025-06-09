import { expect } from 'vitest'
import type { AsyncExpectationResult } from "@vitest/expect";
import 'vitest'
import type MiniProgram from "miniprogram-automator/out/MiniProgram";
import * as path from "node:path";
import sanitize from 'sanitize-filename'
import fs from "fs";

export const generateScreenshotPath = (
  testName: string,
  specPath: string
) => {
  const imageSnapshotsDir = path.join(
    path.dirname(specPath),
    "__image_snapshots__",
  )
  const screenshotPath = path.join(
    imageSnapshotsDir,
    sanitize(testName),
  )

  return {
    base: imageSnapshotsDir,
    expect: screenshotPath + '.png',
    actual: screenshotPath + '.actual.png',
    diff: screenshotPath + '.diff.png',
  }
};

expect.extend({
  toMatchScreenshot: async function (miniProgram: MiniProgram, config: {}): AsyncExpectationResult {
    const testName = this.currentTestName!
    const testPath = this.testPath!

    const screenshotPaths = generateScreenshotPath(testName, testPath)
    if (!fs.existsSync(screenshotPaths.base)) {
      fs.mkdirSync(screenshotPaths.base)
    }

    if (!fs.existsSync(screenshotPaths.expect)) {
      await miniProgram.screenshot({path: screenshotPaths.expect});
      return {
        pass: true,
        message: () => ""
      }
    }

    return {
      pass: false,
      message: () => "not good"
    }
  }
})


interface CustomMatchers<R> {
  toMatchScreenshot: (config: {}) => Promise<R>
}

declare module 'vitest' {
  interface Matchers<T = any> extends CustomMatchers<T> {
  }
}
