const { spawn } = require('child_process');
const path = require('path');

const detectPlagiat = (texteExtrait, resultatsGoogle) => {
    return new Promise((resolve, reject) => {
        const pythonScript = path.join(__dirname, '../python/detect_plagiat.py');
        
        // DEBUG
        console.log('📊 DEBUG - Nombre de résultats:', resultatsGoogle.length);
        if (resultatsGoogle.length > 0) {
            console.log('📊 DEBUG - Premier résultat:', JSON.stringify(resultatsGoogle[0], null, 2));
        }
        
        const args = [
            pythonScript,
            texteExtrait,
            JSON.stringify(resultatsGoogle)
        ];
        
        const pythonProcess = spawn('python3', args);
        
        let dataString = '';
        let errorString = '';
        
        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });
        
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error('❌ Erreur Python stderr:', errorString);
                reject(new Error(`Python script failed: ${errorString}`));
                return;
            }
            
            console.log('📊 DEBUG - Réponse Python:', dataString.substring(0, 200));
            
            try {
                const resultat = JSON.parse(dataString);
                console.log('📊 DEBUG - Taux plagiat:', resultat.taux_plagiat);
                console.log('📊 DEBUG - Nombre de sources:', resultat.sources?.length || 0);
                console.log('✅ Analyse Python terminée');
                resolve(resultat);
            } catch (error) {
                console.error('❌ Erreur parsing JSON:', error.message);
                console.error('❌ Données reçues:', dataString);
                reject(new Error(`Failed to parse Python output: ${error.message}`));
            }
        });
        
        pythonProcess.on('error', (error) => {
            console.error('❌ Erreur lancement Python:', error);
            reject(new Error(`Failed to start Python: ${error.message}`));
        });
    });
};

module.exports = {
    detectPlagiat
};