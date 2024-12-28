Clone git project
https://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@github.com/projectc-development-1/mobileapp.git

############################################################################################################################
Tutorial
https://docs.expo.dev/get-started/start-developing/

Run the expo development server
npx expo start   (generate QR code)


Run the app in IOS simulator
npx expo run:ios  (run local simulator)


Build the app
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

############################################################################################################################
Cocoapods
1. use brew install cocoapods
2. brew link cocoapods



