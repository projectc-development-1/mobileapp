import React, { useRef } from 'react';
import { StyleSheet, View, ScrollView, Image, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getFontFamily } from '@/i18n';
import commonFunctions from '@/scripts/commonFunctions';

interface MapProps {
    targetAccount: { accountName: string; accountID: string; photoInBase64: string } | null;
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
}

const Map: React.FC<MapProps> = ({ targetAccount }) => {
    const { t } = useTranslation();
    const fontFamily = getFontFamily();
    const { getDataFromSecureStore, setDataToSecureStore } = commonFunctions();
    let firstRender = useRef(true);
    const [introduction, setIntroduction] = React.useState('Who are you?');
    const [hobbies, setHobbies] = React.useState('What are your hobbies?');

    async function loadProfileInformation() {
        let deviceLanguage = await getDataFromSecureStore('language');
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
            for (let i = 0; i < data.length; i++) {
                if(data[i].profileKey == 'introduction'){
                    setIntroduction(data[i].profileValue);
                } else if(data[i].profileKey == 'hobbies'){
                    setHobbies(data[i].profileValue);
                }
            }
        })
        .catch((error) => {
            console.error('loadProfileInformation - Error:', error);
        });
    }

    if(firstRender.current){
        loadProfileInformation();
        firstRender.current = false;
    }
    
    return (
        <View style={styles.container}>
            <View style={styles.profileContainer}>
                <ScrollView >
                    <View style={{alignItems: 'center', marginTop: 50, height: 150}}>
                        <Image source={{ uri: targetAccount?.photoInBase64 }} style={styles.icon}/> 
                    </View>
                    <View style={{alignItems: 'center'}}>
                        <View style={styles.introductionContainer}>
                            <Text style={[styles.introduction, { fontFamily }]}>
                                {introduction}
                            </Text>
                        </View>
                    </View>
                    <View style={{alignItems: 'center'}}>
                        <View style={styles.hobbiesContainer}>
                            <Text style={[styles.hobbies, { fontFamily }]}>
                                {hobbies}
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

export default Map;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        position: 'absolute',
        zIndex: 3,
        width: '80%',
        height: '65%',
        borderRadius: 30,
        top: '8%',
        left: '10%',
    },
    profileContainer: {
        position: 'absolute',
        zIndex: 4,
        width: '100%',
        height: '100%',
    },
    icon: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    introductionContainer: {
        backgroundColor: 'rgb(255, 255, 255)',
        width: '70%',
        height: 200,
        marginBottom: 50,
        borderRadius: 25,
    },
    introduction: {
        fontSize: 20,
        color: 'rgb(0, 0, 0)',
    },
    hobbiesContainer: {
        backgroundColor: 'rgb(255, 255, 255)',
        width: '70%',
        height: 200,
        marginBottom: 50,
        borderRadius: 25,
    },
    hobbies: {
        fontSize: 20,
        color: 'rgb(0, 0, 0)',
    },
    whatAreYouLookingForContainer: {
        backgroundColor: 'rgb(255, 255, 255)',
        width: '70%',
        height: 200,
        marginBottom: 50,
        borderRadius: 25,
    },
    whatAreYouLookingFor: {
        fontSize: 20,
        color: 'rgb(0, 0, 0)',
    },
});
