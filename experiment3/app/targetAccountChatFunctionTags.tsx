import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableWithoutFeedback, View, Keyboard, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ScrollView, Image, Alert } from 'react-native';
import uuid from 'react-native-uuid';
import { TextInput } from 'react-native';
import { Icon } from 'react-native-elements';
import { Message } from '@/scripts/messageInterfaces';
import ImageView from "react-native-image-viewing";
import { VideoView } from 'expo-video';
import { useTranslation } from 'react-i18next';




const Map = () => {
    const { t } = useTranslation();
    return (
        <View style={styles.container}>
            <View style={styles.functionItemContainer}>
                <Text style={styles.functionItemName}>{t("chatFunctionTagSerect")}</Text>
            </View>
            <View style={styles.functionItemContainer}>
                <Text style={styles.functionItemName}>{t("chatFunctionTagChoices")}</Text>
            </View>
            <View style={styles.functionItemContainer}>
                <Text style={styles.functionItemName}>{t("chatFunctionTagBetYou")}</Text>
            </View>
        </View>
    );
};

export default Map;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        width: '100%',
        height: '100%',
        borderRadius: 5,
    },
    functionItemContainer: {
        alignItems: 'center',
        borderRadius: 5,
        width: '100%',
        borderBlockColor: 'black',
        backgroundColor: 'rgba(204, 218, 255, 0.88)',
        borderWidth: 1,
        marginVertical: 2,
    },
    functionItemName: {
        fontSize: 15,
        paddingVertical : 4,
    }
});
