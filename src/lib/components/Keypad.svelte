<script lang="ts">
	import Icon from "@iconify/svelte";

	const props = $props();
	const { onClose, onRegister } = props;
	
	let inputBibNumber = $state('');


	const inputNum = (str:string)=>{
		
		if (inputBibNumber.length >= 8) return;
		if (str == '0' && inputBibNumber == '') return;

		inputBibNumber += str;
	}

	const clearNum = () => {
		inputBibNumber = '';
	}

	const onRegisterClick = () => {
		if (inputBibNumber == '') return;

		onRegister(inputBibNumber);
		inputBibNumber = '';
	}

</script>

<style lang="postcss">
	.keypad {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
	}
	.key {
		border-radius: 10px;
		border: gray solid 1px;
		margin: 5px;
		font-size: clamp(16px, 7vw, 48px);
		@apply bg-primary text-white;
	}
	.key.clear {
		@apply bg-blue-600;
		font-size: clamp(16px, 4vw, 48px);
	}
	.key.register {
		@apply bg-red-600;
		font-size: clamp(16px, 4vw, 48px);
	}
</style>

<div style="float:right; cursor:pointer; margin-right:-6px; margin-top:-6px;">
	<Icon icon="mdi:close" class="size-6" onclick={onClose} />
</div>

<div class="p-5">
	<section class="p-3 h-16 text-4xl text-center align-middle bg-white">
		{ inputBibNumber }
	</section>
	<section class="keypad">
		<button class="key" onclick={()=>inputNum('1')}>1</button>
		<button class="key" onclick={()=>inputNum('2')}>2</button>
		<button class="key" onclick={()=>inputNum('3')}>3</button>

		<button class="key" onclick={()=>inputNum('4')}>4</button>
		<button class="key" onclick={()=>inputNum('5')}>5</button>
		<button class="key" onclick={()=>inputNum('6')}>6</button>

		<button class="key" onclick={()=>inputNum('7')}>7</button>
		<button class="key" onclick={()=>inputNum('8')}>8</button>
		<button class="key" onclick={()=>inputNum('9')}>9</button>

		<button class="key clear" onclick={()=>clearNum()}>クリア</button>
		<button class="key" onclick={()=>inputNum('0')}>0</button>
		<button class="key register" onclick={onRegisterClick}>登録</button>
	</section>
	

</div>
