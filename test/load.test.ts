import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import * as process from "process";
import { launchDevTool, loadTestComponent } from "../src/devTool/launcher.ts";
import * as path from "path";
import type MiniProgram from "miniprogram-automator/out/MiniProgram";
import { WireMockRestClient } from 'wiremock-rest-client';
import { GenericContainer, type StartedTestContainer } from "testcontainers";

const appId = process.env.APP_ID!

describe('load', () => {
  let miniProgram: MiniProgram
  let container: StartedTestContainer

  beforeAll(async () => {
    container = await new GenericContainer("wiremock/wiremock:3.13.1")
      .withExposedPorts(8080)
      .start()
  })
  afterEach(() => miniProgram.close())

  afterAll(() => {
    container.stop()
  })

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

  it('should able to forward request', async () => {
    const wireMock = new WireMockRestClient(`http://localhost:${container.getMappedPort(8080)}`);
    await wireMock.mappings.createMapping({
      name: 'get example',
      request: {
        urlPath: '/path/to/example',
        method: 'GET'
      },
      response: {
        status: 200,
        body: 'response from request'
      }
    })
    loadTestComponent(
      path.resolve('test/test-component-request/test-component'),
      __dirname
    )
    const devTool = await launchDevTool(appId, { forwardRequestTo: `http://localhost:${container.getMappedPort(8080)}` });
    miniProgram = devTool.miniProgram

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        wireMock.requests.getCount({
          url: '/path/to/example',
          method: 'GET'
        }).then((data) => {
          console.info('timeout:', data)
        }).catch((error) => {
          console.error('timeout:', error)
          reject()
        })
      }, 1000);
      const interval = setInterval(() => {
        wireMock.requests.getCount({
          url: '/path/to/example',
          method: 'GET'
        }).then((data) => {
          console.info('interval:', data)
          clearTimeout(timeout)
          if (data.count > 0) {
            clearInterval(interval)
            resolve()
          }
        }).catch((error) => {
          console.error('interval:', error)
        })
      }, 100)
    })
    const view = await devTool.page.$("view");
    await expect(view!.text()).resolves.toBe('response from request')
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
