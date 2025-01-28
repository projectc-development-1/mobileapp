import { View, Image, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import React, { useState } from 'react';

let [takeProfilePhoto, setTakeProfilePhoto] = useState(false);

interface MapProps {
    selfAccount: { accountName: string; accountID: string } | null;
}

const Map: React.FC<MapProps> = ({ selfAccount }) => {
    return (
        <View style={styles.container}>
            <Link style={styles.link} href="/takePhotoForProfile" >
                <Image source={require('../assets/images/notesIcon50X50.png')} />
            </Link>
        </View>
    )
}

export default Map;

const styles = StyleSheet.create({
    container: {    
        zIndex: 2,
        top: '80%',
        left: '38%',
    },
    link: {
        top: '100%',
        left: '5%',
    },
    textContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.77)',
        width: '75%',
        left: '20%',
        padding: 10,
    },
    text: {
        fontSize: 16,
        color: 'rgb(0, 0, 0)',
    }
});
