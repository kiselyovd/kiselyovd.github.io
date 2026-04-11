import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://kiselyovd.github.io',
  vite: {
    plugins: [tailwindcss()],
  },
});
