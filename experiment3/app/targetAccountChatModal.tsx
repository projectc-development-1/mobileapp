import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableWithoutFeedback, View, Keyboard, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ScrollView, Image, Alert } from 'react-native';
import uuid from 'react-native-uuid';
import { useTranslation } from 'react-i18next';
import { Icon } from 'react-native-elements';
import commonFunctions from '@/scripts/commonFunctions';
import { Message, MessageContent } from '@/scripts/messageInterfaces';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import ImageView from "react-native-image-viewing";
import { ImageSource } from 'react-native-image-viewing/dist/@types';
import { useVideoPlayer, VideoView } from 'expo-video';
import TargetAccountChatTakePhoto from './targetAccountChatTakePhoto';
import TargetAccountChatSerectTag from './targetAccountChatFunctionTags';
import TargetAccountChatModalInputText from './targetAccountChatModalInputText';

interface MapProps {
    wsSend: (data: string) => void;
    ws: WebSocket;
    targetAccount: { accountName: string; accountID: string } | null;
    selfAccount: { accountName: string; accountID: string } | null;
}

const Map: React.FC<MapProps> = ({ wsSend, ws, targetAccount, selfAccount }) => {
    const { t } = useTranslation();
    const { storePendingMessage, compressAudio, removeFromPendingMessageIfSent } = commonFunctions();
    const [textInputMode, setTextInputMode] = useState('general');
    const [textInputHeight, setTextInputHeight] = useState(0);
    const [textInputWidth, setTextInputWidth] = useState(70);
    const [messages, setMessages] = useState<Message[]>([]);
    let loadHistoryMessages = useRef<boolean>(true);
    let loadHistoryMessagesDone = useRef<boolean>(false);
    const [tempInputMessage, setTempInputMessage] = useState<string>('');
    const scrollViewRef = useRef<ScrollView>(null);
    const [permissionResponse] = Audio.usePermissions();
    const [recording, setRecording] = useState<Audio.Recording | undefined>(undefined);
    const [recordingURI, setRecordingURI] = useState('');
    const [takePhoto, setTakePhoto] = useState(false);
    const [seePhotoInFullScreen, setSeePhotoInFullScreen] = useState<ImageSource[]>([]);
    const [playVideo, setPlayVideo] = useState(false);
    let videoURI = useRef("");
    let videoPlayerSource = useVideoPlayer(videoURI.current, player => { player.loop = true; player.play(); });
    
    if(loadHistoryMessages.current){
        console.log('loading history messages');
        fetch('https://90912xli63.execute-api.ap-south-1.amazonaws.com/loadData', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "action" : "communication",
                "data": {
                    "action": "loadHistoryMessages",
                    "data": {
                        "from_account_id": selfAccount?.accountID,
                        "to_account_id": targetAccount?.accountID
                    }
                }
            })
        })
        .then(response => response.json())
        .then(async eInJson => {
            loadHistoryMessagesDone.current = true;
            let unread_message_ids_timestamp = [];
            for(let i=0; i<eInJson.result.length; i++){
                const messageItem = Object(eInJson.result[i].message).M
                const generalMessagegeneralContentItem = Object(messageItem).generalContent;
                const audioMessagegeneralContentItem = Object(messageItem).audioContent;
                const imageMessagegeneralContentItem = Object(messageItem).imageContent;
                const videoMessagegeneralContentItem = Object(messageItem).videoContent;
                let tempmessage : MessageContent = { generalContent: '', audioContent: '', imageContent: '', videoContent: '' }
                if(Object(generalMessagegeneralContentItem).S.length > 0){
                    tempmessage = {
                        generalContent: Object(generalMessagegeneralContentItem).S,
                        audioContent: '',
                        imageContent: '',
                        videoContent: ''
                    }
                }
                if(Object(audioMessagegeneralContentItem).M != undefined){
                    const audioContentMap = Object(audioMessagegeneralContentItem).M;
                    const audioContentFileName = Object(audioContentMap).fileName;
                    const audioContentInBase64 = Object(audioContentMap).audioInBase64;
                    const audioContentType = Object(audioContentMap).type;
                    tempmessage = {
                        generalContent: '',
                        audioContent: {
                            fileName: Object(audioContentFileName).S,
                            audioInBase64: Object(audioContentInBase64).S,
                            type: Object(audioContentType).S
                        },
                        imageContent: '',
                        videoContent: ''
                    }
                }
                if(Object(imageMessagegeneralContentItem).M != undefined){
                    const imageContentMap = Object(imageMessagegeneralContentItem).M;
                    const imageContentFileName = Object(imageContentMap).fileName;
                    const imageContentCompressedInBase64 = Object(imageContentMap).photoCompressedInBase64;
                    const imageContentType = Object(imageContentMap).type;
                    tempmessage = {
                        generalContent: '',
                        audioContent: '',
                        imageContent: {
                            fileName: Object(imageContentFileName).S,
                            photoOriginalInBase64: '',
                            photoCompressedInBase64: Object(imageContentCompressedInBase64).S,
                            type: Object(imageContentType).S
                        },
                        videoContent: ''
                    }
                }
                if(Object(videoMessagegeneralContentItem).M != undefined){
                    const videoContentMap = Object(videoMessagegeneralContentItem).M;
                    const videoContentFileName = Object(videoContentMap).fileName;
                    const videoContentThumbnailInBase64 = Object(videoContentMap).thumbnailInBase64;
                    const videoContentType = Object(videoContentMap).type;
                    tempmessage = {
                        generalContent: '',
                        audioContent: '',
                        imageContent: '',
                        videoContent: {
                            fileName: Object(videoContentFileName).S,
                            videoOriginalInBase64: '',
                            thumbnailInBase64: Object(videoContentThumbnailInBase64).S,
                            type: Object(videoContentType).S
                        }
                    }
                }
                const tempMsg: Message = {
                    action: 'communication',
                    data: {
                        messageID: Object(eInJson.result[i].messageID).S,
                        from_account_id: Object(eInJson.result[i].from_account_id).S,
                        from_account_name: Object(eInJson.result[i].from_account_name).S,
                        to_account_id: Object(eInJson.result[i].to_account_id).S,
                        to_account_name: Object(eInJson.result[i].to_account_name).S,
                        message: tempmessage,
                        msgtype: Object(eInJson.result[i].msgtype).S,
                        timestamp: parseInt(Object(eInJson.result[i].timestamp).N),
                        read: Object(eInJson.result[i].read).BOOL,
                        sent: parseInt(Object(eInJson.result[i].sent).N)
                    }
                }
                setMessages(prevMessages => [ ...prevMessages, tempMsg ]);
                if(Object(eInJson.result[i].read).BOOL == false && Object(eInJson.result[i].to_account_id).S == selfAccount?.accountID){
                    unread_message_ids_timestamp.push({
                        messageID: Object(eInJson.result[i].messageID).S,
                        timestamp: parseInt(Object(eInJson.result[i].timestamp).N)
                    });
                }
            }
            if(unread_message_ids_timestamp.length > 0){
                wsSend(
                    JSON.stringify({
                        "action" : "communication",
                        "data": {
                            "message_ids_timestamps": unread_message_ids_timestamp,
                            "from_account_id": selfAccount?.accountID,
                            "to_account_id": targetAccount?.accountID,
                            "command": "readAll"
                        }
                    })
                )
            }
            setMessages(prevMessages => [...prevMessages].sort((a, b) => a.data.timestamp - b.data.timestamp));
            setTimeout(() => { scrollViewRef.current?.scrollToEnd({ animated: true }); }, 300);
        })
        .catch((error) => {
            console.error('loadHobbiesLibrary - Error:', error);
        });

        loadHistoryMessages.current = false
    } 

    const audioRecording = async (isRecording: boolean) => {
        if (!permissionResponse || permissionResponse.status !== 'granted') {
            Audio.requestPermissionsAsync();
        }else{
            if(isRecording){
                if (recording) { await recording.stopAndUnloadAsync(); }
                await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
                if (recording) {
                    const uri = recording.getURI();
                    if (uri) {
                        setRecordingURI(await compressAudio(uri));
                        playRecording(uri);
                    }
                }
                setRecording(undefined);
            } else{
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });
                const { recording } = await Audio.Recording.createAsync( Audio.RecordingOptionsPresets.HIGH_QUALITY);
                setRecording(recording);
            }
        }
    }

    const playRecording = async (recordingURI: string) => {
        Audio.Sound.createAsync({ uri: recordingURI }).then(({ sound }) => {
            if (sound) { sound.playAsync(); }
        });
    }

    const stopplayRecording = async (recordingURI: string) => {
        Audio.Sound.createAsync({ uri: recordingURI }).then(({ sound }) => {
            if (sound) { sound.stopAsync(); }
        });
    }

    const deleteRecording = async () => {
        if (recording) {
            await recording.stopAndUnloadAsync();
        }
        try{
            await FileSystem.deleteAsync(recordingURI);
        } finally {
            setRecordingURI('');
            setRecording(undefined);
        }
    }

    const downloadVideoAndPlay = async (filename: string) => {
        fetch('https://90912xli63.execute-api.ap-south-1.amazonaws.com/loadData', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "action" : "communication",
                "data": {
                    "action": "loadVideo",
                    "data": {
                        "filename": filename
                    }
                }
            })
        })
        .then(response => response.json())
        .then(async data => {
            if (data.statusCode === 200) {
                const videoFileUri = FileSystem.documentDirectory + filename;
                await FileSystem.writeAsStringAsync(videoFileUri, data.content, { encoding: FileSystem.EncodingType.Base64 });
                videoURI.current = videoFileUri;
                setPlayVideo(true);
            }
        })
        .catch((error) => {
            console.error('downloadAudioAndPlay - Error:', error);
        });
    }

    const stopVideoRecording = async () => {
        videoPlayerSource.pause();
        videoURI.current = "";
        setPlayVideo(false)
    };

    const downloadAudioAndPlay = async (filename: string) => {
        fetch('https://90912xli63.execute-api.ap-south-1.amazonaws.com/loadData', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "action" : "communication",
                "data": {
                    "action": "loadAudio",
                    "data": {
                        "filename": filename
                    }
                }
            })
        })
        .then(response => response.json())
        .then(async data => {
            if (data.statusCode === 200) {
                const fileUri = FileSystem.documentDirectory + filename;
                try{
                    const base64Response = await fetch(`data:audio/*;base64,${data.content}`);
                    const blob = await base64Response.blob();
                    await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + filename, data.content, { encoding: FileSystem.EncodingType.Base64 });
                    const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
                    if (sound) { await sound.playAsync(); }
                } finally {
                    await FileSystem.deleteAsync(fileUri);
                }
            }
        })
        .catch((error) => {
            console.error('downloadAudioAndPlay - Error:', error);
        });
    }

    const downloadImage = async (filename: string) => {
        fetch('https://90912xli63.execute-api.ap-south-1.amazonaws.com/loadData', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "action" : "communication",
                "data": {
                    "action": "loadImage",
                    "data": {
                        "filename": filename
                    }
                }
            })
        })
        .then(response => response.json())
        .then(async data => {
            if (data.statusCode === 200) {
                let tempSeePhotoInFullScreen = seePhotoInFullScreen;
                tempSeePhotoInFullScreen.push({ uri: "data:image/*;base64," + data.content.split('base64')[1] });
                setSeePhotoInFullScreen(tempSeePhotoInFullScreen);
            }
        })
        .catch((error) => {
            console.error('downloadAudioAndPlay - Error:');
        });
    }

    const sendMsg = async (msg: Message) => {
        if(loadHistoryMessagesDone.current){
            wsSend( JSON.stringify(msg) )
        }
        else{
            storePendingMessage(msg);
        }
    }

    const sendAudioMsg = async () => {
        stopplayRecording(recordingURI);
        // Get the file detail from the recordingURI
        let recordingDetails = await FileSystem.getInfoAsync(recordingURI);
        let recordingFileName = recordingDetails.uri.split('/').pop();
        let recordingFileType = recordingFileName?.split('.').pop();    
        // Create the JSON payload
        const tempMsgId = uuid.v4();
        const base64File = await FileSystem.readAsStringAsync(recordingURI, { encoding: FileSystem.EncodingType.Base64 });
        const tempMsg: Message = {
            action : 'sendAudio',
            data: {
                messageID: tempMsgId,
                from_account_id: selfAccount?.accountID || '',
                from_account_name: selfAccount?.accountName || '',
                to_account_id: targetAccount?.accountID || '',
                to_account_name: targetAccount?.accountName || '',
                msgtype: 'audio',
                timestamp: Date.now(),
                message: {
                    generalContent: '',
                    audioContent: { 
                        fileName: tempMsgId + "_" + recordingFileName,
                        audioInBase64: base64File,
                        type: ('audio/' + recordingFileType) || ''
                    },
                    imageContent: '',
                    videoContent: ''
                },
                read: false,
                sent: 0
            }
        }
        setMsg(tempMsg).then(async () => {
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
                        if(messages[i].data.messageID == tempMsg.data.messageID){
                            messages[i].data.sent = -1;
                            break;
                        }
                    }
                    setMessages(messages);
                }
            });
        });
        deleteRecording();
    }

    const setMsg = async (tempSendMsg: Message) => {
        setTempInputMessage('');
        setTextInputWidth(70);
        setMessages(prevMessages => [ ...prevMessages, tempSendMsg ]);
        setTimeout(() => { scrollViewRef.current?.scrollToEnd({ animated: true }); }, 300);
    }

    ws.onmessage = async e => {
        // a message was received
        let eInJson = JSON.parse(e.data);
        if (eInJson.messageID) {
            if(eInJson.from_account_id == selfAccount?.accountID){
                for(let i=0; i<messages.length; i++){
                    if(messages[i].data.messageID == eInJson.messageID){
                        messages[i].data.sent = 1;
                        removeFromPendingMessageIfSent(eInJson.messageID);
                        break;
                    }
                }
                setMessages(messages);
            }
            if(eInJson.from_account_id != selfAccount?.accountID && eInJson.from_account_id == targetAccount?.accountID){
                const tempMsg: Message = {
                    action: 'communication',
                    data: {
                        messageID: eInJson.messageID,
                        from_account_id: eInJson.from_account_id,
                        from_account_name: eInJson.from_account_name,
                        to_account_id: eInJson.to_account_id,
                        to_account_name: eInJson.to_account_name,
                        message: {
                            generalContent: eInJson.message.generalContent,
                            audioContent: eInJson.message.audioContent,
                            imageContent: eInJson.message.imageContent,
                            videoContent: eInJson.message.videoContent
                        },
                        msgtype: eInJson.msgtype,
                        timestamp: parseInt(eInJson.timestamp),
                        read: eInJson.read,
                        sent: 1
                    }
                }
                setMessages(prevMessages => [ ...prevMessages, tempMsg ]);
                setMessages(prevMessages => [...prevMessages].sort((a, b) => a.data.timestamp - b.data.timestamp));
                wsSend(
                    JSON.stringify({
                        "action" : "communication",
                        "data": {
                            "message_id": eInJson.messageID,
                            "from_account_id": selfAccount?.accountID,
                            "to_account_id": targetAccount?.accountID,
                            "timestamp": parseInt(eInJson.timestamp),
                            "command": "read"
                        }
                    })
                )
            }
            setTimeout(() => { scrollViewRef.current?.scrollToEnd({ animated: true }); }, 300);
        }
    }

    return (
        <>
        {seePhotoInFullScreen.length>0 &&
        <ImageView images={ seePhotoInFullScreen } imageIndex={0} visible={true} onRequestClose={() => setSeePhotoInFullScreen([])}/>
        }
        {playVideo &&
        <View style={styles.cameraContainer}>
            <Icon name='close' onPress={stopVideoRecording} />
            <VideoView player={videoPlayerSource} style={styles.videoView}>
            </VideoView>
        </View>
        }
        <KeyboardAvoidingView
            style={styles.container}
            keyboardVerticalOffset={10}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView ref={scrollViewRef}>
                        {messages && messages.map((msg, index) => (
                            <View key={msg.data.messageID } style={ msg.data.from_account_id !== selfAccount?.accountID ? styles.messageContainerForTargetAccount : styles.messageContainerForSelfAccount }>
                                <Text style={styles.messageTimestamp}>{new Date(msg.data.timestamp).toLocaleString()}</Text>
                                {msg.data.msgtype == 'general' && 
                                <Text style={styles.messageText}>{msg.data.message.generalContent}</Text>
                                }
                                {msg.data.msgtype == 'photo' &&  msg.data.message.imageContent  &&
                                <TouchableOpacity onPress={() => { msg.data.message.imageContent && downloadImage(msg.data.message.imageContent.fileName) }}>
                                    <Image source={{ uri: msg.data.message.imageContent.photoCompressedInBase64 }} style={{ width: 50, height: 50 }}/>
                                </TouchableOpacity>
                                }
                                {msg.data.msgtype == 'audio' &&  msg.data.message.audioContent  &&
                                <TouchableOpacity style={[styles.playrecordingButton]} onPress={() => msg.data.message.audioContent && downloadAudioAndPlay(msg.data.message.audioContent.fileName)}>
                                    <Icon name='audiotrack'/>
                                </TouchableOpacity>
                                }
                                {msg.data.msgtype == 'video' && msg.data.message.videoContent  &&
                                <TouchableOpacity style={[styles.playrecordingButton]} onPress={() => msg.data.message.videoContent && downloadVideoAndPlay(msg.data.message.videoContent.fileName)}>
                                    <Image source={{ uri: msg.data.message.videoContent.thumbnailInBase64 }} style={{ width: 50, height: 50 }}/>
                                </TouchableOpacity>
                                }
                                {msg.data.from_account_id === selfAccount?.accountID && msg.data.sent==1 &&
                                    <Text style={styles.messageSendStatus}>{t('sent')}</Text>
                                }
                                {msg.data.from_account_id === selfAccount?.accountID && msg.data.sent==0 &&
                                    <Text style={styles.messageSendStatus}>{t('sending')}</Text>
                                }
                                {msg.data.from_account_id === selfAccount?.accountID && msg.data.sent==-1 &&
                                    <Text style={styles.messageSendStatus}>{t('sendFail')}</Text>
                                }
                            </View>
                        ))}
                    </ScrollView>
                </TouchableWithoutFeedback>
                <View style={styles.inputViewContainer}>
                    {tempInputMessage.startsWith('@') &&
                    <ScrollView style={styles.functionTagScrollViewContainer}>
                        <TargetAccountChatSerectTag setTextInputMode={setTextInputMode}/>
                    </ScrollView>
                    }
                    {recording ? 
                    <Text></Text> : 
                    recordingURI.length > 0 ?
                    <TouchableOpacity style={[styles.playrecordingButton]} onPress={() => playRecording(recordingURI)}>
                        <Icon name='play-arrow'/>
                    </TouchableOpacity> :
                    <TargetAccountChatModalInputText tempInputMessage={tempInputMessage} setTempInputMessage={setTempInputMessage} setTextInputHeight={setTextInputHeight} setTextInputWidth={setTextInputWidth} textInputHeight={textInputHeight} textInputWidth={textInputWidth} scrollViewRef={scrollViewRef} />
                    }

                    {recordingURI.length > 0 && 
                    <TouchableOpacity style={[styles.button]} onPress={deleteRecording}>
                        <Icon name='delete'/>
                    </TouchableOpacity>
                    }

                    {recordingURI.length == 0 &&
                    <TouchableOpacity style={[styles.button]} onPress={() => audioRecording(!!recording)}>
                    {recording ? 
                        <Icon name='mic-none'/> : 
                        <Icon name='mic'/>
                    }
                    </TouchableOpacity>
                    }

                    {!recording && recordingURI.length == 0 &&
                    <TouchableOpacity style={[styles.button]} onPress={() => {Keyboard.dismiss(); setTakePhoto(true);}}>
                        <Icon name='camera-alt'/>
                    </TouchableOpacity>
                    }
                    

                    { !recording && recordingURI.length > 0 &&
                    <TouchableOpacity style={[styles.button]} onPress={sendAudioMsg}>
                        <Icon name='send'/>
                    </TouchableOpacity> 
                    }
                    { !recording && recordingURI.length == 0  && tempInputMessage.length > 0 &&
                    <TouchableOpacity style={[styles.button]} onPress=
                        {() => {
                            if(selfAccount?.accountID && selfAccount?.accountName && targetAccount?.accountID && targetAccount?.accountName){
                                let tempSendMsg : Message = {
                                    "action" : "communication",
                                    "data": {
                                        "messageID": uuid.v4(),
                                        "from_account_id": selfAccount?.accountID,
                                        "from_account_name": selfAccount?.accountName,
                                        "to_account_id": targetAccount?.accountID,
                                        "to_account_name": targetAccount?.accountName,
                                        "msgtype": "general",
                                        "timestamp": Date.now(),
                                        "read": false,
                                        "sent": 0,
                                        "message": {
                                            generalContent: tempInputMessage,
                                            audioContent: '',
                                            imageContent: '',
                                            videoContent: ''
                                        },
                                    }
                                }
                                setMsg(tempSendMsg).then(() => sendMsg(tempSendMsg));
                            }
                        }}
                    >
                        <Icon name='send'/>
                    </TouchableOpacity>
                    }
                </View>
            </View>
        </KeyboardAvoidingView>
        {takePhoto && 
            <TargetAccountChatTakePhoto 
                setMsg={setMsg}
                targetAccount={targetAccount} 
                selfAccount={selfAccount} 
                setTakePhoto={setTakePhoto}
                messages={messages}
            />
        }
        </>
    );
};

