import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://kiselyovd.github.io',
  integrations: [tailwind({ applyBaseStyles: false })],
});
