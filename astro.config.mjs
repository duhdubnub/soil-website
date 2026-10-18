import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ site: 'https://duhdubnub.github.io', base: '/soil-website', trailingSlash: 'always', vite: { plugins: [tailwindcss()] } });
