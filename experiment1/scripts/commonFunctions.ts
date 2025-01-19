import * as SecureStore from 'expo-secure-store';
import i18next from 'i18next';
import { useRef, useState } from 'react';

export default function CommonFunctions() {

    let tempStoredValue = useRef<string | null>('');

    const setDataToDevice = async (key: string, value: string) => {
        try {
        await SecureStore.setItemAsync(key, value);
        } catch (e) {
            console.error('Failed to save data', e);
        }
    };

    const getDataFromDevice = async (key: string) => {
        try {
            tempStoredValue.current = (await SecureStore.getItemAsync(key));
            return tempStoredValue.current;
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