---
title: Webhooks
description: Recevez des mises à jour en temps réel sur les messages, les contacts, les conversations et les tickets.
icon: i-lucide-webhook
---

Les webhooks vous permettent de recevoir des notifications `POST` en temps réel directement sur votre serveur lorsqu'un événement spécifique se produit dans Digishare.

## 1. Configuration

::steps
### Définir l'URL du Webhook
Configurez l'URL de votre endpoint dans les paramètres de votre application Digishare.

### Écouter les événements
Votre serveur doit être prêt à recevoir des requêtes `POST` avec un payload JSON.

### Accuser réception
Votre endpoint **doit** répondre avec un code HTTP `200 OK` pour confirmer la réception.
::

::warning
Si votre serveur ne répond pas avec un `200 OK`, Digishare tentera de renvoyer la notification selon une politique de retry avant de désactiver temporairement le webhook.
::

## 2. Événements des Campagnes

Déclenchés pour les mises à jour de statut des messages (envoyé, livré, lu) ou les interactions.

| Événement | Description |
| :--- | :--- |
| `campaign_message.delivered` | Le message a été livré au destinataire. |
| `campaign_message.read` | Le destinataire a ouvert le message. |
| `campaign_message.failed` | Échec de livraison (numéro invalide, etc.). |
| `campaign_message.interaction` | L'utilisateur a cliqué sur un bouton. |

### Exemple : Interaction (Bouton cliqué)
```json
{
  "event": "campaign_message.interaction",
  "data": {
    "campaign_id": "cmp_abc123",
    "recipient_id": "212600000000",
    "status_code": "interaction",
    "payload": "button_yes_opt_in"
  }
}
```

## 3. Événements LiveChat

Suivez les conversations et les messages en temps réel.

| Événement | Description |
| :--- | :--- |
| `live_chat.new_conversation` | Une nouvelle session de chat a commencé. |
| `live_chat.new_message` | Un nouveau message (client ou agent) a été posté. |
| `live_chat.conversation_archived` | La conversation a été clôturée. |

### Exemple : Nouveau Message
```json
{
  "event": "live_chat.new_message",
  "data": {
    "conversation_id": "conv_xyz789",
    "type": "text",
    "body": "Bonjour, j'ai une question sur ma commande.",
    "sender": {
      "name": "Fatima Zahra"
    }
  }
}
```

## 4. Événements Third Parties & Tickets

| Objet | Événement |
| :--- | :--- |
| **Third (Contact)** | `third.created`, `third.updated`, `third.deleted` |
| **Ticket** | `ticket.created`, `ticket.updated`, `ticket.deleted` |

::tip
Pour les mises à jour (`updated`), le payload inclut souvent un objet `changes` montrant uniquement les champs modifiés.
::
