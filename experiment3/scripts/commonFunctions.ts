import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';
import { useRef } from 'react';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Video, Image, Audio } from 'react-native-compressor';


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

    const removrDataFromAsyncStore = async (key: string) => {
        try {
            await AsyncStorage.removeItem(key);
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

    const writeBase64ToFile = async (header: string, base64String: string, fileUri: string) => {
        if(Platform.OS == 'android'){
            await FileSystem.writeAsStringAsync(fileUri, base64String, {
                encoding: FileSystem.EncodingType.Base64,
            });
        }
        if(Platform.OS == 'ios'){
            const base64Response = await fetch(header+base64String);
            const blob = await base64Response.blob();
            await FileSystem.writeAsStringAsync(fileUri, base64String, { encoding: FileSystem.EncodingType.Base64 });
        }
    }

    const compressImage = async (uri: string) => {
        const result = await Image.compress(uri, {
            maxWidth: 400,
            quality: 0.5,
        });
        return result;
    };

    const compressVideo = async (uri: string) => {
        const result = await Video.compress(uri, { compressionMethod: 'manual' }, (progress) => {});
        return result;
    }

    const compressAudio = async (uri: string) => {
        const result = await Audio.compress(
            uri, // recommended wav file but can be use mp3 file
            { quality: 'medium' }
          );
        return result;
    }

    return {
        languageSwitcher,
        setDataToSecureStore,
        setDataToAsyncStore,
        getDataFromSecureStore,
        getDataFromAsyncStore,
        removeDataFromSecureStore,
        removrDataFromAsyncStore,
        wsSend,
        ws,
        storePendingMessage,
        sendPendingMessages,
        writeBase64ToFile,
        compressImage,
        compressVideo,
        compressAudio
    };
}