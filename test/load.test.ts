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
    loadTestComponent(
      path.resolve('test/test-component-js/test-component'),
      __dirname
    )
    const devTool = await launchDevTool(appId);
    miniProgram = devTool.miniProgram

    const view = await devTool.page.$("view");
    await expect(view!.text()).resolves.toBe('js component')
  }, {timeout: 60000})

  it('should able to load ts test component', async () => {
    loadTestComponent(
      path.resolve('test/test-component-ts/test-component'),
      __dirname
    )
    const devTool = await launchDevTool(appId);
    miniProgram = devTool.miniProgram

    const view = await devTool.page.$("view");
    await expect(view!.text()).resolves.toBe('ts component')
  }, {timeout: 60000})

  it('should able to load ts test component with properties', async () => {
    loadTestComponent(
      path.resolve('test/test-component-ts-with-properties/test-component'),
      __dirname,
      {template: '<test-component title="visual" count="12"/>'}
    )
    const devTool = await launchDevTool(appId);
    miniProgram = devTool.miniProgram

    const view = await devTool.page.$('.component--properties')
    await expect(view!.text()).resolves.toBe('title: visual and count: 12')
  }, {timeout: 60000})

  it('should able to load ts test component with dependency', async () => {
    loadTestComponent(
      path.resolve('test/test-component-ts-with-dependency/test-component'),
      __dirname,
      {includes: [path.resolve('test/testdeps')]}
    )
    const devTool = await launchDevTool(appId);
    miniProgram = devTool.miniProgram

    const view = await devTool.page.$('view')
    await expect(view!.text()).resolves.toBe('the dependency')
  }, {timeout: 60000})

  it('should able to load ts test component from a complex project', async () => {
    loadTestComponent(
      path.resolve('test/testComplexProject/test-component-ts-with-dependency/test-component'),
      path.resolve('test/testComplexProject'),
      {
        includes: [path.resolve('test/testComplexProject/projectdeps')]
      }
    )
    const devTool = await launchDevTool(appId);
    miniProgram = devTool.miniProgram

    const view = await devTool.page.$('view')
    await expect(view!.text()).resolves.toBe('the project dependency')
  }, {timeout: 60000})

  it('should able to load ts test component from a complex project and stub dependency', async () => {
    loadTestComponent(
      path.resolve('test/testComplexProject/test-component-ts-with-dependency/test-component'),
      path.resolve('test/testComplexProject'),
      {
        includes: [path.resolve('test/testComplexProject/projectdeps')],
        stubs: {
          [path.resolve('test/testComplexProject/projectdeps/dependency.ts')]: "export const dependency = 'the stubbed project dependency'"
        }
      }
    )
    const devTool = await launchDevTool(appId);
    miniProgram = devTool.miniProgram

    const view = await devTool.page.$('view')
    await expect(view!.text()).resolves.toBe('the stubbed project dependency')
  }, {timeout: 60000})
})
