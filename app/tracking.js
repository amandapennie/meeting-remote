import { SEGMENT_WRITE_KEY } from 'react-native-dotenv'
import Analytics from 'analytics-react-native';
import DeviceInfo from 'react-native-device-info';

const analytics = new Analytics(SEGMENT_WRITE_KEY);

export const DEVICE_ID = DeviceInfo.getUniqueID();

//https://segment.com/docs/sources/server/node/#track
export function track(event, properties) {
	analytics.track({
		anonymousId: DEVICE_ID,
		event, 
		properties
	});
}

//https://segment.com/docs/sources/server/node/#identify
export function identify(userId, traits) {
	analytics.identify({
		userId,
		traits
	});
}