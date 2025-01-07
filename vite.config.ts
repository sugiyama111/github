import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],

	// スマホデバッグ用。必要無くなったら削除OK。
	server: {
    host: '0.0.0.0', // 任意のIPアドレスからの接続を許可
    port: 3000,      // 使用するポート番号
    open: false,      // 自動でブラウザを開く
  },
});
