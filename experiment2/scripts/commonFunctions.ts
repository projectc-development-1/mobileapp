import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';
import { useRef } from 'react';

export default function CommonFunctions() {

    let ws = useRef<WebSocket>(new WebSocket('wss://o8e86zvvfl.execute-api.ap-south-1.amazonaws.com/development/'));

    ws.current.onopen = () => {
        console.log('Connected to server');
    }

    const setDataToSecureStore = async (key: string, value: string) => {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (e) {
            console.error('Failed to save data', e);
        }
    };

    const setDataToAsyncStore = async (key: string, value: string) => {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (e) {
            console.error('Failed to save data', e);
        }
    };

    const getDataFromSecureStore = async (key: string) => {
        try {
            let tempStoredValue = (await SecureStore.getItemAsync(key));
            return tempStoredValue;
        } catch (e) {
            console.error('Failed to retrieve data', e);
        }
    };

    const removeDataFromSecureStore = async (key: string) => {
        try {
            await SecureStore.deleteItemAsync(key);
        } catch (e) {
            console.error('Failed to remove data', e);
        }
    };

    const getDataFromAsyncStore = async (key: string) => {
        try {
            let tempStoredValue = (await AsyncStorage.getItem(key));
            return tempStoredValue;
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

    const sendPendingMessages = async () => {
        let pendingMessage = await getDataFromSecureStore('pendingMessage');
        if(pendingMessage){
            let temppendingMessage = JSON.parse(pendingMessage);
            for(let i=0; i<temppendingMessage.length; i++){
                wsSend( JSON.stringify(temppendingMessage[i]) );
            }
        }
    }

    return {
        languageSwitcher,
        setDataToSecureStore,
        setDataToAsyncStore,
        getDataFromSecureStore,
        getDataFromAsyncStore,
        removeDataFromSecureStore,
        wsSend,
        ws,
        sendPendingMessages
    };
}