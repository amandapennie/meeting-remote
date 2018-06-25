import noble from 'react-native-ble';
import {constants as initActions} from './actions/init';
import { hardwareStateUpdate } from './actions/bluetooth';
import {constants as conferenceSystemsActions} from './actions/conferenceSystems';


export function bluetoothMiddleware(store) {
	return function(next){ 
		return function(action){ 
			switch (action.type) {
				case initActions.INIT_START:
					initBluetooth(store);
					break;
			}
			next(action);
		}
	}
}

function initBluetooth(store) {
	// triggered when bluetooth hardware changes (poweredOn/poweredOff)
	noble.on('stateChange', function(bluetoothHardwareState) {
		store.dispatch(hardwareStateUpdate(bluetoothHardwareState));
	});
}