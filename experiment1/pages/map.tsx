import { LocationObject } from "expo-location";
import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";

interface MapProps {
    selflocation: LocationObject[];
    otherlocation: LocationObject[];
}

const Map: React.FC<MapProps> = ({ selflocation, otherlocation }) => {
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
                    />
                ))}
            </MapView>
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
});