<script lang="ts">
	import { db } from "$lib/db/db";
	import type LogEntity from "$lib/db/LogEntity";
	import { onMount } from "svelte";
	import { selectedEvent, selectedPoint, selectedLogId } from '$lib/stores';
	import { goto } from "$app/navigation";
	import type { TimingPoint } from "$lib/api/TimingPoint";
	import { dayjs, type Dayjs } from '$lib/type/Dayjs';
	import { page } from '$app/stores';
	import type RecordEntity from "$lib/db/RecordEntity";
	import { RegisterMode, RegisterModeState } from "$lib/type/RegisterMode";
    import Icon from "@iconify/svelte";
    import { RegisterMethodState } from "$lib/type/RegisterMethod";
    import { Button } from "flowbite-svelte";
    import type MemberEntity from "$lib/db/MemberEntity";
    import type { TimingEvent } from "$lib/api/TimingEvent";
	
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
	let unreadMemberList:Array<MemberEntity> = [];

	onMount(async () => {

		const selectA = db.asyncFetchLog(logId);
		const selectB = db.asyncFetchRecord(logId);
		const selectC = db.asyncFetchMemberUnreadOnLog(logId);
		
		[log, recordList, unreadMemberList] = await Promise.all([selectA, selectB, selectC])
		if (log === null) goto('/ref');

	});


  // CSVフォーマットに変換する関数
  const convertToCSV = (eventDate:Dayjs, records:Array<RecordEntity>) => {
    
		const rows = records.map(record =>{
			const time = dayjs(record.time);
			const rowPart1 = `${record.member_code},${record.race_num},${dayjs(record.time).format('h:mm:ss')},${dayjs(record.time).format('SSS')},`;

			const diffDay:number = time.diff(eventDate, 'day');
			
			const rowPart2:string = (diffDay != 0) ? diffDay.toString() : '';

			return `${rowPart1}${rowPart2}`;
		});

		return rows.join("\r\n") + "\r\n";		
  };

	const downloadCSV = (fileName:string, csvString:string) => {
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

	const asyncDownloadRecords = async () => {
		if (!$selectedEvent || !$selectedPoint) return;

		const records = await db.asyncFetchRecord(logId);

		const csvString = convertToCSV(dayjs($selectedEvent.eventDate), records);

		const fileName = `${$selectedEvent.eventId}_${$selectedPoint.pointCode}_${logId.toString().padStart(4, '0')}`;
		downloadCSV(fileName, csvString);

	}
</script>

<section>
	<Button class="bg-primary m-2 whitespace-nowrap" onclick={asyncDownloadRecords}>recordダウンロード</Button>

</section>

<section class="head">
	{#if log}
	<div>{ $page.params.log_id.toString().padStart(4, '0') }：{ pointList[log.point_id].pointTitle }</div>
	{/if}
</section>

<div class="scroll-container">
	<table class="refd">
		<thead>
			<tr>
				<th>SEQ</th>
				<th>NO.</th>
				<th>NAME</th>
				<th>TIME</th>
				<th>送信</th>
				<th>モード</th>
				<th>方法</th>
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

			{#each unreadMemberList as member}
			<tr>
				<td></td>
				<td>{ member.bib_number }</td>
				<td>{ member.name }</td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
			</tr>
			{/each}
		</tbody>

	</table>
</div>


<style lang="postcss">
	body {
		@apply p-1;
	}
	section.head {
		@apply bg-cyan-200;
		@apply flex justify-center;
		@apply ml-1 mr-1;
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

	.scroll-container {
		@apply ml-1 mr-1 mb-1;
		width: calc(100% - 8px);  /* 幅を設定 */
		height: 100%; /* 高さを設定 */
		overflow: auto; /* スクロールを有効にする */
		border: 1px solid #ccc; /* 枠線を追加 */
	}
/* 	
	.table-wrapper {
		max-height: 300px;
		overflow-y: auto;
	}
	table.refd {
		border-collapse: collapse;

	}
	table.refd tbody {
		display: block;
		max-height: 200px;
		overflow-y: scroll;
		width: calc(100% + 17px);
	}
	table.refd thead, tbody tr {
		display: table;
		width: calc(100%);
		table-layout: fixed;
	}
	
	table.refd col:nth-child(5) { width: 20px; }
	table.refd col:nth-child(6) { width: 20px; }
	table.refd col:nth-child(7) { width: 20px; } */
</style>