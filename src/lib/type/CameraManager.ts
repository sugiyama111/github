import { Html5Qrcode, type CameraDevice } from "html5-qrcode";

export const asyncCameraDevices = async ():Promise<Array<Camera>> => {
	const cameraDeviceList = await Html5Qrcode.getCameras();

	const cameraList = cameraDeviceList.map(dev => Camera.FromCameraDevice(dev));

	return cameraList;
}

export class Camera {
	id: string;
	label: string;

	constructor({id, label} : {id:string,label:string}) {
		this.id = id;
		this.label = label;
	}

	static FromCameraDevice = (dev:CameraDevice) => {
		return new Camera({id:dev.id, label:dev.label});
	}

	asyncIsFacing = async ():Promise<boolean> => {
		console.log('asyncIsFacing');

		// カメラのラベルに"front"が入っていればFacingとみなす
		if (/front/.test(this.label)) return true;

		// ラベルで判断できない場合は、デバイスのfacingModeを取得して確認する
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { deviceId: this.id }
			});
	
			const track = stream.getVideoTracks()[0];
			const settings = track.getSettings();
	
			console.log(`Camera ID: ${this.id}`);
			console.log(`Facing Mode: ${settings.facingMode}`);
	
			track.stop(); // 使用後はストリームを停止
	
			return settings.facingMode === 'user';
			//return settings.facingMode === "user" ? "Front Camera" : "Back Camera";
		} catch (error) {
			console.error("Error getting camera facing mode:", error);
			//return "Unknown";
			return false;
		}
	}
}
