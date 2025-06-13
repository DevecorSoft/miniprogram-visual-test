const fs = require('fs')
const esbuild = require('esbuild')

esbuild.build({
  entryPoints: ['./src/vitest-matcher.ts', './src/jest-matcher.ts', './src/index.ts'],
  bundle: true,
  outdir: './dist',
  platform: 'node',
  format: 'cjs',
  sourcemap: 'external',
  external: ['vitest', 'miniprogram-automator'],
});

fs.cpSync("./src/devTool/miniprogramProject", "./dist/devTool/", {recursive: true})
