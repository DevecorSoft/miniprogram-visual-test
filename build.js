const fs = require('fs')
const esbuild = require('esbuild')

esbuild.build({
  entryPoints: [
    './src/vitest-matcher.ts',
    './src/jest-matcher.ts',
    './src/index.ts',
    './src/devTool/launcher.ts'
  ],
  bundle: true,
  outdir: './dist',
  platform: 'node',
  format: 'cjs',
  sourcemap: 'external',
  external: ['vitest', 'miniprogram-automator'],
});

fs.cpSync("./src/devTool/miniprogramProject", "./dist/devTool/miniprogramProject", {recursive: true})
fs.cpSync('LICENSE', './dist/LICENSE')
fs.cpSync('package.json', './dist/package.json')
fs.cpSync('README.md', './dist/README.md')
fs.cpSync('.npmrc', './dist/.npmrc')
