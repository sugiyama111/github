<script lang="ts">
	import { db } from "$lib/db/db";
	import type LogEntity from "$lib/db/LogEntity";
	import { onMount } from "svelte";
	import { selectedEvent, selectedLogId, isTrial, selectedPoint } from '$lib/stores';
	import { goto } from "$app/navigation";
	import type { TimingPoint } from "$lib/api/TimingPoint";
	import { dayjs } from '$lib/type/Dayjs';
	import Icon from "@iconify/svelte";
	import { Checkbox } from "flowbite-svelte";

	if (!$selectedEvent) goto('/');

	let pointList:{[key:string]:TimingPoint} = {};	// キー(TimingPoint.pointId), 値(TimingPoint)
	$selectedEvent!.points.forEach(
		(point:TimingPoint)=>pointList[point.pointId] = point
	);

	let showsTrialLog:boolean = $state(false);
	let logList:Array<LogEntity> = $state([]);

	$effect(()=>{
		// effectでの監視対象とするため、変数を何もせず配置する
		$isTrial;
		$selectedPoint;
		
		asyncReloadLogList();
	});

	const asyncReloadLogList = async () => {
		logList = await db.asyncFetchLogList();
	}

	onMount(async () => {
		await asyncReloadLogList();
	});

</script>


<section class="p-2">
	<Checkbox bind:checked={showsTrialLog} class="inline-block cursor-pointer">お試しモードのログを表示</Checkbox>
</section>


<div class="scroll-container">
	<table>
		<thead>
			<tr>
				<th></th>
				<th></th>
				<th>
					<div>LOG ID</div>
					<div class="text-xs -mt-1 mb-1">ログ開始日時</div>
				</th>
				<th>地点名</th>
				<th>件数</th>
			</tr>
		</thead>
		<tbody>
			{#each logList as log}
			<tr onclick={()=>goto(`/refd/${log.log_id}`)}
				class:current={$selectedLogId == log.log_id}
				class:bg-trial={log.is_trial}
				class:collapse={log.is_trial && !showsTrialLog}
				>
				<td>
				{#if $selectedLogId == log.log_id}
					<Icon icon="material-symbols:play-circle-outline-rounded"
						class="text-2xl text-gray-700 ml-4" />
				{/if}
				</td>
				<td>
					{#if log.is_trial}お試し{/if}
				</td>
				<td>
					<div>{ log.log_id.toString().padStart(4, '0') }</div>
					<div class="-mt-1">
						<span class="whitespace-nowrap">
							<span class="text-xs">
								{dayjs(log.log_start_time).format('YYYY/')}
							</span>
							<span class="text-sm">
								{dayjs(log.log_start_time).format('MM/DD')}
							</span>
						</span>
						<span class="whitespace-nowrap">
							<span class="text-sm">
								{dayjs(log.log_start_time).format(' HH:mm')}
							</span>
							<span class="text-xs">
								{dayjs(log.log_start_time).format(':ss')}
							</span>
						</span>
					</div>
				</td>
				<td>
					{pointList[log.point_id].pointTitle}
				</td>
				<td>
					{log.record_count}
				</td>
			</tr>
			{/each}
		</tbody>

	</table>
</div>


<style lang="postcss">
	.menu:hover {
		border: 1px solid blue;
	}

	body {
		@apply p-1;
	}
	table {
		border: 1px solid lightgray;
		width: 100%;
	}
	thead {
		@apply bg-gray-300;
	}
	th {
		@apply text-sm;
		@apply font-normal;
		@apply whitespace-nowrap;
	}
	tbody tr {
		border-bottom: 1px solid lightgray;
	}
	td {
		@apply text-center;
		@apply text-sm;
	}

	tbody tr:hover {
		@apply bg-cyan-200;
		cursor: pointer;
	}
	.scroll-container {
		@apply ml-1 mr-1 mb-1;
		width: calc(100% - 8px);  /* 幅を設定 */
		height: 100%; /* 高さを設定 */
		overflow: auto; /* スクロールを有効にする */
		border: 1px solid #ccc; /* 枠線を追加 */
	}
</style>