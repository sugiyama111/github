<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
	import { Html5Qrcode } from 'html5-qrcode';
	import Icon from '@iconify/svelte';
	import { selectedRegisterMode, selectedCameraId, dialogVisibility, isCameraMirrored } from '$lib/stores';
	import { RegisterMode } from '$lib/type/RegisterMode';
	import { Button, Img, Progressbar, Toggle } from 'flowbite-svelte';
	import CameraSelectDialog from './CameraSelectDialog.svelte';
	import { asyncCameraDevices, Camera } from '$lib/type/CameraManager';
	import { TimeoutTicker } from '$lib/type/TimeoutTicker';
	import { linear } from 'svelte/easing';

	const props = $props();
	const { onClose, onRegister, onTimeout } = props;

	let isScanSuccessProcessing = false;
  let cameraActive = false;
  let html5QrCode: Html5Qrcode | null;
  let videoElementId = 'qr-reader';

	let cameraList:Array<Camera> = [];
	let cameraFound:boolean = false;

	let ratio = $state<number>(1);		// 0～1
	const updateRatio = () => {
		ratio = ticker.ratio();
	}

	const handleTimeout = () => {
		setTimeout(onTimeout, 500);
	}

	const ticker = new TimeoutTicker(60, {milsecPerTick:1000, onTimeout:handleTimeout, onTick:updateRatio});
	
	console.log(`camera id: ${$selectedCameraId}`);

	//const ticker = $state<CameraTimeoutTicker>(new CameraTimeoutTicker({onTimeout:onTimeout, onTick:updateRatio}));
	
	

	onMount(async () => {
		cameraList = await asyncCameraDevices();
		//cameraList = await Html5Qrcode.getCameras();

		if (cameraList.length == 0) return;

		// カメラの選択が無い場合は先頭のものを選択
		if (!$selectedCameraId || !isTargetCameraInList(cameraList, $selectedCameraId)) {
			$selectedCameraId = cameraList[0].id;
			cameraFound = true;
		}
 
		await asyncStartCamera();

		// 残り時間タイマー開始
		ticker.start();
	});

  onDestroy(async () => {
		// 残り時間タイマー停止
		ticker.stop();
		
    await asyncStopCamera(); // コンポーネント破棄時にカメラを停止
  });

	const isTargetCameraInList = (cameraList:Array<Camera>, targetCameraId:string) => {
		return (cameraList.map(camera=>camera.id).indexOf(targetCameraId) !== -1);
	}

	const asyncStartCamera = async () => {
		if (cameraActive) return;
		if (!$selectedCameraId) return;

		// 選択済みのカメラが、カメラ一覧に無い場合
		if (!isTargetCameraInList(cameraList, $selectedCameraId)) {
			cameraFound = false;
			return;
		}

		html5QrCode = new Html5Qrcode(videoElementId);
		try {
			//cameraList = await Html5Qrcode.getCameras();
			//cameraOptions = [];
			//cameraList.forEach((camera, idx)=>cameraOptions.push({value:camera.id, name:`${idx} : ${camera.label}　　`}));

			if (cameraList.length > 0) {

				await html5QrCode.start(
					$selectedCameraId,
					{
						fps: 10, // フレーム毎秒
						qrbox: { width: 250, height: 250 }, // QRコード読み取りエリアのサイズ
					},
					onScanSuccess,
					onScanFailure,
				);
			} else {
				console.error('カメラが見つかりません');
			}
		} catch (error) {
			console.error('カメラの起動に失敗:', error);
		} finally {
			cameraActive = true;
		}
	};

  // カメラを停止する
  const asyncStopCamera = async () => {
    if (!cameraActive || !html5QrCode) return;

    await html5QrCode.stop();
    html5QrCode = null;
    cameraActive = false;
  };

	// カメラを再起動する
	const asyncResetCamera = async () => {
		await asyncStopCamera();
		await asyncStartCamera();
	}

	const onScanSuccess = (decodedText:string) => {
		// 短時間での連続読取は避ける
		if (isScanSuccessProcessing) return;
		isScanSuccessProcessing = true;

		// @TODO ここに選択中のイベントと合致するかの判定
		const memberCode = parseQrText(decodedText);
		console.log(memberCode);

		onRegister(memberCode);
		
		// ticker操作
		ticker.stop();
		ticker.resetLeftTick();
		updateRatio();
		setTimeout(ticker.start, 1000);			// 1秒後にtick再開

		// 2秒後に次の読み取りを可能にする
		setTimeout(()=>isScanSuccessProcessing=false, 2000);
	}

	// 読み取り失敗の時
	// QRコードが読み取れない場合に発生。短時間で何度も発生する。
	const onScanFailure = (errorMessage:string) => {
		//console.error('読み取りエラー:', errorMessage);
	}

	const parseQrText = (text:string) => {
		let matches = null;
		if ((matches = text.match(/^[^,]+,([^,]+),[^,]+$/)) !== null) {
			return matches[1];
		} else {
			throw new Error('データ形式が正しくありません');
		}
	}

</script>


<CameraSelectDialog onCameraSelected={()=>{asyncResetCamera();}} />

<div>
	<div class="flex justify-between" style="align-items:flex-start;">
{#if $selectedRegisterMode.isCheck()}
		<div class="mode-chip bg-check whitespace-nowrap"><Icon icon={RegisterMode.CHECK.icon} />チェック</div>
{:else if $selectedRegisterMode.isRetire()}
		<div class="mode-chip bg-retire whitespace-nowrap"><Icon icon={RegisterMode.RETIRE.icon} />リタイア</div>
{:else if $selectedRegisterMode.isSkip()}
		<div class="mode-chip bg-skip whitespace-nowrap"><Icon icon={RegisterMode.SKIP.icon} />スキップ</div>
{/if}
		<div>
			<Toggle color="green" bind:checked={$isCameraMirrored}>
				<span class="-ml-2">左右反転</span>
			</Toggle>
		</div>
		
		<div>
			<Button class="bg-primary rounded-full w-8 h-8 p-0" onclick={()=>{$dialogVisibility.cameraSelect = true;}} >
				<Icon icon="material-symbols:cameraswitch-outline" class="w-7 h-7" />
			</Button>
		</div>
	</div>

  <h1 class="text-center">QRコードを四角い枠に映してください</h1>
  <div id="qr-reader" style={`transform:${$isCameraMirrored ? 'scaleX(-100%)' : 'scaleX(100%)'};`} class="min-h-60 flex justify-center items-center">
		<Img src="loading.svg" class="h-20 w-20" />
	</div>
	<div>
		<Progressbar easing={linear} size="h-1" progressClass="bg-gray-400"
			progress={ratio*100} />
	</div>
</div>

<style lang="postcss">
	.mode-chip {
		@apply flex;
		@apply rounded-xl;
		@apply pl-2 pr-3 pt-1 pb-1;
		width: fit-content;
		line-height: 1.1rem;
		box-shadow: 1px 1px gray;
	}
</style>