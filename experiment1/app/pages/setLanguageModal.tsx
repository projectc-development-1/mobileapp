import React from 'react';
import { StyleSheet, TouchableWithoutFeedback, View, Keyboard, TouchableOpacity, Text } from 'react-native';

interface MapProps {
    setLanguage: (lng: string) => void;
}

const Map: React.FC<MapProps> = ({ setLanguage }) => {
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.chinesebutton} onPress={() => setLanguage('zh')}>
                    <Text style={styles.chinesebuttonText}>中文</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.englishbutton} onPress={() => setLanguage('en')}>
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
        borderColor: '#ccc',
        borderRadius: 25,
        backgroundColor: '#cb4335',
        alignItems: 'center',
        marginBottom: 20,
    },
    chinesebuttonText: {
        color: '#000',
        fontFamily: 'Math-Italic'
    },
    englishbutton: {
        width: '80%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 25,
        backgroundColor: '#f39c12',
        alignItems: 'center',
        marginBottom: 20,
    },
    englishbuttonText: {
        color: '#000',
        fontFamily: 'Math-Italic'
    },
});


