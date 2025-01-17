import * as SecureStore from 'expo-secure-store';
import i18next from 'i18next';

export default function CommonFunctions() {

    const setDataToDevice = async (key: string, value: string) => {
        try {
        await SecureStore.setItemAsync(key, value);
        console.log('Data saved', key, value);
        } catch (e) {
        console.error('Failed to save data', e);
        }
    };

    const getDataFromDevice = async (key: string) => {
        try {
        const value = await SecureStore.getItemAsync(key);
        if (value !== null) {
            console.log('Data retrieved:', key, value);
        }
        } catch (e) {
        console.error('Failed to retrieve data', e);
        }
    };

    const languageSwitcher = (lng: string) => {
        console.log('Switching language to:', lng);
        i18next.changeLanguage(lng);
    };

    return {
        languageSwitcher,
        setDataToDevice,
        getDataFromDevice
    };
}