import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";


const browserLanguage = navigator.language.split('-')[0];

const storedLanguage = browserLanguage || "en";

i18n
    .use(HttpApi)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        supportedLngs: ["en", "fr"],
        fallbackLng: "en",
        detection: {
            order: ["localStorage", "cookie", "navigator"],
            caches: ["localStorage", "cookie"],
        },
        backend: {
            loadPath: "/i18n/locales/{{lng}}/{{ns}}.json",
        },
        ns: ["navbar", "footer", "hotel"],
        defaultNS: "hotel",
    });


i18n.changeLanguage(storedLanguage);

export default i18n;
