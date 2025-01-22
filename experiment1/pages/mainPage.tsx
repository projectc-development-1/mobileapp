import { SafeAreaView } from 'react-native';
import React, { useRef, useState } from 'react';
import healthCheck from '@/scripts/healthCheck';
import SetNameModal from '@/pages/setNameModal';
import SetLanguageModal from './setLanguageModal';
import Map from './map';
import commonFunctions from '@/scripts/commonFunctions';
import * as SecureStore from 'expo-secure-store';
import uuid from 'react-native-uuid';
import { registerBackgroundFetchAsync } from '@/scripts/backgroundTask';

export default function App() {

    const { 
        checkLocationAccess, 
        checkLocationStatus, 
        checkLanguage, 
        checkAccountName
    } = healthCheck()

    const {
        setDataToDevice
    } = commonFunctions();

    let [languageCheckInd, setLanguageCheckInd] = useState<number>(0);
    const setLanguage = (lng: string) => {
        setDataToDevice('language', lng)
        onStart();
    };

    let [accountNameCheckInd, setAccountNameCheckInd] = useState<number>(0);
    let selfAccount = useRef<{ accountName: string; accountID: string } | null>(null);
    const setAccountName = (name: string) => {
        setDataToDevice('accountName', name)
        let accountid = uuid.v4();
        setDataToDevice('accountid', accountid)
        selfAccount.current = { accountName: name, accountID: accountid };
        onStart();
    };

    const [showMap, setShowMap] = useState<boolean>(false);

    let onStartCheckingDone = false;
    const onStart = async () => {
        let languageHealthCheck = await checkLanguage();
        setLanguageCheckInd(languageHealthCheck===true ? 1 : 2);
        if(languageHealthCheck){
            let accountNameHealthCheck = await checkAccountName();
            setAccountNameCheckInd(accountNameHealthCheck===true ? 1 : 2);
            if(accountNameHealthCheck){
                selfAccount.current = { accountName: (await SecureStore.getItemAsync('accountName')) || '', accountID: (await SecureStore.getItemAsync('accountid')) || '' };
                setShowMap(true);
                let locationAccessHealthCheck = checkLocationAccess();
                if(await locationAccessHealthCheck){
                    let locationStatusHealthCheck = checkLocationStatus();
                    if(await locationStatusHealthCheck){
                        registerBackgroundFetchAsync();
                        onStartCheckingDone = true;
                    }
                }
            }
        }
    };
    
    if(!onStartCheckingDone){
        onStart();
    }

    return (
        <SafeAreaView style={{height: '100%'}}>
            {showMap && (
                <Map selfAccount={selfAccount.current}/>
            )}
            {languageCheckInd==2 && (
                <SetLanguageModal setLanguage={setLanguage} />
            )}
            {accountNameCheckInd==2 && (
                <SetNameModal setAccountName={setAccountName}/>
            )}
        </SafeAreaView> 
    );
}

