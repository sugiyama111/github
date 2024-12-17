<script lang="ts">
let inputValue:string = '';

const inputNum = (str:string)=>{
	
	if (inputValue.length >= 8) return;
	if (str == '0' && inputValue == '') return;

	inputValue += str;
}

const clearNum = () => {
	inputValue = '';
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
	aspect-ratio: 1.2;
	margin: 5px;
	font-size: 8vw;
	color: white;
	@apply bg-primary;
}
.key.clear {
	@apply bg-blue-600;
	font-size: 7vw;
}
.key.register {
	@apply bg-red-600;
	font-size: 7vw;
}
</style>

<div>
	<section class="input h-14 text-center text-5xl text-white">
		{ inputValue }
	</section>
	<section class="keypad">
		<button class="key" on:click={()=>inputNum('1')}>1</button>
		<button class="key" on:click={()=>inputNum('2')}>2</button>
		<button class="key" on:click={()=>inputNum('3')}>3</button>

		<button class="key" on:click={()=>inputNum('4')}>4</button>
		<button class="key" on:click={()=>inputNum('5')}>5</button>
		<button class="key" on:click={()=>inputNum('6')}>6</button>

		<button class="key" on:click={()=>inputNum('7')}>7</button>
		<button class="key" on:click={()=>inputNum('8')}>8</button>
		<button class="key" on:click={()=>inputNum('9')}>9</button>

		<button class="key clear" on:click={()=>clearNum()}>クリア</button>
		<button class="key" on:click={()=>inputNum('0')}>0</button>
		<button class="key register">登録</button>
	</section>
	

</div>
