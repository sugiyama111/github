<script lang="ts">
  import { Img, Modal } from 'flowbite-svelte';
	import { showsMemberLoadDialog } from '$lib/stores';

</script>

<Modal title="名簿データ取込中" size="xs" bind:open={$showsMemberLoadDialog}>
	<div class="flex justify-center content-center">
		<Img src="/loading.gif" class="w-10 h-10" />
		<div class="m-2">しばらくお待ちください...</div>
	</div>
</Modal>
