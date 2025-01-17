import * as Location from 'expo-location';
import { Platform } from "react-native";
import * as Device from 'expo-device';

export default function updateLocation (){

    let alllocation: Location.LocationObject[] = [];
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
                        return newLocation;
                    }
                }
            );
        }
        return Location.getLastKnownPositionAsync();
    }

    const getOtherLocation = async () => {
        const dummyLocations: any[] = [];
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
        .then(data => {
            for (let i=0; i<data.length; i++){
                dummyLocations.push(
                    {
                        coords: data[i]['coords'],
                        timestamp: data[i]['timestamp']
                    }
                );
            }
            return dummyLocations;
        })
        .catch((error) => {
            console.error('Error:', error);
        });        
        return dummyLocations;
    }

    const getAllLocation = async () => {
        alllocation = [];
        alllocation.push(... await getOtherLocation());
        let selfLocation = await getSelfLocation();
        if (selfLocation){
            alllocation.unshift(selfLocation);
        }
        return alllocation;
    }

    return {
        getSelfLocation,
        getOtherLocation,
        getAllLocation
    };
}