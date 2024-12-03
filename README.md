Synthèse du Projet : Chatbot d'Aide Basé sur une Documentation
Objectif du Projet
Créer un chatbot intelligent capable de répondre aux questions des utilisateurs en se basant sur des documents PDF fournis. L'application doit également proposer des alternatives (Chat, Téléphone, Email) lorsque la réponse n'est pas pertinente ou suffisante.

Le système est conçu pour être :

Hébergé localement sur une infrastructure interne (Proxmox).
Accessible via une API REST.
Capable de gérer les données issues de Google Drive, avec des fonctionnalités de nettoyage et d'indexation.
Fonctionnalités Clés
1. Collecte et Indexation des Documents
Sources des documents : Les documents PDF sont téléchargés automatiquement depuis un dossier Google Drive identifié par un ID spécifique (2CM).
Indexation : Les fichiers PDF sont analysés et indexés dans Elasticsearch pour permettre des recherches rapides et efficaces.
Nettoyage des données : Suppression des informations inutiles (adresses, numéros de téléphone, mentions légales) dans le contenu des documents avant leur utilisation.
2. Génération de Réponses
Modèle IA utilisé : Flan-T5 Base de Google, un modèle optimisé pour répondre à des questions basées sur des contextes textuels.
Prompt optimisé : Un prompt clair et explicite est utilisé pour guider le modèle dans la génération de réponses pertinentes, tout en filtrant les informations inutiles.
Référencement des documents : Les réponses incluent les noms des documents et les pages correspondantes pour garantir la transparence.
3. Interface Utilisateur
API REST : Accessible via des requêtes HTTP (curl, intégration à d'autres services) avec des endpoints clairs.
Alternatives en cas de réponse insuffisante : Si le chatbot ne peut pas répondre efficacement, il propose des options pour contacter une équipe de support (Chat, Téléphone, Email).
Architecture Technique
Infrastructure

Serveur hébergé sur Proxmox :
Un conteneur pour le backend (Ubuntu Server 22.04).
Un conteneur pour PostgreSQL (base de données pour les logs et les requêtes).
Un conteneur pour Elasticsearch (moteur d'indexation et recherche).
Composants principaux

Backend : Framework FastAPI.
Base de données : PostgreSQL pour enregistrer les requêtes utilisateurs et les réponses générées.
Moteur de recherche : Elasticsearch pour indexer et rechercher efficacement les documents PDF.
Modèle de langage : Flan-T5 Base, téléchargé depuis Hugging Face.
Flux du Chatbot
Requête Utilisateur

L'utilisateur pose une question via l'API REST.
Recherche de Documents

Elasticsearch identifie les documents pertinents.
Le contenu est nettoyé pour supprimer les informations inutiles.
Génération de Réponse

Le modèle Flan-T5 utilise le contexte extrait des documents pour générer une réponse.
La réponse est enrichie avec des références aux documents et numéros de pages.
Sauvegarde et Retour

La requête utilisateur et la réponse sont sauvegardées dans PostgreSQL.
La réponse est renvoyée à l'utilisateur, avec des alternatives en cas de besoin.
Points Forts
Personnalisation locale : Hébergement et traitement entièrement local, garantissant la confidentialité des données.
Recherche optimisée : Utilisation d'Elasticsearch pour une recherche rapide dans les documents PDF.
Modèle de réponse performant : Flan-T5 Base offre des réponses contextuelles adaptées aux questions complexes.
Gestion des erreurs : Propose des options supplémentaires si les informations disponibles sont insuffisantes.
Prochaines Évolutions
Interface utilisateur graphique (UI) :

Ajouter un tableau de bord pour interagir directement avec le chatbot.
Permettre à l’équipe support de voir les logs et de gérer les demandes.
Amélioration des réponses :

Passer à un modèle IA plus performant si besoin (par exemple, Flan-T5 Large ou un modèle spécifique à votre domaine).
Ajuster le prompt pour des cas d’utilisation plus complexes.
Monitoring et Analyse :

Ajouter des métriques pour suivre les performances du chatbot.
Identifier les questions fréquemment posées et améliorer les documents ou l’indexation en conséquence.
Support multilingue :

Étendre la capacité du chatbot pour répondre dans plusieurs langues si nécessaire.
Exemple de Requête et Réponse
Requête
bash
Copier le code
curl -X POST "http://192.168.0.15:8000/chat/" \
-H "Content-Type: application/json" \
-d '{"query": "je souhaiterai faire des situations de travaux"}'
Réponse
json
Copier le code
{
  "response": "Voici ce que j'ai trouvé pour répondre à votre question :\n\nPour créer une situation de travaux, suivez les étapes décrites dans la documentation.\n\nLes informations proviennent des documents suivants :\n- CM019_rev01_Création d'une situation de travaux.pdf (Pages : 1, 2, 3)\n- CM020_rev01_Création d'une facture client.pdf (Pages : 2, 3)\n\nN'hésitez pas à poser d'autres questions si besoin !",
  "alternatives": ["Chat", "Téléphone", "Email"]
}
Conclusion
Ce projet fournit une solution complète et robuste pour automatiser les réponses aux questions des utilisateurs en se basant sur des documents PDF. L'architecture modulaire et locale garantit la confidentialité des données et la flexibilité d'intégration dans un environnement d'entreprise. 🚀






