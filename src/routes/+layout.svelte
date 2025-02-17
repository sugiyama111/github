<script lang="ts">
import { SvelteToast } from '@zerodevx/svelte-toast'
import '../app.css';
	import { dev } from '$app/environment';
	import Icon from "@iconify/svelte";
	import { Button, Progressbar } from 'flowbite-svelte';
	import { config, unsentCount, selectedEvent, selectedPoint, lastRegistered,
		scanner, isSending, goBackUrl } from '$lib/stores';
	import { selectedLogId, isTrial } from '$lib/stores';
	import DrawerMenu from '$lib/components/DrawerMenu.svelte';
	import ConfigLoginDialog from '$lib/components/ConfigLoginDialog.svelte';
	import { db } from "$lib/db/db";

	import { TimingPoint } from '$lib/api/TimingPoint';
	import { page } from '$app/stores';
	import PointSelectDialog from '$lib/components/PointSelectDialog.svelte';
	import { Toast } from '$lib/Toast';
  import { onDestroy, onMount, setContext } from 'svelte';
	import { RegisterMode } from '$lib/type/RegisterMode';
	import { afterNavigate, beforeNavigate, goto, pushState, replaceState } from '$app/navigation';
	import { TimeoutTicker } from '$lib/type/TimeoutTicker';
	import { linear } from 'svelte/easing';
    import { Vibrate } from '$lib/Vibrate';
    import { TrialModeToast } from '$lib/TrialModeToast';
    import { derived } from 'svelte/store';
    import TrialModeConfirmDialog from '$lib/components/TrialModeConfirmDialog.svelte';

	let { children } = $props();


	////// フェールセーフ処理
	// 万一、選択可能なモードが無い場合はチェックを強制的に可能にする
	if ($config.availableRegisterModes.length == 0) {
		$config.availableRegisterModes.push(RegisterMode.CHECK);
	}


  const options = {
    
  }
	//let sendingLeftRatio = $state<number>(1);		// 0～1
	// const updateRatio = () => {
	// 	$sendingLeftTimeRatio = sendTicker.ratio();
	// }

	// const handleTimeout = () => {
	// 	sendTicker.stop();
	// 	setTimeout(async()=>{
	// 		// 送信実処理
	// 		await asyncSendRecords();
			
	// 		if ($config.allowsSending) {
	// 			sendTicker.resetLeftTick();
	// 			updateRatio();

	// 			const intervalSec = $config.sendingIntervalSec == 0 ? 2 : $config.sendingIntervalSec;
	// 			sendTicker.setTimeoutTick(intervalSec);		// sendTickerのmilsecPerTickは1000(1秒)
	// 			setTimeout(sendTicker.start, 500);				// 残り時間満タンを見せる
	// 		}
	// 	}, 500);
	// }

	//const sendTicker = new TimeoutTicker(60, {milsecPerTick:1000, onTimeout:handleTimeout, onTick:updateRatio});
	let sendingTicker:TimeoutTicker|null = null;	

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

	const trialAlertTick = new TimeoutTicker(30, {
		onTimeout: () => {
			Vibrate.Play(Vibrate.TRIAL_MODE);
			TrialModeToast.TrialMode('お試しモード中. データはサーバーに届きません.');

			// まだお試しモードだったら再度tickを開始する
			if ($isTrial) {
				startTrialAlertRoutine();
			}
		},
		onTick: () => {
			console.log('trialmode tick');
		}
	})

	const startTrialAlertRoutine = () => {
		trialAlertTick?.stop();
		trialAlertTick?.resetLeftTick();
		trialAlertTick?.start();
	}
	const stopTrialAlertRoutine = () => {
		trialAlertTick?.stop();
		TrialModeToast.Close();		// お試しモードトーストを閉じる
	}

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

	const asyncSwitchLog = async (point:TimingPoint, isTrial:boolean) => {
		if (!$selectedEvent) return;

		// リセットすべきstoreをリセットする
		$unsentCount = 0;
		$lastRegistered = {check:null, retire:null, skip:null};

		
		const newLogId = await db.asyncSwitchNextLog($selectedEvent, point, isTrial);
		$selectedLogId = newLogId;

		if (!isTrial) {
			// ＠TODO 送信処理を再実行
		

		}
	}

  // ページ遷移時の処理
	// (Web限定)履歴から開いた時も実行されるが、TurnOnが効いていない
  function handleRouteChange(from:string, to:string) {
    console.log(`ページ遷移: ${from} → ${to}`);
		Toast.Info(`ページ遷移: ${from} → ${to}`);
    // 必要な処理をここに記述

		if (to == '/') {
			$scanner?.asyncTurnOn();
			console.log('route change /');
			Toast.Success('route change /');
		} else if (to == '/config') {
			$scanner?.asyncTurnOff();
			console.log('route change /config');
			Toast.Success('route change /config TurnOFF');
		}
  }

	// 初期表示時・画面遷移時に発行
	onMount(()=>{
		console.log('◆pushState');

		if ($isTrial) {
			startTrialAlertRoutine();
		}
		// 2025/2/5 コメントアウト　svelte.config.js で登録するよう
		// // service workerの登録
		// if ('serviceWorker' in navigator) {
    //   navigator.serviceWorker
    //     .register('/service-worker.js'
		// 			,{ type: dev ? 'module' : 'classic' })  // サービスワーカーを登録するパス
    //     .then((registration:ServiceWorkerRegistration) => {
    //       console.log('ServiceWorker registration successful with scope: ', registration.scope);

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
	
    //     })
    //     .catch((error) => {
    //       console.log('ServiceWorker registration failed: ', error);
    //     });
    // } else {
    //   console.log('Service Worker not supported');
    // }

		// 送信ルーティンの開始
		if ($config.allowsSending) {
			restartSendingTicker();
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
	
	const asyncSendManually = async() => {
		//Toast.Info("postMessage:"+messagePort);
		//messagePort?.postMessage("New");
		window.postMessage("New4");

		// 定期送信を止める
		sendingTicker?.stop();

		// 定期送信の残り時間を強制的に0表示にする
		sendingLeftTimeRatio = 0;
		

		await asyncSendRecords();

		// 満タン表示を一瞬見せて再開
		sendingTicker?.resetLeftTick();
		updateRatio();
		setTimeout(()=>{
			sendingTicker?.start()
		}, 500);
	}

	const asyncSendRecords = async() => {
		if (!$selectedLogId) return;
		if ($isSending) {
			console.log('already sending. passed.')
			return;		// 処理中は入らない
		}

		console.log('start sending');
		$isSending = true;

		// 未送信を取得
		const records = await db.asyncFetchUnsentRecord($selectedLogId);

		// サーバーへ送信(トライアルの場合は数秒待つだけ)
		if ($isTrial) {
			await wait(2500);
		} else {
			// 送信処理

			await wait(2500);

		}

		// 送信済みにする
		const seqList = records.map(record=>record.seq);
		console.log('reg seqList');
		console.log(seqList);
		await db.asyncUpdateRecordToSent($selectedLogId, seqList);

		// 未送信件数を更新
		$unsentCount = await db.asyncFetchUnsentRecordCount($selectedLogId);

		$isSending = false;

	}


	let sendingLeftTimeRatio = $state<number>(1);
	const updateRatio = () => {
		if (!sendingTicker) return;
		sendingLeftTimeRatio = sendingTicker.ratio();
	}

	const restartSendingTicker = () => {
		console.log(sendingTicker?.timeoutTick);
		// 稼働中の送信ルーティンがあれば一旦停止
		if (sendingTicker) {
			sendingTicker.stop();
			//sendingTicker = null;	 すぐ新しいオブジェクトが代入され、前のオブジェクトはGC対象になる（null許容していない箇所と動作を合わせる）
		}
		
		// 新しいtick数で開始する
		sendingTicker = new TimeoutTicker($config.sendingIntervalSec, {
			onTimeout: onSendingTickerTimeout,
			onTick: updateRatio,
		});

		updateRatio();

		// 開始
		setTimeout(sendingTicker.start, 500);
	}

	const stopSendingTicker = () => {
		sendingTicker?.stop();
	}

	const onSendingTickerTimeout = () => {
		if (!sendingTicker) return;

		sendingTicker.stop();

		setTimeout(async()=>{
			if (!sendingTicker) return;

			// 送信実処理
			await asyncSendRecords();
			
			if ($config.allowsSending) {
				sendingTicker.resetLeftTick();
				updateRatio();

				sendingTicker.setTimeoutTick($config.sendingIntervalSec);		// sendTickerのmilsecPerTickは1000(1秒)
				setTimeout(sendingTicker.start, 500);				// 残り時間満タンを見せる
			}
		}, 500);		// 残り0を見せる
	}

	// 子コンポーネントで利用できるようにする
	//setContext('reserveSending', reserveSending);
	setContext('restartSendingTicker', restartSendingTicker);
	setContext('stopSendingTicker', stopSendingTicker);
	setContext('asyncSwitchLog', asyncSwitchLog);
	setContext('startTrialAlertRoutine', startTrialAlertRoutine);
	setContext('stopTrialAlertRoutine', stopTrialAlertRoutine);

	onDestroy(()=>{
		// 送信があれば一旦停止
		sendingTicker?.stop();

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
	
	let messagePort:MessagePort;

	self.addEventListener("message", (event) => {

		Toast.Info("Message received in PWA:"+ event.data);
    //console.log("Message received in PWA:", event.data);

		// メッセージのオリジンを確認
		if (event.origin !== "https://github-hazel-two.vercel.app") {
			console.warn("Untrusted origin:", event.origin);
			return;
		}
		if (event.source === window) {
			Toast.Info('do nothing because message is from PWA')
			return;
		}

		messagePort = event.ports[0];
		console.log('port is : '+ messagePort);
		if (typeof messagePort === 'undefined') return;

		// Post message on this port.
		messagePort.postMessage("Test")

		// Receive upcoming messages on this port.
		messagePort.onmessage = function(event) {
			Toast.Info("[PostMessage1] Got message" + event.data);
			console.log("[PostMessage1] Got message" + event.data);
		};
	});


	
	// // TWAからのメッセージを受信
	// navigator.serviceWorker.ready.then((registration) => {
	// 	console.log('registration active postMessage');
	// 	registration?.active?.postMessage("Hello from TWA!");

	// 	navigator.serviceWorker.addEventListener("message", (event) => {
	// 		console.log("Received in PWA:", event.data);
	// 	});
	// });
</script>

<svelte:window on:beforeunload={()=>handleBeforeUnload} />
<svelte:document on:visibilitychange={handleVisibilityChange} />

<!-- PWAのためのmanifest.json読込 -->
<svelte:head>
	<link rel="manifest" href="/manifest.json" />
</svelte:head>


<!-- 通常は非表示の全体で共通のコンポーネント -->
<SvelteToast {options} />
<DrawerMenu bind:hidden={drawerHidden}></DrawerMenu>
<PointSelectDialog />
<ConfigLoginDialog />
<TrialModeConfirmDialog />

<div id="trial-frame" class:hidden={!$isTrial}>
	<div class="top-0 fixed w-full h-2 bg-trial"></div>
	<div class="right-0 fixed w-2 h-full bg-trial"></div>
	<div class="bottom-0 fixed w-full h-2 bg-trial"></div>
	<div class="left-0 fixed w-2 h-full bg-trial"></div>
</div>

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

	
	<!-- 送信ボタン -->
{#if $config.allowsSending}
	<Button
	class={`${$page.url.pathname!='/' ? 'opacity-20' : ''}
		fixed left-[-28px] bottom-[-28px] 
		rounded-full w-28 h-28
		flex justify-center items-center flex-col
		text-primary-text bg-primary`}
		disabled={$isSending || $page.url.pathname!='/'}
		onclick={asyncSendManually}>

		<div class="-mt-4 -mr-3 flex flex-col justify-center">
			<Icon icon="ri:send-plane-fill" class="text-white dark:text-white w-12 h-12" />
		

		<div class="-ml-4 -mr-4 flex justify-center">
		{#if !$isSending}
			<div class="-mt-1">すぐ送信</div>
		{:else}
			<div class="-mt-1 flex">
				送信中...
				<!-- <Icon icon="mdi:send" class="text-lg m-0 p-0" /> -->
			</div>
		{/if}
		</div>

			<Progressbar easing={linear} size="h-1" progressClass="bg-gray-400"
				progress={sendingLeftTimeRatio*100}
				class="mb-1" />
		</div>

		{#if $unsentCount >= 1}
			<div class="rounded-full h-6 w-6 border-white bg-red-600
				flex justify-center items-center
				absolute right-[8px] top-[4px]">{ $unsentCount }</div>
		{/if}
	</Button>
{/if}

</div>