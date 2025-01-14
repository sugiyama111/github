<script lang="ts">
	import Icon from "@iconify/svelte";
	import { Tabs, TabItem, Button } from 'flowbite-svelte';
	import Camera from "$lib/components/Camera_html5.svelte";
	import Keypad from "$lib/components/Keypad.svelte";
	import { db } from "$lib/db/db";
	import MemberEntity from "$lib/db/MemberEntity";
	import RecordEntity from "$lib/db/RecordEntity";
	import { toast } from "$lib/QRTToast";
	import { scanner, config, selectedEvent, selectedPoint, selectedLogId, selectedRegisterMode, 
		showsMemberSelectDialog, showsRegisterConfirmDialog,
		lastRegistered, lastRegisteredTime, unsentCount } from "$lib/stores";
	import MemberSelectDialog from '$lib/components/MemberSelectDialog.svelte';
	import RegisterConfirmDialog from '$lib/components/RegisterConfirmDialog.svelte';
	import { dayjs, type Dayjs } from '$lib/type/Dayjs';
	import { RegisterMethod, RegisterMethodState } from "$lib/type/RegisterMethod";
	import { RegisterMode, RegisterModeState } from "$lib/type/RegisterMode";
	import { Sound } from "$lib/Sound";
	import { Vibrate } from "$lib/Vibrate";
  import { ScanInput } from "$lib/type/ScanInput";
	import { ScanInputValidator } from "$lib/ScanInputValidator";
	import type { ValidationResultState } from "$lib/type/ValidationResult";
	import { TimingEvent } from "$lib/api/TimingEvent";
    import { onMount } from "svelte";
    import { WebSocketConnector } from "$lib/WebSocketConnector";
    import { ScannerMessenger } from "$lib/ScannerMessenger";

	let inputPanel:'info' | 'camera' | 'keypad' = $state<'info' | 'camera' | 'keypad'>('info');
	let memberCollectionForSelect:MemberEntity[] = $state<MemberEntity[]>([]);
	let memberForConfirm:MemberEntity | null = $state(null);
	let measuringTime:Dayjs | null = null;
	let registerMethod:RegisterMethod | null = null;

	// 特定済みメンバー（各ダイアログで共有のためここに保持）
	let specifiedMember:MemberEntity | null = null;


	// 番号での登録
	const asyncRegisterByNumber = async (inputNumber:string, method:RegisterMethod) => {
		const memberList = await (await db.asyncFetchByNumber(inputNumber)).toArray();
		
		measuringTime = dayjs();
		registerMethod = method;

		await asyncFilterProcess(memberList);
	}

	// メンバーコードでの登録
	const asyncRegisterByMemberCode = async (inputCode:string, method:RegisterMethod) => {
		console.log('asyncRegisterByMemberCode');
		console.log(inputCode);
		const memberList = await (await db.asyncFetchByMembercode(inputCode)).toArray();

		measuringTime = dayjs();
		registerMethod = method;
		
		await asyncFilterProcess(memberList);
	}
	
	// 登録プロセス1：メンバー存在確認＆絞り込み
	const asyncFilterProcess = async (memberCollection:MemberEntity[]) => {

		// 複数存在する場合は選択ダイアログを表示
		if (memberCollection.length == 0) {
			// 音とトースト
			toast.error('名簿にみつかりません');
			Sound.Play(Sound.NOT_FOUND);
		} else if (memberCollection.length == 1) {
			// 特定できた場合(→プロセス2へ)
			specifiedMember = memberCollection[0];
			console.log(specifiedMember);
			await asyncConfirmProcess();
		} else {
			// 複数存在する場合
			memberCollectionForSelect = memberCollection;
			$showsMemberSelectDialog = true;
		}
	}

	// 登録プロセス2：登録是非確認
	const asyncConfirmProcess = async () => {
		if ($selectedRegisterMode.isCheck()) {
			// 確認不要の場合
			await asyncRegisterProcess();
		} else {
			// 確認必要の場合
			memberForConfirm = specifiedMember;
			$showsRegisterConfirmDialog = true;
		}
	}

	// 登録プロセス3：登録
	const asyncRegisterProcess = async () => {
		// 万一、記録対象のログが選ばれていない場合
		if ($selectedLogId === null) {
			toast.error('ログが選択されていません');
			return;
		}

		if (specifiedMember === null) {
			toast.error('対象メンバーが特定されていません');
			return;
		}
		if (measuringTime === null) {
			toast.error('計測時刻が異常です');
			return;
		}
		if (registerMethod === null) {
			toast.error('計測方法が選択されていません');
			return;
		}

		const nextSeq = await db.asyncFetchNewRecordSeq();
		console.log(nextSeq);
		console.log(measuringTime);

		// 登録するデータ
		const regRecordObj = {
			seq: nextSeq,
			log_id: $selectedLogId,
			member_code: specifiedMember.member_code,
			member_name: specifiedMember.name,
			race_num: specifiedMember.bib_number,
			time: measuringTime.format('YYYY/MM/DD HH:mm:ss.SSS'),
			method: registerMethod.code,
			mode:$selectedRegisterMode.getCode(),
			sent: false,
		};

    // 登録
		try {
			const record = new RecordEntity(regRecordObj);
			await db.records.add(record);

			// storeを更新：最終登録
			$lastRegistered[$selectedRegisterMode.getCode() as keyof typeof $lastRegistered] = record;
			
			

			Sound.Play(Sound.READ_OK);			// 音を鳴らす
			Vibrate.Play(Vibrate.READ_OK);	// 振動
			toast.success('登録しました');		// Toast

			// storeを更新：未送信件数
			$unsentCount = await db.asyncFetchUnsentCount($selectedLogId);

			// モーダルを条件によっては閉じる


		} catch (e) {
			console.error('登録エラー db.records.add');
			console.error(measuringTime);

		}

	}

