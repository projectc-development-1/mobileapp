require('dotenv').config();

module.exports = {
    expo: {
      name: "experiment1",
      slug: "experiment1",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/icon.png",
      userInterfaceStyle: "light",
      newArchEnabled: true,
      splash: {
        image: "./assets/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
      },
      ios: {
        supportsTablet: true,
        bundleIdentifier: "com.development.1.experiment1"
      },
      android: {
        adaptiveIcon: {
          foregroundImage: "./assets/adaptive-icon.png",
          backgroundColor: "#ffffff"
        },
        config: {
          googleMaps: {
            apiKey: process.env.GOOGLE_MAPS_API_KEY
          }
        },
        permissions: [
          "ACCESS_COARSE_LOCATION",
          "ACCESS_FINE_LOCATION"
        ],
        package: "com.development.x1.experiment1"
      },
      web: {
        favicon: "./assets/favicon.png"
      },
      plugins: [
        [
          "expo-build-properties",
          {
            android: {
              extra: {
                "com.google.android.maps.v2.API_KEY": process.env.GOOGLE_MAPS_API_KEY
              }
            }
          }
        ]
      ]
    }
  };