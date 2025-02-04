import { View, StyleSheet, TouchableOpacity, Image, Text, TextInput, ScrollView, TouchableWithoutFeedback, Keyboard, Button } from 'react-native';
import React, { useRef, useState } from 'react';
import TakePhotoForProfile from './takePhotoForProfile';
import commonFunctions from '@/scripts/commonFunctions';
import { useTranslation } from 'react-i18next';
import { getFontFamily } from '@/i18n';
import { Icon } from 'react-native-elements';

interface MapProps {
    selfAccount: { accountName: string; accountID: string } | null;
}

const Map: React.FC<MapProps> = ({ selfAccount }) => {
    const { t } = useTranslation();
    const fontFamily = getFontFamily();
    const { getDataFromSecureStore, setDataToSecureStore } = commonFunctions();
    let firstRender = useRef(true);
    let [editProfile, setEditProfile] = useState(false);
    let [iconBody, setIconBody] = useState('');
    let [introduction, setIntroduction] = useState('');
    let [hobbies, setHobbies] = useState(new Set());
    let [hobbiesLibrary, setHobbiesLibrary] = useState<any[][]>([]);
    let [needToSave, setNeedToSave] = useState(false);

    function saveAction(){
        if(needToSave){
            console.log('Updating profile information');
            fetch('https://zd7pvkao33.execute-api.ap-south-1.amazonaws.com/updateUserProfile', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "action" : "communication",
                    "data": {
                        "action": "updateProfileInformation",
                        "data": {
                            "accountID": selfAccount?.accountID,
                            "introduction": introduction,
                            "hobbies": Array.from(hobbies)
                        }
                    }
                })
            })
            .then(response => response.text())
            .then(async data => {
                console.log(data);
                if(data=='"profile updated"'){
                    setDataToSecureStore('introduction', introduction);
                    setDataToSecureStore('hobbies', JSON.stringify(Array.from(hobbies)));
                    setEditProfile(false);
                }
            })
            .catch((error) => {
                console.error('saveAction - Error:', error);
            });
        }else{
            setEditProfile(false);
        }
    }

    function backAction(){
        firstRender.current = true;
        setIntroduction('');
        setHobbies(new Set());
        setEditProfile(false);
    }

    function updateHobbiesTags(action: string, hobby: any) {
        let tempSet = new Set(hobbies);
        if(action == 'add') {
            let alreadyExist=false;
            Array.from(hobbies).forEach((h) => {
                if(h.id == hobby.id){ alreadyExist = true; }
            });
            if(!alreadyExist){ tempSet.add(hobby); }
        }
        if(action == 'delete') { 
            tempSet.delete(hobby);
        }
        setHobbies(tempSet);
        setNeedToSave(true);
    }

    async function loadHobbiesLibrary() {   
        let deviceLanguage = await getDataFromSecureStore('language');
        fetch('https://90912xli63.execute-api.ap-south-1.amazonaws.com/loadData', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "action" : "communication",
                "data": {
                    "action": "loadHobbiesLibrary"
                }
            })
        })
        .then(response => response.json())
        .then(async data => {
            if (data.statusCode === 200) {
                let tempSumup = [];
                for (let i = 0; i < data.hobbiesLibrary.length; i+=3) {
                    let tempArray = [];
                    switch (deviceLanguage) {
                        case 'en':
                            data.hobbiesLibrary[i].name = data.hobbiesLibrary[i].en;
                            data.hobbiesLibrary[i+1].name = data.hobbiesLibrary[i+1].en;
                            data.hobbiesLibrary[i+2].name = data.hobbiesLibrary[i+2].en;
                            break;
                        case 'zh':
                            data.hobbiesLibrary[i].name = data.hobbiesLibrary[i].zh;
                            data.hobbiesLibrary[i+1].name = data.hobbiesLibrary[i+1].zh;
                            data.hobbiesLibrary[i+2].name = data.hobbiesLibrary[i+2].zh;
                            break;
                    }
                    tempArray.push(data.hobbiesLibrary[i]);
                    tempArray.push(data.hobbiesLibrary[i+1]);
                    tempArray.push(data.hobbiesLibrary[i+2]);
                    tempSumup.push(tempArray);
                }
                setHobbiesLibrary(tempSumup);
            }
        })
        .catch((error) => {
            console.error('loadHobbiesLibrary - Error:', error);
        });
    }
    
    async function loadProfilePhoto() {
        setTimeout(async () => {
            const photoInBase64 = await getDataFromSecureStore('profilePhoto');
            setIconBody(photoInBase64 ?? '');
        }, 500);
    }

    async function loadProfileInformation() {
        const savedintroduction = await getDataFromSecureStore('introduction');
        setIntroduction(savedintroduction ?? '');

        const savedhobbies = await getDataFromSecureStore('hobbies');
        for (let hobby of JSON.parse(savedhobbies ?? '[]')) {
            hobbies.add(hobby);
        }
    }

    if(firstRender.current){
        loadProfilePhoto();
        loadProfileInformation();
        loadHobbiesLibrary();
        firstRender.current = false;
    }

    return (
        <>
            <View style={styles.containerInNormal}>
                <Text style={[styles.accountName, { fontFamily }]}>{selfAccount?.accountName}</Text>
                <TouchableOpacity onPress={() => setEditProfile(true)}>
                    {iconBody.length > 0 ?
                        <Image source={{ uri: iconBody }} style={styles.icon}/> :
                        <Image source={require('../assets/images/noProfilePhoto.jpg')} style={styles.icon}/>
                    }
                </TouchableOpacity>
            </View>
            {editProfile && (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView style={styles.profileContainer}>
                        <TouchableOpacity style={styles.closeButton} onPress={saveAction}>
                            <Icon name='check' />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.backButton} onPress={backAction}>
                            <Icon name='arrow-back' />
                        </TouchableOpacity>
                        <View style={{alignItems: 'center', marginTop: 50, height: 320}}>
                            <TakePhotoForProfile 
                                selfAccount={selfAccount} 
                                iconBody={iconBody}
                                setEditProfile={setEditProfile} 
                                loadProfilePhoto={loadProfilePhoto}
                            />
                        </View>
                        <View style={{alignItems: 'center'}}>
                            <ScrollView horizontal={true} style={styles.introductionContainer} >
                                <TextInput
                                    style={[styles.introduction, { fontFamily }]}
                                    value={introduction}
                                    onChangeText={setIntroduction}
                                    onBlur={() => setNeedToSave(true)}
                                    placeholder={t('introduction_placeholder')}
                                    multiline
                                />
                            </ScrollView>
                            <View style={styles.hobbiesTagsContainer}>
                                <Text>
                                {Array.from(hobbies).map((hobby, index) => (
                                    <TouchableOpacity key={index} onPress={() => updateHobbiesTags('delete', hobby) }>
                                        <Text>#{hobby.name}    </Text>
                                    </TouchableOpacity>
                                ))}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={loadHobbiesLibrary} style={{ justifyContent: 'center', marginBottom: 20}}>
                            <Icon name='refresh'/>
                        </TouchableOpacity>
                        {hobbiesLibrary.map((hobby, index) => (
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20}}>
                                <TouchableOpacity onPress={() => updateHobbiesTags('add', hobby[0]) }>
                                    <Image source={{ uri: iconBody }} style={styles.hobbiesIcon} />
                                    <Text style={[styles.hobbies, { fontFamily }]}>{hobby[0].name}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => updateHobbiesTags('add', hobby[1]) }>
                                    <Image source={{ uri: iconBody }} style={styles.hobbiesIcon} />
                                    <Text style={[styles.hobbies, { fontFamily }]}>{hobby[1].name}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => updateHobbiesTags('add', hobby[2]) }>
                                    <Image source={{ uri: iconBody }} style={styles.hobbiesIcon} />
                                    <Text style={[styles.hobbies, { fontFamily }]}>{hobby[2].name}</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </TouchableWithoutFeedback>
            )}
        </>
    )
}

