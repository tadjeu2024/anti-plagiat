const linkExtractor = require('../services/linkExtractor');
const serpApi = require('../services/serpApi');
const pythonRunner = require('../services/pythonRunner');

const checkLink = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL manquante' });
        }
        console.log(`📝 Analyse du lien: ${url}`);
        const texteExtrait = await linkExtractor.extractText(url);
        const resultatsGoogle = await serpApi.searchSimilarContent(texteExtrait);
        const analyseResult = await pythonRunner.detectPlagiat(texteExtrait, resultatsGoogle);

        res.json({
            success: true,
            data: {
                url: url,
                taux_plagiat: analyseResult.taux_plagiat,
                taux_similarite: analyseResult.taux_similarite,
                sources_trouvees: analyseResult.sources,
                phrases_copiees: analyseResult.phrases_copiees
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

module.exports = { checkLink };
