import fs from 'fs'

await Bun.build({
  entrypoints: ['./src/vitest-matcher.ts', './src/jest-matcher.ts', './src/index.ts'],
  outdir: './dist',
  target: 'node',
  format: 'cjs',
  sourcemap: 'external',
  external: ['vitest', 'miniprogram-automator'],
});

fs.cpSync("./src/devTool/miniprogramProject", "./dist/devTool/", {recursive: true})
