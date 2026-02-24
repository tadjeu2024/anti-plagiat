const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();


const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ 
        message: 'API Anti-Plagiat - Backend fonctionnel ✅',
        status: 'running'
    });
});

// ROUTES
const plagiatRoutes = require('./routes/plagiatRoutes');
app.use('/api', plagiatRoutes);

app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route non trouvée' 
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📡 API disponible sur http://localhost:${PORT}`);
});