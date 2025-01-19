import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableWithoutFeedback, View, Keyboard, TouchableOpacity, Text, useWindowDimensions } from 'react-native';
import { SceneMap, TabView } from 'react-native-tab-view';


interface MapProps {
    selfAccountName: string;
    targetAccountName: string;
}


const FirstRoute = () => (
    <View style={{ flex: 1, backgroundColor: '#ff4081' }} />
);

const SecondRoute = () => (
    <View style={{ flex: 1, backgroundColor: '#673ab7' }} />
);
const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
});
const routes = [
    { key: 'first', title: 'First' },
    { key: 'second', title: 'Second' },
];

const Map: React.FC<MapProps> = ({ selfAccountName, targetAccountName }) => {
    const { t } = useTranslation();
    const layout = useWindowDimensions();
    const [index, setIndex] = React.useState(0);
    return (
        /*
        <View style={styles.container}>
            <View style={styles.view}>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>{t("Chat")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>{t("Information")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>{t("Notes")}</Text>
                </TouchableOpacity>
            </View>
        </View>
        */
        <View style={styles.container}>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
            />
        </View>
    );
};

export default Map;


const styles = StyleSheet.create({
    container: {
        borderRadius: 30,
        position: 'absolute',
        top: '10%',
        left: '10%',
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        width: '80%',
        height: '80%',
    },
    view: {
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        width: '100%'
    },
    button: {
        width: '33%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        backgroundColor: '#e74c3c',
        alignItems: 'center',
        marginBottom: 0,
    },
    buttonText: {
        color: '#000',
        fontSize: 13,
        fontFamily: 'Math-Italic'
    },
});
