import { Text, View, StyleSheet, SafeAreaView, TextInput, Button, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import React, { useEffect } from 'react';
import MarkerClickAction from '../scripts/mainPage/markerClickAction';
import UpdateLocation from '../scripts/updateLocation';

export default function App() {

    const {
      handleMarkerClick,
      chatboxVisible,
      message,
      handleSendMessage,
      setMessage
    } = MarkerClickAction();

    const {
        getSelfLocation,
        getOtherLocation,
        selflocation,
        otherlocation
    } = UpdateLocation();

    useEffect(() => {
        getSelfLocation();
        const intervalId = setInterval(() => {
            getOtherLocation();
        }, 5000);
    }, []);

    return (
      <SafeAreaView style={{height: '100%'}}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <MapView 
            style={styles.map}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
          >
            {selflocation && (
            <Marker
                key={0}
                coordinate={{latitude: selflocation.coords.latitude, longitude: selflocation.coords.longitude}}
                image={require('../assets/selflocation100X100.png')}
            />
            )}
            {otherlocation && otherlocation.slice(1).map((other_location, index) => (
            <Marker
                key={index+1}
                coordinate={{latitude: other_location.coords.latitude, longitude: other_location.coords.longitude}}
                image={require('../assets/otherlocation100X100.png')}
                onPress={(event) => {
                    handleMarkerClick(event);
                }}
            />
            ))}
          </MapView>
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
