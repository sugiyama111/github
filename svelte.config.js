import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		serviceWorker: {
			register: true		// 自動でサービスワーカーを登録
		},
		// paths: {
		// 	base: '/build',		// index.htmlからの参照パスをトップディレクトリ前提でなく、/build以下前提にする
		// },
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			// pages: 'build', // 静的ファイルの出力先
      // assets: 'build',
      // fallback: 'index.html',

      runtime: 'nodejs20.x' // または 'nodejs20.x'
    }),
	}
};

export default config;
