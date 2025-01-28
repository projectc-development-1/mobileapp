import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableWithoutFeedback, View, Keyboard, TouchableOpacity, Text } from 'react-native';
import { TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import commonFunctions from '@/scripts/commonFunctions';
import uuid from 'react-native-uuid';

const {
    setDataToDevice
} = commonFunctions();

const setAccountName = (name: string, onStart: { (): void; }) => {
    setDataToDevice('accountName', name)
    let accountid = uuid.v4();
    setDataToDevice('accountid', accountid)
    onStart();
};

interface MapProps {
    onStart: () => void;
}

const Map: React.FC<MapProps> = ({ onStart }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <TextInput
                    style={styles.input}
                    placeholder={t("enter_your_name")}
                    placeholderTextColor="#aaa"
                    value={name}
                    onChangeText={setName}
                />
                <TouchableOpacity style={styles.button} onPress={() => setAccountName(name, onStart)}>
                    <Text style={styles.buttonText}>{t("ok")}</Text>
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
    input: {
        width: '80%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 25,
        backgroundColor: '#fff',
        marginBottom: 20,
    },
    button: {
        width: '80%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 25,
        backgroundColor: '#e74c3c',
        alignItems: 'center',
    },
    buttonText: {
        color: '#000',
        fontFamily: 'Math-Italic'
    },
});
