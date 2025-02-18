import { CameraView, CameraType, useCameraPermissions, CameraMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef } from 'react';
import uuid from 'react-native-uuid';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { useTranslation } from "react-i18next";
import { Icon } from 'react-native-elements'
import * as FileSystem from 'expo-file-system';
import { useVideoPlayer, VideoView } from 'expo-video';
import commonFunctions from '@/scripts/commonFunctions';
import { Message } from '@/scripts/messageInterfaces';
import { Video } from 'expo-av';
import * as VideoThumbnails from 'expo-video-thumbnails';


interface MapProps {
    setMsg: (msg: any) => Promise<void>;
    targetAccount: { accountName: string; accountID: string } | null;
    selfAccount: { accountName: string; accountID: string } | null;
    setTakePhoto: React.Dispatch<React.SetStateAction<boolean>>;
    messages: any;
}

const Map: React.FC<MapProps> = ({ setMsg, targetAccount, selfAccount, setTakePhoto, messages }) => {
    const { t } = useTranslation();
    const { compressImage, compressVideo } = commonFunctions();
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [cameraModeRef, setCameraModeRef] = useState<CameraMode>('picture');
    let [editPhoto, setEditPhoto] = useState(true);
    let photoURI = useRef("");
    let photoOriginalBase64File = useRef("");
    let videoInBase64 = useRef("");
    let videoURI = useRef("");
    let videoThumbnailURI = useRef("");
    let [takingVideo, setTakingVideo] = useState(false);

    let videoPlayerSource = useVideoPlayer(videoURI.current, player => { player.loop = true; player.play(); });

    const switchCamera = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
        if(takingVideo){ takeVideo(); }
    }
    
    const pickVideoOrImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            //allowsEditing: true,
            //aspect: [4, 3],
            //quality: 1,
        });
        
        if (!result.canceled) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Result = reader.result as string;
                if (result.assets[0].type === 'image') {
                    photoOriginalBase64File.current = base64Result;
                    photoURI.current = result.assets[0].uri;
                    setEditPhoto(false);
                }
                else if (result.assets[0].type === 'video') {
                    videoURI.current = result.assets[0].uri;
                    videoThumbnailURI.current = (await VideoThumbnails.getThumbnailAsync( result.assets[0].uri, { time: 500, } )).uri;
                    setTimeout(() => {
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
        setCameraModeRef('picture');
        setTimeout(async () => {
            if(cameraRef.current?._onCameraReady) {
                cameraRef.current.takePictureAsync().then(async (photo) => {
                    if (photo?.uri) {
                        fetch(photo.uri)
                        .then(response => response.blob())
                        photoURI.current = photo.uri;
                        photoOriginalBase64File.current = "data:image/*;base64"+ await FileSystem.readAsStringAsync(photo.uri, { encoding: FileSystem.EncodingType.Base64 });
                        setEditPhoto(false);
                    } else {
                        Alert.alert('takePicture - Error', 'Failed to capture photo.');
                    }
                })
            };
        }, 500);
    }

    const takeVideo = async () => {
        setCameraModeRef('video');
        setTimeout(async () => {
            if (cameraRef.current?._onCameraReady) {
                setTakingVideo(true);
                try {
                    const video = await cameraRef.current.recordAsync();
                    if (video?.uri) {
                        videoURI.current = video.uri;
                        videoThumbnailURI.current = (await VideoThumbnails.getThumbnailAsync( video.uri, { time: 500, } )).uri;
                        setTakingVideo(false);
                        setEditPhoto(false);
                    } else {
                        Alert.alert('takeVideo - Error', 'Failed to capture video.');
                    }
                } catch (error) {
                    Alert.alert('takeVideo - Error', 'An error occurred while recording the video.');
                }
            } else {
                console.log('Camera is not ready.');
            }
        }, 1000);
    }

    const stopVideoRecording = async () => {
        if (cameraRef.current) {
            cameraRef.current.stopRecording();
        }
    };

    const deleteRecording = async () => {
        if(photoURI.current.length > 0){
            await FileSystem.deleteAsync(photoURI.current);
            photoURI.current = "";
        }
        videoPlayerSource.pause();
        if (videoURI.current.length > 0){
            await FileSystem.deleteAsync(videoURI.current);
            videoURI.current = "";
            videoInBase64.current = "";
        }
        
        setCameraModeRef('picture');
        setEditPhoto(true);
    }

    async function send(){
        if(photoURI.current.length > 0){
            let photoDetails = await FileSystem.getInfoAsync(photoURI.current);
            let photoFileName = photoDetails.uri.split('/').pop();
            let photoFileType = photoFileName?.split('.').pop();

            photoURI.current = await compressImage(photoURI.current);
            const compressedBase64File = await FileSystem.readAsStringAsync(photoURI.current, { encoding: FileSystem.EncodingType.Base64 });

            const tempMsgId = uuid.v4();
            const tempMsg: Message = {
                action : 'sendPhoto',
                data: {
                    messageID: tempMsgId,
                    from_account_id: selfAccount?.accountID || '',
                    from_account_name: selfAccount?.accountName || '',
                    to_account_id: targetAccount?.accountID || '',
                    to_account_name: targetAccount?.accountName || '',
                    msgtype: 'photo',
                    timestamp: Date.now(),
                    message: {
                        generalContent: '',
                        audioContent: '',
                        imageContent: { 
                            fileName: tempMsgId+"_"+photoFileName,
                            photoOriginalInBase64: photoOriginalBase64File.current,
                            photoCompressedInBase64: "data:image/*;base64,"+compressedBase64File,
                            type: 'image/' + photoFileType
                        },
                        videoContent: ''
                    },
                    read: false,
                    sent: 0
                }
            }
            setMsg(tempMsg).then(() => {
                setTakePhoto(false);
                fetch('https://19h9udqig3.execute-api.ap-south-1.amazonaws.com/chatCommunication_sendBigFile', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "action" : "communication",
                        "data": tempMsg
                    })
                }).then(response => {
                    if (response.status !== 200) {
                        if (response.status === 413) { Alert.alert(t('payLoadTooBig')); }
                        for(let i=0; i<messages.length; i++){
                            if(messages[i].messageID == tempMsg.data.messageID){
                                messages[i].sent = -1;
                                break;
                            }
                        }
                    } else{
                        for(let i=0; i<messages.length; i++){
                            if(messages[i].messageID == tempMsg.data.messageID){
                                messages[i].sent = 1;
                                break;
                            }
                        }
                    }
                });
            });
        }
        else if(videoURI.current.length > 0){
            videoPlayerSource.pause();
            videoURI.current = await compressVideo(videoURI.current);
            let videoDetails = await FileSystem.getInfoAsync(videoURI.current);
            let videoFileName = videoDetails.uri.split('/').pop();
            let videoFileType = videoFileName?.split('.').pop();

            const base64File = await FileSystem.readAsStringAsync(videoURI.current, { encoding: FileSystem.EncodingType.Base64 });
            videoThumbnailURI.current = await compressImage(videoThumbnailURI.current);
            const thumbnailInBase64File = await FileSystem.readAsStringAsync(videoThumbnailURI.current, { encoding: FileSystem.EncodingType.Base64 });

            const tempMsgId = uuid.v4();
            const tempMsg: Message = {
                action : 'sendVideo',
                data: {
                    messageID: tempMsgId,
                    from_account_id: selfAccount?.accountID || '',
                    from_account_name: selfAccount?.accountName || '',
                    to_account_id: targetAccount?.accountID || '',
                    to_account_name: targetAccount?.accountName || '',
                    msgtype: 'video',
                    timestamp: Date.now(),
                    message: {
                        generalContent: '',
                        audioContent: '',
                        imageContent: '',
                        videoContent: { 
                            fileName: tempMsgId+"_"+videoFileName,
                            videoOriginalInBase64: base64File,
                            thumbnailInBase64: "data:image/*;base64,"+thumbnailInBase64File,
                            type: 'video/' + videoFileType
                        }
                    },
                    read: false,
                    sent: 0
                }
            }
            setMsg(tempMsg).then(async () => {
                setTakePhoto(false);
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
                }).then(response => {
                    if (response.status !== 200) {
                        if (response.status === 413) { Alert.alert(t('payLoadTooBig')); }
                        for(let i=0; i<messages.length; i++){
                            if(messages[i].messageID == tempMsg.data.messageID){
                                messages[i].sent = -1;
                                break;
                            }
                        }
                    } else{
                        for(let i=0; i<messages.length; i++){
                            if(messages[i].messageID == tempMsg.data.messageID){
                                messages[i].sent = 1;
                                break;
                            }
                        }
                    }
                });
            });
        }

        deleteRecording();
    }

    return (
        <View style={styles.cameraContainer}>
            {!editPhoto &&
            <View>
                {photoURI.current.length > 0 &&
                <Image source={{ uri: photoURI.current }} style={styles.cameraView}/> 
                }
                {videoURI.current.length > 0 && videoPlayerSource &&
                <VideoView player={videoPlayerSource} style={styles.cameraView} /> 
                }
                {videoInBase64.current.length > 0 &&
                <Video
                    style={styles.cameraView}
                    source={{uri: videoURI.current}}
                    useNativeControls
                    isLooping
                />
                }
                <View style={styles.controlButtonsContainer3}>
                    <TouchableOpacity onPress={() => { deleteRecording(); }} >
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
                <CameraView mode={cameraModeRef} style={styles.cameraView} facing={facing} ref={cameraRef} mirror={facing === 'front'}>
                    <View style={styles.controlButtonsContainer1}>
                        {!takingVideo &&
                        <TouchableOpacity onPress={switchCamera}>
                            <Icon name='cameraswitch'/>
                        </TouchableOpacity>
                        }
                        {!takingVideo &&
                        <TouchableOpacity onPress={takePicture} style={{ marginLeft: 20 }}>
                            <Icon name='camera-alt'/>
                        </TouchableOpacity>
                        }
                        {takingVideo ?
                        <TouchableOpacity onPress={stopVideoRecording} >
                            <Icon name='stop'/>
                        </TouchableOpacity> :
                        <TouchableOpacity onPress={takeVideo} style={{ marginLeft: 20 }}>
                            <Icon name='videocam'/>
                        </TouchableOpacity>
                        }
                        {!takingVideo &&
                        <TouchableOpacity onPress={pickVideoOrImage} style={{ marginLeft: 20 }}>
                            <Icon name='image'/>
                        </TouchableOpacity>
                        }
                    </View>
                    <View style={styles.controlButtonsContainer2}>
                        <TouchableOpacity onPress={() => setTakePhoto(false) } >
                            <Icon name={ 'edit-off'}/>
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