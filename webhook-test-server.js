const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Store received webhooks for display
let receivedWebhooks = [];

// Webhook endpoint
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = req.body;
  
  console.log('\n🎯 Webhook Received!');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🔐 Signature:', signature || 'No signature');
  console.log('📦 Payload:', JSON.stringify(payload, null, 2));
  
  // Store the webhook
  receivedWebhooks.unshift({
    timestamp: new Date().toISOString(),
    signature,
    payload,
    id: Math.random().toString(36).substring(7)
  });
  
  // Keep only last 10 webhooks
  if (receivedWebhooks.length > 10) {
    receivedWebhooks = receivedWebhooks.slice(0, 10);
  }
  
  res.status(200).json({ success: true, message: 'Webhook received successfully' });
});

// Dashboard to view received webhooks
app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Webhook Test Dashboard</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .webhook { background: white; margin: 10px 0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .webhook-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .event-type { background: #007bff; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .timestamp { color: #666; font-size: 14px; }
        .payload { background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; }
        .signature { color: #28a745; font-family: monospace; font-size: 12px; }
        .no-webhooks { text-align: center; color: #666; padding: 40px; }
        .refresh-btn { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
        .setup-info { background: #e7f3ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #007bff; }
      </style>
      <script>
        function refreshPage() {
          window.location.reload();
        }
        
        // Auto-refresh every 5 seconds
        setInterval(refreshPage, 5000);
      </script>
    </head>
    <body>
      <div class="container">
        <h1>🎯 Webhook Test Dashboard</h1>
        
        <div class="setup-info">
          <h3>Setup Instructions:</h3>
          <p><strong>Webhook URL:</strong> <code>http://localhost:3001/webhook</code></p>
          <p>Configure this URL in your admin settings to receive webhooks.</p>
          <p>This page auto-refreshes every 5 seconds to show new webhooks.</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2>Received Webhooks (${receivedWebhooks.length})</h2>
          <button class="refresh-btn" onclick="refreshPage()">🔄 Refresh</button>
        </div>
        
        ${receivedWebhooks.length === 0 ? 
          '<div class="no-webhooks">No webhooks received yet. Configure your webhook URL and test!</div>' :
          receivedWebhooks.map(webhook => `
            <div class="webhook">
              <div class="webhook-header">
                <span class="event-type">${webhook.payload.event || 'unknown'}</span>
                <span class="timestamp">${webhook.timestamp}</span>
              </div>
              ${webhook.signature ? `<div class="signature">✅ Signature: ${webhook.signature}</div>` : '<div style="color: #ffc107;">⚠️ No signature</div>'}
              <div class="payload">
                <pre>${JSON.stringify(webhook.payload, null, 2)}</pre>
              </div>
            </div>
          `).join('')
        }
      </div>
    </body>
    </html>
  `;
  
  res.send(html);
});

// Clear webhooks endpoint
app.post('/clear', (req, res) => {
  receivedWebhooks = [];
  res.json({ success: true, message: 'Webhooks cleared' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🎯 Webhook Test Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔗 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log('\nConfigure this webhook URL in your admin settings to start receiving webhooks!');
}); 