import { Camera, CameraView, CameraType, useCameraPermissions, CameraMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef } from 'react';
import uuid from 'react-native-uuid';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Image, Button } from 'react-native';
import { useTranslation } from "react-i18next";
import { Icon } from 'react-native-elements'
import * as FileSystem from 'expo-file-system';
import { useVideoPlayer, VideoPlayer, VideoView } from 'expo-video';
import commonFunctions from '@/scripts/commonFunctions';
import { Video, Audio } from 'expo-av';


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
    const recordingVideoURIArray = useRef<string[]>([]);
    let [takingVideo, setTakingVideo] = useState(false);
    const [video, setVideo] = useState();

    let videoPlayerSource = useVideoPlayer(videoURI.current, player => { player.loop = true; player.play(); });
    const [videoplayer, setVideoplayer] = useState<VideoPlayer | undefined>(undefined);

    const switchCamera = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
        if(takingVideo){ takeVideo(); }
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
                    photoOriginalBase64File.current = base64Result;
                    photoURI.current = result.assets[0].uri;
                    setEditPhoto(false);
                }
                else if (result.assets[0].type === 'video') {
                    videoURI.current = result.assets[0].uri;
                    setTimeout(() => {
                        setVideoplayer( videoPlayerSource );
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
                        .then(blob => {
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                                photoOriginalBase64File.current = reader.result as string;
                            }
                        });
                        photoURI.current = photo.uri;
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
                    const {status} = await Audio.requestPermissionsAsync();
                    const video = await cameraRef.current.recordAsync();
                    if (video?.uri) {
                        recordingVideoURIArray.current.push(video.uri);
                    } else {
                        Alert.alert('takeVideo - Error', 'Failed to capture video.');
                    }
                } catch (error) {
                    Alert.alert('takeVideo - Error', 'An error occurred while recording the video.');
                }
            } else {
                console.log('Camera is not ready.');
            }
        }, 500);
    }

    const stopVideoRecording = async () => {
        try{
            if (cameraRef.current) {
                cameraRef.current.stopRecording();
            }
            setTimeout(async () => {
                const mergedVideoType = recordingVideoURIArray.current[0].split('.').pop();
                let mergedVideoBase64 = "";
                for (let i = 0; i < recordingVideoURIArray.current.length; i++) {
                    mergedVideoBase64 += await FileSystem.readAsStringAsync(recordingVideoURIArray.current[i], { encoding: FileSystem.EncodingType.Base64 });
                }
                recordingVideoURIArray.current = [];
                //get the file uri
                const videoFileName = 'Camera/tempMergedVideo.' + mergedVideoType;
                const videoFileUri = FileSystem.cacheDirectory + videoFileName;
                await FileSystem.writeAsStringAsync(videoFileUri, mergedVideoBase64, { encoding: FileSystem.EncodingType.Base64 });
                videoURI.current = videoFileUri;
                
                setVideoplayer( videoPlayerSource );
                setTakingVideo(false);
                setEditPhoto(false);
            }, 1000);
        } catch (error) {
            Alert.alert('stopVideoRecording - Error', 'An error occurred while stopping the video recording.');
        }
    };

    const deleteRecording = async () => {
        if(photoURI.current.length > 0){
            await FileSystem.deleteAsync(photoURI.current);
            photoURI.current = "";
        }
        videoPlayerSource.pause();
        setVideoplayer(undefined);
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
            const base64File = await FileSystem.readAsStringAsync(photoURI.current, { encoding: FileSystem.EncodingType.Base64 });

            const tempMsgId = uuid.v4();
            const tempMsg = {
                "action" : "sendPhoto",
                "data": {
                    "message_id": tempMsgId,
                    "from_account_id": selfAccount?.accountID,
                    "from_account_name": selfAccount?.accountName,
                    "to_account_id": targetAccount?.accountID,
                    "to_account_name": targetAccount?.accountName,
                    "message": "data:image/*;base64,"+base64File+"@#@"+(tempMsgId+"_"+photoFileName),
                    "photoCompressedBase64": "data:image/*;base64,"+base64File,
                    "msgtype": "photo",
                    "timestamp": Date.now().toString(),
                    "sent": 0
                }
            }
            setMsg(tempMsg).then(() => {
                setTakePhoto(false);
                const messageContent: any = {
                    name: photoFileName,
                    type: 'image/' + photoFileType,
                    base64: photoOriginalBase64File.current
                }
                tempMsg.data.message = messageContent;
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
                            if(messages[i].messageID == tempMsg.data.message_id){
                                messages[i].sent = -1;
                                break;
                            }
                        }
                    } else{
                        for(let i=0; i<messages.length; i++){
                            if(messages[i].messageID == tempMsg.data.message_id){
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
            // Get the file detail from the recordingURI
            videoURI.current = await compressVideo(videoURI.current);
            let videoDetails = await FileSystem.getInfoAsync(videoURI.current);
            let videoFileName = videoDetails.uri.split('/').pop();
            let videoFileType = videoFileName?.split('.').pop();
            // Create the JSON payload
            const tempMsgId = uuid.v4();
            const tempMsg = {
                action : 'sendVideo',
                data: {
                    message: tempMsgId+"_"+videoFileName,
                    message_id: tempMsgId,
                    from_account_id: selfAccount?.accountID,
                    from_account_name: selfAccount?.accountName,
                    to_account_id: targetAccount?.accountID,
                    to_account_name: targetAccount?.accountName,
                    msgtype: 'video',
                    timestamp: Date.now().toString(),
                    sent: 0
                }
            }
            setMsg(tempMsg).then(async () => {
                setTakePhoto(false);
                // Read the file and convert it to base64
                const base64File = await FileSystem.readAsStringAsync(videoURI.current, { encoding: FileSystem.EncodingType.Base64 });
                const messageContent: any = {
                    name: videoFileName,
                    type: 'video/' + videoFileType,
                    base64: "data:video/*;base64,"+base64File
                }
                tempMsg.data.message = messageContent;

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
                            if(messages[i].messageID == tempMsg.data.message_id){
                                messages[i].sent = -1;
                                break;
                            }
                        }
                    } else{
                        for(let i=0; i<messages.length; i++){
                            if(messages[i].messageID == tempMsg.data.message_id){
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
                        <TouchableOpacity onPress={switchCamera}>
                            <Icon name='cameraswitch'/>
                        </TouchableOpacity>
                        {!takingVideo &&
                        <TouchableOpacity onPress={takePicture} style={{ marginLeft: 20 }}>
                            <Icon name='camera-alt'/>
                        </TouchableOpacity>
                        }
                        {takingVideo ?
                        <TouchableOpacity onPress={stopVideoRecording} style={{ marginLeft: 20 }}>
                            <Icon name='stop'/>
                        </TouchableOpacity> :
                        <TouchableOpacity onPress={takeVideo} style={{ marginLeft: 20 }}>
                            <Icon name='videocam'/>
                        </TouchableOpacity>
                        }
                        <TouchableOpacity onPress={pickVideoOrImage} style={{ marginLeft: 20 }}>
                            <Icon name='image'/>
                        </TouchableOpacity>
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