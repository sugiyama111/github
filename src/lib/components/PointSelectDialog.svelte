<script lang="ts">
  import { Button, Modal, Radio } from 'flowbite-svelte';
	import { lastRegistered, selectedEvent, selectedLogId, selectedPoint, unsentCount } from '$lib/stores';
	import { showsPointSelectDialog } from '$lib/stores';
	import type { TimingPoint } from '$lib/api/TimingPoint';
	import { db } from '$lib/db/db';
	import { Toast } from '$lib/Toast';

	//$: selectedId = $selectedPoint?.pointId;
	let selectedId = $selectedPoint?.pointId;

	if (!$selectedEvent) {
		$showsPointSelectDialog = false;
	}

	const asyncSelectPoint = async (point:TimingPoint) => {
		// 万一、イベントが選択されていない場合は何もしない
		if (!$selectedEvent) {
			Toast.Error('イベントが選択されていません');
			return;
		}
		
		// 地点を選択
		$selectedPoint = point;

		// @TODO ログを切り替える
		// 旧ログを更新
		

		// リセットすべきstoreをリセットする
		$unsentCount = 0;
		$lastRegistered = {check:null, retire:null, skip:null};

		
		const newLogId = await db.asyncSwitchNextLog($selectedEvent, point);
		$selectedLogId = newLogId;

		// ＠TODO 送信処理を再実行
		
	}

</script>

<style lang="postcss">

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