// @TODO Zebra端末の時のみ起動する
(async () => {
	$scanner = await ScannerMessenger.asyncGetInstance((input:string)=>{
		console.log('INPUT: ' + input);
		asyncRegisterByMemberCode(input, RegisterMethod.SCANNER);
	});
})();




	let scannerStackStr:string = '';

	// onMount(()=>{
	// 	// スキャナのイベント割り当て
	// 	document.body.addEventListener('keypress', (e)=>{
	// 	  this.stackKey(e);
	// 	});
	// });


	// スキャナーからの入力を受け付けるために、入力キーをスタックする。
	// body:onloadにて割り当て
	function stackKey(e:any) {
		//if ($selectedEvent == null) return;

		const key = e.key;
// console.log('code - which');
// console.log(e.keyCode)
// console.log(e.which);
// console.log(e.key);
		
		// セミコロンが来たら出力
		if (key == ';') {
			console.log(`stackKey done@+layout.svelte val is [${scannerStackStr}]`)

			const scanInput:ScanInput = new ScanInput(
				scannerStackStr, 
				dayjs().format('YYYY/MM/DD HH:mm:ss.SSS'),
				new RegisterMethodState(RegisterMethod.SCANNER),		// スキャナ限定
				$selectedRegisterMode,
				1,//$selectedEvent.eventId,		// @TODO テストコード戻す
			);

			// 読取り後処理
			afterScan(scanInput);

			scannerStackStr = ''; // クリア
			return;
		} else {
			// 特殊記号の場合は無視
			if (key === "Unidentified") {
				console.log(`[${key}] is not valid character for QR.`)
				return;
			}

			// キーをスタックする
			scannerStackStr += key;
			//console.log(`Stacked: ${key}`);
		}
	}


	async function afterScan(_scanInput:ScanInput) {
		//if (!$selectedEvent) return;

		const validator = new ScanInputValidator(_scanInput);

		// @TODO テストコード戻す
//		const valResState:ValidationResultState = await validator.asyncValidate($selectedEvent);
		const valResState:ValidationResultState = await validator.asyncValidate(new TimingEvent({eventId:1, eventCode:'24test', eventTitle:'テスト', eventDate:'2025-1-5 18:28:20', eventUpdatedAt:'2025-1-5 18:28:20', points:[]}));

		// 異常時の処理
		if (!valResState.isSuccess()) {
			console.log(`invalid state ${valResState}`);

			// ユーザーにレスポンス(エラー)を返して終わり
			const result = valResState.getResult();

			Sound.Play(Sound.INVALID);
			toast.error(result.message);
			
			return;
		}

		// memberCodeをQRデータから取り出し
		const memberCode = _scanInput.val.split(',')[1];

		asyncRegisterByMemberCode(memberCode, RegisterMethod.SCANNER);

	}


// let scanner:ScannerMessenger | null = null;

// // @TODO Zebra端末の時のみ起動する
// (async () => {
// 	scanner = await ScannerMessenger.asyncGetInstance();
// })();

// $: {
// 	if ($showsRegisterConfirmDialog)
// }

</script>

<!-- <svelte:body bind:this={bodyElement} on:keydown={(e)=>{stackKey(e);}}/> -->
	<svelte:body on:keydown={(e)=>{stackKey(e);}}/>

