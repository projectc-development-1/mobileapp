require('punycode/');

import React, { useState , useEffect} from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Button,
  ScrollView
} from "react-native";
import useBLE from "../../useBLE";
import * as Device from 'expo-device';


const App = () => {
  const {
    color,
    scanForPeripheralsInLowPower,
    scanForPeripheralsInOpportunistic,
    allDevices
  } = useBLE();
  
  let scanForPeripheralsMode = 1;

  useEffect(() => {
    setInterval(() => {
        //console.log(Device.deviceName + " Scanning for devices" + " at " + new Date().toLocaleTimeString() );
        if(scanForPeripheralsMode % 2 == 0) {
            scanForPeripheralsInLowPower();
        }else{
            scanForPeripheralsInOpportunistic();
        }
        scanForPeripheralsMode++;
        for (let i = 0; i < allDevices.length; i++) {
          //console.log("Device Found - ", allDevices[i].name, allDevices[i].serviceUUIDs);
        }
    }, 5000);
  }, []);


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: color }]}>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Device Model: {Device.modelName}</Text>
        <Text>OS Name: {Device.osName}</Text>
        <Text>OS Version: {Device.osVersion}</Text>
      </View>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>All Devices:</Text>
      <ScrollView>
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>Device Name</Text>
            <Text>Device ID</Text>
            <Text>RSSI</Text>
          </View>
          {allDevices.map((device, index) => (
            <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text>{device.name || device.localName}</Text>
              <Text>{device.id}</Text>
              <Text>{device.rssi}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
    </SafeAreaView> 
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  heartRateTitleWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heartRateTitleText: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 20,
    color: "black",
  }
});

export default App;

function scanForDevices() {
    throw new Error("Function not implemented.");
}
