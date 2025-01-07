import { StyleSheet } from 'react-native';
import { useEffect } from 'react';
import Config from 'react-native-config';


export default function App() {

useEffect(() => {
    console.log('aaa:'+Config.API_URL); 
}, []);

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#ecf0f1',
    },
    paragraph: {
        fontSize: 18,
        textAlign: 'center',
        color: 'white',
    },
    map: {
        width: '100%',
        height: '100%',
    },
});
  