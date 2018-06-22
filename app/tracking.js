import Analytics from 'analytics-react-native';

const analytics = new Analytics(0IrQ4C4Ik64KABwz5lYXr1ohMQKWfV2V);

analytics.track({
	//userID once we create a login screen
	event: 'UNSUPPORTED_PROVIDER_SELECTED',
	provider: providerName,
})