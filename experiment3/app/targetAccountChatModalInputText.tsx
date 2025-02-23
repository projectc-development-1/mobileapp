import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';

interface MapProps {
    tempInputMessage: string;
    setTempInputMessage: React.Dispatch<React.SetStateAction<string>>;
    setTextInputHeight: React.Dispatch<React.SetStateAction<number>>;
    setTextInputWidth: React.Dispatch<React.SetStateAction<number>>;
    textInputHeight: number;
    textInputWidth: number;
    scrollViewRef: React.RefObject<ScrollView>;
    
}

const Map: React.FC<MapProps> = ({ 
    tempInputMessage, setTempInputMessage,
    setTextInputHeight, setTextInputWidth,
    textInputHeight, textInputWidth, scrollViewRef
}) => {
    const { t } = useTranslation();

    return (
        <TextInput
            placeholder={t("try@")}
            placeholderTextColor='rgb(144, 144, 144)'
            style={[styles.input, { height: Math.max(30, textInputHeight), width: `${textInputWidth}%` }]}
            value={tempInputMessage}
            onFocus={() => {setTimeout(() => { scrollViewRef.current?.scrollToEnd({ animated: true }); }, 300);}}
            onChangeText={setTempInputMessage}
            multiline 
            onContentSizeChange={(event) => {
                if(event.nativeEvent.contentSize.height < 66){
                    setTextInputHeight(event.nativeEvent.contentSize.height);
                }
            }}
            onChange={(event) => {
                if(event.nativeEvent.text.length > 0){
                    setTextInputWidth(60);
                }else{
                    setTextInputWidth(70);
                }
            }}
        >
        </TextInput>
    );
};

export default Map;

const styles = StyleSheet.create({
    input: {
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'rgb(204, 204, 204)',
        borderRadius: 10,
        backgroundColor: 'rgb(255, 255, 255)',
        marginRight: 10,
        fontSize: 15,
        textAlign: 'left',
    },
});
