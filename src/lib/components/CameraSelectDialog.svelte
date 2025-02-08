<script lang="ts">
  import { Button, Modal, Radio } from 'flowbite-svelte';
	import { dialogVisibility, isCameraMirrored, selectedCameraId, selectedEvent } from '$lib/stores';
		
	import { onMount } from 'svelte';
	import { asyncCameraDevices, Camera } from '$lib/type/CameraManager';


	const props = $props();
	const { onCameraSelected } = props;
	

	if (!$selectedEvent) {
		console.log('selectedEvent is NULL!');
		$dialogVisibility.cameraSelect = false;
	}

	//let cameraList:Array<CameraDevice> = $state([]);
		let cameraList:Array<Camera> = $state([]);

	onMount(async() => {
		// カメラ一覧を取得
		//cameraList = await Html5Qrcode.getCameras();
		cameraList = await asyncCameraDevices();

	});
	
	const handleCameraSelectClick = async (camera:Camera) => {
		$selectedCameraId = camera.id;
		$dialogVisibility.cameraSelect = false;

		// 左右反転の自動設定
		$isCameraMirrored = await camera.asyncIsFacing();

		onCameraSelected();		// 親から指定のコールバック
	}
</script>

<style lang="postcss">

</style>

<Modal title="カメラの切り替え" size="xs" bind:open={$dialogVisibility.cameraSelect}>

{#if cameraList.length == 0}
	<div>カメラが見つかりません</div>
{:else}
	<ul class="w-100 divide-y divide-gray-200 dark:divide-gray-600">
	{#each cameraList as camera, idx}
		<li>
			<Radio class="pt-3 pb-3 pl-5 hover:bg-gray-300"
				bind:group={ $selectedCameraId! } value={camera.id}
				onclick={()=>handleCameraSelectClick(camera)}>
				{ `${idx} : ${camera.label}` }
			</Radio>
		</li>
	{/each}
	</ul>
{/if}


	<svelte:fragment slot="footer">
		<Button onclick={()=>$dialogVisibility.cameraSelect=false} color="alternative">キャンセル</Button>
  </svelte:fragment>
	
</Modal>
