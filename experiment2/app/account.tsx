import { View, Image, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import React from 'react';

interface MapProps {
    selfAccount: { accountName: string; accountID: string } | null;
}

const Map: React.FC<MapProps> = ({ selfAccount }) => {

    return (
        <View style={styles.container}>
            <Link href="/takePhotoForProfile" >
                <Image style={styles.icon} source={require('../assets/images/notesIcon50X50.png')} />
            </Link>
        </View>
    )
}

export default Map;

const styles = StyleSheet.create({
    container: {    
        zIndex: 2,
    },
    icon: {
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
        color: 'black',
    }
});
