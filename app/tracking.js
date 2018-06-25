import Analytics from 'analytics-react-native';
import DeviceInfo from 'react-native-device-info';

const analytics = new Analytics("0IrQ4C4Ik64KABwz5lYXr1ohMQKWfV2V");

export const DEVICE_ID = DeviceInfo.getUniqueID();

//https://segment.com/docs/sources/server/node/#track
export function track(event, properties) {
	analytics.track({
		anonymousId: DEVICE_ID,
		event, 
		properties
	});
}