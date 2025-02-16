import { getFontFamily } from "@/i18n";
import commonFunctions from "@/scripts/commonFunctions";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View, Image, TouchableOpacity, Text, StyleSheet } from "react-native"
import { Icon } from "react-native-elements"
import TargetAccountChatModal from "./targetAccountChatModal";
import TargetAccountProfileModal from "./targetAccountProfileModal";

interface MapProps {
    wsSend: (data: string) => void;
    ws: WebSocket;
    targetAccount: { accountName: string; accountID: string } | null;
    selfAccount: { accountName: string; accountID: string } | null;
    openTargetAccountModalType: number;
    setOpenTargetAccountModalType: React.Dispatch<React.SetStateAction<number>>;
}

const Map: React.FC<MapProps> = ({ wsSend, ws, targetAccount, selfAccount, openTargetAccountModalType, setOpenTargetAccountModalType }) => {
    const { t } = useTranslation();
    const fontFamily = getFontFamily();
    let firstRender = useRef(true);
    let [photoInBase64, setPhotoInBase64] = useState<string | null>(null);
    let [introduction, setIntroduction] = useState<string | null>(null);
    let [hobbies, setHobbies] = useState<Set<{ name: JSON }> | null>(null);

    async function loadProfileInformationAndPhoto() {
        fetch('https://90912xli63.execute-api.ap-south-1.amazonaws.com/loadData', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "action" : "communication",
                "data": {
                    "action": "loadTargetAccountProfile",
                    "data": {
                        "accountID": targetAccount?.accountID
                    }
                }
            })
        })
        .then(response => response.json())
        .then(async data => {
            setPhotoInBase64(data[0].photoInBase64);
            setIntroduction(data[0].introduction);
            setHobbies(data[0].hobbies);
        })
        .catch((error) => {
            console.error('loadProfilePhoto - Error:', error);
        });
    }

    if(firstRender.current){
        loadProfileInformationAndPhoto();
        firstRender.current = false;
    }

    return(
        <>
        <View style={styles.targetIconContainer}>
            {photoInBase64 ? 
            <Image source={{ uri: photoInBase64 }} style={styles.targetIcon}/> :
            <Image source={require('../assets/images/noProfilePhoto.jpg')} style={styles.targetIcon}/>
            }
            <ScrollView horizontal={true} style={styles.targetAccountNameContainer} >
                <Text style={[styles.targetAccountName, { fontFamily }]}>{targetAccount?.accountName}</Text>
            </ScrollView>
        </View>
        <View style={styles.toolListContainer}>
            <TouchableOpacity onPress={() => setOpenTargetAccountModalType(1) } style={{paddingHorizontal: 10}}>
                <Icon name='chat' />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setOpenTargetAccountModalType(2) } style={{paddingHorizontal: 10}}>
                <Icon name='info' />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('Button 3 pressed')} style={{paddingHorizontal: 10}}>
                <Icon name='notes' />
            </TouchableOpacity>
        </View>
        {openTargetAccountModalType==1 && (
            <TargetAccountChatModal 
                wsSend={wsSend}
                ws={ws} 
                targetAccount={targetAccount} 
                selfAccount={selfAccount}
            />
        )}
        {openTargetAccountModalType==2 && (
            <TargetAccountProfileModal 
                introduction={introduction}
                photoInBase64={photoInBase64}
                hobbies={hobbies}
            />
        )}
        </>
    )
}

export default Map;

const styles = StyleSheet.create({
    targetIconContainer: {
        position: 'absolute',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        alignSelf: 'center',
        top: '73%',
    },
    targetAccountNameContainer: {
        textAlign: 'center',
        width: 150,
        backgroundColor: 'rgba(0, 0, 0, 0)',
    },
    targetAccountName: {
        alignItems: 'center',
        fontSize: 20,
        color: 'rgb(0, 0, 0)',
        marginTop: 10,
        fontWeight: 'bold',
    },
    targetIcon: {
        width: 50,
        height: 50,
        borderRadius: 50,
    },
    toolListContainer: {
        position: 'absolute',
        width: 280,
        height: 45,
        alignSelf: 'center',
        top: '85%',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        padding: 10,
        borderRadius: 100,
        flexDirection: 'row', 
        justifyContent: 'space-around'
    },
});