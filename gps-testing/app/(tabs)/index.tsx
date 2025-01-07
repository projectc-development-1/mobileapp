//require('punycode/')

import React, { useState, useEffect } from 'react';
import { Platform, Text, View, StyleSheet, SafeAreaView, TextInput, Button, Pressable } from 'react-native';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import MarkerClickAction from '../../markerClickAction';

export default function App() {
  const [selflocation, setSelfLocation] = useState<Location.LocationObject | null>(null);
  const [alllocation, setAllLocations] = useState<Location.LocationObject[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    handleMarkerClick,
    chatboxVisible,
    message,
    handleSendMessage,
    setMessage
  } = MarkerClickAction();

  let subscription: Location.LocationSubscription | null = null;

  async function getSelfLocation() {
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

    subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 1,
      },
      (newLocation) => {
        setSelfLocation(newLocation);
      }
    );
  }

  async function getAllLocation() {
      const dummyLocations: Location.LocationObject[] = [];
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
      setAllLocations(dummyLocations);
  }
  
  useEffect(() => {
    getSelfLocation();
    getAllLocation();
  }, []);

  return (
    <SafeAreaView style={{height: '100%'}}>
      <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
        <MapView style={styles.map}>
        {selflocation && (
          <Marker
            key={0}
            coordinate={{latitude: selflocation.coords.latitude, longitude: selflocation.coords.longitude}}
            image={require('../../assets/images/icon30X30.png')}
          />
        )}
        {alllocation && alllocation.slice(1).map((all_location, index) => (
          <Marker
            key={index+1}
            coordinate={{latitude: all_location.coords.latitude, longitude: all_location.coords.longitude}}
            image={require('../../assets/images/icon30X30.png')}
            onPress={(event) => {
                handleMarkerClick(event);
            }}
          />
        ))}
        </MapView>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {selflocation && (
          <>
            <Text style={styles.paragraph}>{new Date(selflocation.timestamp).toISOString().replace('T', ' ').substring(0, 19)}</Text>
            <Text style={styles.paragraph}>{JSON.stringify(selflocation.coords)}</Text>
          </>
        )}
      </View>
      {chatboxVisible && (
          <View style={styles.chatbox}>
              <Text>Chatbox</Text>
              <TextInput
                  style={styles.input}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Type your message"
              />
              <Button title="Send" onPress={handleSendMessage} />
          </View>
      )}
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
    }
});