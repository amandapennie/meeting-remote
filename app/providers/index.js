export gtm from './gtm';
import { Actions, Scene, Router, ActionConst } from 'react-native-router-flux';

const types = {
    gtm: "gtm",
    zoom: "zoom",
    bluejeans: "bluejeans",
    webex: "webex",
    hangout: "hangout",
    skype: "skype",
}

const supportedType = [
    types.gtm
]

function isTypeSupported(type) {
	return supportedType.indexOf(type) > -1;
}

export { types };
export { supportedType };
export { isTypeSupported };
