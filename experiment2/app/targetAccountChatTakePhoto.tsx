import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef } from 'react';
import uuid from 'react-native-uuid';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Image, Button } from 'react-native';
import { useTranslation } from "react-i18next";
import { Icon } from 'react-native-elements'
import { manipulateAsync, FlipType } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { useVideoPlayer, VideoPlayer, VideoView } from 'expo-video';

interface MapProps {
    setMsg: React.Dispatch<React.SetStateAction<string>>;
    targetAccount: { accountName: string; accountID: string } | null;
    selfAccount: { accountName: string; accountID: string } | null;
    setTakePhoto: React.Dispatch<React.SetStateAction<boolean>>;
}

const Map: React.FC<MapProps> = ({ setMsg, targetAccount, selfAccount, setTakePhoto }) => {
    const { t } = useTranslation();
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = React.useRef<CameraView>(null);
    let [editPhoto, setEditPhoto] = useState(true);
    let photoInBase64 = useRef("");
    let photoURI = useRef("");
    let videoInBase64 = useRef("");
    let videoURI = useRef("");
    let [takingVideo, setTakingVideo] = useState(false);
    let [videoplayer, setVideoplayer] = useState<VideoPlayer | null>(null);

    let player = useVideoPlayer(videoURI.current, player => { player.loop = true; player.play(); });

    const compressImage = async (uri: string) => {
        const result = await manipulateAsync(
            uri,
            [{ resize: { width: 800 } }],
            { compress: 0.1 }
        );
        return result.uri;
    }

    const pickVideoOrImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        
        if (!result.canceled) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Result = reader.result as string;
                if (result.assets[0].type === 'image') {
                    photoInBase64.current = base64Result;
                    photoURI.current = result.assets[0].uri;
                    setEditPhoto(false);
                }
                else if (result.assets[0].type === 'video') {
                    videoInBase64.current = base64Result;
                    videoURI.current = result.assets[0].uri;
                    setTimeout(() => {
                        setVideoplayer( player )
                        setEditPhoto(false);
                    }, 1000);
                }
            };
            if (result.assets[0].type === 'image') {
                let response = await fetch(result.assets[0].uri);
                const compressedUri = await compressImage(response.url);
                response = await fetch(compressedUri);
                const blob = await response.blob();
                reader.readAsDataURL(blob);
            }
            else if (result.assets[0].type === 'video') {
                let response = await fetch(result.assets[0].uri);
                const blob = await response.blob();
                reader.readAsDataURL(blob);
            }
        }
    }
    
    const takePicture = () => { 
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
                                    }
                                } else {
                                    const manipResult = await manipulateAsync(
                                        photo.uri,
                                        [{ resize: { width: 800 } }],
                                        { base64: true, compress: 0.1 },
                                    );
                                    if(manipResult.base64 != null){
                                        let manipResultInBase64 = (base64Result.substring(0, base64Result.indexOf('base64,'))+ 'base64,') + manipResult.base64;
                                        photoInBase64.current = manipResultInBase64;
                                    }
                                }
                                photoURI.current = photo.uri;
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

    const takeVideo = () => {
        if(cameraRef.current?._onCameraReady) {
            setTakingVideo(true);
            cameraRef.current.recordAsync().then((video) => {
                console.log('444');
                if (video?.uri) {
                    fetch(video.uri)
                        .then(response => response.blob())
                        .then(blob => {
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                                const base64Result = reader.result as string;
                                if (facing === 'front') {
                                    const manipResult = await manipulateAsync(
                                        video.uri,
                                        [{ flip: FlipType.Horizontal }, { resize: { width: 800 } }],
                                        { base64: true, compress: 0 },
                                    );
                                    if(manipResult.base64 != null){
                                        let manipResultInBase64 = (base64Result.substring(0, base64Result.indexOf('base64,'))+ 'base64,') + manipResult.base64;
                                        videoInBase64.current = manipResultInBase64;
                                    }
                                } else {
                                    const manipResult = await manipulateAsync(
                                        video.uri,
                                        [{ resize: { width: 800 } }],
                                        { base64: true, compress: 0 },
                                    );
                                    if(manipResult.base64 != null){
                                        let manipResultInBase64 = (base64Result.substring(0, base64Result.indexOf('base64,'))+ 'base64,') + manipResult.base64;
                                        videoInBase64.current = manipResultInBase64;
                                    }
                                }
                                videoURI.current = video.uri;
                                console.log('1111111', videoURI.current);
                                setEditPhoto(false);
                            };
                            reader.readAsDataURL(blob);
                        });
                } else {
                    Alert.alert('takeVideo - Error', 'Failed to capture video.');
                }
            })
        };
    }

    const stopVideoRecording = () => {
        if (cameraRef.current) {
            cameraRef.current.stopRecording();
        }
    };

    const deleteRecording = async () => {
        if(photoURI.current.length > 0){
            await FileSystem.deleteAsync(photoURI.current);
            photoURI.current = "";
            photoInBase64.current = "";
        }
        player.pause();
        if (videoURI.current.length > 0){
            await FileSystem.deleteAsync(videoURI.current);
            videoURI.current = "";
            videoInBase64.current = "";
        }
    }

    async function send(){
        if(photoInBase64.current.length > 0){
            const tempMsg = {
                "action" : "sendPhoto",
                "data": {
                    "message_id": uuid.v4(),
                    "from_account_id": selfAccount?.accountID,
                    "from_account_name": selfAccount?.accountName,
                    "to_account_id": targetAccount?.accountID,
                    "to_account_name": targetAccount?.accountName,
                    "message": photoInBase64.current,
                    "msgtype": "photo",
                    "timestamp": Date.now().toString()
                }
            }
            fetch('https://19h9udqig3.execute-api.ap-south-1.amazonaws.com/chatCommunication_sendBigFile', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "action" : "communication",
                    "data": tempMsg
                })
            })
            setMsg(tempMsg);
        }
        else if(videoInBase64.current.length > 0){
            // Get the file detail from the recordingURI
            let videoDetails = await FileSystem.getInfoAsync(videoInBase64.current);
            let videoFileName = videoDetails.uri.split('/').pop();
            let videoFileType = videoFileName?.split('.').pop();
        
            // Read the file and convert it to base64
            let base64File = await FileSystem.readAsStringAsync(videoInBase64.current, { encoding: FileSystem.EncodingType.Base64 });
        
            // Create the JSON payload
            const tempMsg = {
                action : 'sendVideo',
                data: {
                    message: {
                        name: videoFileName,
                        type: 'audio/' + videoFileType,
                        base64: base64File
                    },
                    message_id: uuid.v4(),
                    from_account_id: selfAccount?.accountID,
                    from_account_name: selfAccount?.accountName,
                    to_account_id: targetAccount?.accountID,
                    to_account_name: targetAccount?.accountName,
                    msgtype: 'video',
                    timestamp: Date.now().toString()
                }
            }
        
            // Send the POST request with the JSON payload
            fetch('https://19h9udqig3.execute-api.ap-south-1.amazonaws.com/chatCommunication_sendBigFile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "action" : "communication",
                    "data": tempMsg
                })
            })
            const filename: any = tempMsg.data.message_id+"_"+tempMsg.data.message.name;
            tempMsg.data.message = filename;
            setMsg(tempMsg);
        }
        setTakePhoto(false);
        deleteRecording();
    }

    return (
        <View style={styles.cameraContainer}>
            {!editPhoto &&
            <View>
                {photoInBase64.current.length > 0 &&
                <Image source={{ uri: photoInBase64.current }} style={styles.cameraView}/> 
                }
                {videoInBase64.current.length > 0 && videoplayer &&
                <VideoView player={videoplayer} style={styles.cameraView} allowsPictureInPicture allowsFullscreen/> 
                }
                <View style={styles.controlButtonsContainer3}>
                    <TouchableOpacity onPress={() => { setEditPhoto(true); deleteRecording(); }} >
                        <Icon name={ editPhoto ? 'edit-off' : 'edit' }/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={send} style={{ marginLeft: 20 }}>
                        <Icon name='send'/>
                    </TouchableOpacity>
                </View>
            </View>
            }
            {editPhoto && permission && permission.granted &&
            <View>
                <CameraView style={styles.cameraView} facing={facing} ref={cameraRef}>
                    <View style={styles.controlButtonsContainer1}>
                        <TouchableOpacity onPress={ () => {setFacing(current => (current === 'back' ? 'front' : 'back'));} }>
                            <Icon name='cameraswitch'/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={takePicture} style={{ marginLeft: 20 }}>
                            <Icon name='camera-alt'/>
                        </TouchableOpacity>
                        {takingVideo ?
                        <TouchableOpacity onPress={takeVideo} style={{ marginLeft: 20 }}>
                            <Icon name='stop'/>
                        </TouchableOpacity> :
                        <TouchableOpacity onPress={stopVideoRecording} style={{ marginLeft: 20 }}>
                            <Icon name='videocam'/>
                        </TouchableOpacity>
                        }
                        <TouchableOpacity onPress={pickVideoOrImage} style={{ marginLeft: 20 }}>
                            <Icon name='image'/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.controlButtonsContainer2}>
                        <TouchableOpacity onPress={() => setTakePhoto(false) } >
                            <Icon name={ editPhoto ? 'edit-off' : 'edit' }/>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            </View>
            }
            {editPhoto && permission && !permission.granted &&
            <View style={styles.requestPermissionView}>
                <Text style={styles.message}>{t('cameraPermissionRequired')}</Text>
                <TouchableOpacity onPress={requestPermission}>
                    <Text style={styles.text}>{t('requestPermission')}</Text>
                </TouchableOpacity>
            </View>
            }
        </View>
    );
}

export default Map;

const styles = StyleSheet.create({
    requestPermissionView: {
        width: 200,
        height: 100,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgb(255, 255, 255)',
    },
    cameraView: {
        width: 320,
        height: '90%',
        alignSelf: 'center',
    },
    cameraContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        position: 'absolute',
        zIndex: 3,
        width: 320,
        height: '65%',
        borderRadius: 30,
        top: '8%',
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
        top: '80%',
        width: 180,
        height: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 20,
        borderRadius: 30,
        backgroundColor: 'rgb(255, 255, 255)',
    },
    controlButtonsContainer2: {
        top: '80%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 20,
        borderRadius: 30,
        width: 30,
        height: 30,
        backgroundColor: 'rgb(255, 255, 255)',
    },
    controlButtonsContainer3: {
        top: '80%',
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 20,
        borderRadius: 30,
        width: 150,
        height: 30,
        backgroundColor: 'rgb(255, 255, 255)',
    },
});