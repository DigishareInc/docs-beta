---
title: Tickets
description: Gérer le cycle de vie des demandes clients via le système de tickets intégré.
icon: i-lucide-ticket
---

Le système de tickets de Digishare vous permet de centraliser et de suivre les demandes d'assistance provenant de divers canaux (Web, WhatsApp, Mail).

## 1. Création de Ticket

Les tickets peuvent être créés manuellement par les agents ou automatiquement via des formulaires web ou des bots.

::api-playground{method="POST" url="https://api.digishare.ma/v1/tickets" description="Créer un nouveau ticket de support." :variables='{"token": "VOTRE_TOKEN"}' :headers='{"Authorization": "Bearer {token}", "Content-Type": "application/json"}' :body='{"subject": "Problème de connexion", "priority_id": 2, "type_ticket_id": "ttyp_support", "comment": "L@utilisateur ne parvient pas à se connecter à son espace client.", "third_id": "thd_123456"}'}
::

## 2. Propriétés Clés

| Champ | Type | Description |
| :--- | :--- | :--- |
| `ticket_number` | String | Numéro formaté unique (ex: T2024-001) |
| `priority_id` | Integer | Niveau d'urgence (1: Faible, 2: Moyen, 3: Élevé) |
| `ticket_status_id` | String | État (`tstat_new`, `tstat_assigned`, `tstat_closed`) |
| `handler_id` | String | ID de l'agent assigné au ticket |

## 3. Gestion et Suivi

### Mise à jour d'un Ticket
Utilisez cette méthode pour changer le statut, assigner un agent ou ajouter des notes internes.

::api-playground{method="PUT" url="https://api.digishare.ma/v1/tickets/{id}" description="Mettre à jour les informations d@un ticket." :variables='{"token": "VOTRE_TOKEN", "id": "tkt_xyz123"}' :headers='{"Authorization": "Bearer {token}", "Content-Type": "application/json"}' :body='{"ticket_status_id": "tstat_assigned", "handler_id": "usr_agent_01", "note": "En cours de traitement par le support technique."}'}
::

### Liste des Tickets
Récupérez vos tickets avec des filtres par statut ou par date.

::api-playground{method="GET" url="https://api.digishare.ma/v1/tickets" description="Lister les tickets avec filtres optionnels." :variables='{"token": "VOTRE_TOKEN"}' :headers='{"Authorization": "Bearer {token}"}'}
::

::tip
Vous pouvez recevoir des notifications en temps réel lors de chaque modification de ticket en configurant un [Webhook pour les Tickets](/fr/developer-guides/webhooks#4-événements-third-parties--tickets).
::
