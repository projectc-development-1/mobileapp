require('punycode/')

import React, { useState, useEffect } from 'react';
import { Platform, Text, View, StyleSheet, SafeAreaView } from 'react-native';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import MapView, {Marker} from 'react-native-maps';

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function getCurrentLocation() {
      if (Platform.OS === 'android' && !Device.isDevice) {
        setErrorMsg(
          'Oops, this will not work on Snack in an Android Emulator. Try it on your device!'
        );
        return;
      }
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      console.log(location);
      setLocation(location);
    }

    getCurrentLocation();
  }, []);

  let text = 'Waiting...';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }
 
  return (
    <SafeAreaView style={{height: '100%'}}>
      <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
        <MapView style={styles.map}>
        {location && (
          <Marker
            coordinate={{latitude: location.coords.latitude, longitude: location.coords.longitude}}
            title="Your Location"
            description="This is where you are"
            image={require('../../assets/images/icon.png')}
          />
        )}
        </MapView>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {location && (
            <Text style={styles.paragraph}>{text}</Text>
        )}
      </View>
    </SafeAreaView> 
  );
}

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
});
