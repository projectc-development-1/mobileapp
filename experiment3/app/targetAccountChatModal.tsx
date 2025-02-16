import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableWithoutFeedback, View, Keyboard, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ScrollView, Image, Alert } from 'react-native';
import uuid from 'react-native-uuid';
import { TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from 'react-native-elements';
import commonFunctions from '@/scripts/commonFunctions';
import TargetAccountChatTakePhoto from './targetAccountChatTakePhoto';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import ImageView from "react-native-image-viewing";
import { ImageSource } from 'react-native-image-viewing/dist/@types';
import { useVideoPlayer, VideoPlayer, VideoView } from 'expo-video';

interface MapProps {
    wsSend: (data: string) => void;
    ws: WebSocket;
    targetAccount: { accountName: string; accountID: string } | null;
    selfAccount: { accountName: string; accountID: string } | null;
}

interface Message {
    messageID: string;
    from_account_id: string;
    from_account_name: string;
    to_account_id: string;
    to_account_name: string;
    message: string;
    msgtype: string;
    timestamp: number;
    read: boolean;
    sent: number;
}

const Map: React.FC<MapProps> = ({ wsSend, ws, targetAccount, selfAccount }) => {
    const { t } = useTranslation();
    const { storePendingMessage, compressAudio } = commonFunctions();
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
                setMessages(prevMessages => [
                    ...prevMessages,
                    {
                        messageID: Object(eInJson.result[i].messageID).S,
                        from_account_id: Object(eInJson.result[i].from_account_id).S,
                        from_account_name: Object(eInJson.result[i].from_account_name).S,
                        to_account_id: Object(eInJson.result[i].to_account_id).S,
                        to_account_name: Object(eInJson.result[i].to_account_name).S,
                        message: Object(eInJson.result[i].message).S,
                        msgtype: Object(eInJson.result[i].msgtype).S,
                        timestamp: parseInt(Object(eInJson.result[i].timestamp).N),
                        read: Object(eInJson.result[i].read).BOOL,
                        sent: parseInt(Object(eInJson.result[i].sent).N),
                    }
                ]);
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
            setMessages(prevMessages => [...prevMessages].sort((a, b) => a.timestamp - b.timestamp));
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
                await FileSystem.writeAsStringAsync(videoFileUri, data.content.split('base64')[1], { encoding: FileSystem.EncodingType.Base64 });
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

    const sendMsg = async (msg: {}) => {
        let tempSendMsg = msg;
        if(loadHistoryMessagesDone.current){
            wsSend( JSON.stringify(tempSendMsg) )
        }
        else{
            storePendingMessage(tempSendMsg);
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
        const tempMsg = {
            action : 'sendAudio',
            data: {
                message: tempMsgId+"_"+recordingFileName,
                message_id: tempMsgId,
                from_account_id: selfAccount?.accountID,
                from_account_name: selfAccount?.accountName,
                to_account_id: targetAccount?.accountID,
                to_account_name: targetAccount?.accountName,
                msgtype: 'audio',
                timestamp: Date.now().toString()
            }
        }
        setMsg(tempMsg).then(async () => {
            // Read the file and convert it to base64
            const base64File = await FileSystem.readAsStringAsync(recordingURI, { encoding: FileSystem.EncodingType.Base64 });
            const messageContent: any = {
                name: recordingFileName,
                type: 'audio/' + recordingFileType,
                base64: base64File
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
                    setMessages(messages);
                }
            });
        });
        deleteRecording();
    }

    const setMsg = async (tempSendMsg: {}) => {
        setTempInputMessage('');
        setTextInputWidth(70);
        setMessages(prevMessages => [
            ...prevMessages,
            {
                messageID: tempSendMsg.data.message_id || '',
                from_account_id: tempSendMsg.data.from_account_id || '',
                from_account_name: tempSendMsg.data.from_account_name || '',
                to_account_id: tempSendMsg.data.to_account_id || '',
                to_account_name: tempSendMsg.data.to_account_name || '',
                message: tempSendMsg.data.message || '',
                msgtype: tempSendMsg.data.msgtype || '',
                timestamp: parseInt(tempSendMsg.data.timestamp),
                read: true,
                sent: 0
            }
        ]);
        setTimeout(() => { scrollViewRef.current?.scrollToEnd({ animated: true }); }, 300);
    }

    ws.onmessage = async e => {
        // a message was received
        let eInJson = JSON.parse(e.data);
        if (eInJson.messageID) {
            if(eInJson.from_account_id == selfAccount?.accountID){
                for(let i=0; i<messages.length; i++){
                    if(messages[i].messageID == eInJson.messageID){
                        messages[i].sent = 1;
                        break;
                    }
                }
                setMessages(messages);
            }
            if(eInJson.from_account_id != selfAccount?.accountID && eInJson.from_account_id == targetAccount?.accountID){
                setMessages(prevMessages => [
                    ...prevMessages,
                    {
                        messageID: eInJson.messageID,
                        from_account_id: eInJson.from_account_id,
                        from_account_name: eInJson.from_account_name,
                        to_account_id: eInJson.to_account_id,
                        to_account_name: eInJson.to_account_name,
                        message: eInJson.message,
                        msgtype: eInJson.msgtype,
                        timestamp: parseInt(eInJson.timestamp),
                        read: eInJson.read,
                        sent: 1
                    }
                ]);
                setMessages(prevMessages => [...prevMessages].sort((a, b) => a.timestamp - b.timestamp));
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
                            <View key={msg.messageID } style={ msg.from_account_id !== selfAccount?.accountID ? styles.messageContainerForTargetAccount : styles.messageContainerForSelfAccount }>
                                <Text style={styles.messageTimestamp}>{new Date(msg.timestamp).toLocaleString()}</Text>
                                {msg.msgtype == 'text' && 
                                <Text style={styles.messageText}>{msg.message}</Text>
                                }
                                {msg.msgtype == 'photo' && 
                                <TouchableOpacity onPress={() => downloadImage(msg.message.split("@#@")[1])}>
                                    <Image source={{ uri: msg.message.split("@#@")[0] }} style={{ width: 50, height: 50 }}/>
                                </TouchableOpacity>
                                }
                                {msg.msgtype == 'audio' && 
                                <TouchableOpacity style={[styles.playrecordingButton]} onPress={() => downloadAudioAndPlay(msg.message)}>
                                    <Icon name='audiotrack'/>
                                </TouchableOpacity>
                                }
                                {msg.msgtype == 'video' && 
                                <TouchableOpacity style={[styles.playrecordingButton]} onPress={() => downloadVideoAndPlay(msg.message)}>
                                    <Icon name='movie'/>
                                </TouchableOpacity>
                                }
                                {msg.from_account_id === selfAccount?.accountID && msg.sent==1 &&
                                    <Text style={styles.messageSendStatus}>{t('sent')}</Text>
                                }
                                {msg.from_account_id === selfAccount?.accountID && msg.sent==0 &&
                                    <Text style={styles.messageSendStatus}>{t('sending')}</Text>
                                }
                                {msg.from_account_id === selfAccount?.accountID && msg.sent==-1 &&
                                    <Text style={styles.messageSendStatus}>{t('sendFail')}</Text>
                                }
                            </View>
                        ))}
                    </ScrollView>
                </TouchableWithoutFeedback>
                <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 10 }}>
                    {recording ? 
                    <Text></Text> : 
                    recordingURI.length > 0 ?
                    <TouchableOpacity style={[styles.playrecordingButton]} onPress={() => playRecording(recordingURI)}>
                        <Icon name='play-arrow'/>
                    </TouchableOpacity> :
                    <TextInput
                        style={[styles.input, { height: Math.max(30, textInputHeight), width: `${textInputWidth}%` }]}
                        value={tempInputMessage}
                        onChangeText={setTempInputMessage}
                        multiline 
                        onContentSizeChange={(event) => {
                            if(event.nativeEvent.contentSize.height < 66){
                                setTextInputHeight(event.nativeEvent.contentSize.height);
                            }
                        }}
                        onChange={(event) => {
                            if(event.nativeEvent.text.length > 0){
                                setTextInputWidth(60);
                            }else{
                                setTextInputWidth(70);
                            }
                        }}
                    />
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
                            let tempSendMsg = {
                                "action" : "communication",
                                "data": {
                                    "message_id": uuid.v4(),
                                    "from_account_id": selfAccount?.accountID,
                                    "from_account_name": selfAccount?.accountName,
                                    "to_account_id": targetAccount?.accountID,
                                    "to_account_name": targetAccount?.accountName,
                                    "message": tempInputMessage,
                                    "msgtype": "text",
                                    "timestamp": Date.now().toString()
                                }
                            }
                            setMsg(tempSendMsg).then(() => sendMsg(tempSendMsg));
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
