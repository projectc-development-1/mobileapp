import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableWithoutFeedback, View, Keyboard, TouchableOpacity, Text, useWindowDimensions } from 'react-native';
import { SceneMap, TabView } from 'react-native-tab-view';
import TargetProfileModalChatTab from '@/pages/targetProfileModalChatTab';

interface MapProps {
    selfAccountName: string;
    targetAccountName: string;
}

const ChatRoute: React.FC<{ targetAccountName: string }> = ({ targetAccountName }) => (
    <TargetProfileModalChatTab targetAccountName={targetAccountName} />
);
const InformationRoute: React.FC<{ targetAccountName: string }> = ({ targetAccountName }) => (
    <View style={{ flex: 1, backgroundColor: '#673ab7' }} />
);
const NotesRoute: React.FC<{ targetAccountName: string }> = ({ targetAccountName }) => (
    <View style={{ flex: 1, backgroundColor: '#673ab7' }} />
);

const Map: React.FC<MapProps> = ({ selfAccountName, targetAccountName }) => {
    const { t } = useTranslation();
    const layout = useWindowDimensions();
    const [index, setIndex] = React.useState(0);

    const routes = [
        { key: 'Chat', title: t('Chat') },
        { key: 'Information', title: t('Information') },
        { key: 'Notes', title: t('Notes') }
    ];

    const renderScene = SceneMap({
        Chat: () => <ChatRoute targetAccountName={targetAccountName} />,
        Information: () => <InformationRoute targetAccountName={targetAccountName} />,
        Notes: () => <NotesRoute targetAccountName={targetAccountName} />
    });

    return (
        <View style={styles.container}>
            <TabView
                style={styles.tabView}
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
        alignItems: 'center',
        width: '80%',
        height: '80%',
    },
    tabView: {
        borderRadius: 30,
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
