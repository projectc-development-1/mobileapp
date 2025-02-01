import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef } from 'react';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { useTranslation } from "react-i18next";
import commonFunctions from '@/scripts/commonFunctions';
import { Icon } from 'react-native-elements'
import { manipulateAsync, FlipType, SaveFormat, ImageManipulator } from 'expo-image-manipulator';


const { setDataToSecureStore } = commonFunctions();

interface ProfileDetail {
    accountName: string;
    photoInBase64: string;
}

interface MapProps {
    selfAccount: { accountName: string; accountID: string } | null;
    iconBody: string;
    setEditProfile: React.Dispatch<React.SetStateAction<boolean>>;
    loadProfilePhoto: () => Promise<void>;
}

const Map: React.FC<MapProps> = ({ selfAccount, iconBody, setEditProfile, loadProfilePhoto }) => {

    const { t } = useTranslation();
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = React.useRef<CameraView>(null);
    let [editPhoto, setEditPhoto] = useState(false);
    let photoInBase64 = useRef(iconBody);
    let [loading, setLoading] = useState(false);
    let [needToSave, setNeedToSave] = useState(false);

    const compressImage = async (uri: string) => {
        const result = await manipulateAsync(
            uri,
            [{ resize: { width: 800 } }], // Resize the image to a width of 800px
            { compress: 0.1 } // Compress the image to 70% quality
        );
        return result.uri;
    };

    async function pickImage() {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
    
        console.log(result);
    
        if (!result.canceled) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Result = reader.result as string;
                photoInBase64.current = base64Result;
                setNeedToSave(true);
                setEditPhoto(false);
            };
            let response = await fetch(result.assets[0].uri);
            const compressedUri = await compressImage(response.url);
            response = await fetch(compressedUri);
            const blob = await response.blob();
            reader.readAsDataURL(blob);
        }
    }
    
    function takePicture() { 
        if(cameraRef.current?._onCameraReady) {
            cameraRef.current.takePictureAsync().then((photo) => {
                if (photo?.uri) {
                    fetch(photo.uri)
                        .then(response => response.blob())
                        .then(blob => {
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                                const base64Result = reader.result as string;
                                if (facing === 'front') {
                                    const manipResult = await manipulateAsync(
                                        photo.uri,
                                        [{ flip: FlipType.Horizontal }],
                                        { base64: true }
                                    );
                                    if(manipResult.base64 != null){
                                        let manipResultInBase64 = (base64Result.substring(0, base64Result.indexOf('base64,'))+ 'base64,') + manipResult.base64;
                                        photoInBase64.current = manipResultInBase64;
                                        setNeedToSave(true);
                                    }
                                } else {
                                    photoInBase64.current = base64Result;
                                    setNeedToSave(true);
                                }
                                setEditPhoto(false);
                            };
                            reader.readAsDataURL(blob);
                        });
                } else {
                    Alert.alert('takePicture - Error', 'Failed to capture photo.');
                }
            })
        };
    }

    function saveAction(){
        console.log('Updating profile photo');
        setLoading(true);
        fetch('https://zd7pvkao33.execute-api.ap-south-1.amazonaws.com/updateUserProfile', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "action" : "communication",
                "data": {
                    "action": "updateProfilePhoto",
                    "data": {
                        "accountID": selfAccount?.accountID,
                        "photoInBase64": photoInBase64.current
                    }
                }
            })
        })
        .then(response => response.text())
        .then(async data => {
            console.log(data);
            if(data=='"profile updated"'){
                setDataToSecureStore('profilePhoto', photoInBase64.current);
                setLoading(false);
                loadProfilePhoto();
            }
        })
        .catch((error) => {
            console.error('saveAction - Error:', error);
        });
    }

    return (
        <>
            {loading &&
                <Image source={require('../assets/images/loading.gif')}/> 
            }
            {!loading &&
                <>
                <>
                    {!editPhoto &&
                        <Image source={{ uri: photoInBase64.current }} style={styles.icon}/> 
                    }
                    {editPhoto && permission && permission.granted &&
                        <>
                            <CameraView style={styles.icon} facing={facing} ref={cameraRef} />
                            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
                                <TouchableOpacity onPress={ () => {setFacing(current => (current === 'back' ? 'front' : 'back'));} }>
                                    <Icon name='cameraswitch'/>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={takePicture} style={{ marginLeft: 20 }}>
                                    <Icon name='camera-alt'/>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={pickImage} style={{ marginLeft: 20 }}>
                                    <Icon name='image'/>
                                </TouchableOpacity>
                            </View>
                        </>
                    }
                    {editPhoto && permission && !permission.granted &&
                        <View style={styles.container}>
                            <Text style={styles.message}>{t('cameraPermissionRequired')}</Text>
                            <TouchableOpacity onPress={requestPermission}>
                                <Text style={styles.text}>{t('requestPermission')}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => setEditPhoto(!editPhoto)} >
                            <Icon name={ editPhoto==false ? 'edit' : 'edit-off' }/>
                        </TouchableOpacity>
                        {needToSave && 
                            <TouchableOpacity onPress={saveAction} style={{ marginLeft: 20 }}>
                                <Icon name='save'/>
                            </TouchableOpacity>
                        }
                    </View>
                </>
                </>
            }
        </>
    );
}

export default Map;

const styles = StyleSheet.create({
    container: {
        height: 200,
        alignItems: 'center', // Center the camera view horizontally
        justifyContent: 'center', // Center the camera view vertically
        marginBottom: 30,
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    icon: {
        width: 200, // Set a fixed width for the circle
        height: 200, // Set a fixed height for the circle
        borderRadius: 100, // Half of the width/height to make it a circle
        overflow: 'hidden',
        marginBottom: 30,
    },
    cameraContainer: {
        top: 10,
        height: '30%',
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'rgb(0, 0, 0)',
    },
});
