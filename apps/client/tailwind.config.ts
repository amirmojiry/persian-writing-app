import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}', '../../packages/ui/src/**/*.vue'],
  theme: {
    extend: {}
  },
  plugins: []
} satisfies Config;
