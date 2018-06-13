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
				case conferenceSystemsActions.INSERT:
					action.payload = setBleConnected(action.payload, store);
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

// set ConferenceSystem.bluetoothConnected based off currently connected peripherals
function setBleConnected(conferenceSystems, store) {
	const keys = Object.keys(store.bluetooth.connectedPeripherals);
	for(var i=0;i<conferenceSystems.length;i++){
		let conferenceSystem = conferenceSystems[i];
		if(conferenceSystem.isConnectedJacket == 'true') {
			conferenceSystem.bluetoothConnected = keys.indexOf(conferenceSystem.peripheralId) > -1;
			conferenceSystems[i] = conferenceSystem;
		}
	}
	return conferenceSystems;
}