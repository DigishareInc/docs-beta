---
title: Campagnes WhatsApp
description: Orchestrez des campagnes WhatsApp à grand volume avec une personnalisation dynamique.
icon: i-mdi-whatsapp
---

Ce guide explique comment envoyer des campagnes WhatsApp à l'aide des **Modèles de Message Digishare**. Ces modèles peuvent être de type **Texte**, **ITM** (Interactive Template Message) ou **WABA TM** (Modèle approuvé par Meta).

::note
**Prérequis** :

- Un **Bearer Token** valide.
- L'**ID du Modèle de Message Digishare** (créé dans votre Dashboard Digishare).
- L'**ID du Sender Label** (ex: `VOTRE_ID_EXPEDITEUR`) représentant votre canal WhatsApp.
::

## 1. Référence de la Charge Utile API

La charge utile de la campagne utilise un schéma JSON structuré optimisé pour la messagerie à grand volume et une intégration fluide.

### Champs de Configuration

| Champ | Type | Statut | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | **Requis** | Nom interne de la campagne (non visible par les destinataires). |
| `channel` | `string` | **Requis** | Le canal de communication à utiliser. Défini sur `whatsapp`. |
| `sender_label_id` | `string` | **Requis** | L'identifiant unique de votre canal expéditeur. |
| `message_template_id` | `string` | **Requis** | L'ID de votre modèle de message Digishare (Texte, ITM ou WABA). |
| `conversation_id` | `string` | Optionnel | Lie à un fil existant ou définit un déclencheur : `message-out`, `replay-button`, `any-reply` ou `conversed`. |
| `start_datetime` | `string` | Optionnel | Heure de début planifiée de la campagne (format ISO-8601). |
| `notify_webhooks` | `boolean` | Optionnel | Si `true`, déclenche les webhooks externes pour les événements de livraison et d'interaction. |
| `meta` | `object` | Optionnel | Un objet JSON personnalisé pour l'analyse interne, les IDs ou les références externes. |
| `conversation_tags` | `array` | Optionnel | Une liste de labels à appliquer automatiquement aux conversations générées. |
| `recipients` | `array` | **Requis** | Une liste d'objets destinataires contenant leurs identifiants uniques et variables. |
| `global_data` | `object` | Optionnel | Le pont de mappage utilisé pour remplir les variables du modèle avec des valeurs statiques ou des données dynamiques des destinataires. |

## 2. Exemple : Notification de Commande Personnalisée

Si votre modèle utilise des variables comme `Bonjour {{name}}, votre commande {{order_id}} est prête.`, la charge utile suivante démontre une configuration complète incluant la planification, les webhooks et le mappage dynamique :

::api-playground
---
method: POST
url: https://api.digishare.ma/v1/campaigns
description: Envoyez une campagne WhatsApp personnalisée avec toutes les clés de configuration.
variables:
  token: VOTRE_TOKEN
  senderId: VOTRE_ID_EXPEDITEUR
  templateId: VOTRE_ID_MODELE
headers:
  Authorization: Bearer {token}
  Content-Type: application/json
body:
  title: Campagne de Notification de Commande
  channel: whatsapp
  sender_label_id: "{senderId}"
  message_template_id: "{templateId}"
  conversation_id: any-reply
  start_datetime: "2026-04-01T10:00:00Z"
  notify_webhooks: true
  meta:
    order_system: shopify
    priority: high
  conversation_tags:
    - mise_a_jour_commande
    - notification_automatisee
  global_data:
    company_name: Digishare
    name: "%recipient.name%"
    order_id: "%recipient.order_id%"
  recipients:
    - wa_id: "212600000000"
      name: John
      order_id: ORD-123
    - wa_id: "212600000001"
      name: Jane
      order_id: ORD-456
---
::

## 3. Mappage Dynamique des Données

Le bloc `global_data` sert de pont de mappage centralisé entre vos données de destinataires et les variables du modèle de message. Il prend en charge :

- **Valeurs statiques** : Données fixes partagées par tous les destinataires (ex: `nom_marque`).
- **Valeurs mappées** : Données dynamiques tirées des champs des destinataires en utilisant la syntaxe `%recipient.champ%`.

::important
Les modèles de messages ne recherchent les variables **que** dans le bloc `global_data`. Si vous avez un champ dans votre liste `recipients` (comme `name`) mais que vous ne le mappez pas explicitement dans `global_data` (ex: `"name": "%recipient.name%"`), cette donnée ne sera pas disponible pour le modèle.
::

### Cas d'Utilisation : Personnalisation Dynamique

Pour un modèle comme `Bonjour {{name}}, votre commande {{order_id}} est prête.`, vous devez mapper chaque champ du destinataire à la variable correspondante du modèle :

```json
{
  "global_data": { 
    "company_name": "Digishare", 
    "name": "%recipient.name%",
    "order_id": "%recipient.order_id%"
  },
  "recipients": [
    { "wa_id": "212600000000", "name": "John", "order_id": "123" },
    { "wa_id": "212600000001", "name": "Jane", "order_id": "456" }
  ]
}
```

> [!TIP]
> Dans cet exemple, le premier destinataire recevra un message avec `John` et `123`.

## 4. Orchestration et Marquage de Conversation

Organisez automatiquement vos fils de discussion professionnels en liant les campagnes aux conversations existantes ou en appliquant des étiquettes de classification pour une meilleure gestion.

```json
{
  "title": "Campagne Lead Gen",
  "channel": "whatsapp",
  "conversation_id": "conv_987654321",
  "conversation_tags": ["nouveau_lead", "promo_ete"],
  "global_data": { "name": "%recipient.name%" },
  "recipients": [ 
    { "wa_id": "212600000000", "name": "John" }
  ]
}
```

::important
Les tags sont appliqués à la conversation **dès que l utilisateur répond** au message initial de la campagne ou lorsque le message est livré avec succès (selon vos paramètres de canal).
::
