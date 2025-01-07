<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import jsQR from 'jsqr';

	const props = $props();
	const { onClose, onRegister } = props;

  // HTML要素の型
  let videoElement: HTMLVideoElement | null = null;
  let canvasElement: HTMLCanvasElement | null = null;

  // 状態管理用の変数
  let result: string = ''; // QRコードの読み取り結果
  let scanning: boolean = false; // スキャン中かどうか
  let videoStream: MediaStream | null = null; // カメラストリーム

  // カメラの起動
  const asyncStartCamera = async (): Promise<void> => {
    if (scanning || !videoElement) return; // 既にスキャン中なら起動しない

    try {
      // ユーザーのカメラへのアクセスをリクエスト
      videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // 背面カメラを選択
      });
      videoElement.srcObject = videoStream;

      videoElement.setAttribute('playsinline', 'true'); // iOS対応
      await videoElement.play();

      scanning = true;
      requestAnimationFrame(scanFrame); // フレームのスキャンを開始
    } catch (err) {
      console.error('カメラ起動エラー:', err);
    }
  };

  // カメラの停止
  const asyncStopCamera = (): void => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      videoStream = null;
    }
    scanning = false;
  };

	const drawGuideLines = (context:any, canvas:any) => {
    context.strokeStyle = "red";
    context.lineWidth = 2;

    // 画面中央にガイドラインを描画
    context.beginPath();
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    context.moveTo(0, canvas.height / 2);
    context.lineTo(canvas.width, canvas.height / 2);
    context.stroke();
  }
  const drawBoundingBox = (context:any, location:any) => {
    context.strokeStyle = "green";
    context.lineWidth = 4;

	console.log(location);
	
    context.beginPath();
    context.moveTo(location.topLeftCorner.x, location.topLeftCorner.y);
    context.lineTo(location.topRightCorner.x, location.topRightCorner.y);
    context.lineTo(location.bottomRightCorner.x, location.bottomRightCorner.y);
    context.lineTo(location.bottomLeftCorner.x, location.bottomLeftCorner.y);
    context.closePath();
    context.stroke();
  }

  // フレームをスキャンしてQRコードを検出
  const scanFrame = (): void => {
    if (!scanning || !canvasElement || !videoElement) return;

    const canvasContext = canvasElement.getContext('2d');
    if (!canvasContext) return;

    canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    const imageData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height);
		
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

		drawGuideLines(canvasContext, canvasElement);

    if (qrCode) {
			drawBoundingBox(canvasContext, qrCode.location);

      result = qrCode.data; // QRコードの内容を取得
      // scanning = false; // スキャンを停止
      // stopCamera(); // カメラを停止

			const memberCode = parseQrText(result);
			
			onRegister(memberCode);

			
      setTimeout(()=>requestAnimationFrame(scanFrame), 2000); // 次のフレームをスキャン
    } else {
      requestAnimationFrame(scanFrame); // 次のフレームをスキャン
    }
  };

	onMount(async ()=>{
		await asyncStartCamera();
	});

  // コンポーネントが破棄されたときにカメラを停止
  onDestroy(async () => {
    await asyncStopCamera();
  });
	
	const parseQrText = (text:string) => {
		let matches = null;
		if ((matches = text.match(/^[^,]+,([^,]+),[^,]+$/)) !== null) {
			return matches[1];
		} else {
			throw new Error('データ形式が正しくありません');
		}
	}
</script>

<style>
  video {
    width: 100%;
    max-width: 400px;
    border: 1px solid #ccc;
  }

  canvas {
    display: none; /* QRコード解析用 */
  }

</style>

<div>
  <h1 class="text-center">QRコードを四角い枠に映してください</h1>
  <video bind:this={videoElement}></video>
  <canvas bind:this={canvasElement} width="400" height="400"></canvas>
</div>