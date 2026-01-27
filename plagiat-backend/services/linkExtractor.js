const axios = require('axios');
const cheerio = require('cheerio');

// Fonction pour extraire le texte d'une URL
const extractText = async (url) => {
    try {
        // 1. Faire une requête HTTP pour récupérer le HTML
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000 // 10 secondes max
        });

        // 2. Parser le HTML avec cheerio
        const $ = cheerio.load(response.data);

        // 3. Enlever les scripts et styles
        $('script').remove();
        $('style').remove();
        $('nav').remove();
        $('footer').remove();

        // 4. Extraire le texte (priorité au contenu principal)
        let texte = '';
        
        // Essayer d'extraire le contenu principal (article, main, etc.)
        // 4. Extraire le texte (priorité au contenu principal)
// Pour Wikipedia spécifiquement
            if (url.includes('wikipedia.org')) {
                // Extraire seulement les paragraphes du contenu principal
                $('#mw-content-text p').each(function() {
                    const para = $(this).text().trim();
                    if (para.length > 50) { // Ignorer les petits paragraphes
                        texte += para + ' ';
                    }
                });
            } else if ($('article').length > 0) {
                texte = $('article').text();
            } else if ($('main').length > 0) {
                texte = $('main').text();
            } else {
                texte = $('body').text();
            }

        // 5. Nettoyer le texte (enlever espaces multiples, sauts de ligne excessifs)
        texte = texte
            .replace(/\s+/g, ' ') // Remplacer espaces multiples par un seul
            .trim(); // Enlever espaces au début/fin

        // 6. Limiter à 5000 caractères (pour l'API SERP et Python)
        if (texte.length > 5000) {
            texte = texte.substring(0, 5000);
        }

        console.log(`✅ Texte extrait (${texte.length} caractères)`);
        return texte;

    } catch (error) {
        console.error('❌ Erreur extraction:', error.message);
        throw new Error(`Impossible d'extraire le texte de ${url}: ${error.message}`);
    }
};

module.exports = {
    extractText
};