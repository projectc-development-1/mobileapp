import * as Location from "expo-location";
import * as Device from "expo-device";
import { LocationObject } from "expo-location";
import React, { useRef, useState } from "react";
import { View, StyleSheet, Platform, Alert, Text, TouchableOpacity, Image, Keyboard } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { useTranslation } from "react-i18next";
import RNExitApp from 'react-native-exit-app';
import commonFunctions from "@/scripts/commonFunctions";
import TargetAccountChatModal from "./targetAccountChatModal";
interface AdvanceLocationObject extends LocationObject {
    accountName: string;
    accountID: string;
}

interface MapProps {
    selfAccount: { accountName: string; accountID: string } | null;
}

const Map: React.FC<MapProps> = ({ selfAccount }) => {
    const { t } = useTranslation();
    const {
        getDataFromDevice
    } = commonFunctions();

    let [selflocation, setSelflocation] = useState<LocationObject[]>([]);
    let subscription = useRef<Location.LocationSubscription | null>(null);
    let [otherlocation, setOtherlocation] = useState<AdvanceLocationObject[]>([]);
    const [region, setRegion] = useState<Region>({
        latitude: selflocation[0]?.coords.latitude || 0,
        longitude: selflocation[0]?.coords.longitude || 0,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    });
    
    const stopUpdating = useRef(false);
    const firstLoad = useRef(true);
    const nextUpdateTime = useRef(Date.now());

    if (stopUpdating.current==false && Date.now() >= nextUpdateTime.current){
        console.log(Date.now() , 'getSelfLocation() and getOtherLocation()');

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
                            if (firstLoad.current){
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
                            "accountName": await getDataFromDevice("accountName"),
                            "accountID": await getDataFromDevice("accountid"),
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
                    if (data[i]['accountID']==await getDataFromDevice("accountID")){
                        continue;
                    }
                    dummyLocations.push(
                        {   
                            accountName: data[i]['accountName'],
                            accountID: data[i]['accountID'],
                            coords: {
                                latitude: parseFloat(data[i]['coords']['latitude']), 
                                longitude: parseFloat(data[i]['coords']['longitude']),
                                altitude: parseFloat(data[i]['coords']['altitude']),
                                accuracy: parseFloat(data[i]['coords']['accuracy']),
                                altitudeAccuracy: parseFloat(data[i]['coords']['altitudeAccuracy']),
                                heading: parseFloat(data[i]['coords']['heading']),
                                speed: parseFloat(data[i]['coords']['speed']),
                            },
                            timestamp: parseFloat(data[i]['timestamp'])
                        }
                    );
                }
                setOtherlocation(dummyLocations);
            })
            .catch((error) => {
                console.error('Error:', error);
            });        
        }

        getSelfLocation();
        getOtherLocation();

        firstLoad.current = false;
        nextUpdateTime.current = Date.now() + 10000;
    }

    let [openToolBox, setOpenToolBox] = useState<boolean>(false);
    let [openTargetAccountChatModal, setOpenTargetAccountChatModal] = useState<boolean>(false);
    let [targetAccount, setTargetAccount] = useState<{ accountName: string; accountID: string } | null>(null);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
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
                            setTargetAccount({ accountName: other_location.accountName, accountID: other_location.accountID });
                            setOpenToolBox(true);
                        }}
                    />
                ))}
            </MapView>
            <View style={styles.textContainer}>
                <Text style={styles.text}>{ selfAccount?.accountName } ({ selfAccount?.accountID })</Text>
            </View>
            {openToolBox && (
                <View style={styles.toolListContainer}>
                    <TouchableOpacity onPress={() => setOpenTargetAccountChatModal(!openTargetAccountChatModal)} style={{paddingVertical: 10}}>
                        <Image source={require('../assets/chatIcon50X40.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => console.log('Button 2 pressed')} style={{paddingVertical: 10}}>
                        <Image source={require('../assets/informationIcon54X44.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => console.log('Button 3 pressed')} style={{paddingVertical: 10}}>
                        <Image source={require('../assets/notesIcon50X50.png')}/>
                    </TouchableOpacity>
                </View>
            )}
            {openTargetAccountChatModal && (
                <TargetAccountChatModal 
                    ws={new WebSocket('wss://o8e86zvvfl.execute-api.ap-south-1.amazonaws.com/development/')} 
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
    toolListContainer: {
        position: 'absolute',
        width: '18%',
        height: '28%',
        left: '5%',
        top: '65%',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        padding: 10,
        borderRadius: 100,
    },
    toolListItem: {
        fontSize: 16,
        color: 'black',
        marginBottom: 5,
    },
});