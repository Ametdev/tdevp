import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://tdevp.ru',
  base: '/',
  output: 'static',
  integrations: [
    tailwind(),
    // sitemap() - временно отключен из-за ошибки, будет добавлен позже
  ],
  vite: {
    ssr: {
      noExternal: ['@astrojs/check']
    }
  }
});
