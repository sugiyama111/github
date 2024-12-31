<script lang="ts">
	import '../app.css';
	
	import { dayjs } from '$lib/type/Dayjs';
	import Icon from "@iconify/svelte";
	import { Button } from 'flowbite-svelte';
	import { selectedEvent, selectedPoint, selectedRegisterMode } from '$lib/stores';
	import { RegisterMethod, RegisterMethodState } from '$lib/type/RegisterMethod';
	import { ScanInput } from '$lib/type/ScanInput';
	import { ScanInputValidator } from '$lib/ScanInputValidator';
	import type { ValidationResultState } from '$lib/type/ValidationResult';
	import { QRTToast } from '$lib/QRTToast';
	import DrawerMenu from '$lib/components/DrawerMenu.svelte';
  import ConfigLoginDialog from '$lib/components/ConfigLoginDialog.svelte';
		
	import { Toaster } from 'svelte-sonner';
	import { page } from '$app/stores';

	let { children } = $props();

console.log('page');
console.log($page.url.href);

	// PWAのためのservice-worker登録
	if ('serviceWorker' in navigator) {
		window.addEventListener('load', function() {
			this.navigator.serviceWorker.register('/service-worker.js', { scope: './' }).then(function (registration) {
				console.log('ServiceWorker registration successfull with scope: ', registration.scope);
			}, function (err) {
				console.log('ServiceWorker registration failed: ', err);
			});
		});
	}


	// drawerの設定
	let drawerHidden = $state(true);

	// scannerのキースタック準備
	let bodyElement: HTMLBodyElement;
	let scannerStackStr:string = '';

	// onMount(()=>{
	// 	// スキャナのイベント割り当て
	// 	document.body.addEventListener('keypress', (e)=>{
	// 	  this.stackKey(e);
	// 	});
	// });


	// スキャナーからの入力を受け付けるために、入力キーをスタックする。
	// body:onloadにて割り当て
	function stackKey(e:any) {
		console.log('z');
		//if ($pstore.selectedEvent == null) return;

		let key = e.key;
		console.log(`Stacked: ${key}`);

		// セミコロンが来たら出力
		if (key == ';') {
			console.log(`stackKey done@+layout.svelte val is [${scannerStackStr}]`)

			const scanInput:ScanInput = new ScanInput(
				scannerStackStr, 
				dayjs().format('YYYY/MM/DD HH:mm:ss.SSS'),
				new RegisterMethodState(RegisterMethod.SCANNER),		// スキャナ限定
				$selectedRegisterMode,
				'1',	//$pstore.selectedEvent.eventId,
			);

	console.log(scanInput);

			// 読取り後処理
			afterScan(scanInput);

			scannerStackStr = ''; // クリア
			return;
		}
	}


	async function afterScan(_scanInput:ScanInput) {
		
		const validator = new ScanInputValidator(_scanInput);
		const valResState:ValidationResultState = await validator.asyncValidate();

		// 異常時の処理
		if (!valResState.isSuccess()) {
			console.log(`invalid state ${valResState}`);

			// ユーザーにレスポンス(エラー)を返して終わり
			const result = valResState.getResult();
			new QRTToast().error(result.message);
			
			return;
		}

		// member_codeをQRデータから取り出し
		const member_code = _scanInput.val.split(',')[1];



		// // 登録処理
		// // 確認ダイアログを表示する場合はダイアログ側で登録処理する
		// if (this.needsConfirm[_scanInputInfo.method][_scanInputInfo.mode]) {

		// 	// 確認ダイアログを表示
		// 	this.memberCodeForConfirm = member_code;
		// 	this.selectedRegisterMethodForConfirm = _scanInputInfo.method;
		// 	this.timeForConfirm = _scanInputInfo.time;
		// 	this.$store.commit('updateIsConfirming', true)
		// } else {
		// 	// この画面で登録処理をする
		// 	await this.registerData(member_code, _scanInputInfo.method, _scanInputInfo.mode, _scanInputInfo.time)
		// }

		// // @TODO registerData が実行できなかった場合の処理は？
		// // ここで行うのでは？
	}

</script>

<style lang="postcss">
</style>

<!-- PWAのためのmanifest.json読込 -->
<svelte:head>
	<link rel="manifest" href="/manifest.json" />
</svelte:head>

<svelte:body bind:this={bodyElement} on:keypress={(e)=>{stackKey(e);}}/>


<!-- 通常は非表示の全体で共通のコンポーネント -->
<Toaster richColors closeButton />
<DrawerMenu bind:hidden={drawerHidden}></DrawerMenu>
<ConfigLoginDialog />
<!-- <ConfigDialog /> -->


<!-- 共通ヘッダ部分 -->
<header class="flex header bg-primary">

	<Button on:click={()=>drawerHidden = false} class="p-2">
		<Icon icon="material-symbols:menu-rounded" class="w-8 h-6" />
	</Button>

	<div class="grow">
		<div id="point_name" class="text-primary-text text-xl whitespace-nowrap" style="text-align:left;">{ $selectedPoint?.pointTitle }</div>
		<div id="event_name" class="text-primary-text text-xs whitespace-nowrap" style="text-align:left;">{ $selectedEvent?.eventTitle }</div>
	</div>

<!-- 	
	<Button class="p-2">
		<Icon icon="mdi:dots-vertical" class="w-8 h-6" />
	</Button>
	 -->
</header>

	<!-- メインコンテンツ -->
	{@render children()}
