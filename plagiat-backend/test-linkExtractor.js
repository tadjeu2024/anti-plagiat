require('dotenv').config();
const linkExtractor = require('./services/linkExtractor');

const test = async () => {
    try {
        console.log('🧪 Test linkExtractor...');
        const texte = await linkExtractor.extractText('https://fr.wikipedia.org/wiki/Intelligence_artificielle');
        console.log('✅ Texte extrait:', texte.substring(0, 200) + '...');
        console.log('📏 Longueur:', texte.length, 'caractères');
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
};

test();