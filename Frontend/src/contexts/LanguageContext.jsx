import { createContext, useContext, useState } from 'react';
import { translations } from '@/shared/utils/translations';
const LanguageContext = createContext({
    language: 'en',
    setLanguage: () => { },
    t: (key) => key,
});
export const useLanguage = () => useContext(LanguageContext);
export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        const saved = localStorage.getItem('agriflow-language');
        return (saved === 'np' ? 'np' : 'en');
    });
    const handleSetLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('agriflow-language', lang);
    };
    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language];
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            }
            else {
                return key;
            }
        }
        return typeof value === 'string' ? value : key;
    };
    return (<LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>);
}
