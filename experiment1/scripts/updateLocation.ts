import { useState } from "react";
import * as Location from 'expo-location';
import { Platform } from "react-native";
import * as Device from 'expo-device';

function UpdateLocation (){
    const [selflocation, setSelfLocation] = useState<Location.LocationObject | null>(null);
    const [otherlocation, setOtherLocations] = useState<Location.LocationObject[] | null>(null);

    let subscription: Location.LocationSubscription | null = null;

    async function getSelfLocation() {
        
        if (Platform.OS === 'android' && !Device.isDevice) {
            console.log(
            'Oops, this will not work on Snack in an Android Emulator. Try it on your device!'
            );
            return;
        }
        
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
            return;
        }
        
        subscription = await Location.watchPositionAsync(
            {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            //distanceInterval: 1,
            },
            (newLocation) => {
                if (newLocation){
                    console.log(newLocation);
                    setSelfLocation(newLocation);
                }
            }
        );

    }

    async function getOtherLocation() {
        const dummyLocations = [];
        dummyLocations.push(
            {
                coords: {
                    latitude: 0,
                    longitude: 0,
                    altitude: null,
                    accuracy: null,
                    altitudeAccuracy: null,
                    heading: null,
                    speed: null
                },
                timestamp: 0
            },
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
            },
            {
                coords: {
                    latitude: 22.370920562114932, 
                    longitude: 113.9508017423441,
                    altitude: 14.371987,
                    accuracy: 13.387766,
                    altitudeAccuracy: 30,
                    heading: -1,
                    speed: -1,
                },
                timestamp: Date.now(),
            },
            {
                coords: {
                    latitude: 22.377905035842414, 
                    longitude: 113.98376072597144,
                    altitude: 14.371987,
                    accuracy: 13.387766,
                    altitudeAccuracy: 30,
                    heading: -1,
                    speed: -1,
                },
                timestamp: Date.now(),
            }
        )
        setOtherLocations(dummyLocations);
    }

    return {
        getSelfLocation,
        getOtherLocation,
        selflocation,
        otherlocation
    };
}

export default UpdateLocation;