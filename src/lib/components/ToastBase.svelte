<script lang="ts">
	import Icon from '@iconify/svelte';
  export let icon;
  export let message;
	export let iconColor;
</script>

<div class="flex align-middle whitespace-nowrap p-0">
  <Icon icon={icon} class="text-2xl mr-1" color={iconColor} />
  <span class="font-bold">{message}</span>
</div>

<style>
  /* 必要に応じてスタイルを追加できます */
</style>