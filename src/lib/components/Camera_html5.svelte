<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
	import { Html5Qrcode } from 'html5-qrcode';
    import Icon from '@iconify/svelte';
    import { selectedRegisterMode } from '$lib/stores';
    import { RegisterMode } from '$lib/type/RegisterMode';
    import { Img } from 'flowbite-svelte';
	
	const props = $props();
	const { onClose, onRegister } = props;

	let isScanSuccessProcessing = false;
  let cameraActive = false;
  let html5QrCode: Html5Qrcode | null;
  let videoElementId = 'qr-reader';


  // カメラを開始する関数
  const asyncStartCamera = async () => {
    if (cameraActive) return;

    html5QrCode = new Html5Qrcode(videoElementId);
    try {
      const cameras = await Html5Qrcode.getCameras();
      if (cameras && cameras.length > 0) {
        const cameraId = cameras[0].id;

        await html5QrCode.start(
          cameraId,
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

  // カメラを停止する関数
  const asyncStopCamera = async () => {
    if (!cameraActive || !html5QrCode) return;

    await html5QrCode.stop();
    html5QrCode = null;
    cameraActive = false;
  };

	onMount(async () => {
    await asyncStartCamera();
  });

  onDestroy(async () => {
    await asyncStopCamera(); // コンポーネント破棄時にカメラを停止
  });

	const onScanSuccess = (decodedText:string) => {
		if (isScanSuccessProcessing) return;
		isScanSuccessProcessing = true;

		// @TODO ここに選択中のイベントと合致するかの判定
		const memberCode = parseQrText(decodedText);
		console.log(memberCode);

		onRegister(memberCode);

		setTimeout(()=>isScanSuccessProcessing=false, 2000);
	}

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


<div>
{#if $selectedRegisterMode.isCheck()}
	<div class="mode-chip bg-check"><Icon icon="material-symbols:check-circle-outline" />チェック</div>
{:else if $selectedRegisterMode.isRetire()}
	<div class="mode-chip bg-retire"><Icon icon="material-symbols:close" />リタイア</div>
{:else if $selectedRegisterMode.isSkip()}
	<div class="mode-chip bg-skip"><Icon icon="material-symbols:step-over" />スキップ</div>
{/if}
  <h1 class="text-center">QRコードを四角い枠に映してください</h1>
  <div id="qr-reader" style="transform: scaleX(-100%);" class="min-h-60 flex justify-center items-center">
		<Img src="loading.gif" class="h-20 w-20" />
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