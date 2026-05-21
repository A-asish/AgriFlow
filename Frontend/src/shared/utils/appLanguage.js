/** Current UI language code for API requests (matches LanguageContext). */
export function getAppLanguage() {
    const saved = localStorage.getItem('agriflow-language');
    return saved === 'np' ? 'np' : 'en';
}

export function getDateLocale(language) {
    return language === 'np' ? 'ne-NP' : 'en-US';
}
