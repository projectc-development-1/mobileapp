import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEn from "./assets/locales/en/translation.json";
import translationZh from "./assets/locales/zh/translation.json";
import * as SecureStore from 'expo-secure-store';

const resources = {
  "en": { translation: translationEn },
  "zh": { translation: translationZh },
};

const initI18n = async () => {
  let savedLanguage = await SecureStore.getItemAsync('language');
  i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage || "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });
};

initI18n();

export default i18n;