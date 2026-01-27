import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faSpinner, faCheckCircle, faExclamationTriangle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../Styles/detectionLien.css';

function DetectionLien() {
    const [lien, setLien] = useState('');
    const [chargement, setChargement] = useState(false);
    const [resultat, setResultat] = useState(null);
    const [erreur, setErreur] = useState('');
    const [progression, setProgression] = useState(0);

    const detecterLien = async () => {
        setErreur('');
        setResultat(null);
        setProgression(0);

        if (!lien || lien.trim() === '') {
            setErreur('Veuillez entrer un lien valide');
            return;
        }

        try {
            new URL(lien);
        } catch {
            setErreur('Le lien entré n\'est pas valide. Exemple : https://example.com');
            return;
        }

        setChargement(true);

        // Animation de progression
        const interval = setInterval(() => {
            setProgression(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 10;
            });
        }, 1500);

        try {
            const response = await fetch('http://localhost:5000/api/check-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: lien })
            });

            const data = await response.json();
            clearInterval(interval);
            setProgression(100);

            if (data.success) {
                setTimeout(() => {
                    setResultat(data.data);
                    setChargement(false);
                }, 500);
            } else {
                setErreur(data.error + ': ' + (data.details || ''));
                setChargement(false);
            }

        } catch (error) {
            clearInterval(interval);
            console.error('Erreur:', error);
            setErreur('Erreur de connexion au serveur. Assurez-vous que le backend est démarré.');
            setChargement(false);
        }
    };

    return (
        <>
            <Header />
            
            <div className="detection-container">
                <Link to="/" className="btn-retour">
                    <FontAwesomeIcon icon={faArrowLeft} /> Retour à l'accueil
                </Link>

                <div className="detection-card">
                    <div className="card-header">
                        <FontAwesomeIcon icon={faLink} className="header-icon" />
                        <h1>Détection de plagiat par lien</h1>
                        <p className="subtitle">Entrez l'URL d'une page web pour analyser son contenu</p>
                    </div>

                    <div className="input-section">
                        <div className="input-wrapper">
                            <FontAwesomeIcon icon={faLink} className="input-icon" />
                            <input
                                type="url"
                                placeholder="https://example.com/article"
                                value={lien}
                                onChange={(e) => setLien(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && detecterLien()}
                                disabled={chargement}
                            />
                        </div>
                        
                        <button
                            onClick={detecterLien}
                            disabled={chargement}
                            className="btn-analyser"
                        >
                            {chargement ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} spin /> Analyse en cours...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faCheckCircle} /> Analyser
                                </>
                            )}
                        </button>
                    </div>

                    {chargement && (
                        <div className="progress-section">
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${progression}%` }}></div>
                            </div>
                            <p className="progress-text">{progression}% - Analyse en cours...</p>
                            <div className="loading-steps">
                                <div className={`step ${progression >= 25 ? 'active' : ''}`}>
                                    📥 Extraction du contenu
                                </div>
                                <div className={`step ${progression >= 50 ? 'active' : ''}`}>
                                    🔍 Recherche de sources
                                </div>
                                <div className={`step ${progression >= 75 ? 'active' : ''}`}>
                                    🧮 Analyse de similarité
                                </div>
                                <div className={`step ${progression >= 100 ? 'active' : ''}`}>
                                    ✅ Génération du rapport
                                </div>
                            </div>
                        </div>
                    )}

                    {erreur && (
                        <div className="error-box">
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                            <p>{erreur}</p>
                        </div>
                    )}

                    {resultat && (
                        <div className="results-section">
                            <h2 className="results-title">📊 Résultats de l'analyse</h2>

                            <div className="stats-grid">
                                <div className="stat-card plagiat">
                                    <div className="stat-icon">🚨</div>
                                    <div className="stat-label">Taux de plagiat</div>
                                    <div className="stat-value">{resultat.taux_plagiat}%</div>
                                    <div className="stat-bar">
                                        <div className="stat-bar-fill" style={{ width: `${resultat.taux_plagiat}%`, backgroundColor: '#f44336' }}></div>
                                    </div>
                                </div>

                                <div className="stat-card similarite">
                                    <div className="stat-icon">📈</div>
                                    <div className="stat-label">Taux de similarité</div>
                                    <div className="stat-value">{resultat.taux_similarite}%</div>
                                    <div className="stat-bar">
                                        <div className="stat-bar-fill" style={{ width: `${resultat.taux_similarite}%`, backgroundColor: '#ff9800' }}></div>
                                    </div>
                                </div>
                            </div>

                            {resultat.sources_trouvees && resultat.sources_trouvees.length > 0 && (
                                <div className="sources-section">
                                    <h3 className="sources-title">
                                        🌐 Sources détectées ({resultat.sources_trouvees.length})
                                    </h3>
                                    <div className="sources-list">
                                        {resultat.sources_trouvees.map((source, index) => (
                                            <div key={index} className="source-card">
                                                <div className="source-header">
                                                    <div className="source-rank">#{index + 1}</div>
                                                    <div className="source-info">
                                                        <div className="source-title">{source.titre}</div>
                                                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="source-url">
                                                            {source.url}
                                                        </a>
                                                    </div>
                                                    <div className="source-similarity">{source.similarite}%</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="actions-section">
                                <button className="btn-secondary" onClick={() => { setResultat(null); setLien(''); }}>
                                    Nouvelle analyse
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </>
    );
}

export default DetectionLien;