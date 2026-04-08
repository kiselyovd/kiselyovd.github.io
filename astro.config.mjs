import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://kiselyovd.github.io',
  integrations: [tailwind()],
});
