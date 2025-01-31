<script lang="ts">
  import axios from 'axios';
	import { Button, Img, Input, Modal } from 'flowbite-svelte';
	import { selectedEvent, showsEventLoadDialog } from '$lib/stores';
	import { TimingEvent } from '$lib/api/TimingEvent';
	import { TimingPoint } from '$lib/api/TimingPoint';

	let eventCode: string = '21test';
	let userId: string = '21test';
	let userPassword: string = 'Ez6t';
	// let eventCode: string = '24qrtest';
	// let userId: string = 'test';
	// let userPassword: string = 'test';

	let loading = false;

	const asyncLoadEvent = async() => {
		loading = true;

		// @TODO PWA化時にenvの内容がundefinedになってしまう
		const serverName:string = 'https://stg56.qr-timing.jp';//import.meta.env.VITE_API_BASE_URL;
		
		try {
			const resApiEvent = await axios.get(`${serverName}/api/v2/events/${eventCode}`);
			const data = resApiEvent.data;

			const event = new TimingEvent({
				eventId:data.event_id,
				eventCode:data.event_code,
				eventDate:data.event_date,	//dayjs(data.event_date),
				eventTitle:data.event_title,
				eventUpdatedAt:data.updated_at,	//dayjs(data.updated_at),
				points: data.points.map((point:any) => 
					new TimingPoint({
						pointCode: point.point_code,
						pointId: point.point_id,
						pointTitle: point.point_title,
						sortOrder: point.sort_order,
					}
				)),
			});
			$selectedEvent = event;

			console.log(`event:`)
			console.log(event);
			console.log(resApiEvent.data);

			$showsEventLoadDialog = false;
		} catch (e) {
			console.log('error');
			console.error(e);
		}

		loading = false;
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

<Modal title="イベント情報の取得" size="xs" bind:open={$showsEventLoadDialog}>

{#if !loading}
	<div class="row">
		<section class="title">イベント名</section>
		<section class="body">
			<Input type="text" bind:value={eventCode} />
		</section>
	</div>

	<div class="row">
		<section class="title">認証ID</section>
		<section class="body">
			<Input type="text" bind:value={userId} />
		</section>
	</div>

	<div class="row">
		<section class="title">認証PASS</section>
		<section class="body">
			<Input type="text" bind:value={userPassword} />
		</section>
	</div>

{:else}
	<div class="flex justify-center content-center">
		<Img src="/loading.svg" class="w-10 h-10" />
		<div class="m-2">読込中</div>
	</div>
{/if}

	<svelte:fragment slot="footer">
		<Button disabled={loading} on:click={()=>$showsEventLoadDialog=false} color="alternative">キャンセル</Button>
		<Button disabled={loading} on:click={asyncLoadEvent} class="text-primary">OK</Button>
  </svelte:fragment>
</Modal>