<MemberSelectDialog message="複数見つかりました。対象を選んでください。" memberCollection={memberCollectionForSelect} onMemberSelected={(member:MemberEntity)=>{specifiedMember = member; asyncConfirmProcess();}} />
<RegisterConfirmDialog message="登録してよいですか？" member={memberForConfirm} onRegisterConfirmed={asyncRegisterProcess} />


<!-- body全体 -->
<section class={`bg-${$selectedRegisterMode.getCode()} flex-1 overflow-y-hidden`}>

{#if !$selectedEvent}

<!-- テスト ここから -->
<button onclick={()=>Vibrate.Play(Vibrate.READ_OK)} class="btn w-20 h-20"
	style="border:1px solid black;">振動<br>READ_OK</button>
<button onclick={()=>Vibrate.Play(Vibrate.NOT_FOUND)} class="btn w-20 h-20"
	style="border:1px solid black;">振動<br>NOT_FOUND</button>

	<button onclick={()=>{console.log('on');$scanner?.asyncTurnOn();}} class="btn w-20 h-20"
		style="border:1px solid black;">スキャナON</button>
	<button onclick={()=>{console.log('off');$scanner?.asyncTurnOff();}} class="btn w-20 h-20"
		style="border:1px solid black;">スキャナOFF</button>

	<!-- テスト ここまで -->

	<section class="flex justify-center p-6 text-lg">
		<Icon icon="mdi:alert-circle-outline" font-size="30" />
		<div>イベントを読み込んでください</div>
	</section>
{:else if !$selectedPoint}
	<section class="flex justify-center p-6 text-lg">
		<Icon icon="mdi:alert-circle-outline" font-size="30" />
		<div>地点を選択してください</div>
	</section>

{:else}

<!-- コンテンツ１：タブとモードごとの内容 -->
<div class="w-full">
  <!-- タブナビゲーション -->
	<Tabs contentClass="m-0 p-0" class="bg-gray-600">
    <div class="flex w-full">
	{#if $config.availableRegisterModes.findIndex(m => m.code == RegisterMode.CHECK.code) !== -1}
			<TabItem open={!$selectedRegisterMode.isRetire() && !$selectedRegisterMode.isSkip()}
				class="flex-1 rounded-t-lg"
				defaultClass="w-full hover:!bg-check !bg-check"
				onclick={()=>$selectedRegisterMode=new RegisterModeState(RegisterMode.CHECK)}>
				<section slot="title" class="flex gap-1 -m-3 p-3">
					<Icon icon="material-symbols:check-circle-outline" class="size-5 m-0 p-0" />
					<div class="whitespace-nowrap">チェック</div>
				</section>

				<section class="pt-4 bg-check">
					<article class="last-data">
						<div class="mode-chip bg-check"><Icon icon="material-symbols:check-circle-outline" />チェック</div>
						<div>No. { $lastRegistered['check']?.race_num}</div>
						<div>{ $lastRegistered['check']?.member_name }</div>
						<div>
							{#if $lastRegisteredTime['check']}
							<span class="text-sm">{ $lastRegisteredTime['check'].format('YYYY') }/</span>{ $lastRegisteredTime['check'].format('MM/DD HH:mm') }<span class="text-sm">:{ $lastRegisteredTime['check'].format('ss') }</span>
							{/if}
						</div>
					</article>
				</section>
			</TabItem>
	{/if}

	{#if $config.availableRegisterModes.findIndex(m => m.code == RegisterMode.RETIRE.code) !== -1}
			<TabItem open={$selectedRegisterMode.isRetire()}
				class="flex-1 rounded-t-lg"
				defaultClass="w-full hover:!bg-retire !bg-retire"
				onclick={()=>$selectedRegisterMode=new RegisterModeState(RegisterMode.RETIRE)}>
				<section slot="title" class="flex gap-1 -m-3 p-3">
					<Icon icon="material-symbols:close" class="size-5 p-0" />
					<div class="whitespace-nowrap">リタイア</div>
				</section>

				<section class="pt-4 bg-retire">
					<article class="last-data">
						<div class="mode-chip bg-retire"><Icon icon="material-symbols:close" />リタイア</div>
						<div>No. { $lastRegistered['retire']?.race_num}</div>
						<div>{ $lastRegistered['retire']?.member_name }</div>
						<div>
							{#if $lastRegisteredTime['retire']}
							<span class="text-sm">{ $lastRegisteredTime['retire'].format('YYYY') }/</span>{ $lastRegisteredTime['retire'].format('MM/DD HH:mm') }<span class="text-sm">:{ $lastRegisteredTime['retire'].format('ss') }</span>
							{/if}
						</div>
					</article>
				</section>
			</TabItem>
	{/if}

	{#if $config.availableRegisterModes.findIndex(m => m.code == RegisterMode.SKIP.code) !== -1}
			<TabItem open={$selectedRegisterMode.isSkip()}
				class="flex-1 rounded-t-lg"
				defaultClass="w-full hover:!bg-skip !bg-skip"
				onclick={()=>$selectedRegisterMode=new RegisterModeState(RegisterMode.SKIP)}>
				<section slot="title" class="flex gap-1 -m-3 p-3">
					<Icon icon="material-symbols:step-over" class="size-5 p-0" />
					<div class="whitespace-nowrap">スキップ</div>
				</section>

				<section class="pt-4 bg-skip">
					<article class="last-data">
						<div class="mode-chip bg-skip"><Icon icon="material-symbols:step-over" />スキップ</div>
						<div>No. { $lastRegistered['skip']?.race_num}</div>
						<div>{ $lastRegistered['skip']?.member_name }</div>
						<div>
							{#if $lastRegisteredTime['skip']}
							<span class="text-sm">{ $lastRegisteredTime['skip'].format('YYYY') }/</span>{ $lastRegisteredTime['skip'].format('MM/DD HH:mm') }<span class="text-sm">:{ $lastRegisteredTime['skip'].format('ss') }</span>
							{/if}
						</div>
					</article>
				</section>
			</TabItem>
	{/if}
    </div>
  </Tabs>
</div>


<!-- コンテンツ２：スキャナ情報・カメラ・キーパッド -->
<section class="control-panel">

{#if inputPanel == 'info'}
	<article id="information" class="">
		スキャナはありません<br>
		Scanner Manager アプリが起動していません。<br>
		端末起動直後の場合は起動するまでお待ちください。<br>
		それ以外は、アプリを起動してください。		
	</article>
{:else if inputPanel == 'keypad'}
	<Keypad onClose={()=>inputPanel = 'info'} onRegister={(num:string)=>{asyncRegisterByNumber(num, RegisterMethod.KEYPAD);}} />
{:else if inputPanel == 'camera' }
	<Camera onRegister={(code:string)=>{asyncRegisterByMemberCode(code, RegisterMethod.CAMERA);}} />
{/if}

</section>


<!-- コンテンツ３：下部ボタン -->
<!-- layoutでclass="h-lvh"を指定。ここではsize-fullを指定。 -->
<section class="pt-4 size-full"
	class:check={$selectedRegisterMode.isCheck()}
	class:retire={$selectedRegisterMode.isRetire()}
	class:skip={$selectedRegisterMode.isSkip()}>

	<!-- 送信ボタン -->
	<Button class="p-3 fixed rounded-full
		flex justify-center items-center
		text-primary-text bg-primary
		w-36 h-36 left-[-25px] bottom-[-25px]">
		<div class="-mt-4 -mr-1">
			<Icon icon="ri:send-plane-fill" class="text-white dark:text-white w-20 h-20" />
			<div class="text-lg -mt-3">すぐ送信</div>
		</div>
{#if $unsentCount >= 1}
		<div class="rounded-full h-6 w-6 border-white bg-red-600
			flex justify-center items-center
			absolute right-[10px] top-[10px]">{ $unsentCount }</div>
{/if}
	</Button>

	<Button pill={true} class="!p-3 fixed bg-primary" style="right:90px; bottom:10px;"
		on:click={()=>inputPanel = 'camera'}>
		<Icon icon="material-symbols:photo-camera-outline" class="w-10 h-10" />
	</Button>
	<Button pill={true} class="!p-3 fixed bg-primary" style="right:10px; bottom:10px;"
		on:click={()=>inputPanel = 'keypad'}>
		<Icon icon="material-symbols:dialpad" class="w-10 h-10" />
	</Button>

</section>


{/if}
</section>

<style lang="postcss">
	.mode-chip {
		@apply flex;
		@apply rounded-xl;
		@apply pl-2 pr-3 pt-1 pb-1;
		width: fit-content;
		line-height: 1.1rem;
		box-shadow: 1px 1px gray;
	}
	
	article.last-data {
		@apply p-2 ml-auto mr-auto mb-4;
		@apply w-3/4 max-w-96;
		@apply rounded-md;
		@apply bg-slate-300 shadow-md;
		@apply text-black text-left;
	}
	article.last-data div {
		height: 1.6em;
	}

	section.control-panel {
		@apply p-2 ml-auto mr-auto mb-10;
		@apply w-3/4 max-w-96;
		@apply rounded-md;
		@apply bg-yellow-100 shadow-md;
		@apply text-black text-left;
	}

</style>