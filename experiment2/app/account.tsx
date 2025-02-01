import { View, StyleSheet, TouchableOpacity, Image, Text, TextInput, ScrollView } from 'react-native';
import React, { useState } from 'react';
import TakePhotoForProfile from './takePhotoForProfile';
import commonFunctions from '@/scripts/commonFunctions';
import { useFonts } from 'expo-font';
import { useTranslation } from 'react-i18next';
import { getFontFamily } from '@/i18n';
import { Icon } from 'react-native-elements';

const { getDataFromSecureStore } = commonFunctions();

interface MapProps {
    selfAccount: { accountName: string; accountID: string } | null;
}

const Map: React.FC<MapProps> = ({ selfAccount }) => {
    const { t } = useTranslation();
    const fontFamily = getFontFamily();

    let [editProfile, setEditProfile] = useState(false);
    let [iconBody, setIconBody] = useState('');
    const [introduction, setIntroduction] = React.useState('Who are you?');

    async function loadProfilePhoto() {
        setTimeout(async () => {
            const photoInBase64 = await getDataFromSecureStore('profilePhoto');
            setIconBody(photoInBase64 ?? '');
        }, 500);
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
                <ScrollView style={styles.profileContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => { loadProfilePhoto(); setEditProfile(false); } }>
                        <Icon name='close' />
                    </TouchableOpacity>
                    <View style={{alignItems: 'center', marginTop: 50, marginBottom: 50}}>
                        <TakePhotoForProfile 
                            selfAccount={selfAccount} 
                            iconBody={iconBody}
                            setEditProfile={setEditProfile} 
                            loadProfilePhoto={loadProfilePhoto}
                        />
                    </View>
                    <View style={{alignItems: 'center'}}>
                        <View style={styles.introductionContainer}>
                            <TextInput
                                style={[styles.introduction, { fontFamily }]}
                                onChangeText={setIntroduction}
                                value={introduction}
                            />
                        </View>
                    </View>
                    <View style={{alignItems: 'center'}}>
                        <View style={styles.hobbiesContainer}>
                            <TextInput
                                style={[styles.hobbies, { fontFamily }]}
                                onChangeText={setIntroduction}
                                value={introduction}
                            />
                        </View>
                    </View>
                    <View style={{alignItems: 'center'}}>
                        <View style={styles.whatAreYouLookingForContainer}>
                            <TextInput
                                style={[styles.whatAreYouLookingFor, { fontFamily }]}
                                onChangeText={setIntroduction}
                                value={introduction}
                            />
                        </View>
                    </View>
                </ScrollView>
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
    profileContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        position: 'absolute',
        zIndex: 2,
        width: '100%',
        height: '100%',
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
    closeButton: {
        position: 'absolute',
        top: '10%',
        left: '5%',
        zIndex: 2,
    },
    introductionContainer: {
        backgroundColor: 'rgb(255, 255, 255)',
        width: '70%',
        height: '40%',
        borderRadius: 25,
    },
    introduction: {
        fontSize: 20,
        color: 'rgb(0, 0, 0)',
    },
    hobbiesContainer: {
        backgroundColor: 'rgb(255, 255, 255)',
        width: '70%',
        height: '40%',
        borderRadius: 25,
    },
    hobbies: {
        fontSize: 20,
        color: 'rgb(0, 0, 0)',
    },
    whatAreYouLookingForContainer: {
        backgroundColor: 'rgb(255, 255, 255)',
        width: '70%',
        height: '40%',
        borderRadius: 25,
    },
    whatAreYouLookingFor: {
        fontSize: 20,
        color: 'rgb(0, 0, 0)',
    },
});
