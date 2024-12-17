<script lang="ts">
  import { Button, Input, Modal, Range, Toggle } from 'flowbite-svelte';
	import { selectedEvent, selectedPoint } from '../stores';
	import { showsEventLoadDialog, showsConfigDialog } from '../stores';
    import axios from 'axios';
    import { TimingEvent } from '$lib/type/TimingEvent';
    import { dayjs } from 'svelte-time/dayjs.js';

	let eventCode: string = '21test';
	let userId: string = '21test';
	let userPassword: string = 'Ez6t';

	const asyncLoadEvent = async() => {
		const serverName:string = import.meta.env.VITE_API_BASE_URL;
		
		const resApiEvent = await axios.get(`${serverName}/api/v2/events/${eventCode}`);
		const data = resApiEvent.data;

		const event = new TimingEvent({
			eventCode:data.event_code,
			eventDate:dayjs(data.event_date),
			eventTitle:data.event_title,
			eventUpdatedAt:dayjs(data.updated_at),
			points: data.points,
		});
		$selectedEvent = event;

		console.log(event);
		console.log(resApiEvent.data);

		$showsEventLoadDialog = false;
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

<Modal title="イベント情報の取得" size="xs" bind:open={$showsEventLoadDialog} on:close={()=>$showsConfigDialog=true}>

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
	
	<svelte:fragment slot="footer">
		<Button color="alternative">キャンセル</Button>
		<Button on:click={asyncLoadEvent}>OK</Button>
  </svelte:fragment>
</Modal>
