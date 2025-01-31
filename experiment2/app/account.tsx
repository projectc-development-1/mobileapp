import { View, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
import React, { useState } from 'react';
import TakePhotoForProfile from './takePhotoForProfile';
import commonFunctions from '@/scripts/commonFunctions';
import { useFonts } from 'expo-font';
import { useTranslation } from 'react-i18next';
import { getFontFamily } from '@/i18n';

const { getDataFromSecureStore } = commonFunctions();

interface MapProps {
    selfAccount: { accountName: string; accountID: string } | null;
}

const Map: React.FC<MapProps> = ({ selfAccount }) => {
    const { t } = useTranslation();
    const fontFamily = getFontFamily();

    let [editProfile, setEditProfile] = useState(false);
    let [iconBody, setIconBody] = useState('');

    async function loadProfilePhoto() {
        const photoInBase64 = await getDataFromSecureStore('profilePhoto');
        setIconBody(photoInBase64 ?? '');
    }
    loadProfilePhoto();

    return (
        <>
            <View style={styles.containerInNormal}>
                <Text style={[styles.accountName, { fontFamily }]}>{selfAccount?.accountName}</Text>
                <TouchableOpacity onPress={() => setEditProfile(true)}>
                    <Image source={{ uri: iconBody }} style={styles.icon}/>
                </TouchableOpacity>
            </View>
            {editProfile && (
                <View style={styles.takePhotoForProfileContainer}>
                    <TakePhotoForProfile 
                        selfAccount={selfAccount} 
                        iconBody={iconBody}
                        setEditProfile={setEditProfile} 
                        loadProfilePhoto={loadProfilePhoto}
                    />
                </View>
            )}
        </>
    )
}

export default Map;

const styles = StyleSheet.create({
    containerInNormal: {    
        zIndex: 2,
        left: '5%',
        top: '5%',
    },
    takePhotoForProfileContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.73)',
        position: 'absolute',
        zIndex: 2,
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    icon: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    accountName: {
        alignItems: 'center',
        fontSize: 25,
        color: 'rgb(0, 0, 0)',
        marginTop: 10,
        fontWeight: 'bold',
    },
});
