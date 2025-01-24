import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

import { globSync } from 'glob';
import path from 'node:path';

const cssFiles = Object.fromEntries(
  globSync('client/**/*.css').map((file) => [
    path.relative('', file.slice(0, file.length - path.extname(file).length)),
    fileURLToPath(new URL(file, import.meta.url)),
  ])
);

const tsFiles = Object.fromEntries(
  globSync('client/**/*.ts').map((file) => [
    path.relative('', file.slice(0, file.length - path.extname(file).length)),
    fileURLToPath(new URL(file, import.meta.url)),
  ])
);
const htmlFiles = Object.fromEntries(
  globSync('client/**/*.html').map((file) => [
    path.relative('', file.slice(0, file.length - path.extname(file).length)),
    fileURLToPath(new URL(file, import.meta.url)),
  ])
);

// const serverTsFiles = Object.fromEntries(
//   globSync('server/**/*.ts').map((file) => [
//     path.relative('', file.slice(0, file.length - path.extname(file).length)),
//     fileURLToPath(new URL(file, import.meta.url)),
//   ])
// );

const inputObject = { ...cssFiles, ...tsFiles, ...htmlFiles };

// const __dirname = dirname(fileURLToPath(import.meta.url))
export default defineConfig({
  plugins: [nodePolyfills()],
  build: {
    minify: false,
    outDir: 'dist',
    assetsDir: '',
    rollupOptions: {
      input: inputObject,
      output: {
        // format: 'es',
        // dir: 'dist'
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
    },
  },
});
