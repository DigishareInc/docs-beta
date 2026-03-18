---
title: Overview
description: Receive real-time updates about tickets.
---


## Ticket Events

| Event | Description |
| :--- | :--- |
| `ticket.created` | A new ticket was created. |
| `ticket.updated` | A ticket was modified (status, assignment, etc.). |
| `ticket.deleted` | A ticket was deleted. |




::tip
For updates (`updated`), the payload includes a `changes` object showing only the modified fields and their new values.
::
