<script lang="ts">
  import { Img, Modal } from 'flowbite-svelte';
	import { dialogVisibility } from '$lib/stores';

</script>

<Modal title="名簿データ取込中" size="xs" bind:open={$dialogVisibility.memberLoad}>
	<div class="flex justify-center content-center">
		<Img src="/loading.svg" class="w-10 h-10" />
		<div class="m-2">しばらくお待ちください...</div>
	</div>
</Modal>
