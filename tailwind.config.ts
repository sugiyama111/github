import containerQueries from '@tailwindcss/container-queries';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
  //content: ['./src/**/*.{html,js,svelte,ts}'],
	content: [
		'./src/**/*.{html,js,svelte,ts}', 
		'./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'
	],

  theme: {
    extend: {
      colors: {
        // flowbite-svelte
        primary: {
					DEFAULT: '#22b186',
					text: 'white',
					background: '#eee',
        },
				check: {
					DEFAULT: 'white',
				},
				retire: {
					DEFAULT: '#FFAAAA',
				},
				skip: {
					DEFAULT: '#acf',
				},
      }
    },
  },

  plugins: [typography, forms, containerQueries]
} satisfies Config;
