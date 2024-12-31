<script lang="ts">
  import { Button, Modal, Radio } from 'flowbite-svelte';
	import { selectedEvent, selectedLogId, selectedPoint } from '$lib/stores';
	import { showsPointSelectDialog } from '$lib/stores';
	import type { TimingPoint } from '$lib/api/TimingPoint';
	import { db } from '$lib/db/db';
    import { QRTToast } from '$lib/QRTToast';

	//$: selectedId = $selectedPoint?.pointId;
	let selectedId = $selectedPoint?.pointId;

	if (!$selectedEvent) {
		$showsPointSelectDialog = false;
	}

	const asyncSelectPoint = async (point:TimingPoint) => {
		// 万一、イベントが選択されていない場合は何もしない
		if (!$selectedEvent) {
			new QRTToast().error('イベントが選択されていません');
			return;
		}
		
		// 地点を選択
		$selectedPoint = point;

		// ログを切り替える
		const newLogId = await db.asyncSwitchNextLog($selectedEvent, point);
		$selectedLogId = newLogId;
	}

</script>

<style lang="postcss">
	.title {
		@apply w-24;
		@apply text-gray-500;
	}
	.body {
		@apply flex;
		@apply grow;
		@apply text-blue-600;
	}
	.row {
		@apply pb-4;
		@apply flex items-center;
		@apply h-10 leading-normal;
		border-bottom: 1px solid gray;
	}
</style>

<Modal title="地点の選択" size="xs" bind:open={$showsPointSelectDialog}>

	<ul class="w-100 divide-y divide-gray-200 dark:divide-gray-600">
	{#each $selectedEvent!.points as point}
		<li>
			<Radio class="pt-3 pb-3 pl-5 hover:bg-gray-300"
				bind:group={ selectedId } value={ point.pointId }
				on:click={()=>{asyncSelectPoint(point); $showsPointSelectDialog = false;}}>
				{ point.pointTitle }
			</Radio>
		</li>
	{/each}
	</ul>


	<svelte:fragment slot="footer">
		<Button on:click={()=>$showsPointSelectDialog=false} color="alternative">キャンセル</Button>
  </svelte:fragment>
	
</Modal>
