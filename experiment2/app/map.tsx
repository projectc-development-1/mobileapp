import * as Location from "expo-location";
import { LocationObject } from "expo-location";
import React, { useRef, useState } from "react";
import { View, StyleSheet, Platform, Alert, TouchableOpacity, Image, Text } from "react-native";
import { Map as ImmutableMap } from 'immutable';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { useTranslation } from "react-i18next";
import RNExitApp from 'react-native-exit-app';
import commonFunctions from "@/scripts/commonFunctions";
import TargetAccountChatModal from "./targetAccountChatModal";
interface AdvanceLocationObject extends LocationObject {
    accountName: string;
    accountID: string;
    unreadMsgMapAmount: number;
    photoInBase64: string;
}

interface MapProps {
    selfAccount: { accountName: string; accountID: string; } | null;
}

const { getDataFromSecureStore } = commonFunctions();

const Map: React.FC<MapProps> = ({ selfAccount }) => {
    const { t } = useTranslation();
    const {
        getDataFromSecureStore,
        wsSend,
        ws
    } = commonFunctions();

    let selflocation = useRef<LocationObject[]>([]);
    let subscription = useRef<Location.LocationSubscription | null>(null);
    let [otherlocation, setOtherlocation] = useState<AdvanceLocationObject[]>([]);
    let unreadMsgMap = useRef(ImmutableMap<string, number>());
    const [region, setRegion] = useState<Region>({
        latitude: selflocation.current[0]?.coords.latitude || 0,
        longitude: selflocation.current[0]?.coords.longitude || 0,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    });
    
    const stopUpdating = useRef(false);
    const firstLoad = useRef(true);
    const nextUpdateTime = useRef(Date.now());
    
    if (stopUpdating.current==false && Date.now() >= nextUpdateTime.current){

        const checkLocationAccess = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                // ask for permission
                Location.requestForegroundPermissionsAsync();
                stopUpdating.current = true;
            }
        }

        const getSelfLocation = async () => {
            if (subscription.current==null){
                subscription.current = await Location.watchPositionAsync(
                    {
                    accuracy: Location.Accuracy.High
                    }, 
                    (newLocation) => {
                        if (newLocation){
                            console.log(Date.now() , 'getSelfLocation()');
                            selflocation.current = ([newLocation]);
                            if (firstLoad.current || region.latitude==0){
                                setRegion({
                                    latitude: newLocation.coords.latitude,
                                    longitude: newLocation.coords.longitude,
                                    latitudeDelta: 0.1,
                                    longitudeDelta: 0.1,
                                });
                            }
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
                            "accountName": await getDataFromSecureStore("accountName"),
                            "accountID": await getDataFromSecureStore("accountid"),
                            "coords": {
                                "latitude": (selflocation.current[0].coords.latitude).toString(), 
                                "longitude": (selflocation.current[0].coords.longitude).toString(),
                                "altitude": selflocation.current[0]?.coords.altitude?.toString() || '',
                                "accuracy": selflocation.current[0]?.coords.accuracy?.toString() || '',
                                "altitudeAccuracy": selflocation.current[0]?.coords.altitudeAccuracy?.toString() || '',
                                "heading": selflocation.current[0]?.coords.heading?.toString() || '',
                                "speed": selflocation.current[0]?.coords.speed?.toString() || ''
                            },
                            "timestamp": selflocation.current[0].timestamp.toString()
                        }
                    }
                })
            })
            .then(response => response.json())
            .then(async data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }

        const getOtherLocation = async () => {
            /*
                dummyLocations.push(
                {
                    coords: {
                        latitude: 22.370920562114932, 
                        longitude: 114.08332432234569,
                        altitude: 14.371987,
                        accuracy: 13.387766,
                        altitudeAccuracy: 30,
                        heading: -1,
                        speed: -1,
                    },
                    timestamp: Date.now(),
                }
            );
            */
            
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
                console.log(Date.now() , 'getOtherLocation()');
                const dummyLocations: any[] = [];
                for (let i=0; i<data.length; i++){
                    if (data[i]['accountID']==selfAccount?.accountID){
                        continue;
                    }
                    dummyLocations.push(
                        {   
                            accountName: data[i]['accountName'],
                            accountID: data[i]['accountID'],
                            unreadMsgMapAmount: unreadMsgMap.current.get(data[i]['accountID']),
                            coords: {
                                latitude: parseFloat(data[i]['coords']['latitude']), 
                                longitude: parseFloat(data[i]['coords']['longitude']),
                                altitude: parseFloat(data[i]['coords']['altitude']),
                                accuracy: parseFloat(data[i]['coords']['accuracy']),
                                altitudeAccuracy: parseFloat(data[i]['coords']['altitudeAccuracy']),
                                heading: parseFloat(data[i]['coords']['heading']),
                                speed: parseFloat(data[i]['coords']['speed']),
                            },
                            timestamp: parseFloat(data[i]['timestamp']),
                            photoInBase64: data[i]['photoInBase64']
                        }
                    );
                }
                if(dummyLocations.length>0){
                    setOtherlocation(dummyLocations);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });        
        }

        const updateStatusToOnline = async () => { 
            wsSend(
                JSON.stringify({
                    "action" : "communication",
                    "data": {
                        "account_id": selfAccount?.accountID,
                        "account_name": selfAccount?.accountName,
                        "command": "onlineAndSyncMsg",
                        "timestamp": Date.now().toString()
                    }
                })
            );
        }

        if(Platform.OS === 'android'){
            if(firstLoad.current){
                setInterval(() => {
                    checkLocationAccess();
                    getSelfLocation();
                    getOtherLocation();
                    updateStatusToOnline();
                }, 10000);
            }
        }else{
            checkLocationAccess();
            getSelfLocation();
            getOtherLocation();
            updateStatusToOnline();
        }
        firstLoad.current = false;
        nextUpdateTime.current = Date.now() + 5000;
    }

    ws.current.onmessage = e => {
        // a message was received
        let eInJson = JSON.parse(e.data);
        if(eInJson.command == 'onlineAndSyncMsg'){
            console.log(eInJson);
            unreadMsgMap.current = ImmutableMap<string, number>();
            for(let i=0; i<eInJson.result.length; i++){
                unreadMsgMap.current = unreadMsgMap.current.set(eInJson.result[i].from_account_id, parseInt(eInJson.result[i].unreadMsgAmount));
            }
        }
    };

    let [openToolBox, setOpenToolBox] = useState<boolean>(false);
    let [openTargetAccountChatModal, setOpenTargetAccountChatModal] = useState<boolean>(false);
    let [targetAccount, setTargetAccount] = useState<{ accountName: string; accountID: string; photoInBase64: string; } | null>(null);

    return (
        <View style={styles.container}>
            <MapView 
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                region={Platform.OS === 'android' ? region : undefined}
                onPress={() => {
                    if (openToolBox){
                        if (openTargetAccountChatModal){ setOpenTargetAccountChatModal(false); }
                        else { setOpenToolBox(false); }
                    }
                }}
            >
                {selflocation && selflocation.current.map((self_location, index) => (
                    <Marker
                        key={index}
                        coordinate={{latitude: self_location.coords.latitude, longitude: self_location.coords.longitude}}
                    >
                        <Image source={require('../assets/images/selflocation30X30.png')}/>
                    </Marker>
                ))}
                {otherlocation && otherlocation.map((other_location, index) => (
                    <Marker
                        key={index}
                        coordinate={{latitude: other_location.coords.latitude, longitude: other_location.coords.longitude}}
                        onPress={() => {
                            console.log('Marker pressed');
                            setTargetAccount({ accountName: other_location.accountName, accountID: other_location.accountID, photoInBase64: other_location.photoInBase64 });
                            setOpenToolBox(true);
                        }}
                    >
                        <Image source={require('../assets/images/otherlocation30X30.png')} style={{'display': unreadMsgMap.current.get(other_location.accountID)==undefined?'flex':'none'}} />
                        <Image source={require('../assets/images/otherAccountWithUnreadMsgWIthUnreadMsgs40X40.gif')} style={{display: unreadMsgMap.current.get(other_location.accountID)==undefined?'none':'flex'}} />
                    </Marker>
                ))}
            </MapView>
            {openToolBox && (
                <>
                <Image source={{ uri: targetAccount?.photoInBase64 }} style={styles.icon}/>
                <View style={styles.toolListContainer}>
                    <TouchableOpacity onPress={() => setOpenTargetAccountChatModal(!openTargetAccountChatModal)} style={{paddingVertical: 10}}>
                        <Image source={require('../assets/images/chatIcon50X40.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => console.log('Button 2 pressed')} style={{paddingVertical: 10}}>
                        <Image source={require('../assets/images/informationIcon54X44.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => console.log('Button 3 pressed')} style={{paddingVertical: 10}}>
                        <Image source={require('../assets/images/notesIcon50X50.png')}/>
                    </TouchableOpacity>
                </View>
                </>
            )}
            {openTargetAccountChatModal && (
                <TargetAccountChatModal 
                    wsSend={wsSend}
                    ws={ws.current} 
                    targetAccount={targetAccount} 
                    selfAccount={selfAccount}
                />
            )}
        </View>
    );
};

export default Map;

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    paragraph: {
        fontSize: 18,
        textAlign: 'center',
        color: 'rgb(255, 255, 255)',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    input: {
        height: 40,
        borderColor: 'rgb(155, 155, 155)',
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
        color: 'rgb(0, 0, 0)',
    },
    toolListContainer: {
        position: 'absolute',
        width: '18%',
        height: '25%',
        left: '5%',
        top: '65%',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        padding: 10,
        borderRadius: 100,
    },
    toolListItem: {
        fontSize: 16,
        color: 'rgb(0, 0, 0)',
        marginBottom: 5,
    },
    icon: {
        width: 20,
        height: 20,
        borderRadius: 50,
    }
});