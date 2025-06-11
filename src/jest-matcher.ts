import { type CustomMatchers, matchScreenshot } from "./screenshot-macher.ts";

// @ts-ignore
expect.extend({
  toMatchScreenshot: matchScreenshot
})

// @ts-ignore
declare module 'expect' {
  // @ts-ignore
  interface Matchers<T = any> extends CustomMatchers<T> {
  }
}
