---
title: Vue d'ensemble
description: Découvrez les entités Third et comment gérer contacts et clients via l'API.
icon: i-mdi-account-group
---

# Thirds

Un **Third** représente un contact, client ou prospect dans votre compte Digishare. Utilisez l'API Thirds pour gérer votre base de contacts de manière programmatique.

---

## Exemple Rapide

Créez un nouveau contact avec un seul appel API :

::api-playground
---
method: POST
url: "https://api.digishare.ma/v1/thirds"
headers:
  Authorization: "Bearer VOTRE_ACCESS_TOKEN"
  Content-Type: "application/json"
body:
  first_name: "Marie"
  last_name: "Dupont"
  email: "marie@example.com"
  mobile: "+212612345678"
responseSample:
  id: "xYz123AbC"
  status: "créé"
---
::

---

## Ce que Vous Pouvez Faire

::card-group
::card{title="Créer des Contacts" icon="i-mdi-account-plus"}
Ajoutez de nouveaux contacts avec leurs informations de profil, données personnalisées et groupes.
::

::card{title="Rechercher & Filtrer" icon="i-mdi-magnify"}
Trouvez des contacts avec la recherche, le filtrage et les requêtes sur champs personnalisés.
::

::card{title="Synchroniser avec CRM" icon="i-mdi-refresh"}
Utilisez `ext_ref` pour synchroniser les contacts avec votre CRM externe.
::

::card{title="Étendre avec Champs Personnalisés" icon="i-mdi-tag-multiple"}
Stockez des métadonnées illimitées comme le solde, les préférences ou les scores.
::
::

---

## L'Objet Third

Chaque Third a un `id` unique et appartient à une entreprise. Voici une réponse typique :

```json
{
  "object": "Third",
  "id": "xYz123AbC",
  "first_name": "Marie",
  "last_name": "Dupont",
  "name": "Marie Dupont",
  "email": "marie@example.com",
  "mobile": "+212612345678",
  "wa_id": "212612345678",
  "lang": "fr",
  "is_company": false,
  "premium": true,
  "verified": true,
  "created_at": "2026-01-15T10:30:00Z",
  "updated_at": "2026-01-18T14:20:00Z"
}
```

---

## Champs Principaux

| Champ        | Type   | Description                         |
| ------------ | ------ | ----------------------------------- |
| `id`         | string | Identifiant unique (hashé)          |
| `first_name` | string | Prénom                              |
| `last_name`  | string | Nom de famille                      |
| `name`       | string | Nom complet                         |
| `email`      | string | Adresse email                       |
| `mobile`     | string | Téléphone mobile                    |
| `wa_id`      | string | ID WhatsApp (unique par entreprise) |

## Détails de Contact

| Champ       | Type   | Description                    |
| ----------- | ------ | ------------------------------ |
| `phone`     | string | Téléphone fixe                 |
| `address`   | string | Adresse principale             |
| `address_2` | string | Adresse secondaire             |
| `lang`      | string | Code langue (`en`, `fr`, `ar`) |
| `gender`    | string | `male`, `female`, `other`      |
| `birthday`  | string | Date de naissance (AAAA-MM-JJ) |

## Indicateurs

| Champ        | Type    | Défaut | Description             |
| ------------ | ------- | ------ | ----------------------- |
| `is_company` | boolean | false  | Est-ce une entreprise ? |
| `premium`    | boolean | false  | Client premium          |
| `verified`   | boolean | false  | Contact vérifié         |
| `status`     | boolean | true   | Statut actif            |

## Données Étendues

Stockez des données supplémentaires dans l'objet `data` :

```json
{
  "data": {
    "company_name": "Acme Inc",
    "title": "PDG",
    "website": "https://acme.com",
    "customer": true,
    "custom_fields": {
      "balance": 150.75,
      "loyalty_tier": "gold"
    }
  }
}
```

**Champs standard :** `company_name`, `title`, `function`, `website`, `comment`, `zip`, `tz`, `avatar`, `emails[]`, `mobiles[]`, `phones[]`, `facebook_ids[]`, `instagram_ids[]`, `linkedin_ids[]`, `telegram_ids[]`, `customer`, `supplier`, `employee`, `location`.

**Champs personnalisés :** Utilisez l'objet `custom_fields` pour vos propres données. Voir [Champs Personnalisés](/fr/developer-guides/thirds/custom-fields) pour les options avancées.

---

## IDs Liés

Liez les thirds à d'autres entités via leurs IDs hashés :

| Champ        | Description                     |
| ------------ | ------------------------------- |
| `company_id` | Entreprise parente              |
| `source_id`  | Source du lead                  |
| `country_id` | Pays                            |
| `state_id`   | Région/Province                 |
| `city_id`    | Ville                           |
| `parent_id`  | Third parent (pour hiérarchies) |

---

## Prochaines Étapes

::card-group
::card{title="Opérations CRUD" icon="i-mdi-database" to="/fr/developer-guides/thirds/crud"}
Créer, lire, mettre à jour et supprimer des contacts.
::

::card{title="Champs Personnalisés" icon="i-mdi-tag-multiple" to="/fr/developer-guides/thirds/custom-fields"}
Stocker des métadonnées personnalisées sur les contacts.
::
::

