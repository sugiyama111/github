<script lang="ts">
  import { Button, Checkbox, Modal, Range, Toggle } from 'flowbite-svelte';
	import { selectedEvent, selectedPoint, config } from '../stores';
	import { showsConfigDialog, showsEventLoadDialog } from '../stores';
    import { RegisterMode } from '$lib/type/RegisterMode';

	$: disablesSending = !$config.allowsSending ;
	
	const clearEvent = () => {
		$selectedEvent = null;
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

<Modal title="管理情報" bind:open={$showsConfigDialog}>

{#if $selectedEvent}
	<div class="row">
		<Button class="bg-primary" on:click={clearEvent}>イベントクリア</Button>
		<Button class="bg-primary">名簿クリア</Button>
	</div>
{:else}
	<div class="row">
		<Button class="bg-primary" on:click={()=>{$showsEventLoadDialog = true; $showsConfigDialog = false;}}>イベントの取得</Button>
	</div>
{/if}

{#if !$selectedEvent}
	<div class="row">
		<section class="title">イベント情報</section>
		<section class="body grow">
			まだ読み込まれていません
		</section>
	</div>

{:else}
	<div class="row">
		<section class="title">イベント名</section>
		<section class="body grow">
			{ $selectedEvent.eventTitle }
		</section>
	</div>

	<div class="row">
		<section class="title">更新日時</section>
		<section class="body grow">
			{ $selectedEvent.eventUpdatedAt.format('YYYY/MM/DD HH:mm:ss')}
		</section>
	</div>

	<div class="row">
		<section class="title">計測地点</section>
		<section class="body">
			{ $selectedPoint?.name }
			testtest
		</section>
		<Button class="bg-primary">地点</Button>
	</div>

	<div class="row">
		<section class="title">重複読込</section>
		<section class="body">
			{ $config.allowsDuplicate ? '重複可' : '重複不可' }
		</section>
		<Toggle color="green" bind:checked={$config.allowsDuplicate} />
	</div>

	<div class="row">
		<section class="title">データ送信</section>
		<section class="body">
			{ $config.allowsSending ? '送信可' : '送信不可' }
		</section>
		<Toggle color="green" bind:checked={$config.allowsSending} />
	</div>

	<div class="row">
		<section class="title">送信間隔</section>
		<section class="body">
			{ $config.sendingIntervalSec == 0 ? 'すぐ送信' : `${$config.sendingIntervalSec}秒間隔` }
		</section>
		<section class="flex items-center" style="line-height:2em;">
			<Range size="sm" min="0" max="60" step="15"
				bind:value={$config.sendingIntervalSec} bind:disabled={disablesSending} />
		</section>
	</div>

	<div class="row">
		<section class="title">モード</section>
		<section class="body">
			<Checkbox checked={$config.availableRegisterModes[RegisterMode.CHECK as keyof typeof RegisterMode]}>{ RegisterMode.CHECK.text}</Checkbox>
			{ $config.allowsSending ? '送信可' : '送信不可' }
		</section>
		<Toggle color="green" bind:checked={$config.allowsSending} />
	</div>


	<div class="row">
		<section class="title">名簿取込</section>
		<section class="body">
			0件 取得済
		</section>
		<Button class="bg-primary">取込</Button>
	</div>

{/if}

	<div class="row">
		<section class="title">Install ID</section>
		<section class="body grow">
			1234567890
		</section>
	</div>

</Modal>
