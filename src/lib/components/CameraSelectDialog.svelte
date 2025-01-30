<script lang="ts">
  import { Button, Modal, Radio } from 'flowbite-svelte';
	import { selectedCameraId, selectedEvent } from '$lib/stores';
	import { showsCameraSelectDialog } from '$lib/stores';
	
	import { onMount } from 'svelte';
	import { Html5Qrcode, type CameraDevice } from 'html5-qrcode';

	const props = $props();
	const { onCameraSelected } = props;
	

	if (!$selectedEvent) {
		console.log('selectedEvent is NULL!');
		$showsCameraSelectDialog = false;
	}

	let cameraList:Array<CameraDevice> = [];

	onMount(async() => {
		// カメラ一覧を取得
		cameraList = await Html5Qrcode.getCameras();

	});
	
	const handleCameraSelectClick = (camera:CameraDevice) => {
		$selectedCameraId = camera.id;
		$showsCameraSelectDialog = false;
		onCameraSelected();		// 親から指定のコールバック
	}
</script>

<style lang="postcss">

</style>

<Modal title="カメラの切り替え" size="xs" bind:open={$showsCameraSelectDialog}>

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
		<Button on:click={()=>$showsCameraSelectDialog=false} color="alternative">キャンセル</Button>
  </svelte:fragment>
	
</Modal>
