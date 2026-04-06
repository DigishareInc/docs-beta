Source: https://docs.360dialog.com/docs/support/api-error-message-list.md

# Official 360dialog WhatsApp API Error List

## Integrity & Policy
- **368**: Temporarily blocked for policy violations.
- **130497**: Restricted from messaging users in specific countries (scaling path required).
- **131031**: Account locked. Resolve by disabling/enabling 2FA or checking Health Status API.

## Delivery Failures
- **131026 (Message Undeliverable)**: 
    - Recipient phone number is not on WhatsApp.
    - Customer has blocked the business.
    - Restricted/sanctioned country.
    - Recipient has not accepted new Terms of Service.
    - **Minimum Client Versions Required**:
        - Android: 2.21.15.15
        - iOS: 2.21.170.4
        - Web: 2.2132.6
- **131047 (Re-engagement)**: > 24 hours since last reply. Use a template.
- **131049 (Ecosystem Limit)**: Meta per-user marketing limit. Wait 24h.

## Payments & Registration
- **131042**: Payment account not attached, credit line exceeded, or suspended WABA.
- **1005**: Registration timeout or error verifying phone number.

## Media Errors
- **131052**: Unable to download media. Check MIME type and accessibility.
- **131053**: Unable to upload media. Ensure file type is supported.

## Templates
- **132000**: Parameter count mismatch.
- **132001**: Template does not exist or is not approved.
- **132005**: Translated text too long.
- **132007**: Format policy violated.
- **132012**: Parameter format mismatch.
