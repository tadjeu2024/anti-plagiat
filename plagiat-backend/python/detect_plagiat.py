#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import sys
import re
from difflib import SequenceMatcher

def nettoyer_texte(texte):
    """Nettoie et normalise le texte"""
    texte = re.sub(r'\s+', ' ', texte)
    texte = re.sub(r'[^\w\s.,!?]', '', texte)
    return texte.strip().lower()

def comparer_textes(texte1, texte2):
    """Compare deux textes et retourne la similarité"""
    texte1_clean = nettoyer_texte(texte1)
    texte2_clean = nettoyer_texte(texte2)
    
    if not texte1_clean or not texte2_clean:
        return 0.0
    
    return SequenceMatcher(None, texte1_clean, texte2_clean).ratio()

def extraire_phrases(texte):
    """Extrait les phrases d'un texte"""
    phrases = re.split(r'[.!?]+', texte)
    return [p.strip() for p in phrases if len(p.strip()) > 30]

def analyser_plagiat(texte_extrait, resultats_google):
    """Analyse le plagiat en comparant le texte avec les snippets Google"""
    
    if not resultats_google or len(resultats_google) == 0:
        return {
            'taux_plagiat': 0.0,
            'taux_similarite': 0.0,
            'sources': [],
            'phrases_copiees': []
        }
    
    phrases_texte = extraire_phrases(texte_extrait)
    sources_detectees = []
    phrases_copiees = []
    max_similarite = 0.0
    
    # Pour chaque résultat Google
    for result in resultats_google:
        titre = result.get('titre') or result.get('title', 'Sans titre')
        url = result.get('url') or result.get('link', '')
        snippet = result.get('snippet', '')
        
        if not snippet or len(snippet) < 20:
            continue
        
        # Comparer le snippet avec chaque phrase du texte
        for phrase in phrases_texte:
            similarite = comparer_textes(phrase, snippet)
            
            # Si similarité > 40%, c'est suspect
            if similarite > 0.4:
                if similarite > max_similarite:
                    max_similarite = similarite
                
                # Ajouter la source
                source_existe = False
                for s in sources_detectees:
                    if s['url'] == url:
                        source_existe = True
                        if similarite * 100 > s['similarite']:
                            s['similarite'] = round(similarite * 100, 2)
                        break
                
                if not source_existe:
                    sources_detectees.append({
                        'titre': titre,
                        'url': url,
                        'similarite': round(similarite * 100, 2)
                    })
                
                # Ajouter la phrase copiée
                if similarite > 0.5:  # Seuil 50%
                    phrases_copiees.append({
                        'phrase_originale': phrase[:200],  # Limiter à 200 caractères
                        'phrase_source': snippet[:200],
                        'similarite': round(similarite * 100, 2)
                    })
    
    # Calculer les taux
    taux_similarite = round(max_similarite * 100, 2)
    
    nb_phrases_totales = len(phrases_texte)
    nb_phrases_copiees = len(phrases_copiees)
    taux_plagiat = round((nb_phrases_copiees / nb_phrases_totales * 100), 2) if nb_phrases_totales > 0 else 0.0
    
    # Trier par similarité
    sources_detectees.sort(key=lambda x: x['similarite'], reverse=True)
    phrases_copiees.sort(key=lambda x: x['similarite'], reverse=True)
    
    return {
        'taux_plagiat': taux_plagiat,
        'taux_similarite': taux_similarite,
        'sources': sources_detectees[:10],
        'phrases_copiees': phrases_copiees[:10]
    }

def main():
    """Fonction principale"""
    try:
        if len(sys.argv) < 3:
            raise ValueError("Arguments manquants")
        
        texte_extrait = sys.argv[1]
        resultats_google_json = sys.argv[2]
        
        resultats_google = json.loads(resultats_google_json)
        
        resultat = analyser_plagiat(texte_extrait, resultats_google)
        
        print(json.dumps(resultat, ensure_ascii=False))
        
    except Exception as e:
        print(json.dumps({
            'error': str(e),
            'taux_plagiat': 0.0,
            'taux_similarite': 0.0,
            'sources': [],
            'phrases_copiees': []
        }, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    main()