require('punycode/');

import React, { useState , useEffect} from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Button
} from "react-native";
import useBLE from "../../useBLE";
import * as Device from 'expo-device';


const App = () => {
  const {
    connectedDevice,
    color,
    requestPermissions,
    scanForPeripherals,
    allDevices,
  } = useBLE();

  const [refreshButtonTitle, setRefreshButtonTitle] = useState('Refresh');
  const [refreshButtonDisable, setRefreshButtonDisable] = useState(false);
  

  useEffect(() => {
    console.log(Device.modelName);
    console.log(Device.osName);
    console.log(Device.osVersion);
  }, []);

  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      const result = scanForPeripherals();
      for (let i = 0; i < allDevices.length; i++) {
        console.log("Device Found - ", allDevices[i].name, allDevices[i].id);
      }
    }
    let countdown = 3;
    setRefreshButtonDisable(true);
    const intervalId = setInterval(() => {
      if (countdown > 0) {
        countdown--;
        setRefreshButtonTitle('Refresh (' + countdown + ')');
      } else {
        setRefreshButtonDisable(false);
        setRefreshButtonTitle('Refresh');
        clearInterval(intervalId);
      }
    }, 1000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: color }]}>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Device Model: {Device.modelName}</Text>
        <Text>OS Name: {Device.osName}</Text>
        <Text>OS Version: {Device.osVersion}</Text>
      </View>
      <View style={styles.heartRateTitleWrapper}>
        <Text style={styles.heartRateTitleText}>none</Text>
        {connectedDevice ? (
          <>
            <Text style={styles.heartRateTitleText}>Connected</Text>
          </>
        ) : (
          <Text style={styles.heartRateTitleText}>
            Please connect the Arduino
          </Text>
        )}
        <Button
            disabled={refreshButtonDisable}
            onPress={scanForDevices}
            title={refreshButtonTitle}
        />
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