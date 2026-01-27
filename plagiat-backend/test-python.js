require('dotenv').config();
const pythonRunner = require('./services/pythonRunner');

const test = async () => {
    try {
        console.log('🧪 Test Python...');
        
        const texte = "L'intelligence artificielle est fascinante";
        const resultats = [
            {
                titre: "IA Wikipedia",
                url: "https://example.com",
                snippet: "L'intelligence artificielle est fascinante et révolutionnaire"
            }
        ];
        
        const analyse = await pythonRunner.detectPlagiat(texte, resultats);
        console.log('✅ Analyse terminée:', analyse);
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
};

test();