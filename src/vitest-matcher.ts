import { expect } from 'vitest'
import type { AsyncExpectationResult } from "@vitest/expect";
import 'vitest'
import type MiniProgram from "miniprogram-automator/out/MiniProgram";
import * as path from "node:path";
import sanitize from 'sanitize-filename'
import fs from "fs"
import { PNG, type PNGWithMetadata } from 'pngjs'
import pixelmatch from 'pixelmatch'

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

export const createImageResizer =
  (width: number, height: number) => (source: PNG) => {
    const resized = new PNG({width, height, fill: true});
    PNG.bitblt(source, resized, 0, 0, source.width, source.height, 0, 0);
    return resized;
  }

const inArea = (x: number, y: number, height: number, width: number) =>
  y > height || x > width;

export const fillSizeDifference = (
  image: PNG,
  width: number,
  height: number,
) => {
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      if (inArea(x, y, height, width)) {
        const idx = (image.width * y + x) << 2;
        image.data[idx] = 0;
        image.data[idx + 1] = 0;
        image.data[idx + 2] = 0;
        image.data[idx + 3] = 64;
      }
    }
  }
  return image;
}

export const alignImagesToSameSize = (
  firstImage: PNGWithMetadata,
  secondImage: PNGWithMetadata,
): [PNG, PNG] => {
  const firstImageWidth = firstImage.width;
  const firstImageHeight = firstImage.height;
  const secondImageWidth = secondImage.width;
  const secondImageHeight = secondImage.height;

  const resizeToSameSize = createImageResizer(
    Math.max(firstImageWidth, secondImageWidth),
    Math.max(firstImageHeight, secondImageHeight),
  );

  const resizedFirst = resizeToSameSize(firstImage);
  const resizedSecond = resizeToSameSize(secondImage);

  return [
    fillSizeDifference(resizedFirst, firstImageWidth, firstImageHeight),
    fillSizeDifference(resizedSecond, secondImageWidth, secondImageHeight),
  ];
};


expect.extend({
  toMatchScreenshot: async function (miniProgram: MiniProgram, config: {
    maxDiffThreshold: number
  }): AsyncExpectationResult {
    const testName = this.currentTestName!
    const testPath = this.testPath!

    const screenshotPaths = generateScreenshotPath(testName, testPath)
    if (!fs.existsSync(screenshotPaths.base)) {
      fs.mkdirSync(screenshotPaths.base)
    }

    if (fs.existsSync(screenshotPaths.expect)) {
      await miniProgram.screenshot({path: screenshotPaths.actual})

      const rawImgOldBuffer = fs.readFileSync(screenshotPaths.expect)
      const rawImgNewBuffer = fs.readFileSync(screenshotPaths.actual)
      const rawImgNew = PNG.sync.read(rawImgNewBuffer)
      const rawImgOld = PNG.sync.read(rawImgOldBuffer);
      const isImgSizeDifferent =
        rawImgNew.height !== rawImgOld.height ||
        rawImgNew.width !== rawImgOld.width;

      if (isImgSizeDifferent) {
        console.warn(`Warning: Images size mismatch - new screenshot is ${rawImgNew.width}px by ${rawImgNew.height}px while old one is ${rawImgOld.width}px by ${rawImgOld.height} (width x height).`)
      }

      const [imgNew, imgOld] = isImgSizeDifferent
        ? alignImagesToSameSize(rawImgNew, rawImgOld)
        : [rawImgNew, rawImgOld];
      const {width, height} = imgNew;
      const diff = new PNG({width, height});

      const diffPixels = pixelmatch(
        imgNew.data,
        imgOld.data,
        diff.data,
        width,
        height,
        {
          includeAA: true,
          threshold: 0,
        },
      );
      const imgDiff = diffPixels / (width * height);

      if (imgDiff > config.maxDiffThreshold) {
        const diffBuffer = PNG.sync.write(diff);
        fs.writeFileSync(
          screenshotPaths.diff,
          diffBuffer
        )
        return {
          pass: false,
          message: () => `Image diff factor (${imgDiff}%) is bigger than maximum threshold option ${config.maxDiffThreshold}.`
        }
      }

      fs.rmSync(screenshotPaths.actual)
    } else {
      await miniProgram.screenshot({path: screenshotPaths.expect});
    }

    return {
      pass: true,
      message: () => ""
    }
  }
})


interface CustomMatchers<R> {
  toMatchScreenshot: (config: {
    maxDiffThreshold: number
  }) => Promise<R>
}

declare module 'vitest' {
  interface Matchers<T = any> extends CustomMatchers<T> {
  }
}
