<script lang="ts">
  import { Button, Modal, Radio } from 'flowbite-svelte';
	import { isTrial, lastRegistered, selectedEvent, selectedLogId, selectedPoint, unsentCount } from '$lib/stores';
	import { dialogVisibility } from '$lib/stores';
	import type { TimingPoint } from '$lib/api/TimingPoint';
	import { db } from '$lib/db/db';
	import { Toast } from '$lib/Toast';
    import { getContext } from 'svelte';

	//$: selectedId = $selectedPoint?.pointId;
	let selectedId = $selectedPoint?.pointId;

	if (!$selectedEvent) {
		$dialogVisibility.pointSelect = false;
	}

	const asyncSwitchLog:Function = getContext('asyncSwitchLog');

	const asyncSelectPoint = async (point:TimingPoint) => {
		// 万一、イベントが選択されていない場合は何もしない
		if (!$selectedEvent) {
			Toast.Error('イベントが選択されていません');
			return;
		}
		
		// 地点を選択
		$selectedPoint = point;

		// ログ切り替え
		await asyncSwitchLog(point, $isTrial);
	}

</script>

<style lang="postcss">

</style>

<Modal title="地点の選択" size="xs" bind:open={$dialogVisibility.pointSelect}>

	<ul class="w-100 divide-y divide-gray-200 dark:divide-gray-600">
	{#each $selectedEvent!.points as point}
		<li>
			<Radio class="pt-3 pb-3 pl-5 hover:bg-gray-300"
				bind:group={ selectedId } value={ point.pointId }
				on:click={()=>{asyncSelectPoint(point); $dialogVisibility.pointSelect = false;}}>
				{ point.pointTitle }
			</Radio>
		</li>
	{/each}
	</ul>


	<svelte:fragment slot="footer">
		<Button on:click={()=>$dialogVisibility.pointSelect=false} color="alternative">キャンセル</Button>
  </svelte:fragment>
	
</Modal>
