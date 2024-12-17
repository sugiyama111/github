<script lang="ts">
	import Icon from "@iconify/svelte";
	import { RegisterMode, RegisterModeState } from "$lib/type/RegisterMode";
	import { Tabs, TabItem, Button, Modal } from 'flowbite-svelte';
	import Camera from "../components/Camera.svelte";
	import Keypad from "../components/Keypad.svelte";

	let mode:RegisterModeState = new RegisterModeState(RegisterMode.CHECK);
	let showsCameraModal = false;
	let showsKeypadModal = false;

	//let mode_list = [RegisterMode.CHECK, RegisterMode.RETIRE, RegisterMode.SKIP];		// 設定から読み込む選択可能なモード
	//let mode = mode_list[0];


	function vib() {
		console.log('vib');
		window.navigator.vibrate([400]); // vibrate for 200ms
		console.log('vib finished');
	}

</script>




<!-- モード切替タブ -->
<Tabs tabStyle="underline" contentClass="m-0">
	
	<TabItem open={!mode.isRetire() && !mode.isSkip()} class="bg-check">
		<div slot="title" class="flex items-center gap-2">
			<Icon icon="material-symbols:check-circle-outline" />
			<div class="whitespace-nowrap">チェック</div>
		</div>
		<section class="p-4 bg-check">
			
			<article id="last-data" class="p-2 ml-auto mr-auto mb-4 bg-slate-300 shadow-md 
				text-black text-left rounded-md w-3/4 max-w-96">
				<div class="flex"><Icon icon="material-symbols:check-circle-outline" />チェック</div>
				<div>No. 101</div>
				<div>田中 太郎</div>
				<div><span class="text-sm">2024/</span>7/25 14:47<span class="text-sm">:42</span></div>
			</article>

			<article id="information" class="p-2 ml-auto mr-auto mb-10 bg-yellow-100 shadow-md 
				text-black text-left rounded-md w-3/4 min-h-48 max-w-96">
				<div>最終送信：<span class="text-sm">2024/</span>7/25 14:49<span class="text-sm">:01</span></div>
				<div id="info-detail">
					端末内　件数　回数
				</div>
			</article>

		</section>
	</TabItem>

  <TabItem open={mode.isRetire()} class="bg-retire">
    <div slot="title" class="flex items-center gap-2">
      <Icon icon="material-symbols:close" />
			<div class="whitespace-nowrap">リタイア</div>
    </div>

		<section class="p-4 bg-retire">
			
			<article id="last-data" class="p-2 ml-auto mr-auto mb-4 bg-slate-300 shadow-md 
				text-black text-left rounded-md w-3/4 max-w-96">
				<div class="flex"><Icon icon="material-symbols:close" />リタイア</div>
				<div>No. 101</div>
				<div>田中 太郎</div>
				<div><span class="text-sm">2024/</span>7/25 14:47<span class="text-sm">:42</span></div>
			</article>

			<article id="information" class="p-2 ml-auto mr-auto mb-10 bg-yellow-100 shadow-md 
				text-black text-left rounded-md w-3/4 min-h-48 max-w-96">
				<div>最終送信：<span class="text-sm">2024/</span>7/25 14:49<span class="text-sm">:01</span></div>
				<div id="info-detail">
					端末内　件数　回数
				</div>
			</article>

		</section>
  </TabItem>

  <TabItem open={mode.isSkip()} class="bg-skip">
		<div slot="title" class="flex items-center gap-2">
			<Icon icon="material-symbols:step-over" />
			<div class="whitespace-nowrap">スキップ</div>
		</div>

		<section class="p-4 bg-skip">
			
			<article id="last-data" class="p-2 ml-auto mr-auto mb-4 bg-slate-300 shadow-md 
				text-black text-left rounded-md w-3/4 max-w-96">
				<div class="flex"><Icon icon="material-symbols:step-over" />スキップ</div>
				<div>No. 101</div>
				<div>田中 太郎</div>
				<div><span class="text-sm">2024/</span>7/25 14:47<span class="text-sm">:42</span></div>
			</article>

			<article id="information" class="p-2 ml-auto mr-auto mb-10 bg-yellow-100 shadow-md 
				text-black text-left rounded-md w-3/4 min-h-48 max-w-96">
				<div>最終送信：<span class="text-sm">2024/</span>7/25 14:49<span class="text-sm">:01</span></div>
				<div id="info-detail">
					端末内　件数　回数
				</div>
			</article>

  </TabItem>
</Tabs>



<!-- 下部ボタンコンテンツ -->
<!-- layoutでclass="h-lvh"を指定。ここではsize-fullを指定。 -->
<main class="pt-4 size-full"
	class:check={mode.isCheck()}
	class:retire={mode.isRetire()}
	class:skip={mode.isSkip()}>

	<button on:click={vib} class="btn btn-primary w-20 h-20" style="border:1px solid black;">振動</button>

	<!-- 送信ボタン -->
	<button class="p-3 fixed btn btn-circle btn-primary w-40 h-40" style="left:-25px; bottom:-25px;">
		<div style="margin-top:-15px; margin-right:-15px;">
			<Icon icon="ri:send-plane-fill" class="text-white dark:text-white w-24 h-24" />
			<div class="text-lg" style="margin-top:-12px;">すぐ送信</div>
		</div>
		<div class="badge rounded-full h-6 w-6 border-white text-nm" style="position:absolute; right:10px; top:10px;">15</div>
	</button>


	<Button pill={true} class="!p-3 fixed bg-primary" style="right:90px; bottom:10px;"
		on:click={()=>(showsCameraModal=true)}>
		<Icon icon="material-symbols:photo-camera-outline" class="w-10 h-10" />
	</Button>
	<Button pill={true} class="!p-3 fixed bg-primary" style="right:10px; bottom:10px;"
		on:click={()=>(showsKeypadModal=true)}>
		<Icon icon="material-symbols:dialpad" class="w-10 h-10" />
	</Button>

</main>

<Modal title="カメラでQR読み取り" bind:open={showsCameraModal} autoclose outsideclose>
	<Camera />
</Modal>

<Modal title="キーパッドで入力" bind:open={showsKeypadModal} outsideclose>
	<Keypad />
</Modal>

<style lang="postcss">
	.btn-circle {
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		@apply text-primary-text;
	}
</style>