/**
 * Application Initial State factory
 *
 * It's wrap into a function so we return copies
 * of the original Initial State and avoid
 * unwanted in place mutation
 *
 */
export function getInitialState() {
  return {
    init: {
      loading: false,
      done: false,
      rehydrated: false,
    },

    routes: {
      scene: {},
    },

    conferenceSystems: {
      loading: false,
      data: {}
    },

    provider: {
      currentProviderType: 'gtm',
      authenticatedProviders: {},
      launchRequested: false
    },

    session: {
      validating: false,
      valid: false,
      user: {},
    },

    bluetooth: {
      bluetoothHardwareState: 'poweredOff',
      discoveredPeripherals: {},
      nearestPeripherals: [],
      nearestPeripheralsIds: [],
      connectedPeripherals: {},
      associatingUuid: null,
      scanning: false,
    }
  };
}
