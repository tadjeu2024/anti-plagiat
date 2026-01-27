require('dotenv').config();
const serpApi = require('./services/serpApi');

const test = async () => {
    try {
        console.log('🧪 Test SERP API...');
        const texte = "L'intelligence artificielle est un ensemble de techniques";
        const resultats = await serpApi.searchSimilarContent(texte);
        console.log('✅ Résultats trouvés:', resultats.length);
        console.log('📋 Premier résultat:', resultats[0]);
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
};

test();