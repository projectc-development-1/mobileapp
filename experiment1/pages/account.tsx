import React from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet, Text, Image } from "react-native";

interface MapProps {
    selfAccount: { accountName: string; accountID: string } | null;
}

const Map: React.FC<MapProps> = ({ selfAccount }) => {
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <Image style={styles.icon} source={require('../assets/notesIcon50X50.png')} />
            <View style={styles.textContainer}>
                <Text style={styles.text}>{ selfAccount?.accountName } ({ selfAccount?.accountID })</Text>
            </View>
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
        top: '50%',
    },
    textContainer: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.77)',
        width: '75%',
        left: '20%',
        padding: 10,
    },
    text: {
        fontSize: 16,
        color: 'black',
    },
});