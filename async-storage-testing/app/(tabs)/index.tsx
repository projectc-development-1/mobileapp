import { StyleSheet, View, Text, Button, TextInput } from 'react-native';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

export default function App() {
  const [storedValue, setStoredValue] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    retrieveData();
  }, []);

  const storeData = async (value: string) => {
    try {
      await SecureStore.setItemAsync('storage_Key', value);
      console.log('Data saved');
      setStoredValue(value);
    } catch (e) {
      console.error('Failed to save data', e);
    }
  };

  const retrieveData = async () => {
    try {
      const value = await SecureStore.getItemAsync('storage_Key');
      if (value !== null) {
        setStoredValue(value);
        console.log('Data retrieved:', value);
      }
    } catch (e) {
      console.error('Failed to retrieve data', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Stored Value: {storedValue}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter some data"
        value={inputValue}
        onChangeText={setInputValue}
      />
      <Button title="Save Data" onPress={() => storeData(inputValue)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ecf0f1',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '80%',
  },
  paragraph: {
    fontSize: 18,
  },
});