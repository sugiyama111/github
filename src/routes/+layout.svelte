<script lang="ts">
	import '../app.css';
	import Icon from "@iconify/svelte";
	import { Button } from 'flowbite-svelte';
	import { config, unsentCount, selectedEvent, selectedPoint, scanner, isSending, goBackUrl } from '$lib/stores';
	import { sendingProcessId, selectedLogId } from '$lib/stores';
	import DrawerMenu from '$lib/components/DrawerMenu.svelte';
	import ConfigLoginDialog from '$lib/components/ConfigLoginDialog.svelte';
	import { db } from "$lib/db/db";
	
	import { Toaster } from 'svelte-sonner';
	import { page } from '$app/stores';
	import PointSelectDialog from '$lib/components/PointSelectDialog.svelte';
  import { toast } from '$lib/QRTToast';
  import { onDestroy, onMount, setContext, tick } from 'svelte';
    import { RegisterMode } from '$lib/type/RegisterMode';
    import { afterNavigate, beforeNavigate, goto, pushState, replaceState } from '$app/navigation';
	
	let { children } = $props();

	////// フェールセーフ処理
	// 万一、選択可能なモードが無い場合はチェックを強制的に可能にする
	if ($config.availableRegisterModes.length == 0) {
		$config.availableRegisterModes.push(RegisterMode.CHECK);
	}


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
		console.log('◆pushState');

		// service workerの登録
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

		// 送信ルーティンの開始
		if ($config.allowsSending) {
			console.log('start sending ' + $config.sendingIntervalSec);
			
			reserveSending();
		}


		//toast.info(`mount url:${$page.url.pathname}`);
		resetScannerByUrl($page.url.pathname);



		window.addEventListener('popstate', handleGetBack);
		window.addEventListener('beforeunload', handleBeforeUnload);
		
		return () => {
			window.removeEventListener('popstate', handleGetBack);		// ← ここはonDestroy内でも良い
			window.removeEventListener('beforeunload', handleBeforeUnload);
		}

	});



	function wait(ms:number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	// 送信処理＋次の送信予約
	const asyncRoutineSending = async () => {
		// 送信処理
		console.log('do');
		await asyncSendRecords();

		// 送信処理が終わってから、次の実行を予約
		if ($config.allowsSending) {
			reserveSending();
		}
	}

	const asyncSendRecords = async() => {
		if (!$selectedLogId) return;
		if ($isSending) {
			console.log('already sending. passed.')
			return;		// 処理中は入らない
		}

		$isSending = true;

		// 未送信を取得
		const records = await db.asyncFetchUnsentRecord($selectedLogId);

		// サーバーへ送信
		
		await wait(2500);

		// 送信済みにする
		const seqList = records.map(record=>record.seq);
		console.log('reg seqList');
		console.log(seqList);
		await db.asyncUpdateRecordToSent($selectedLogId, seqList);

		// 未送信件数を更新
		$unsentCount = await db.asyncFetchUnsentRecordCount($selectedLogId);

		$isSending = false;

	}

	// 送信予約をする処理
	const reserveSending = () => {
		console.log('reserve after '+$config.sendingIntervalSec);

		const interval = $config.sendingIntervalSec == 0 ? 2 : $config.sendingIntervalSec;
		$sendingProcessId = setTimeout(asyncRoutineSending, interval * 1000);
	}
	// 子コンポーネントで利用できるようにする
	setContext('asyncSendRecords', asyncSendRecords);
	setContext('reserveSending', reserveSending);


	onDestroy(()=>{
		// 送信予約があれば一旦停止
		if ($sendingProcessId) {
			clearTimeout($sendingProcessId);
			$sendingProcessId = null;
		}

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
	function handleBeforeUnload(e:Event) {
		$scanner?.asyncTurnOff();
		// console.log('beforeunload');
		// toast.success('beforeunload');
//		goto('/');
		//e.preventDefault();
		//e.returnValue = '';

	}

	// beforeNavigate((event)=>{
	// 	console.log('◆beforeNavigate');
	// 	console.log(event.to?.url.pathname);
	// 	if (event.to?.url.pathname == '/') {
	// 		$goBackUrl = null;
	// 	} else if (event.to?.url.pathname == '/config') {
	// 		$goBackUrl = '/';
	// 	} else if (event.to?.url.pathname == '/ref') {
	// 		$goBackUrl = '/';
	// 	} else if (/^\/refd\//.test(event.to?.url.pathname ?? '')) {
	// 		$goBackUrl = '/ref';
	// 	}

	// 	console.log('goback: ' + $goBackUrl);
	// });
	
	const handleGetBack = (e:Event) => {
		console.log('◆handleGotBack');
		console.log('goBackUrl=: ' + $goBackUrl);

		const to = $goBackUrl;

		if (to === null) {
			$goBackUrl = null;
			
			goto('/');		// メインに戻るべき時のみgotoさせる（それ以外は、自身のback操作で戻ってもらう
			// ここ以外でgotoすると画面が閉じる？refd->(back)->ref->(back)->閉じようとする
			
		} else if (to === '/') {			// ここが無いと、参照→設定→(back)で参照に戻ってしまう
			$goBackUrl = null;
			goto('/');

		}

	}

	// beforeNavigate(({from, to, cancel})=>{
	// 	console.log('◆beforeNavigate');
	// 	if ($goBackUrl === null) {
	// 		console.log('goto / !');
			
	// 		return '/';
	// 	} else {
	// 		console.log('goto '+$goBackUrl);
			
	// 		return $goBackUrl;
	// 	}
	// });

	// onpopstateは afterNavigate(beforeNavigate) との実行順序は保証できない？
	// afterNavigateではgotoせず、戻るべき先のみを指示する
	afterNavigate((event)=>{
		console.log('◆afterNavigate');

		const path = event.to?.url.pathname ?? '';

		if (path == '/') {
			$goBackUrl = null;
		} else if (path == '/config') {
			$goBackUrl = '/';
		} else if (path == '/ref') {
			$goBackUrl = '/';
		} else if (/^\/refd\//.test(path)) {
			$goBackUrl = '/ref';
		}

		console.log('now: '+path+' and goBackUrl set to:'+$goBackUrl);
	});
	
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

	<div class="grow flex items-center text-primary-text text-left whitespace-nowrap">
	{#if ($page.url.pathname == '/')}
		<div>
			<div class="text-xs">{ $selectedEvent?.eventTitle }</div>
			<div class="text-2xl -mt-1">{ $selectedPoint?.pointTitle }</div>
		</div>
	{:else if ($page.url.pathname == '/config')}
		<div class="text-xl">管理者設定</div>
	{:else if ($page.url.pathname == '/ref')}
		<div class="text-xl">記録参照 - ログ選択</div>
	{:else if (/^\/refd\/.+$/.test($page.url.pathname))}
		<div class="text-xl">記録参照 - 詳細</div>
	{/if}
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