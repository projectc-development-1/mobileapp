import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableWithoutFeedback, View, Keyboard, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import uuid from 'react-native-uuid';
import { TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from 'react-native-elements';
import commonFunctions from '@/scripts/commonFunctions';
import { get } from 'immutable';

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
    timestamp: number;
    read: boolean;
    sent: boolean;
}

const Map: React.FC<MapProps> = ({ wsSend, ws, targetAccount, selfAccount }) => {
    const { t } = useTranslation();
    const { getDataFromSecureStore, setDataToSecureStore, removeDataFromSecureStore } = commonFunctions();
    const [textInputHeight, setTextInputHeight] = useState(0);
    const [textInputWidth, setTextInputWidth] = useState(90);
    const [messages, setMessages] = useState<Message[]>([]);
    let loadHistoryMessages = useRef<boolean>(true);
    let loadHistoryMessagesDone = useRef<boolean>(false);
    const [tempInputMessage, setTempInputMessage] = useState<string>('');
    const scrollViewRef = useRef<ScrollView>(null);
    
    if(loadHistoryMessages.current){
        console.log('loading history messages');
        wsSend(
            JSON.stringify({
                "action" : "communication",
                "data": {
                    "from_account_id": selfAccount?.accountID,
                    "to_account_id": targetAccount?.accountID,
                    "command": "loadHistoryMessages",
                    "timestamp": Date.now().toString()
                }
            })
        )
        loadHistoryMessages.current = false
    } 

    const storePendingMessage = async (tempSendMsg: {}) => {
        let pendingMessage = await getDataFromSecureStore('pendingMessage');
        let temppendingMessage = [];
        if(pendingMessage){
            temppendingMessage = JSON.parse(pendingMessage);
            temppendingMessage.push(tempSendMsg);
        } else {
            temppendingMessage.push(tempSendMsg);
        }
        setDataToSecureStore('pendingMessage', JSON.stringify(temppendingMessage));
    }

    const sendMsg = async (msg: {}) => {
        let tempSendMsg = {};
        if(Object.keys(msg).length !== 0){
            tempSendMsg = msg
        } else{
            tempSendMsg = {
                "action" : "communication",
                "data": {
                    "message_id": uuid.v4(),
                    "from_account_id": selfAccount?.accountID,
                    "from_account_name": selfAccount?.accountName,
                    "to_account_id": targetAccount?.accountID,
                    "to_account_name": targetAccount?.accountName,
                    "message": tempInputMessage,
                    "timestamp": Date.now().toString()
                }
            }
        }
        
        if(loadHistoryMessagesDone.current){
            wsSend( JSON.stringify(tempSendMsg) )
        }
        else{
            storePendingMessage(tempSendMsg);
        }
        setTempInputMessage('');
        setTextInputWidth(90);
        setMessages(prevMessages => [
            ...prevMessages,
            {
                messageID: tempSendMsg.data.message_id || '',
                from_account_id: tempSendMsg.data.from_account_id || '',
                from_account_name: tempSendMsg.data.from_account_name || '',
                to_account_id: tempSendMsg.data.to_account_id || '',
                to_account_name: tempSendMsg.data.to_account_name || '',
                message: tempSendMsg.data.message || '',
                timestamp: parseInt(tempSendMsg.data.timestamp),
                read: true,
                sent: false
            }
        ]);
        scrollViewRef.current?.scrollToEnd({ animated: true });
    };

    ws.onmessage = async e => {
        // a message was received
        let eInJson = JSON.parse(e.data);
        if(eInJson.command == 'loadHistoryMessages'){
            console.log('received history messages');
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
                        timestamp: parseInt(Object(eInJson.result[i].timestamp).N),
                        read: Object(eInJson.result[i].read).BOOL,
                        sent: Object(eInJson.result[i].sent).BOOL,
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
        }
        else if (eInJson.messageID) {
            if(eInJson.from_account_id == selfAccount?.accountID){
                for(let i=0; i<messages.length; i++){
                    if(messages[i].messageID == eInJson.messageID){
                        messages[i].sent = true;
                        break;
                    }
                }
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
                        timestamp: parseInt(eInJson.timestamp),
                        read: eInJson.read,
                        sent: true
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
    };

    ws.onerror = e => {
    // an error occurred
    console.log('websocket error', (e as WebSocketErrorEvent).message);
    };

    ws.onclose = e => {
    // connection closed
    console.log(e.code, e.reason);
    };



    return (
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
                                <Text style={styles.messageText}>{msg.message}</Text>
                                {!msg.sent && <Text style={styles.messageSendStatus}>{t('sending')}</Text>}
                                {msg.sent && <Text style={styles.messageSendStatus}>{t('sent')}</Text>}
                            </View>
                        ))}
                    </ScrollView>
                </TouchableWithoutFeedback>
                <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 10 }}>
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
                                setTextInputWidth(75);
                            }else{
                                setTextInputWidth(90);
                            }
                        }}
                    />
                    {tempInputMessage.length > 0 && (
                        <TouchableOpacity style={[styles.button]} onPress={() => sendMsg({})}>
                            <Icon name='send'/>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

export default Map;

const styles = StyleSheet.create({
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
    button: {
        width: '15%',        
        borderWidth: 1,
        borderColor: 'rgb(204, 204, 204)',
        borderRadius: 50,
        backgroundColor: 'rgb(231, 76, 60)',
        alignItems: 'center',
        justifyContent: 'center',
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
