import React, { useRef, useState } from 'react';
import { Map as ImmutableMap } from 'immutable';
import { StyleSheet, TouchableWithoutFeedback, View, Keyboard, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';

interface MapProps {
    ws: WebSocket;
    targetAccount: { accountName: string; accountID: string } | null;
    selfAccount: { accountName: string; accountID: string } | null;
}

interface Message {
    messageID: string | undefined;
    from_account_id: string | undefined;
    from_account_name: string | undefined;
    to_account_id: string | undefined;
    to_account_name: string | undefined;
    message: string | undefined;
    timestamp: string | undefined;
}

const Map: React.FC<MapProps> = ({ ws, targetAccount, selfAccount }) => {
    const { t } = useTranslation();
    const [textInputHeight, setTextInputHeight] = useState(0);
    const [textInputWidth, setTextInputWidth] = useState(90);
    const [messages, setMessages] = useState<Message[]>([]);
    let loadHistoryMessages = useRef<boolean>(true);
    let [sendButtonDisabled, setSendButtonDisabled] = useState<boolean>(true);
    const [tempInputMessage, setTempInputMessage] = useState<string>('');
    const scrollViewRef = useRef<ScrollView>(null);
    
    if(ws.readyState < 1){
        ws.onopen = async () => {
            if(loadHistoryMessages.current){
                if(ws.readyState == 1){
                    setSendButtonDisabled(true);
                    console.log('loading history messages');
                    ws.send(
                        JSON.stringify({
                            "action" : "communication",
                            "data": {
                                "from_account_id": selfAccount?.accountID,
                                "from_account_name": selfAccount?.accountName,
                                "to_account_id": targetAccount?.accountID,
                                "to_account_name": targetAccount?.accountName,
                                "command": "loadHistoryMessages",
                                "timestamp": Date.now().toString()
                            }
                        })
                    );
                    loadHistoryMessages.current = false
                }
            }    
        }
    }

    const sendMsg = () => {
        if(ws.readyState == ws.OPEN){
            console.log('sending message');
            ws.send(
                JSON.stringify({
                    "action" : "communication",
                    "data": {
                        "from_account_id": selfAccount?.accountID,
                        "from_account_name": selfAccount?.accountName,
                        "to_account_id": targetAccount?.accountID,
                        "to_account_name": targetAccount?.accountName,
                        "message": tempInputMessage,
                        "timestamp": Date.now().toString()
                    }
                })
            );
            setTempInputMessage('');
            setTextInputWidth(90);
        }else{
            console.log('Connection not open');
        }
    };

    ws.onmessage = e => {
        // a message was received
        let eInJson = JSON.parse(e.data);
        if(eInJson.command == 'loadHistoryMessages'){
            console.log('received history messages');
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
                        timestamp: Object(eInJson.result[i].timestamp).S
                    }
                ]);
            }
            setSendButtonDisabled(false);
        }
        else if (eInJson.messageID) {
            setMessages(prevMessages => [
                ...prevMessages,
                {
                    messageID: eInJson.messageID,
                    from_account_id: eInJson.from_account_id,
                    from_account_name: eInJson.from_account_name,
                    to_account_id: eInJson.to_account_id,
                    to_account_name: eInJson.to_account_name,
                    message: eInJson.message,
                    timestamp: eInJson.timestamp
                }
            ]);
        }
        scrollViewRef.current?.scrollToEnd({ animated: true });
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
            keyboardVerticalOffset={50}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
                <View>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <ScrollView ref={scrollViewRef}>
                            {messages && messages.map((msg, index) => (
                                <View key={msg.messageID} 
                                    style={[
                                        styles.messageContainer, 
                                        { alignSelf: msg.from_account_id !== selfAccount?.accountID ? 'flex-start' : 'flex-end' }
                                    ]}
                                >
                                    <Text style={styles.messageText}>{msg.message}</Text>
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
                                    setTextInputWidth(73);
                                }else{
                                    setTextInputWidth(90);
                                }
                            }}
                        />
                        {tempInputMessage.length > 0 && (
                            <TouchableOpacity style={[styles.button, { opacity: sendButtonDisabled ? 0.5 : 1 }]} onPress={sendMsg} disabled={sendButtonDisabled}>
                                <Text style={styles.buttonText}>{t('S')}</Text>
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
        zIndex: 0,
        width: '70%',
        height: '90%',
        borderRadius: 30,
        top: '3%',
        left: '25%',
    },
    input: {
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        backgroundColor: '#fff',
        marginRight: 10,
        fontSize: 15,
        textAlign: 'left',
        fontFamily: 'Math-Italic',
    },
    button: {
        width: '20%',
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 25,
        backgroundColor: '#e74c3c',
        alignItems: 'center',
        opacity: 1,
    },
    buttonText: {
        color: '#000',
        fontFamily: 'Math-Italic'
    },
    messageContainer: {
        padding: 10,
        marginVertical: 5,
        backgroundColor: '#f1f1f1',
        borderRadius: 10,
    },
    messageText: {
        fontSize: 16,
        color: '#333',
    },
});
