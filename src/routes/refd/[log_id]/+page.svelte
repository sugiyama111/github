<script lang="ts">
	import { db } from "$lib/db/db";
	import type LogEntity from "$lib/db/LogEntity";
	import { onMount } from "svelte";
	import { selectedEvent } from '$lib/stores';
	import { goto } from "$app/navigation";
	import type { TimingPoint } from "$lib/api/TimingPoint";
	import { dayjs } from '$lib/type/Dayjs';
	import { page } from '$app/stores';
	import type RecordEntity from "$lib/db/RecordEntity";
	import { RegisterMode, RegisterModeState } from "$lib/type/RegisterMode";
    import Icon from "@iconify/svelte";
    import { RegisterMethodState } from "$lib/type/RegisterMethod";
	
	if (!$selectedEvent) goto('/');

	// パラメータがlog_id(number)に合致しない場合は一覧に戻す
	if (!/^[0-9]+$/.test($page.params.log_id)) goto('/ref');


	let pointList:{[key:string]:TimingPoint} = {};	// キー(TimingPoint.pointId), 値(TimingPoint)
	$selectedEvent!.points.forEach(
		(point:TimingPoint)=>pointList[point.pointId] = point
	);
	
	const logId:number = Number($page.params.log_id);
	let log:LogEntity|null = null;
	let recordList:Array<RecordEntity> = [];


	onMount(async () => {

		const selectA = db.asyncFetchRecord(logId);
		const selectB = db.asyncFetchLog(logId);

		[recordList, log] = await Promise.all([selectA, selectB])
		if (log === null) goto('/ref');

	});

</script>


<section class="head">
	{#if log}
	<div>{ $page.params.log_id.toString().padStart(4, '0') }：{ pointList[log.point_id].pointTitle }</div>
	{/if}
</section>

<table>
	<thead>
		<tr>
			<th>SEQ</th>
			<th>NO.</th>
			<th>NAME</th>
			<th>TIME</th>
			<th>送信</th>
			<th>方法</th>
			<th>モード</th>
		</tr>
	</thead>
	<tbody>
		{#each recordList as record}
		<tr>
			<td>{ record.seq }</td>
			<td>{ record.race_num }</td>
			<td>{ record.member_name }</td>
			<td>
				<span class="text-sm">
					{dayjs(record.time).format('HH:mm:ss')}
				</span>
				<span class="text-xs">
					{dayjs(record.time).format('.SSS')}
				</span>
			</td>
			<td>{ record.sent == 1 ? '済' : '' }</td>
			<td><div class="flex justify-center items-center"><Icon icon={ RegisterModeState.CodeToMode(record.mode)?.icon ?? ""} /></div></td>
			<td><div class="flex justify-center items-center"><Icon icon={ RegisterMethodState.CodeToMethod(record.method)?.icon ?? ""} /></div></td>
		</tr>
		{/each}
	</tbody>

</table>

<style lang="postcss">
	section.head {
		@apply bg-cyan-200;
		@apply ml-1 mr-1 mt-1;
		@apply flex justify-center;
	}
	table {
		@apply ml-1 mr-1 mb-1;
		border: 1px solid lightgray;
	}
	thead {
		@apply bg-gray-300;
	}
	tbody tr {
		border-bottom: 1px solid lightgray;
	}
	td {
		@apply text-center;
	}
</style>