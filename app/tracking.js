import Analytics from 'analytics-react-native';
import DeviceUUID from 'react-native-device-uuid';

var anonymousId;

DeviceUUID.getUUID().then((uuid) => {
  anonymousId = uuid;
});

const analytics = new Analytics("0IrQ4C4Ik64KABwz5lYXr1ohMQKWfV2V");

export function track (event, params) {
	analytics.track(
		Object.assign({anonymousId}, {event}, params)
	)
}