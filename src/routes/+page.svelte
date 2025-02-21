<script lang="ts">
	import Icon from "@iconify/svelte";
	import { Tabs, Button } from 'flowbite-svelte';
	import Camera from "$lib/components/Camera_html5.svelte";
	import Keypad from "$lib/components/Keypad.svelte";
	import { db } from "$lib/db/db";
	import MemberEntity from "$lib/db/MemberEntity";
	import RecordEntity from "$lib/db/RecordEntity";
	import { Toast } from "$lib/Toast";
	import { scanner, config, selectedEvent, selectedPoint, selectedLogId, selectedRegisterMode, 
		dialogVisibility, lastRegistered, lastRegisteredTime, unsentCount, 
        isSending} from "$lib/stores";
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
	import RegisterModeTab from "$lib/components/RegisterModeTab.svelte";

	let inputPanel:'info' | 'camera' | 'keypad' = $state<'info' | 'camera' | 'keypad'>('info');
	let memberCollectionForSelect:MemberEntity[] = $state<MemberEntity[]>([]);
	let memberForConfirm:MemberEntity | null = $state(null);
	let measuringTime:Dayjs | null = null;
	let registerMethod:RegisterMethod | null = null;

	// 特定済みメンバー（各ダイアログで共有のためここに保持）
	let specifiedMember:MemberEntity | null = null;


	// 万一、選択可能なモードが無い場合はチェックを強制的に可能にする
	if ($config.availableRegisterModes.length == 0) {
		$config.availableRegisterModes.push(RegisterMode.CHECK);
	}
	// selectedRegisterModeがavailableに無い場合は、availableのうち左から優先的に選択する。
	// $config.availableRegisterModesには(CHEKC->RETIRE->SKIP)の順に入っている。
	if ($config.availableRegisterModes.findIndex(m => m.code == $selectedRegisterMode.getCode()) === -1) {
		const code = $config.availableRegisterModes[0].code;
		$selectedRegisterMode = new RegisterModeState(RegisterModeState.CodeToMode(code)!);
	}


	// 番号での登録
	const asyncRegisterByNumber = async (inputNumber:string, method:RegisterMethod) => {
		const memberList = await (await db.asyncFetchMemberByNumber(inputNumber)).toArray();
		
		measuringTime = dayjs();
		registerMethod = method;

		await asyncFilterProcess(memberList);
	}

	// メンバーコードでの登録
	const asyncRegisterByMemberCode = async (inputCode:string, method:RegisterMethod) => {
		console.log('asyncRegisterByMemberCode');
		console.log(inputCode);
		const memberList = await (await db.asyncFetchMemberByCode(inputCode)).toArray();

		measuringTime = dayjs();
		registerMethod = method;
		
		await asyncFilterProcess(memberList);
	}
	
	// 登録プロセス1：メンバー存在確認＆絞り込み
	const asyncFilterProcess = async (memberCollection:MemberEntity[]) => {

		// 複数存在する場合は選択ダイアログを表示
		if (memberCollection.length == 0) {
			// 音とトースト
			Sound.Play(Sound.NOT_FOUND);
			Vibrate.Play(Vibrate.NOT_FOUND);
			Toast.Error('名簿にみつかりません');
		} else if (memberCollection.length == 1) {
			// 特定できた場合(→プロセス2へ)
			specifiedMember = memberCollection[0];
			console.log(specifiedMember);
			await asyncConfirmProcess();
		} else {
			// 複数存在する場合
			memberCollectionForSelect = memberCollection;
			$dialogVisibility.memberSelect = true;
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
			$dialogVisibility.registerConfirm = true;
		}
	}

	// 登録プロセス3：登録
	const asyncRegisterProcess = async () => {
		// 万一、記録対象のログが選ばれていない場合
		if ($selectedLogId === null) {
			Toast.Error('ログが選択されていません');
			return;
		}

		if (specifiedMember === null) {
			Toast.Error('対象メンバーが特定されていません');
			return;
		}
		if (measuringTime === null) {
			Toast.Error('登録時刻が異常です');
			return;
		}
		if (registerMethod === null) {
			Toast.Error('登録方法が選択されていません');
			return;
		}

		const nextSeq = await db.asyncFetchNewRecordSeq($selectedLogId);

		// 登録するデータ
		const regRecordObj = {
			seq: nextSeq,
			log_id: $selectedLogId,
			member_code: specifiedMember.member_code,
			member_name: specifiedMember.name,
			race_num: specifiedMember.bib_number,
			time: measuringTime.format('YYYY/MM/DD HH:mm:ss.SSS'),
			method: registerMethod.code,
			mode: $selectedRegisterMode.getCode(),
			sent: 0,
		};

    // 登録
		try {
			const record = new RecordEntity(regRecordObj);
			console.log(record);
			await db.asyncRegisterRecord($selectedLogId, record);

			// storeを更新：最終登録
			$lastRegistered[$selectedRegisterMode.getCode() as keyof typeof $lastRegistered] = record;
		} catch (e) {
			console.log(e);
			Toast.Error('登録できませんでした');
			return;
		}

		Sound.Play(Sound.READ_OK);				// 音を鳴らす
		Vibrate.Play(Vibrate.READ_OK);		// 振動
		Toast.Success('登録しました');		 // Toast
		
		try {
			// storeを更新：未送信件数
			$unsentCount = await db.asyncFetchUnsentRecordCount($selectedLogId);
			console.log('e');

		} catch (e) {
			console.error(e);
		}

		// モーダルを条件によっては閉じる


	}

