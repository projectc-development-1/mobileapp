import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import commonFunctions from './commonFunctions';
import locationCommunication from './locationCommunication';

export default function HealthCheck() {

    const{
        languageSwitcher,
        setDataToDevice,
        getDataFromDevice
    } = commonFunctions();

    //Check required location access
    const checkLocationAccess = async () => {
        console.log('Checking location access');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            return false;
        }
        return true;
    }

    //Check device location status
    const checkLocationStatus = () => {
        console.log('Checking location status');
        const locationStatus = Location.hasServicesEnabledAsync();
        if (!locationStatus) {
            return false;
        }
        return true;
    }

    //Check account name
    const checkLanguage = async () => {
        console.log('Checking language');
        const language = await SecureStore.getItemAsync('language');
        if (!language) {
            return false;
        }
        languageSwitcher(language);
        return true;
    }

    //Check account name
    const checkAccountName = async () => {
        console.log('Checking account name');
        const accountName = await SecureStore.getItemAsync('accountName');
        if (!accountName) {
            return false;
        }
        return true;
    }

    return {
        checkLocationAccess,
        checkLocationStatus,
        checkLanguage,
        checkAccountName,
    };
}