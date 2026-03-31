---
title: Aperçu
icon: i-mdi-file-document-outline
description: Apprenez à configurer les webhooks pour recevoir des notifications d'événements en temps réel de Digishare.
icon: i-mdi-webhook
---

Les webhooks vous permettent de recevoir des notifications HTTP en temps réel lorsque certains événements se produisent dans Digishare. Au lieu d'interroger notre API pour des mises à jour, Digishare peut envoyer les données d'événement directement à votre serveur dès qu'elles se produisent.

## 1. Accéder à la Configuration des Webhooks

Pour configurer les webhooks, vous devez créer un fournisseur **Custom Webhooks** (Webhooks personnalisés).

::steps

### Naviguer vers API Provider

Accédez à **Paramètres Avancés > API Provider** dans le menu latéral.

::tip
Vous pouvez également trouver cela instantanément en recherchant "**provider**" dans la barre de recherche.
::

### Créer un Fournisseur

Cliquez sur l'icône bleue **+** (plus) située en haut à gauche de la liste des fournisseurs pour ajouter votre premier fournisseur de webhooks.

### Sélectionner le Type de Fournisseur

Choisissez **Custom Webhooks** dans la liste des types de fournisseurs disponibles.

### Ouvrir la Configuration des Webhooks

Faites défiler jusqu'à la section **Configuration des Webhooks** (Webhook Configuration). Vous y verrez une liste de toutes les catégories d'événements prises en charge.
::

![Aperçu de la Configuration des Webhooks](/docs/webhook-overview.png)

## 2. Événements Pris en Charge

Digishare prend en charge les notifications en temps réel pour plusieurs ressources de base. Les événements sont regroupés logiquement :

* **Campagnes** (Campaigns) : Événements liés aux messages de campagne (Envoyé, Distribué, Lu, Échoué, Interactions).
* **Modèles de Messages** (Message Templates) : Notifications pour les changements de statut d'approbation des modèles.
* **Contacts** : Mises à jour lorsque des contacts sont créés, mis à jour ou désinscrits.
* **Tickets** : Mises à jour en temps réel pour l'assignation de tickets de support client, les changements de statut et les nouvelles réponses.
* **Live Chat** : Événements de conversation en temps réel pour les chats actifs des agents.

## 3. Ajouter un Webhook

Pour vous abonner à un événement spécifique :

1. Développez la catégorie concernée (par ex., **Campagnes**).
2. Trouvez l'événement exact que vous souhaitez écouter (par ex., `campaign_message.delivered`).
3. Cliquez sur le bouton violet **+** (Ajouter) à côté de la ligne de l'événement.

Cela ouvrira la boîte de dialogue **Nouveau Webhook** (New Webhook).

![Boîte de dialogue Ajouter un Webhook](/docs/webhook-dialog.png)

## 4. Paramètres du Webhook

Lors de la configuration d'un nouveau webhook, vous pouvez personnaliser la façon dont Digishare délivre la charge utile (payload) à votre serveur.

### Configuration du Point de Terminaison (Endpoint)

* **URL** : Le point de terminaison sur votre serveur qui recevra les requêtes (doit être accessible publiquement ou via VPN).
* **Méthode** (Method) : La méthode HTTP à utiliser (par défaut `POST`).
* **Content-Type** : Le format de la charge utile (par défaut `application/json`).
* **Actif** (Active) : Un interrupteur pour activer ou désactiver instantanément le webhook spécifique.

::note
Vous pouvez configurer plusieurs webhooks différents pour le même événement exact. Par exemple, vous pouvez envoyer les événements `ticket.created` à la fois à votre CRM et à un service de notification Slack spécialisé simultanément.
::

## 5. Meilleures Pratiques

Pour garantir une intégration robuste, suivez ces recommandations lors de la manipulation des webhooks Digishare :

*   **Accusé de Réception Immédiat** : Votre serveur doit répondre avec un statut `200 OK` immédiatement après avoir reçu la charge utile. Effectuez tout traitement lourd ou appel API externe de manière asynchrone en arrière-plan.
*   **Gérer les Réessais** : Si votre serveur renvoie un statut non-2xx, Digishare tentera de relivrer le webhook. Assurez-vous que votre point de terminaison gère ces relivraisons avec élégance.
*   **Idempotence** : Comme les webhooks peuvent être livrés plus d'une fois (en raison de problèmes réseau, par exemple), vérifiez toujours l'identifiant `event_id` ou un identifiant unique similaire pour éviter de traiter deux fois le même événement.
*   **Ordre des Événements** : Bien que nous nous efforcions d'assurer une livraison séquentielle, la variabilité du réseau peut faire arriver les événements dans le désordre. Utilisez les horodatages (`timestamp`) dans la charge utile pour déterminer l'ordre logique correct.

## 6. Sécurité et Vérification

Nous vous recommandons vivement de sécuriser vos points de terminaison pour garantir que les requêtes proviennent bien de Digishare.

### Authentification des Requêtes
Comme détaillé dans la section **Configuration Avancée**, vous pouvez utiliser :
*   **Basic Auth** : Vérification simple par nom d'utilisateur et mot de passe.
*   **Bearer Token** : Un jeton secret statique partagé entre Digishare et votre serveur.
*   **En-têtes Personnalisés** : Ajoutez un en-tête (ex: `X-Digishare-Secret`) et vérifiez-le de votre côté.

### Liste Blanche d'IP
Si votre infrastructure le permet, vous pouvez mettre nos adresses IP sur liste blanche. Veuillez contacter le support pour obtenir la liste actuelle des plages IP sortantes de Digishare.

### Vérification de Charge Utile (Recommandé)
Vérifiez toujours que la structure de la charge utile correspond à ce que vous attendez. Une charge utile typique comprend :

```json
{
  "event": "campaign_message.delivered",
  "timestamp": "2026-03-23T15:40:00Z",
  "event_id": "evt_123456789",
  "data": {
    "message_id": "msg_987654321",
    "recipient_id": "212600000000",
    "status": "delivered"
  }
}
```

### Configuration Avancée

Développez les panneaux sous les paramètres du point de terminaison pour sécuriser votre webhook :

#### En-têtes (Headers)

Ajoutez des en-têtes HTTP personnalisés qui seront inclus avec chaque requête. Ceci est utile pour transmettre des clés API statiques, des identifiants de routage ou des jetons de sécurité personnalisés attendus par votre serveur.

#### Authentification

Nous vous recommandons vivement de sécuriser vos points de terminaison de webhook. Digishare peut authentifier automatiquement les requêtes envoyées à votre serveur.

* **Basic Auth** : Fournissez un Nom d'utilisateur (Username) et un Mot de passe (Password).
* **Bearer Token** : Fournissez un jeton Bearer statique.
* **Custom Auth** : Définissez une clé et une valeur d'en-tête personnalisées pour les mécanismes d'authentification propriétaires.

#### Proxy VPN

Si votre serveur se trouve derrière un pare-feu d'entreprise et n'est pas exposé publiquement sur Internet, vous pouvez activer le Proxy VPN interne. Cela nécessite une connexion VPN préconfigurée dans les paramètres de l'espace de travail Digishare.

::warning
**Meilleure Pratique de Sécurité :** Nous vous recommandons vivement de valider les webhooks entrants à l'aide d'un jeton d'authentification ou en vérifiant que les requêtes proviennent des adresses IP connues de Digishare.
::

