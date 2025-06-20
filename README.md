# miniprogram-visual-test

A visual regression testing tool for WeChat Mini Programs, inspired by [cypress-plugin-visual-regression-diff](https://github.com/FRSOURCE/cypress-plugin-visual-regression-diff). It helps you automate UI screenshot comparisons to catch visual changes and regressions in your miniprogram projects. Supports both Jest and Vitest.

---

## Features
- Automated screenshot capture for miniprogram custom components
- Pixel-by-pixel image diffing with threshold configuration
- Integrates with Vitest and Jest
- Forwards wx.request to anywhere you want
- Easy to extend and customize

## Installation

Install with npm:

```bash
npm install @devecorsoft/miniprogram-visual-test miniprogram-automator --save-dev
```

Or with yarn:

```bash
yarn add -D @devecorsoft/miniprogram-visual-test miniprogram-automator
```

Note that please make sure you have [wechat miniprogram devtool](https://developers.weixin.qq.com/miniprogram/dev/devtools/devtools.html) installed. 

## Usage

### Get started with Jest

1. Enable matcher in `jest.config.js`:

```js
// jest.config.js
module.exports = {
  // ...existing config
  setupFilesAfterEnv: [
    // ...other setup files
    '@devecorsoft/miniprogram-visual-test/jest-matcher',
  ],
};
```

2. load test component and match screenshots

```ts
import { launchDevTool, loadTestComponent } from "../src/devTool/launcher.ts";
import type MiniProgram from "miniprogram-automator/out/MiniProgram";
import * as path from "path";

describe('screenshot', () => {
  let miniProgram: MiniProgram

  afterEach(() => miniProgram.close())

  it('should able to take screenshot for first running', async () => {
    const testProjectPath = path.resolve('.')
    loadTestComponent(
      path.resolve('test/test-component-js/test-component'),
      testProjectPath,
      {
        template: '<test-component title="visual" count="12"/>',
        includes: ['miniprogram_npm', 'styles', 'commonDeps']
      }
    )
    const devTool = await launchDevTool(appId, {forwardRequestTo: 'http://localhost:8080/path'})
    miniProgram = devTool.miniProgram
    
    const view = await devTool.page.$("view")
    await expect(view!.text()).resolves.toBe('js component')
    
    await expect(miniProgram).toMatchScreenshot({maxDiffThreshold: 0})
  })
})
```

Note that: see [tests](https://github.com/DevecorSoft/miniprogram-visual-test/tree/main/test) for all the usages.

## Contributing

Contributions are welcome! Please open issues or pull requests for bug fixes, features, or documentation improvements.

## License

This project is licensed under the MIT License.
