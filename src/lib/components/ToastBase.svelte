<script lang="ts">
	import Icon from '@iconify/svelte';
  export let icon;
  export let message;
	export let iconColor;
</script>

<div class="flex items-center align-middle whitespace-nowrap p-0 -mr-2">
  <Icon icon={icon} class="text-xl mr-1" color={iconColor} />
  <span>{message}</span>
</div>

<style>
  /* 必要に応じてスタイルを追加できます */
</style>