export default Map;

const styles = StyleSheet.create({
    cameraContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.81)',
        position: 'absolute',
        zIndex: 4,
        width: 320,
        height: '65%',
        borderRadius: 30,
        top: '8%',
        alignSelf: 'center',
    },
    functionTagScrollViewContainer: {
        zIndex: 5,
        left: 5,
        bottom: 50,
        width: '25%',
        position: 'absolute',
    },
    inputViewContainer: {
        flexDirection: 'row', 
        justifyContent: 'center', 
        paddingVertical: 10
    },
    videoView: {
        width: 320,
        height: '90%',
        alignSelf: 'center',
    },
    photoInFullScreen: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        position: 'absolute',
        zIndex: 4,
        width: 320,
        height: '65%',
        borderRadius: 30,
        top: '8%',
        alignSelf: 'center',
    },
    container: {
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
    input: {
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'rgb(204, 204, 204)',
        borderRadius: 10,
        backgroundColor: 'rgb(255, 255, 255)',
        marginRight: 10,
        fontSize: 15,
        textAlign: 'left',
    },
    playrecordingButton: {
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'rgb(204, 204, 204)',
        borderRadius: 10,
        backgroundColor: 'rgb(255, 255, 255)',
        marginRight: 10,
        fontSize: 15,
        textAlign: 'left',
        width: '60%',
    },
    button: {
        width: 30,        
        borderWidth: 1,
        borderColor: 'rgb(204, 204, 204)',
        borderRadius: 50,
        backgroundColor: 'rgb(255, 109, 109)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 4,
    },
    buttonText: {
        color: 'rgb(0, 0, 0)',
        fontFamily: 'Math-Italic'
    },
    messageContainerForTargetAccount: {
        padding: 10,
        marginVertical: 5,
        backgroundColor: 'rgb(255, 154, 143)',
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    messageContainerForSelfAccount: {
        padding: 10,
        marginVertical: 5,
        backgroundColor: 'rgb(255, 207, 143)',
        borderRadius: 10,
        alignSelf: 'flex-end',
    },
    messageTimestamp: {
        fontSize: 10,
        color: 'rgb(121, 121, 121)',
        marginBottom: 5,
    },
    messageSendStatus: {
        fontSize: 10,
        color: 'rgb(121, 121, 121)',
        textAlign: 'right',
    },
    messageText: {
        fontSize: 16,
        color: 'rgb(51, 51, 51)',
    },
});