// 	const asyncSetupScannerConnector = async () => {
// 		Toast.Success('start setup scanner connector');
// 		$scanner = await ScannerMessenger.asyncGetInstance((input:string)=>{
// 			console.log('INPUT: ' + input);
// 			asyncRegisterByMemberCode(input, RegisterMethod.SCANNER);
// 		});

// 		Toast.Success('end setup scanner connector');
// 	}

// // @TODO Zebra端末の時のみ起動する
// (async () => {
// 	await asyncSetupScannerConnector();
// })();

	const handleScannerButton = () => {
		if (!$scanner) {
			Toast.Error('スキャナと接続されていません');
			return;
		}

		$scanner.turnOn();
		sendIntentTurnOn();
		Toast.Info('端末横の黄色いボタンでスキャンして下さい');
	}


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
		if ($selectedEvent == null) return;

		const key = e.key;
		
		// セミコロンが来たら出力
		if (key == ';') {
			console.log(`stackKey done@+layout.svelte val is [${scannerStackStr}]`)

			const scanInput:ScanInput = new ScanInput(
				scannerStackStr, 
				dayjs().format('YYYY/MM/DD HH:mm:ss.SSS'),
				new RegisterMethodState(RegisterMethod.SCANNER),		// スキャナ限定
				$selectedRegisterMode,
				$selectedEvent.eventId,
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
			console.log(`Stacked: ${key}`);
		}
	}


	async function afterScan(_scanInput:ScanInput) {
		if (!$selectedEvent) return;

		const validator = new ScanInputValidator(_scanInput);

		
		const valResState:ValidationResultState = await validator.asyncValidate($selectedEvent);
		// @TODO テストコード消す
		//const valResState:ValidationResultState = await validator.asyncValidate(new TimingEvent({eventId:1, eventCode:'24test', eventTitle:'テスト', eventDate:'2025-1-5 18:28:20', eventUpdatedAt:'2025-1-5 18:28:20', points:[]}));

		// 異常時の処理
		if (!valResState.isSuccess()) {
			console.log(`invalid state ${valResState}`);

			// ユーザーにレスポンス(エラー)を返して終わり
			const result = valResState.getResult();

			Sound.Play(Sound.INVALID);
			Toast.Error(result.message);
			
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


function sendIntentTurnOn() {
		const action = "com.symbol.datawedge.api.ACTION_SCANNERINPUTPLUGIN"; // Intentのアクション
		const extraKey = "com.symbol.datawedge.api.EXTRA_PARAMETER"; // 送信するキー
		const extraValue = "ENABLE_PLUGIN"; // 送信する値

		// IntentのURLを組み立てる
    var intentUrl = "intent://" +
                    "#Intent;" +
                    "action=" + action + ";" +
                    "S." + extraKey + "=" + encodeURIComponent(extraValue) + ";" + // Extra情報を含める
                    "end";


		// Android端末を開くように促す
		location.href = intentUrl;
}
function sendIntentTurnOff() {
		const action = "com.symbol.datawedge.api.ACTION_SCANNERINPUTPLUGIN"; // Intentのアクション
		const extraKey = "com.symbol.datawedge.api.EXTRA_PARAMETER"; // 送信するキー
		const extraValue = "DISABLE_PLUGIN"; // 送信する値

		// IntentのURLを組み立てる
    var intentUrl = "intent://" +
                    "#Intent;" +
                    "action=" + action + ";" +
                    "S." + extraKey + "=" + encodeURIComponent(extraValue) + ";" + // Extra情報を含める
                    "end";


		// Android端末を開くように促す
		window.location.href = intentUrl;
}

</script>

<svelte:body on:keydown={(e)=>{stackKey(e);}}/>
	<!-- <svelte:body bind:this={bodyElement} on:keydown={(e)=>{stackKey(e);}}/> -->

<MemberSelectDialog message="複数見つかりました。対象を選んでください。" memberCollection={memberCollectionForSelect} onMemberSelected={(member:MemberEntity)=>{specifiedMember = member; asyncConfirmProcess();}} />
<RegisterConfirmDialog message="登録してよいですか？" member={memberForConfirm} onRegisterConfirmed={asyncRegisterProcess} />

<!-- body全体 -->
<section class={`bg-${$selectedRegisterMode.getCode()} flex-1 overflow-y-hidden`}>

{#if !$selectedEvent}

<!-- テスト ここから -->
<button onclick={()=>{
	//window.close();
	//asyncSetupScannerConnector();
		if (window && window.postMessage) {
			window.postMessage("Hello from PWA", "*");
			console.log("PWAからTWAへメッセージを送信");
		}
		Toast.Info('pushed');
		// @ts-ignore
		//android.hogeMethod('ほげほげ');
	}} class="btn w-20 h-20"
	style="border:1px solid black;">call<br>1531</button>

	<button onclick={()=>{console.log('on');$scanner?.turnOn();}} class="btn w-20 h-20"
		style="border:1px solid black;">スキャナON</button>
	<button onclick={()=>{console.log('off');$scanner?.turnOff();}} class="btn w-20 h-20"
		style="border:1px solid black;">スキャナOFF</button>

<button onclick={()=>{console.log('on');sendIntentTurnOn();}} class="btn w-20 h-20"
	style="border:1px solid black;">JsIntentスキャナON</button>
<button onclick={()=>{console.log('off');sendIntentTurnOff();}} class="btn w-20 h-20"
	style="border:1px solid black;">JsIntentスキャナOFF</button>
	

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
			<RegisterModeTab registerMode={RegisterMode.CHECK} />
	{/if}

	{#if $config.availableRegisterModes.findIndex(m => m.code == RegisterMode.RETIRE.code) !== -1}
			<RegisterModeTab registerMode={RegisterMode.RETIRE} />
	{/if}
	
	{#if $config.availableRegisterModes.findIndex(m => m.code == RegisterMode.SKIP.code) !== -1}
		<RegisterModeTab registerMode={RegisterMode.SKIP} />
	{/if}
    </div>
  </Tabs>
</div>


<!-- コンテンツ２：スキャナ情報・カメラ・キーパッド -->
<section class="control-panel">

{#if inputPanel == 'info'}
	<article id="information" class="">
		ここにメッセージ
		
	</article>
{:else if inputPanel == 'keypad'}
	<Keypad onClose={()=>inputPanel = 'info'} onRegister={(num:string)=>{asyncRegisterByNumber(num, RegisterMethod.KEYPAD);}} />
{:else if inputPanel == 'camera' }
	<Camera onRegister={(code:string)=>{asyncRegisterByMemberCode(code, RegisterMethod.CAMERA);}} 
		onTimeout={()=>setTimeout(()=>{inputPanel = 'info'}, 200)} />
{/if}

</section>


<!-- コンテンツ３：下部ボタン -->
<!-- layoutでclass="h-lvh"を指定。ここではsize-fullを指定。 -->
<section class="pt-4"
	class:check={$selectedRegisterMode.isCheck()}
	class:retire={$selectedRegisterMode.isRetire()}
	class:skip={$selectedRegisterMode.isSkip()}>

	<Button pill={true} class="!p-2.5 fixed bg-primary" style="right:130px; bottom:8px;"
		on:click={()=>{inputPanel='info'; handleScannerButton();}}>
		<Icon icon={ RegisterMethod.SCANNER.icon } class="w-8 h-8" />
	</Button>
	<Button pill={true} class="!p-2.5 fixed bg-primary" style="right:70px; bottom:8px;"
		on:click={()=>inputPanel='camera'}>
		<Icon icon={ RegisterMethod.CAMERA.icon } class="w-8 h-8" />
	</Button>
	<Button pill={true} class="!p-2.5 fixed bg-primary" style="right:10px; bottom:8px;"
		on:click={()=>inputPanel='keypad'}>
		<Icon icon={ RegisterMethod.KEYPAD.icon } class="w-8 h-8" />
	</Button>

</section>


{/if}
</section>

<style lang="postcss">
	section.control-panel {
		@apply p-2 ml-auto mr-auto mb-10;
		@apply w-3/4 max-w-96;
		@apply rounded-md;
		@apply bg-slate-300 shadow-md;
		@apply text-black text-left;
	}

</style>