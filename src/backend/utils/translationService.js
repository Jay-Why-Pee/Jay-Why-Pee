const { Translate } = require('@google-cloud/translate').v2;
const axios = require('axios');

class TranslationService {
    constructor() {
        // Google Cloud Translation setup
        this.googleTranslate = process.env.GOOGLE_TRANSLATE_KEY ? 
            new Translate({ key: process.env.GOOGLE_TRANSLATE_KEY }) : null;
        
        // Papago setup
        this.papagoClientId = process.env.PAPAGO_CLIENT_ID;
        this.papagoClientSecret = process.env.PAPAGO_CLIENT_SECRET;
        
        // Translation cache
        this.cache = new Map();
    }

    async translate(text, source = 'en', target = 'ko') {
        if (!text) return '';
        
        // Check cache first
        const cacheKey = `${text}:${source}:${target}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            let translatedText;

            // Try Google Translate first
            if (this.googleTranslate) {
                try {
                    const [translation] = await this.googleTranslate.translate(text, target);
                    translatedText = translation;
                } catch (error) {
                    console.error('Google Translate error:', error);
                }
            }

            // Fallback to Papago if Google Translate fails or is not configured
            if (!translatedText && this.papagoClientId && this.papagoClientSecret) {
                try {
                    const response = await axios.post('https://openapi.naver.com/v1/papago/n2mt',
                        { source, target, text },
                        {
                            headers: {
                                'X-Naver-Client-Id': this.papagoClientId,
                                'X-Naver-Client-Secret': this.papagoClientSecret,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    translatedText = response.data.message.result.translatedText;
                } catch (error) {
                    console.error('Papago error:', error);
                }
            }

            // If both translation services fail, return original text
            if (!translatedText) {
                console.warn('Translation failed, returning original text');
                return text;
            }

            // Cache the result
            this.cache.set(cacheKey, translatedText);
            return translatedText;

        } catch (error) {
            console.error('Translation error:', error);
            return text;
        }
    }

    // Batch translate multiple texts
    async translateBatch(texts, source = 'en', target = 'ko') {
        const translations = await Promise.all(
            texts.map(text => this.translate(text, source, target))
        );
        return translations;
    }

    // Clear cache for memory management
    clearCache() {
        this.cache.clear();
    }
}

module.exports = new TranslationService();