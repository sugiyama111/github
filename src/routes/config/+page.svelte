<script lang="ts">
  import { Button, Range, Toggle } from 'flowbite-svelte';
	import { selectedPoint } from '../../stores';

	let allowsDuplicate:boolean = true;
	let allowsSending:boolean = true;
	$: disablesSending = !allowsSending;
	let sendingIntervalSec = 30;

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
		@apply flex;
		height: 2em;
		line-height: 2em;
		border-bottom: 1px solid gray;
		@apply justify-center;
	}
</style>

<div class="row">
	<section class="title">イベント名</section>
	<section class="body grow">
		test
	</section>
</div>

<div class="row">
	<section class="title">更新日時</section>
	<section class="body grow">
		test2
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
		{ allowsDuplicate ? '重複可' : '重複不可' }
	</section>
	<Toggle color="green" bind:checked={allowsDuplicate} />
</div>

<div class="row">
	<section class="title">データ送信</section>
	<section class="body">
		{ allowsSending ? '送信可' : '送信不可' }
	</section>
	<Toggle color="green" bind:checked={allowsSending} />
</div>

<div class="row">
	<section class="title">名簿取込</section>
	<section class="body">
		0件 取得済
	</section>
	<Button class="bg-primary">取込</Button>
</div>

<div class="row">
	<section class="title">送信間隔</section>
	<section class="body">
		{ sendingIntervalSec == 0 ? 'すぐ送信' : `${sendingIntervalSec}秒間隔` }
	</section>
	<section class="flex items-center" style="line-height:2em;">
		<Range size="sm" min="0" max="60" step="15"
			bind:value={sendingIntervalSec} bind:disabled={disablesSending} />
	</section>
</div>

<div class="row">
	<section class="title">Install ID</section>
	<section class="body grow">
		1234567890
	</section>
</div>


