<script lang="ts">
	import { db } from "$lib/db/db";
	import type LogEntity from "$lib/db/LogEntity";
	import { onMount } from "svelte";
	import { selectedEvent, selectedLogId } from '$lib/stores';
	import { goto } from "$app/navigation";
	import type { TimingPoint } from "$lib/api/TimingPoint";
	import { dayjs } from '$lib/type/Dayjs';
	import Icon from "@iconify/svelte";

	if (!$selectedEvent) goto('/');

	let pointList:{[key:string]:TimingPoint} = {};	// キー(TimingPoint.pointId), 値(TimingPoint)
	$selectedEvent!.points.forEach(
		(point:TimingPoint)=>pointList[point.pointId] = point
	);

	
	let logList:Array<LogEntity> = [];
	
	onMount(async () => {
		logList = await db.asyncFetchLogList();
	});


</script>


<table>
	<thead>
		<tr>
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
			class:current={$selectedLogId == log.log_id}>
			<td>
			{#if $selectedLogId == log.log_id}
				<Icon icon="material-symbols:play-circle-outline-rounded"
					class="text-2xl text-gray-700 ml-4" />
			{/if}
			</td>
			<td>
				<div>{ log.log_id.toString().padStart(4, '0') }</div>
				<div class="-mt-1">
					<span class="text-xs">
						{dayjs(log.log_start_time).format('YYYY/')}
					</span>
					<span class="text-sm">
						{dayjs(log.log_start_time).format('MM/DD HH:mm')}
					</span>
					<span class="text-xs">
						{dayjs(log.log_start_time).format(':ss')}
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

<style lang="postcss">
	table {
		@apply m-1;
		border: 1px solid lightgray;
	}
	thead {
		@apply bg-gray-300;
	}
	tbody tr {
		border-bottom: 1px solid lightgray;
	}
	/* tbody tr.current {
		@apply bg-emerald-200;
	} */
	tbody tr:hover {
		@apply bg-cyan-200;
		cursor: pointer;
	}
	td {
		@apply text-center;
	}
</style>