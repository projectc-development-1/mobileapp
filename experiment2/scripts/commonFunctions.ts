import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';
import { useRef } from 'react';

let ws = useRef<WebSocket>(new WebSocket('wss://o8e86zvvfl.execute-api.ap-south-1.amazonaws.com/development/'));

export default function CommonFunctions() {

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
        try{
            if(ws.current.readyState == ws.current.OPEN){
                console.log('Sending data to server:', data.substring(0, 1000));
                ws.current.send(data);
            }
            else{
                console.error('Connection to server is ', ws.current.readyState);
                ws.current = new WebSocket('wss://o8e86zvvfl.execute-api.ap-south-1.amazonaws.com/development/');
            }
        } catch (e) {
            console.error('Failed to send data to server', e);
        }
    }

    const storePendingMessage = async (tempSendMsg: {}) => {
        let pendingMessage = await getDataFromAsyncStore('pendingMessage');
        let temppendingMessage = [];
        if(pendingMessage){
            temppendingMessage = JSON.parse(pendingMessage);
            temppendingMessage.push(tempSendMsg);
        } else {
            temppendingMessage.push(tempSendMsg);
        }
        setDataToAsyncStore('pendingMessage', JSON.stringify(temppendingMessage));
    }

    const sendPendingMessages = async () => {
        let pendingMessage = await getDataFromAsyncStore('pendingMessage');
        //await setDataToAsyncStore('pendingMessage', '[]');
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
        storePendingMessage,
        sendPendingMessages
    };
}