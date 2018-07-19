import { SEGMENT_WRITE_KEY } from 'react-native-dotenv'
import Analytics from 'analytics-react-native';
import DeviceInfo from 'react-native-device-info';

const analytics = new Analytics((__DEV__) ? "0IrQ4C4Ik64KABwz5lYXr1ohMQKWfV2V" : "jI8QHtyds2oHFGevqRV02t2IiEioYhWx");

export const DEVICE_ID = DeviceInfo.getUniqueID();

//https://segment.com/docs/sources/server/node/#track
export function track(event, userId, properties) {
	const data = {
		event, 
		properties
	};

	if(userId){
		data['userId'] = userId;
	}else{
		data['anonymousId'] = DEVICE_ID;
	}

	analytics.track(data);
}

//https://segment.com/docs/sources/server/node/#identify
export function identify(userId, traits) {
	analytics.identify({
		anonymousId: DEVICE_ID,
		userId,
		traits
	});
}

export function alias(previousId, userId) {
	analytics.alias({
		userId,
		previousId
	});
}