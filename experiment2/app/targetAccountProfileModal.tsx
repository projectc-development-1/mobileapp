import React, { useRef, useState } from 'react';
import { StyleSheet, View, ScrollView, Image, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getFontFamily } from '@/i18n';
import commonFunctions from '@/scripts/commonFunctions';

interface MapProps {
    introduction: string | null;
    photoInBase64: string | null;
    hobbies: Set<{ name: JSON }> | null;
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

const Map: React.FC<MapProps> = ({ introduction, photoInBase64, hobbies }) => {
    const { t } = useTranslation();
    const fontFamily = getFontFamily();
    const { getDataFromSecureStore } = commonFunctions();
    let firstRender = useRef(true);
    let [translatedHobbies, setTranslatedHobbies] = useState(new Set());

    async function translateHobbies(hobbies: Set<{ name: JSON }>) {
        let deviceLanguage = await getDataFromSecureStore('language');
        Array.from(hobbies).map((h) => {
            switch (deviceLanguage) {
                case 'en':
                    h.name = h.en;
                    break;
                case 'zh':
                    h.name = h.zh;
                    break;
            }
        });
        setTranslatedHobbies(hobbies);
    }

    if(firstRender.current){
        
        if(hobbies != null){
            translateHobbies(hobbies);
            firstRender.current = false;
        }
    }
    
    return (
        <View style={styles.container}>
            <View style={styles.profileContainer}>
                <ScrollView >
                    <View style={{alignItems: 'center', marginTop: 50, height: 200}}>
                        {photoInBase64 && <Image source={{ uri: photoInBase64 }} style={styles.icon}/>}
                    </View>
                    <View style={{alignItems: 'center'}}>
                        <ScrollView style={styles.introductionContainer}>
                            <Text style={[styles.introduction, { fontFamily }]}>
                                {introduction}
                            </Text>
                        </ScrollView>
                    </View>
                    <View style={{alignItems: 'center'}}>
                        <View style={styles.hobbiesContainer}>
                            <Text>
                            {translatedHobbies && Array.from(translatedHobbies).map((h, index) => (
                                <Text>#{h.name}    </Text>
                            ))}
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
        alignSelf: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        position: 'absolute',
        zIndex: 3,
        width: 320,
        height: '65%',
        borderRadius: 30,
        top: '8%',
    },
    profileContainer: {
        position: 'absolute',
        zIndex: 4,
        width: '100%',
        height: '100%',
    },
    icon: {
        width: 150,
        height: 150,
        borderRadius: 75,
    },
    introductionContainer: {
        backgroundColor: 'rgb(255, 255, 255)',
        width: 280,
        height: 150,
        marginBottom: 50,
        borderRadius: 25,
    },
    introduction: {
        fontSize: 15,
        color: 'rgb(0, 0, 0)',
    },
    hobbiesContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0)',
        width: 280,
        marginBottom: 50,
    },
    hobbies: {
        fontSize: 20,
        color: 'rgb(0, 0, 0)',
    },
});
