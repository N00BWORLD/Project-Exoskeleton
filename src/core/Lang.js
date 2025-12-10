import { TextData } from '../data/TextData.js';

export const LangSystem = {
    current: 'ko', // Default Language

    // Get text by key
    get: function (key) {
        const text = TextData[this.current] ? TextData[this.current][key] : null;
        // Return text or error placeholder
        return text ? text : `MISSING[${key}]`;
    },

    // Change language
    setLanguage: function (langCode) {
        if (TextData[langCode]) {
            this.current = langCode;
            console.log(`Language changed to: ${langCode}`);
        } else {
            console.warn(`Language code '${langCode}' not found.`);
        }
    }
};
