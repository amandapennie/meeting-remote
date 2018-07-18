import { SEGMENT_WRITE_KEY } from 'react-native-dotenv'
import Analytics from 'analytics-react-native';
import DeviceInfo from 'react-native-device-info';

const analytics = new Analytics((__DEV__) ? "0IrQ4C4Ik64KABwz5lYXr1ohMQKWfV2V" : "jI8QHtyds2oHFGevqRV02t2IiEioYhWx");

export const DEVICE_ID = DeviceInfo.getUniqueID();
var _userId;

//https://segment.com/docs/sources/server/node/#track
export function track(event, properties) {
	const data = {
		event, 
		properties
	};

	if(_userId){
		data['userId'] = _userId;
	}else{
		data['anonymousId'] = DEVICE_ID;
	}

	analytics.track(data);
}

//https://segment.com/docs/sources/server/node/#identify
export function identify(userId, traits) {
	_userId = userId;
	analytics.identify({
		userId,
		traits
	});
}