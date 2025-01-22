<script lang="ts">
	import '../app.css';
	import { derived } from 'svelte/store';
	import Icon from "@iconify/svelte";
	import { Button } from 'flowbite-svelte';
	import { selectedEvent, selectedPoint, scanner } from '$lib/stores';
	import { showsConfigLoginDialog } from '$lib/stores';
	import DrawerMenu from '$lib/components/DrawerMenu.svelte';
	import ConfigLoginDialog from '$lib/components/ConfigLoginDialog.svelte';

	import { Toaster } from 'svelte-sonner';
	import { page } from '$app/stores';
	import PointSelectDialog from '$lib/components/PointSelectDialog.svelte';
    import { ScannerMessenger } from '$lib/ScannerMessenger';
    import { toast } from '$lib/QRTToast';
    import { onDestroy, onMount } from 'svelte';
	
	let { children } = $props();

	let isUpdateAvailable = false;

	// PWAのためのservice-worker登録
	// console.log('service workerがregisterできているか');
	// console.log(window);
	// if ('serviceWorker' in navigator) {
	// 	//window.addEventListener('load', function() {
	// 	window.addEventListener('load', () => {
	// 		console.log('load');
	// 		window.navigator.serviceWorker.register('/service-worker.js')	//, { scope: './' })
	// 		.then((registration:ServiceWorkerRegistration) => {
	// 			console.log('ServiceWorker registration successfull with scope: ', registration.scope);

	// 			registration.onupdatefound = () => {
	// 				const installingWorker = registration.installing;
	// 				if (installingWorker) {
	// 					installingWorker.onstatechange = () => {
	// 						if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
	// 							isUpdateAvailable = true;
	// 							if (confirm('更新があります。更新しますか？')) {
	// 								registration.update();
	// 							}
	// 						}
	// 					};
	// 				}
	// 			}

	// 		}, function (err:Error) {
	// 			console.log('ServiceWorker registration failed: ', err);
	// 		});
	// 	});
	// }


	// drawerの設定
	let drawerHidden = $state(true);


/*
// ダイアログ表示時にturnoffするテスト
$effect(()=>{
	showsConfigLoginDialog.subscribe(shows=>{
		if (shows) {
			console.log('effect:shows? ' + shows);
			console.log('scanner info.');
			console.log($scanner);
			$scanner.asyncTurnOff;
			console.log('called asyncTurnOff')
		} 
		else {
			console.log('effect:shows? ' + shows);
			console.log($scanner);
			$scanner?.asyncTurnOn;
		}
	})
});
*/

const resetScannerByUrl = (path:string) => {
	if (path === '/' && $selectedEvent && $selectedPoint) $scanner?.asyncTurnOn();
	else $scanner?.asyncTurnOff();
}


	let currentPath:string;
  // ページ遷移を検知して処理を実行
  $effect(() => {
		// URL入力しての画面表示時に発行(undefined -> /)。
		// スキャナついてなくてリロード時にONにする
		resetScannerByUrl($page.url.pathname);
    // const newPath = $page.url.pathname;

    // if (newPath !== currentPath) {
    //   handleRouteChange(currentPath, newPath);
    //   currentPath = newPath;
    // }
  });

  // ページ遷移時の処理
	// (Web限定)履歴から開いた時も実行されるが、TurnOnが効いていない
  function handleRouteChange(from:string, to:string) {
    console.log(`ページ遷移: ${from} → ${to}`);
		toast.info(`ページ遷移: ${from} → ${to}`);
    // 必要な処理をここに記述

		if (to == '/') {
			$scanner?.asyncTurnOn();
			console.log('route change /');
			toast.success('route change /');
		} else if (to == '/config') {
			$scanner?.asyncTurnOff();
			console.log('route change /config');
			toast.success('route change /config TurnOFF');
		}
  }


	// 初期表示時・画面遷移時に発行
	onMount(()=>{
		console.log('onMount@layout');
		if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js', { type:'module' })  // サービスワーカーを登録するパス
        .then((registration:ServiceWorkerRegistration) => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);

					registration.onupdatefound = () => {
						const installingWorker = registration.installing;
						if (installingWorker) {
							installingWorker.onstatechange = () => {
								if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
									isUpdateAvailable = true;
									if (confirm('更新があります。更新しますか？')) {
										registration.update();
									}
								}
							};
						}
					}
	
        })
        .catch((error) => {
          console.log('ServiceWorker registration failed: ', error);
        });
    } else {
      console.log('Service Worker not supported');
    }

		//toast.info(`mount url:${$page.url.pathname}`);
		resetScannerByUrl($page.url.pathname);
	});
	// // 他画面に遷移時に発行
	// onDestroy(()=>{
	// 	$scanner?.asyncTurnOff();
	// 	console.log('destroy');
	// 	toast.success('destroy');
	// });

	// ◎これは有効。タスク管理では発行されない（残念）
	// ホーム画面表示時にhiddenが発行。
	// Androidでタブ一覧表示時に発行される（タブ削除操作前）。
	function handleVisibilityChange() {
		//console.log('document.visibilityState:' + document.visibilityState);
		//toast.success(`visibility: ${document.visibilityState} path:${$page.url.pathname}`);
		
		if (document.visibilityState === 'visible' && $page.url.pathname == '/') {
			$scanner?.asyncTurnOn();
		} else {
			$scanner?.asyncTurnOff();
		}
	}

	// PWAをkillした時に実行される
	function handleBeforeUnload() {
		$scanner?.asyncTurnOff();
		// console.log('beforeunload');
		// toast.success('beforeunload');
	}
	
</script>

<style lang="postcss">
	body {
		user-select: none;
	}
</style>

<svelte:window on:beforeunload={()=>handleBeforeUnload} />
<svelte:document on:visibilitychange={handleVisibilityChange} />

<!-- PWAのためのmanifest.json読込 -->
<svelte:head>
	<link rel="manifest" href="/manifest.json" />
</svelte:head>


<!-- 通常は非表示の全体で共通のコンポーネント -->
<Toaster richColors closeButton />
<DrawerMenu bind:hidden={drawerHidden}></DrawerMenu>
<PointSelectDialog />
<ConfigLoginDialog />


<div class="h-screen flex flex-col ">
<!-- 共通ヘッダ部分 -->
<header class="flex bg-primary h-12">

	<Button on:click={()=>drawerHidden = false} class="p-2">
		<Icon icon="material-symbols:menu-rounded" class="w-8 h-6" />
	</Button>

	<div class="grow">
		<div id="point_name" class="text-primary-text text-xl whitespace-nowrap" style="text-align:left;">{ $selectedPoint?.pointTitle }</div>
		<div id="event_name" class="text-primary-text text-xs whitespace-nowrap" style="text-align:left;">{ $selectedEvent?.eventTitle }</div>
	</div>

{#if isUpdateAvailable}
	アップデートあり
{/if}

<!-- 	
	<Button class="p-2">
		<Icon icon="mdi:dots-vertical" class="w-8 h-6" />
	</Button>
	 -->
</header>

	<!-- メインコンテンツ -->
	{@render children()}

</div>