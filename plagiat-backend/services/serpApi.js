const axios = require('axios');

const chunkText = (texte, tailleChunk = 100) => {
    const mots = texte.split(' ');
    const chunks = [];
    
    for (let i = 0; i < mots.length; i += tailleChunk) {
        chunks.push(mots.slice(i, i + tailleChunk).join(' '));
    }
    
    return chunks;
};

const searchWithSerper = async (query) => {
    try {
        const SERPER_API_KEY = process.env.SERPER_API_KEY;
        
        if (!SERPER_API_KEY) {
            console.error('❌ SERPER_API_KEY manquante dans .env');
            return [];
        }
        
        const response = await axios.post(
            'https://google.serper.dev/search',
            {
                q: query,
                num: 5
            },
            {
                headers: {
                    'X-API-KEY': SERPER_API_KEY,
                    'Content-Type': 'application/json'
                },
                timeout: 30000  // ⬅️ 30 secondes au lieu de 10
            }
        );
        
        const organic = response.data.organic || [];
        
        return organic.map(result => ({
            titre: result.title,
            url: result.link,
            snippet: result.snippet || ''
        }));
        
    } catch (error) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        console.error(`⚠️ Erreur Serper.dev (${status}): ${message}`);
        return [];
    }
};

const searchSimilarContent = async (texte) => {
    try {
        const chunks = chunkText(texte, 100);
        const recherches = chunks.slice(0, 3);
        
        const tousLesResultats = [];

        for (const chunk of recherches) {
            try {
                console.log(`🔍 Recherche Serper.dev: "${chunk.substring(0, 50)}..."`);
                
                const items = await searchWithSerper(chunk);
                
                items.forEach(item => {
                    tousLesResultats.push({
                        titre: item.titre,
                        url: item.url,
                        snippet: item.snippet,
                        position: tousLesResultats.length + 1
                    });
                });

                // ⬅️ Pause de 2 secondes au lieu de 500ms
                await new Promise(resolve => setTimeout(resolve, 2000));

            } catch (error) {
                console.error(`⚠️ Erreur recherche: ${error.message}`);
            }
        }

        console.log(`✅ ${tousLesResultats.length} résultats trouvés avec Serper.dev`);
        return tousLesResultats;

    } catch (error) {
        console.error('❌ Erreur recherche Serper:', error.message);
        return [];
    }
};

module.exports = {
    searchSimilarContent
};