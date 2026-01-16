import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [
    vue({
      appEntrypoint: '/src/pages/_app'
    }),
    tailwind()
  ],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': 'http://localhost:4001'
    }
  },
  output: 'static'
});