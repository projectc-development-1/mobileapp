import * as SecureStore from 'expo-secure-store';


export default function HealthCheck() {
    //Check required network access
    const checkNetworkAccess = async () => {
        console.log('Checking network access');
        const networkAccess = await SecureStore.getItemAsync('networkAccess');
        if (networkAccess === null) {
            throw new Error('Network access not found');
        }
    }

    //Check required location access
    const checkLocationAccess = async () => {
        console.log('Checking location access');
        const locationAccess = await SecureStore.getItemAsync('locationAccess');
        if (locationAccess === null) {
            throw new Error('Location access not found');
        }
    }

    //Check device network status
    const checkNetworkStatus = async () => {
        console.log('Checking network status');
        const networkStatus = await SecureStore.getItemAsync('networkStatus');
        if (networkStatus === null) {
            throw new Error('Network status not found');
        }
    }

    //Check device location status
    const checkLocationStatus = async () => {
        console.log('Checking location status');
        const locationStatus = await SecureStore.getItemAsync('locationStatus');
        if (locationStatus === null) {
            throw new Error('Location status not found');
        }
    }

    //Check account name
    const checkAccountName = async () => {
        console.log('Checking account name');
        const accountName = await SecureStore.getItemAsync('accountName');
        if (accountName === null) {
            throw new Error('Account name not found');
        }
    }

    return {
        checkNetworkAccess,
        checkLocationAccess,
        checkNetworkStatus,
        checkLocationStatus,
        checkAccountName
    };
}