export default Map;

const styles = StyleSheet.create({
    containerInNormal: {    
        zIndex: 2,
        left: '5%',
        top: '5%',
    },
    profileContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        position: 'absolute',
        zIndex: 2,
        width: '100%',
        height: '100%',
    },
    icon: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    hobbiesIcon : {
        width: 100,
        height: 100,
        borderRadius: 25,
    },
    accountName: {
        alignItems: 'center',
        fontSize: 25,
        color: 'rgb(0, 0, 0)',
        marginTop: 10,
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 2,
    },
    backButton: {
        position: 'absolute',
        top: 150,
        left: 20,
        zIndex: 2,
    },
    hobbiesTagsContainer: {
        width: 300,
        marginBottom: 50,
    },
    introductionContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.71)',
        width: 300,
        height: 160,
        marginBottom: 50,
        borderRadius: 10,
    },
    introduction: {
        fontSize: 15,
        color: 'rgb(0, 0, 0)',
    },
    hobbiesContainer: {
        backgroundColor: 'rgb(255, 255, 255)',
        width: 300,
        height: 200,
        marginBottom: 60,
        borderRadius: 25,
    },
    hobbies: {
        fontSize: 15,
        textAlign: 'center',
        color: 'rgb(0, 0, 0)',
    },
});
