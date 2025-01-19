import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableWithoutFeedback, View, Keyboard, TouchableOpacity, Text, useWindowDimensions } from 'react-native';
import { SceneMap, TabView } from 'react-native-tab-view';
import TargetProfileModalChatTab from '@/pages/targetProfileModalChatTab';

interface MapProps {
    selfAccountName: string;
    targetAccountName: string;
    closeTargetProfileModal: () => void;
}

const LazyLoadingPlaceholder: React.FC = () => (
    <Text>Loading…</Text>
);

const ChatRoute: React.FC<{ targetAccountName: string }> = ({ targetAccountName }) => (
    <TargetProfileModalChatTab targetAccountName={targetAccountName} />
);
const InformationRoute: React.FC<{ targetAccountName: string }> = ({ targetAccountName }) => (
    <View style={{ flex: 1, backgroundColor: '#673ab7' }} />
);
const NotesRoute: React.FC<{ targetAccountName: string }> = ({ targetAccountName }) => (
    <View style={{ flex: 1, backgroundColor: '#673ab7' }} />
);

const Map: React.FC<MapProps> = ({ selfAccountName, targetAccountName, closeTargetProfileModal }) => {
    const { t } = useTranslation();
    const layout = useWindowDimensions();
    const [index, setIndex] = React.useState(0);

    const routes = [
        { key: 'Chat', title: t('Chat') },
        { key: 'Information', title: t('Information') },
        { key: 'Notes', title: t('Notes') }
    ];

    return (
        <View style={styles.container}>
            <TabView
                lazy
                style={styles.tabView}
                navigationState={{ index, routes }}
                renderLazyPlaceholder={LazyLoadingPlaceholder}
                renderScene={SceneMap({
                    Chat: () => <ChatRoute targetAccountName={targetAccountName} />,
                    Information: () => <InformationRoute targetAccountName={targetAccountName} />,
                    Notes: () => <NotesRoute targetAccountName={targetAccountName} />
                  })}
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
        top: '15%',
        left: '15%',
        alignItems: 'center',
        width: '70%',
        height: '70%',
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Set background color with transparency
    },
    tabView: {
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Set background color with transparency
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
