import healthCheck from "@/scripts/healthCheck";
import { useRef, useState } from "react";
import * as SecureStore from 'expo-secure-store';
import { View } from "react-native";
import Map from './map';
import SetNameModal from './setNameModal';
import SetLanguageModal from './setLanguageModal';
import Account from './account';
import '../i18n.ts';
import React from "react";

export default function App() {

    const { 
        checkLocationAccess, 
        checkLocationStatus, 
        checkLanguage, 
        checkAccountName
    } = healthCheck()

    let [languageCheckInd, setLanguageCheckInd] = useState<number>(0);
    let [accountNameCheckInd, setAccountNameCheckInd] = useState<number>(0);
    let [showMap, setShowMap] = useState<boolean>(false);
    let selfAccount = useRef<{ accountName: string; accountID: string; photoInBase64: string } | null>(null);

    let onStartCheckingDone = false;
    const onStart = async () => {
        let languageHealthCheck = await checkLanguage();
        setLanguageCheckInd(languageHealthCheck===true ? 1 : 2);
        if(languageHealthCheck){
            let accountNameHealthCheck = await checkAccountName();
            setAccountNameCheckInd(accountNameHealthCheck===true ? 1 : 2);
            if(accountNameHealthCheck){
                selfAccount.current = { accountName: (await SecureStore.getItemAsync('accountName')) || '', accountID: (await SecureStore.getItemAsync('accountid')) || '', photoInBase64: (await SecureStore.getItemAsync('profilePhoto')) || '' };
                setShowMap(true);
                let locationAccessHealthCheck = checkLocationAccess();
                if(await locationAccessHealthCheck){
                    let locationStatusHealthCheck = checkLocationStatus();
                    if(await locationStatusHealthCheck){
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
        <View style={{height: '100%'}}>
            {showMap && (
                <>
                <Map selfAccount={selfAccount.current} />
                <Account selfAccount={selfAccount.current} />
                </>
            )}
            {languageCheckInd==2 && (
                <SetLanguageModal onStart={onStart} />
            )}
            {accountNameCheckInd==2 && (
                <SetNameModal onStart={onStart}/>
            )}
        </View> 
    );
}
