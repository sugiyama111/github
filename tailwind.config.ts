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
					//DEFAULT: '#22b186',
					DEFAULT: '#1d9672',
					text: 'white',
				},
				light: {
					text: '#333',
					background: 'white',
				},
				dark: {
					text: 'white',
					background: '#333',
				},
				check: {
					DEFAULT: 'white',
				},
				retire: {
					//DEFAULT: '#FFAAAA',
					DEFAULT: '#ff7d7d',
				},
				skip: {
					//DEFAULT: '#acf',
					DEFAULT: '#55c5ff',
				},
				trial: {
					DEFAULT: '#FFFF00',
				},
				config: {
					DEFAULT: 'blue-600',
				},
      }
    },
  },

  plugins: [typography, forms, containerQueries]
} satisfies Config;
