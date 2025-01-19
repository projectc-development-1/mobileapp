import React, { useState } from 'react';
import { StyleSheet, TouchableWithoutFeedback, View, Keyboard, TouchableOpacity, Text } from 'react-native';
import { TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';

interface MapProps {
    targetAccountName: string;
}

const Map: React.FC<MapProps> = ({ targetAccountName }) => {
    const { t } = useTranslation();
    return (
        <View style={styles.container}>
            <Text style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>{t('Chat with')} {targetAccountName}</Text>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <View style={{ flex: 1 }}>
                        {/* Messages will be displayed here */}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
                        <TextInput
                            style={styles.input}
                            placeholder={t('Type a message')}
                            multiline
                        />
                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonText}>{t('Send')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </View>
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
        zIndex: 2,
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
