<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
	import { Html5Qrcode } from 'html5-qrcode';
	
  let qrCodeResult = '';
  let cameraActive = false;
  let html5QrCode: Html5Qrcode | null;
  let videoElementId = 'qr-reader';


  // カメラを開始する関数
  const startCamera = async () => {
    if (cameraActive) return;

    html5QrCode = new Html5Qrcode(videoElementId);
    try {
      const cameras = await Html5Qrcode.getCameras();
      if (cameras && cameras.length > 0) {
        const cameraId = cameras[0].id;

        cameraActive = true;
        await html5QrCode.start(
          cameraId,
          {
            fps: 10, // フレーム毎秒
            qrbox: { width: 250, height: 250 }, // QRコード読み取りエリアのサイズ
          },
          (decodedText) => {
            qrCodeResult = decodedText; // QRコードの内容を取得
            stopCamera(); // 必要に応じて停止
          },
          (errorMessage) => {
            console.error('読み取りエラー:', errorMessage);
          }
        );
      } else {
        console.error('カメラが見つかりません');
      }
    } catch (error) {
      console.error('カメラの起動に失敗:', error);
    }
  };

  // カメラを停止する関数
  const stopCamera = async () => {
    if (!cameraActive || !html5QrCode) return;

    await html5QrCode.stop();
    html5QrCode = null;
    cameraActive = false;
  };

  onDestroy(() => {
    stopCamera(); // コンポーネント破棄時にカメラを停止
  });
</script>


<div>
  <h1>QRコードリーダー</h1>
  <div id="qr-reader"></div>
  <div class="result">
    <p>読み取り結果: {qrCodeResult}</p>
    <button on:click={startCamera} disabled={cameraActive}>カメラ開始</button>
    <button on:click={stopCamera} disabled={!cameraActive}>カメラ停止</button>
  </div>
</div>
