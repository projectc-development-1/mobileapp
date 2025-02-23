import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

interface MapProps {
    setTextInputMode: React.Dispatch<React.SetStateAction<string>>;   
}

const Map: React.FC<MapProps> = ({ setTextInputMode }) => {
    const { t } = useTranslation();
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => setTextInputMode('')} style={[styles.functionItemContainer, {backgroundColor: 'rgba(255, 173, 237, 0.88)'}]}>
                <Text style={styles.functionItemName}>{t("chatFunctionTagSerect")}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTextInputMode('')} style={[styles.functionItemContainer, {backgroundColor: 'rgba(129, 183, 255, 0.88)'}]}>
                <Text style={styles.functionItemName}>{t("chatFunctionTagChoices")}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTextInputMode('')} style={[styles.functionItemContainer, {backgroundColor: 'rgba(255, 115, 115, 0.88)'}]}>
                <Text style={styles.functionItemName}>{t("chatFunctionTagBetYou")}</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Map;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        width: '100%',
        height: '100%',
        borderRadius: 5,
    },
    functionItemContainer: {
        alignItems: 'center',
        borderRadius: 5,
        width: '100%',
        borderBlockColor: 'black',
        borderWidth: 1,
        marginVertical: 2,
    },
    functionItemName: {
        fontSize: 15,
        paddingVertical : 4,
    }
});
