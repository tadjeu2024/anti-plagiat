const { pool } = require('../db/database');
const linkExtractor = require('../services/linkExtractor');
const serpApi = require('../services/serpApi');
const pythonRunner = require('../services/pythonRunner');

// Fonction principale pour vérifier un lien
const checkLink = async (req, res) => {
    try {
        // 1. Récupérer l'URL depuis la requête
        const { url } = req.body;

        // Vérification que l'URL est fournie
        if (!url) {
            return res.status(400).json({ 
                error: 'URL manquante' 
            });
        }

        console.log(`📝 Analyse du lien: ${url}`);

        // 2. Extraire le texte du lien
        console.log('🔍 Extraction du texte...');
        const texteExtrait = await linkExtractor.extractText(url);

        // 3. Rechercher sur Google des contenus similaires
        console.log('🌐 Recherche sur Google...');
        const resultatsGoogle = await serpApi.searchSimilarContent(texteExtrait);

        // 4. Analyser avec Python (détection de plagiat)
        console.log('🐍 Analyse avec Python...');
        const analyseResult = await pythonRunner.detectPlagiat(texteExtrait, resultatsGoogle);

        // 5. Sauvegarder dans la base de données
        console.log('💾 Sauvegarde dans PostgreSQL...');
        const insertQuery = `
            INSERT INTO plagiat_results 
            (url, texte_extrait, taux_plagiat, taux_similarite, sources_trouvees, phrases_copiees)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;

        const result = await pool.query(insertQuery, [
            url,
            texteExtrait,
            analyseResult.taux_plagiat,
            analyseResult.taux_similarite,
            JSON.stringify(analyseResult.sources),
            JSON.stringify(analyseResult.phrases_copiees)
        ]);

        // 6. Renvoyer le résultat au frontend
        console.log('✅ Analyse terminée !');
        res.json({
            success: true,
            data: {
                id: result.rows[0].id,
                url: url,
                taux_plagiat: analyseResult.taux_plagiat,
                taux_similarite: analyseResult.taux_similarite,
                sources_trouvees: analyseResult.sources,
                phrases_copiees: analyseResult.phrases_copiees,
                date_analyse: result.rows[0].date_analyse
            }
        });

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        res.status(500).json({ 
            error: 'Erreur lors de l\'analyse',
            details: error.message 
        });
    }
};

module.exports = {
    checkLink
};