// 1. IMPORTER LE MODULE POSTGRESQL
const { Pool } = require('pg');

// 2. CRÉER UNE CONNEXION (POOL)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Nécessaire pour Supabase
    }
});

// 3. FONCTION POUR TESTER LA CONNEXION
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Connexion à PostgreSQL réussie !');
        client.release();
    } catch (error) {
        console.error('❌ Erreur de connexion à PostgreSQL:', error.message);
    }
};

// 4. FONCTION POUR CRÉER LES TABLES (si elles n'existent pas)
const createTables = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS plagiat_results (
            id SERIAL PRIMARY KEY,
            url VARCHAR(500) NOT NULL,
            texte_extrait TEXT,
            taux_plagiat DECIMAL(5,2),
            taux_similarite DECIMAL(5,2),
            sources_trouvees JSONB,
            phrases_copiees JSONB,
            date_analyse TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(createTableQuery);
        console.log('✅ Table "plagiat_results" créée ou déjà existante');
    } catch (error) {
        console.error('❌ Erreur lors de la création de la table:', error.message);
    }
};

// 5. INITIALISER LA BASE DE DONNÉES
const initDatabase = async () => {
    await testConnection();
    await createTables();
};

// 6. EXPORTER
module.exports = {
    pool,
    initDatabase
};
