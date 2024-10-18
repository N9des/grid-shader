import glsl from 'vite-plugin-glsl';
import {glslify} from 'vite-plugin-glslify'
import { defineConfig } from 'vite';

export default defineConfig({
	root: 'src/',
    publicDir: '../static/',
    base: "/grid-shader/",
    server: {
        host: true,
    },
    build: {
      outDir: '../dist',
      emptyOutDir: true,
      sourcemap: true
    },
    plugins: [
      glslify()
    ]
});
