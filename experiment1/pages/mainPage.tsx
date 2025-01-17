import { StyleSheet, SafeAreaView, Platform } from 'react-native';
import * as Device from 'expo-device';
import React, { useEffect, useState } from 'react';
import healthCheck from '@/scripts/healthCheck';
import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';
import SetNameModal from '@/pages/setNameModal';
import SetLanguageModal from './setLanguageModal';
import Map from './map';
import commonFunctions from '@/scripts/commonFunctions';
import updateLocation from '@/scripts/updateLocation';

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
    const setAccountName = (name: string) => {
        setDataToDevice('accountName', name)
        onStart();
    };

    let [selflocation, setSelflocation] = useState<LocationObject[]>([]);
    let subscription: Location.LocationSubscription | null = null;
    const getSelfLocation = async () => {
        if (Platform.OS === 'android' && !Device.isDevice) {
            console.log('Oops, this will not work on Snack in an Android Emulator. Try it on your device!');
        }
        
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
        }
        
        if (subscription==null){
            subscription = await Location.watchPositionAsync(
                {
                accuracy: Location.Accuracy.High
                }, 
                (newLocation) => {
                    if (newLocation){
                        setSelflocation([newLocation]);
                    }
                }
            );
        }
        const lastKnownPosition = await Location.getLastKnownPositionAsync();
        if (lastKnownPosition) {
            setSelflocation([lastKnownPosition]);
        }
    }

    let [otherlocation, setOtherlocation] = useState<LocationObject[]>([]);
    const getOtherLocation = async () => {
        const dummyLocations: any[] = [];
        fetch('https://8jf471h04j.execute-api.ap-south-1.amazonaws.com/userLocationCommunication', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "action" : "communication",
                "data": {
                    "action": "SELECT"
                }
            })
        })
        .then(response => response.json())
        .then(data => {
            for (let i=0; i<data.length; i++){
                dummyLocations.push(
                    {
                        coords: data[i]['coords'],
                        timestamp: data[i]['timestamp']
                    }
                );
            }
            setOtherlocation(dummyLocations);
        })
        .catch((error) => {
            console.error('Error:', error);
        });        
    }

    const onStart = async () => {
        let locationAccessHealthCheck = checkLocationAccess();
        if(await locationAccessHealthCheck){
            let locationStatusHealthCheck = checkLocationStatus();
            if(await locationStatusHealthCheck){
                let languageHealthCheck = await checkLanguage();
                setLanguageCheckInd(await languageHealthCheck===true ? 1 : 2);
                if(languageHealthCheck){
                    let accountNameHealthCheck = await checkAccountName();
                    setAccountNameCheckInd(accountNameHealthCheck===true ? 1 : 2);
                    if(accountNameHealthCheck){
                        setStepInd(1);
                    }
                }
            }
        }
    };

    const onRunning = async () => {
        setInterval(async () => {
            getSelfLocation();
            getOtherLocation();
        }, 5000);
        setStepInd(2);
    }


    let [stepInd, setStepInd] = useState<number>(0);
    if(stepInd==0){
        onStart();
    }
    else if(stepInd==1){
        onRunning();
    }

    return (
        <SafeAreaView style={{height: '100%'}}>
            <Map selflocation={selflocation} otherlocation={otherlocation}/>
            {languageCheckInd==2 && (
                <SetLanguageModal setLanguage={setLanguage} />
            )}
            {accountNameCheckInd==2 && (
                <SetNameModal setAccountName={setAccountName}/>
            )}
        </SafeAreaView> 
    );
}

