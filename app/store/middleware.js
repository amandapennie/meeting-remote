import BleManager from 'react-native-ble-manager';
import {
  NativeAppEventEmitter,
  NativeEventEmitter,
  NativeModules
} from 'react-native';
import {constants as initActions} from './actions/init';
import * as bleActions from './actions/bluetooth';
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
	BleManager.start({showAlert: false})
	.then(() => {
		const BleManagerModule = NativeModules.BleManager;
		const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
		
		// triggered when bluetooth hardware changes (poweredOn/poweredOff)
		bleManagerEmitter.addListener(
		    'BleManagerDidUpdateState',
		    (args) => {
		        // The new state: args.state
		        store.dispatch(bleActions.hardwareStateUpdate(args.state));
		    }
		);

		//device found during scan
		bleManagerEmitter.addListener(
		    'BleManagerDiscoverPeripheral',
		    (peripheralInstance) => {
		        store.dispatch(bleActions.peripheralFound(peripheralInstance));
		    }
		);

		// peripheral disconnect happened
		bleManagerEmitter.addListener(
		    'BleManagerDisconnectPeripheral',
		    (peripheralId) => {
		        store.dispatch(bleActions.peripheralDisconnected({id: peripheralId}));
		    }
		);

		// force initial state check
		BleManager.checkState();
	}).catch((err) => {
		console.log(err);
	});
}