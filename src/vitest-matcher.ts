import 'vitest'
import { expect } from 'vitest'
import { matchScreenshot, type CustomMatchers } from "./screenshot-macher.ts";

expect.extend({
  toMatchScreenshot: matchScreenshot
})

declare module 'vitest' {
  interface Matchers<T = any> extends CustomMatchers<T> {
  }
}
