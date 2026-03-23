# API Playground Component Skill

Use this skill when you need to document API endpoints in the Digishare documentation using the interactive `::api-playground` component.

## Component Overview

The `::api-playground` component is a premium, interactive API client integrated directly into the markdown documentation. It allows developers to test request snippets, see live results, and view formatted response samples.

## Basic Syntax

The component uses a multiline YAML frontmatter declaration for maximum readability and ease of maintenance.

```mdc
::api-playground
---
method: POST
url: "https://api.digishare.ma/v1/endpoint"
description: "Brief explanation of what this endpoint does."
headers:
  Content-Type: "application/json"
  Authorization: "Bearer YOUR_TOKEN"
body:
  key: "value"
responseSample:
  status: "success"
  data: {}
---
::
```

## Conversion Guide: from cURL to component

When you encounter a traditional cURL command, follow these mapping rules to convert it:

| cURL Flag | Component Property | Example |
|-----------|--------------------|---------|
| `-X` (Method) | `method` | `method: POST` |
| URL | `url` | `url: "https://..."` |
| `-H` (Header) | `headers` | `headers: { "Key": "Value" }` |
| `-d` (Body) | `body` | `body: { "id": 123 }` |

### Important Rules
1. **Never use single-line bracket syntax** like `::api-playground{prop="val"}`. ALWAYS use the multiline YAML block shown above.
2. **Objects as Objects:** Headers and Body should be defined as standard YAML objects, not stringified JSON.
3. **Descriptions:** If the description is long, move it into standard markdown text immediately above the component instead of using the `description` prop.
4. **Response Samples:** Always provide a realistic `responseSample` object to show the user what to expect.

## Example Conversion

**Original cURL:**
```bash
curl -X POST "https://api.digishare.ma/v1/messages" \
  -H "Authorization: Bearer MY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to": "212600000000", "message": "Hello"}'
```

**New Component:**
```mdc
::api-playground
---
method: POST
url: "https://api.digishare.ma/v1/messages"
headers:
  Authorization: "Bearer MY_TOKEN"
  Content-Type: "application/json"
body:
  to: "212600000000"
  message: "Hello"
responseSample:
  id: "msg_123"
  status: "sent"
---
::
```
