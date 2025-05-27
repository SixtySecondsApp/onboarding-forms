# Webhook Testing Guide

This guide explains how to test the webhook functionality in the onboarding forms system, including the new `form.updated` webhook feature.

## Overview

The system now supports multiple webhook events:
- `form.completed` - Triggered when a form is fully completed
- `form.updated` - Triggered when form data is updated (NEW)
- `section.completed` - Triggered when a form section is completed
- `webhook.test` - Test event for verifying webhook configuration

## Setup

### 1. Start the Development Server
```bash
npm run dev
```
The server will run on `http://localhost:3000`

### 2. Start the Webhook Test Server (Optional)
```bash
node webhook-test-server.js
```
This creates a test webhook receiver on `http://localhost:3001` with a dashboard at `http://localhost:3001/`

## Testing Steps

### 1. Configure Webhook Settings

1. Navigate to the admin dashboard: `http://localhost:3000/admin`
2. Go to Settings → Webhooks tab
3. Configure:
   - **Webhook URL**: `http://localhost:3001/webhook` (for local testing)
   - **Enable webhook**: Toggle on
   - **Generate Secret**: Click to create a webhook secret
   - **Save Configuration**

### 2. Test Basic Webhook Connectivity

1. In the webhook settings, click "Test Webhook"
2. Check the webhook test server dashboard for the received payload
3. Verify the signature is included and valid

### 3. Test Form.Updated Webhook

#### Method 1: Through Admin Interface
1. In webhook settings, click "Test" next to `form.updated` event
2. This sends a mock form.updated webhook with test data
3. Check the webhook dashboard for the payload

#### Method 2: Through Form Updates
1. Create a new form in the admin dashboard
2. Fill out some form data and save
3. Update the form data again
4. Each update should trigger a `form.updated` webhook

#### Method 3: Direct API Call
```bash
curl -X PATCH http://localhost:3000/api/forms/1/data \
  -H "Content-Type: application/json" \
  -d '{"businessDetails": {"name": "Updated Company Name"}}'
```

### 4. Test Form Completion Webhook

1. Create a form and complete all sections
2. When the form reaches 100% completion, a `form.completed` webhook is sent
3. Check the webhook dashboard for the completion payload

## Webhook Payloads

### form.updated Event
```json
{
  "event": "form.updated",
  "form_id": 123,
  "new_data": {
    "businessDetails": {
      "name": "New Company Name"
    }
  },
  "old_data": {
    "businessDetails": {
      "name": "Old Company Name"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### form.completed Event
```json
{
  "event": "form_completion",
  "form_id": 123,
  "form_name": "Acme Corp",
  "client_email": "john@acme.com",
  "form_data": {...},
  "sections": [
    {
      "section_id": 101,
      "section_name": "Business Details",
      "data": {...}
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### webhook.test Event
```json
{
  "event": "webhook.test",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "message": "This is a test webhook from your onboarding forms system",
    "test_id": "abc123"
  }
}
```

## Security

All webhooks include an `X-Webhook-Signature` header when a webhook secret is configured:

```
X-Webhook-Signature: sha256=<hmac_signature>
```

To verify the signature:
```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
}
```

## API Endpoints

### Webhook Configuration
- `GET /api/webhook-settings` - Get current webhook settings
- `POST /api/webhook-settings` - Update webhook settings

### Testing Endpoints
- `POST /api/webhook/test` - Send a test webhook
- `POST /api/webhook/test-form-updated/:id` - Test form.updated webhook for specific form
- `PATCH /api/forms/:id/data` - Update form data (triggers form.updated webhook)

## Troubleshooting

### Webhook Not Received
1. Check webhook URL is correct and accessible
2. Verify webhook is enabled in settings
3. Check server logs for error messages
4. Ensure webhook endpoint returns 200 status

### Invalid Signature
1. Verify webhook secret matches between sender and receiver
2. Check payload is being verified exactly as sent (no modifications)
3. Ensure signature header name is correct: `X-Webhook-Signature`

### Form.Updated Not Triggering
1. Verify form data is actually changing
2. Check that the form ID exists
3. Ensure webhook is enabled and URL is configured
4. Check server logs for any errors during webhook sending

## Implementation Details

The `form.updated` webhook is triggered in the following scenarios:
1. When `updateFormData()` is called in the storage layer
2. When form data is updated via the `/api/forms/:id/data` endpoint
3. When form progress is saved during the onboarding flow

The webhook includes both the old and new data to allow receivers to understand what changed. 