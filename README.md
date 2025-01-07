Clone git project
https://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@github.com/projectc-development-1/mobileapp.git

############################################################################################################################
Tutorial
https://docs.expo.dev/get-started/start-developing/

Run the expo development server
npx expo start   (generate QR code)


Run the app in IOS simulator
npx expo run:ios --device (run local simulator / ios device that you may need to run in Xcode)
npx expo run:android --device (run local simulator / ios device that you may need to run in Android Studio)


creates the android and ios directories for running your React code
npx expo prebuild


Clean project
npx expo prebuild --clean


Deploy the app
https://docs.expo.dev/build/setup/
eas build --platform ios

############################################################################################################################
BlueTooth example
https://expo.dev/blog/how-to-build-a-bluetooth-low-energy-powered-expo-app
https://github.com/friyiajr/BLEExpoBlog

BleManager() -- Your JavaScript code tried to access a native module that doesn't exist. 
1. npm install react-native-ble-manager
2. npm install react-native-ble-plx
2. npx react-native link react-native-ble-plx
3. Update Code: If you need to update your code to use the new module, replace any require('punycode') statements with  require('punycode/').



############################################################################################################################
Expo account
https://expo.dev/accounts/development.1
https://expo.dev/accounts/development.1/projects/bluetooth-testing

############################################################################################################################
Cocoapods
1. use brew install cocoapods
2. brew link cocoapods




#########################################################################################################################
necessary library
1. react-native-gifted-chat
2. react-native-maps
3. react-native-vector-icons
