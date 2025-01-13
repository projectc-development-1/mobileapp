import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';

export default function CommonFunctions() {
    const [storedValue, setStoredValue] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState<string>('');

    const setDataToDevice = async (key: string, value: string) => {
        try {
        await SecureStore.setItemAsync(key, value);
        console.log('Data saved');
        setStoredValue(value);
        } catch (e) {
        console.error('Failed to save data', e);
        }
    };

    const getDataFromDevice = async (key: string) => {
        try {
        const value = await SecureStore.getItemAsync(key);
        if (value !== null) {
            setStoredValue(value);
            console.log('Data retrieved:', value);
        }
        } catch (e) {
        console.error('Failed to retrieve data', e);
        }
    };

    return {
        setDataToDevice,
        getDataFromDevice
    };
}