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

::note
Pour activer ces notifications pour une campagne, définissez `"notify_webhooks": true` dans l'objet `contacts_and_data` lors de la création.
::

| Événement | Description |
| :--- | :--- |
| `campaign_message.delivered` | Le message a été livré au destinataire. |
| `campaign_message.read` | Le destinataire a ouvert le message. |
| `campaign_message.failed` | Échec de livraison (numéro invalide, etc.). |
| `campaign_message.interaction` | L'utilisateur a cliqué sur un bouton. |

### Exemple : Message Livré

```json
{
  "event": "campaign_message.delivered",
  "data": {
    "date": "2025-04-09T02:02:11.000000Z",
    "campaign_id": "cmp_abc123def456",
    "provider_id": "prov_whatsapp_prod",
    "channel_id": "whatsapp",
    "recipient_id": "212601020304",
    "campaign_external_ref": "RAMADAN_PROMO_25",
    "provider_message_id": "wamid.HBgNNzA5ODUwOTI0MzE4QkU1QzQ1Rg==",
    "push_log_id": "pl_ghi789jkl012",
    "planned_message_id": "pm_mno345pqr678",
    "status_code": "delivered"
  }
}
```

### Exemple : Interaction (Bouton cliqué)

```json
{
  "event": "campaign_message.interaction",
  "data": {
    "date": "2025-04-09T02:05:30.000000Z",
    "campaign_id": "cmp_abc123def456",
    "provider_id": "prov_whatsapp_prod",
    "channel_id": "whatsapp",
    "recipient_id": "212601020304",
    "campaign_external_ref": "RAMADAN_PROMO_25",
    "provider_message_id": "wamid.HBgNNzA5ODUwOTI0MzE4QkU1QzQ1Rg==",
    "push_log_id": "pl_ghi789jkl012",
    "planned_message_id": "pm_mno345pqr678",
    "status_code": "interaction",
    "payload": "button_yes_opt_in"
  }
}
```

### Exemple : Échec de livraison

```json
{
  "event": "campaign_message.failed",
  "data": {
    "date": "2025-04-09T02:03:00.000000Z",
    "campaign_id": "cmp_stu789vwx012",
    "provider_id": "prov_sms_global",
    "channel_id": "sms",
    "recipient_id": "212600000000",
    "status_code": "failed",
    "sub_status_code": "failed_invalid_recipient",
    "error_message": "The recipient number is not valid or is blacklisted."
  }
}
```

## 3. Événements LiveChat

Suivez les conversations et les messages en temps réel.

| Événement | Description |
| :--- | :--- |
| `live_chat.new_conversation` | Une nouvelle session de chat a commencé. |
| `live_chat.new_message` | Un nouveau message (client ou agent) a été posté. |
| `live_chat.conversation_archived` | La conversation a été clôturée/archivée. |

### Exemple : Nouvelle Conversation

```json
{
  "event": "live_chat.new_conversation",
  "data": {
    "id": "conv_abc123xyz789",
    "data": {
      "created_at": "2025-04-29T14:40:47.000000Z",
      "third": {
        "id": "thd_pqr456stu012",
        "name": "Fatima Zahra",
        "platform_link": {
          "id": "plnk_lmn789opq345",
          "channel": "whatsapp",
          "platform_id": "212612345678"
        }
      }
    }
  }
}
```

### Exemple : Nouveau Message (Client)

```json
{
  "event": "live_chat.new_message",
  "data": {
    "id": "msg_user123abc456",
    "data": {
      "conversation_id": "conv_abc123xyz789",
      "system": false,
      "type": "text",
      "body": "Bonjour, j'ai une question sur ma commande.",
      "send_to_third": false,
      "sent_using": "whatsapp",
      "created_at": "2025-04-30T12:14:33.000000Z",
      "sender": {
        "id": "sndr_thd_pqr456stu012",
        "model_type": "third",
        "model_id": "thd_pqr456stu012",
        "name": "Fatima Zahra"
      }
    }
  }
}
```

### Exemple : Nouveau Message (Agent)

```json
{
  "event": "live_chat.new_message",
  "data": {
    "id": "msg_agent789def012",
    "data": {
      "conversation_id": "conv_abc123xyz789",
      "system": false,
      "type": "text",
      "body": "Bonjour Fatima, je peux vous aider. Quel est votre numéro de commande ?",
      "send_to_third": true,
      "sent_using": "whatsapp",
      "created_at": "2025-04-30T12:15:05.000000Z",
      "sender": {
        "id": "sndr_usr_agent_support_01",
        "model_type": "user",
        "model_id": "usr_agent_support_01",
        "name": "Support Agent Ahmed"
      }
    }
  }
}
```

