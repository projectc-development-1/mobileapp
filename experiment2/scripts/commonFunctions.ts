import * as SecureStore from 'expo-secure-store';
import i18next from 'i18next';
import { useRef } from 'react';

export default function CommonFunctions() {

    let tempStoredValue = useRef<string | null>('');
    let ws = useRef<WebSocket>(new WebSocket('wss://o8e86zvvfl.execute-api.ap-south-1.amazonaws.com/development/'));

    ws.current.onopen = () => {
        console.log('Connected to server');
    }

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

    const wsSend = (data: string) => {
        if(ws.current.readyState == ws.current.OPEN){
            console.log('Sending data to server:', data);
            ws.current.send(data);
        }
        else{
            console.error('Connection to server is closed');
            ws.current = new WebSocket('wss://o8e86zvvfl.execute-api.ap-south-1.amazonaws.com/development/');
        }
    }

    return {
        languageSwitcher,
        setDataToDevice,
        getDataFromDevice,
        wsSend,
        ws
    };
}