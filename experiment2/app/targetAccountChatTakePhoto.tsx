import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef } from 'react';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { useTranslation } from "react-i18next";
import commonFunctions from '@/scripts/commonFunctions';
import { Icon } from 'react-native-elements'
import { manipulateAsync, FlipType } from 'expo-image-manipulator';
import { useRouter } from 'expo-router';

const Map = () => {

    const { t } = useTranslation();
    const router = useRouter();
    const { setDataToSecureStore } = commonFunctions();
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = React.useRef<CameraView>(null);
    let [editPhoto, setEditPhoto] = useState(true);
    let photoInBase64 = useRef("");
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
                                        [{ flip: FlipType.Horizontal }, { resize: { width: 800 } }],
                                        { base64: true, compress: 0.1 },
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
        setDataToSecureStore('tempPhotoToSend', photoInBase64.current);
        router.back();
    }

    return (
        <>
            {!editPhoto &&
                <Image source={{ uri: photoInBase64.current }} style={styles.cameraView}/> 
            }
            {editPhoto && permission && permission.granted &&
                <>
                    <CameraView style={styles.cameraView} facing={facing} ref={cameraRef} />
                    <View style={styles.controlButtonsContainer1}>
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
                <View style={styles.cameraView}>
                    <Text style={styles.message}>{t('cameraPermissionRequired')}</Text>
                    <TouchableOpacity onPress={requestPermission}>
                        <Text style={styles.text}>{t('requestPermission')}</Text>
                    </TouchableOpacity>
                </View>
            }
            <View style={styles.controlButtonsContainer2}>
                <TouchableOpacity onPress={() => router.back() } >
                    <Icon name={ editPhoto==false ? 'edit' : 'edit-off' }/>
                </TouchableOpacity>
                {needToSave && 
                    <TouchableOpacity onPress={saveAction} style={{ marginLeft: 20 }}>
                        <Icon name='save'/>
                    </TouchableOpacity>
                }
            </View>
        </>
    );
}

export default Map;

const styles = StyleSheet.create({
    cameraView: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        position: 'absolute',
        width: '100%',
        height: '70%',
        borderRadius: 30,
        top: '10%',
        alignSelf: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'rgb(0, 0, 0)',
    },
    controlButtonsContainer1: {
        top: '85%',
        flexDirection: 'row',
        justifyContent: 'center', 
        marginBottom: 20,
    },
    controlButtonsContainer2: {
        top: '85%',
        flexDirection: 'row',
        justifyContent: 'center', 
        marginBottom: 20,
    }
});