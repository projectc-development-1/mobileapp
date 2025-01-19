import * as Location from "expo-location";
import * as Device from "expo-device";
import { LocationObject } from "expo-location";
import React, { useRef, useState } from "react";
import { View, StyleSheet, Platform, Alert, Text } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";
import { useTranslation } from "react-i18next";
import RNExitApp from 'react-native-exit-app';
import commonFunctions from "@/scripts/commonFunctions";
import TargetProfile from "./targetProfileModal";

interface AdvanceLocationObject extends LocationObject {
    accountName: string;
}

const Map = () => {
    const { t } = useTranslation();
    const {
        getDataFromDevice
    } = commonFunctions();

    let [myAccountName, setMyAccountName] = useState<string>('');
    let [selflocation, setSelflocation] = useState<LocationObject[]>([]);
    let subscription = useRef<Location.LocationSubscription | null>(null);
    let [otherlocation, setOtherlocation] = useState<AdvanceLocationObject[]>([]);
    
    const stopUpdating = useRef(false);
    const nextUpdateTime = useRef(Date.now());

    if (stopUpdating.current==false && Date.now() >= nextUpdateTime.current){
        console.log(Date.now() , 'getSelfLocation() and getOtherLocation()');

        const displayAccountName = async () => {
            setMyAccountName(await getDataFromDevice("accountName") || '')
        }

        const getSelfLocation = async () => {
            if (Platform.OS === 'android' && !Device.isDevice) {
                console.log('Oops, this will not work on Snack in an Android Emulator. Try it on your device!');
            }

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                Alert.alert(
                    t("location_access_warning_message_title"), 
                    t("location_access_warning_message_body"), 
                    [
                        { text: 'OK', onPress: () => {
                            RNExitApp.exitApp() 
                        }},
                    ]
                );
                stopUpdating.current = true;
            }
            
            if (subscription.current==null){
                subscription.current = await Location.watchPositionAsync(
                    {
                    accuracy: Location.Accuracy.High
                    }, 
                    (newLocation) => {
                        if (newLocation){
                            setSelflocation([newLocation]);
                            return;
                        }
                    }
                );
            }

            //insert to database
            fetch('https://8jf471h04j.execute-api.ap-south-1.amazonaws.com/userLocationCommunication', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "action" : "communication",
                    "data": {
                        "action": "INSERT",
                        "data": {
                            "USERID": await getDataFromDevice("accountName"),
                            "STATUS": 1,
                            "coords": {
                                "latitude": (selflocation[0].coords.latitude).toString(), 
                                "longitude": (selflocation[0].coords.longitude).toString(),
                                "altitude": selflocation[0]?.coords.altitude?.toString() || '',
                                "accuracy": selflocation[0]?.coords.accuracy?.toString() || '',
                                "altitudeAccuracy": selflocation[0]?.coords.altitudeAccuracy?.toString() || '',
                                "heading": selflocation[0]?.coords.heading?.toString() || '',
                                "speed": selflocation[0]?.coords.speed?.toString() || ''
                            },
                            "timestamp": selflocation[0].timestamp.toString()
                        }
                    }
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });       
        }

        const getOtherLocation = async () => {
            const dummyLocations: any[] = [];
            getDataFromDevice("accountName")
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
            .then(async data => {
                for (let i=0; i<data.length; i++){
                    if (data[i]['USERID']==await getDataFromDevice("accountName")){
                        continue;
                    }
                    dummyLocations.push(
                        {   
                            userAccountName: data[i]['USERID'],
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

        displayAccountName();
        getSelfLocation();
        getOtherLocation();
        nextUpdateTime.current = Date.now() + 10000;
    }

    let [openTargetProfileModal, setOpenTargetProfileModal] = useState<boolean>(false);
    let [targetAccountName, setTargetAccountName] = useState<string>('');

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <MapView 
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
            >
                {selflocation && selflocation.map((self_location, index) => (
                    <Marker
                        key={index}
                        coordinate={{latitude: self_location.coords.latitude, longitude: self_location.coords.longitude}}
                        image={require('../assets/selflocation100X100.png')}
                    />
                ))}
                {otherlocation && otherlocation.map((other_location, index) => (
                    <Marker
                        key={index}
                        coordinate={{latitude: other_location.coords.latitude, longitude: other_location.coords.longitude}}
                        image={require('../assets/otherlocation100X100.png')}
                        onPress={() => {
                            // Code to open the targetProfileModal.tsx
                            setTargetAccountName(other_location.accountName);
                            setOpenTargetProfileModal(true);
                        }}
                    />
                ))}
            </MapView>
            <View style={styles.textContainer}>
                <Text style={styles.text}>{ myAccountName }</Text>
            </View>
            {openTargetProfileModal && (
                <TargetProfile selfAccountName={myAccountName} targetAccountName={myAccountName}/>
            )}
        </View>
    );
};

export default Map;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#ecf0f1',
    },
    paragraph: {
        fontSize: 18,
        textAlign: 'center',
        color: 'white',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    chatbox: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ccc',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    textContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: 10,
        borderRadius: 5,
    },
    text: {
        fontSize: 16,
        color: 'black',
    },
});