### Exemple : Conversation Archivée

```json
{
  "event": "live_chat.conversation_archived",
  "data": {
    "conversation_id": "conv_abc123xyz789",
    "archived_at": "2025-05-01T10:30:00.000000Z"
  }
}
```

## 4. Événements Third Parties (Contacts)

| Événement | Description |
| :--- | :--- |
| `third.created` | Un nouveau contact a été créé. |
| `third.updated` | Un contact existant a été modifié. |
| `third.deleted` | Un contact a été supprimé. |
| `third.tags-changed` | Les tags d'un contact ont été modifiés. |

### Exemple : Contact Créé

```json
{
  "event": "third.created",
  "data": {
    "id": "thd_0wyb4mee98mxng8p",
    "data": {
      "id": "thd_0wyb4mee98mxng8p",
      "wa_id": "212611223344",
      "email": "new.contact@example.ma",
      "first_name": "Karim",
      "last_name": "Alaoui",
      "name": "Karim Alaoui",
      "lang": "fr",
      "created_at": "2025-04-09T17:54:54.000000Z"
    },
    "wasRecentlyCreated": true
  }
}
```

### Exemple : Contact Mis à Jour

```json
{
  "event": "third.updated",
  "data": {
    "id": "thd_0wyb4mee98mxng8p",
    "data": {
      "id": "thd_0wyb4mee98mxng8p",
      "name": "Karim ALAOUI (VIP)",
      "premium": true,
      "verified": true,
      "updated_at": "2025-04-10T09:15:00.000000Z"
    },
    "wasRecentlyCreated": false,
    "changes": {
      "premium": true,
      "verified": true,
      "name": "Karim ALAOUI (VIP)",
      "updated_at": "2025-04-10 09:15:00"
    }
  }
}
```

### Exemple : Tags Modifiés

```json
{
  "event": "third.tags-changed",
  "data": {
    "model_type": "third",
    "model_id": "thd_80ew4kx3bxkdyjpa",
    "attached_tags": ["vip_customer", "newsletter_subscriber_active"],
    "detached_tags": ["prospect_level_1", "event_invitee_q1_2025"]
  }
}
```

## 5. Événements Tickets

| Événement | Description |
| :--- | :--- |
| `ticket.created` | Un nouveau ticket a été créé. |
| `ticket.updated` | Un ticket a été modifié (statut, assignation, etc.). |
| `ticket.deleted` | Un ticket a été supprimé. |

### Exemple : Ticket Créé

```json
{
  "event": "ticket.created",
  "data": {
    "id": "tkt_n65opmdwby6l84r7",
    "data": {
      "id": "tkt_n65opmdwby6l84r7",
      "ticket_number": "T20250507-001897",
      "subject": "New Inquiry via Webform: Enterprise Plan Pricing",
      "priority_id": 1,
      "ticket_status_id": "tstat_new",
      "tags": ["pricing", "enterprise_plan", "web_inquiry"],
      "information": {
        "fullname": "Leila Kassir",
        "email": "leila.kassir@example.com",
        "phone": "212655112233"
      },
      "created_at": "2025-05-07T10:00:05.000000Z"
    },
    "wasRecentlyCreated": true
  }
}
```

### Exemple : Ticket Mis à Jour

```json
{
  "event": "ticket.updated",
  "data": {
    "id": "tkt_n65opmdwby6l84r7",
    "data": {
      "ticket_number": "T20250507-001897",
      "subject": "RE: Enterprise Plan Pricing [Assigned]",
      "ticket_status_id": "tstat_assigned",
      "handler_id": "usr_agent_amina_sales",
      "note": "Assigned to Amina. Follow up within 2 business hours."
    },
    "wasRecentlyCreated": false,
    "changes": {
      "ticket_status_id": "tstat_assigned",
      "handler_id": "usr_agent_amina_sales",
      "handler_type": "user"
    }
  }
}
```

::tip
Pour les mises à jour (`updated`), le payload inclut un objet `changes` montrant uniquement les champs modifiés et leurs nouvelles valeurs.
::
