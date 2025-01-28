import commonFunctions from '@/scripts/commonFunctions';
import React, { useState } from 'react';
import { StyleSheet, TouchableWithoutFeedback, View, Keyboard, TouchableOpacity, Text } from 'react-native';

const {
    setDataToDevice
} = commonFunctions();

 
const setLanguage = (lng: string, onStart: { (): void; } ) => {
    setDataToDevice('language', lng)
    onStart();
};

interface MapProps {
    onStart: () => void;
}

const Map: React.FC<MapProps> = ({ onStart }) => {
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.chinesebutton} onPress={() => setLanguage('zh', onStart)}>
                    <Text style={styles.chinesebuttonText}>中文</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.englishbutton} onPress={() => setLanguage('en', onStart)}>
                    <Text style={styles.englishbuttonText}>English</Text>
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback>
    );
};

export default Map;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    chinesebutton: {
        width: '80%',
        padding: 10,
        borderWidth: 1,
        borderColor: 'rgb(204, 204, 204)',
        borderRadius: 25,
        backgroundColor: 'rgb(203, 68, 53)',
        alignItems: 'center',
        marginBottom: 20,
    },
    chinesebuttonText: {
        color: 'rgba(0, 0, 0, 0)',
        fontFamily: 'Math-Italic'
    },
    englishbutton: {
        width: '80%',
        padding: 10,
        borderWidth: 1,
        borderColor: 'rgb(204, 204, 204)',
        borderRadius: 25,
        backgroundColor: 'rgb(243, 156, 18)',
        alignItems: 'center',
        marginBottom: 20,
    },
    englishbuttonText: {
        color: 'rgb(0, 0, 0)',
        fontFamily: 'Math-Italic'
    },
});


