import type { Config } from 'tailwindcss';
import daisyUI from 'daisyui';

export default {
  content: ['./src/**/*.{html,ts}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      container: {
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
        },
      },
    },
  },
  plugins: [daisyUI],
} satisfies Config;
