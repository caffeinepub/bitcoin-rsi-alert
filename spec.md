# TV Webhook Trading Pipeline

## Current State
Fresh project. No existing code.

## Requested Changes (Diff)

### Add
- Secure webhook receiver with static secret token validation (token checked FIRST before kill switch)
- Kill switch (stable var, defaults false/OFF, must be explicitly enabled by admin)
- Deduplication by alert_id with 90-second TTL window
- Binance credentials storage (apiKey + apiSecret as opaque Text blobs, admin-only, never returned to frontend)
- Testnet mode flag (stable var, defaults true = testnet, must be explicitly set false for live)
- Default order quantity (stable var, Text, e.g. "0.001")
- Audit log: last 100 entries, append new to end, remove oldest (first) when over 100 -- NOT removeLast
- Admin-only functions: getKillSwitchStatus, setKillSwitch, setWebhookSecret, hasWebhookSecret (bool only, never returns secret), getAuditLog, setBinanceCredentials, hasBinanceCredentials, clearBinanceCredentials, setTestnetMode, getTestnetMode, setDefaultOrderQuantity, getDefaultOrderQuantity
- Public function: receiveWebhook(alertId, timestamp, symbol, side, signal, secretToken) -- validates token first, then kill switch, then dedup, then logs accepted
- Internet Identity authentication (authorization component)
- Frontend: always-visible Sign In button in header
- Frontend: Pipeline Status Bar showing kill switch status and testnet/live mode
- Frontend: Admin Control Panel with all config (kill switch toggle with confirm dialog, webhook secret input with stored/not-set badge, Binance credentials inputs with stored/not-set badge, testnet toggle with confirm, default order quantity field, webhook endpoint URL display with copy button)
- Frontend: Audit Log Table (auto-refreshes every 5s)
- Frontend: Test Webhook Panel with example Pine Script JSON payload

### Modify
N/A -- fresh project

### Remove
N/A -- fresh project

## Implementation Plan

### Backend (`main.mo`)
1. Stable vars: killSwitch (Bool, false), webhookSecret (?Text, null), binanceApiKey (?Text, null), binanceApiSecret (?Text, null), testnetMode (Bool, true), defaultOrderQuantity (Text, "0.001")
2. AuditLogEntry type: alertId, timestamp, symbol, side, signal, status, reason, receivedAt (Int)
3. List for auditLog, Map for deduplicationEntries
4. appendAuditLogEntry: add to end, while size > 100 call removeFirst (NOT removeLast)
5. receiveWebhook security gate ORDER: (1) token check first, (2) kill switch, (3) dedup -- this order prevents info leaks
6. All admin functions: check isAdmin first, return gracefully (false/[]/etc) if not -- NO Runtime.trap for unregistered callers in isAdmin check
7. NO UserProfile type, NO userProfiles map, NO dead imports
8. Dedup window: 90 seconds in nanoseconds
9. Max audit log: 100 entries

### Frontend
1. App.tsx: header with Sign In/Out button (always visible), PipelineStatusBar, AdminControlPanel, AuditLogTable, TestWebhookPanel
2. PipelineStatusBar: shows kill switch armed/disarmed badge + testnet/live badge
3. AdminControlPanel: all config sections
4. AuditLogTable: polling every 5s, shows last 100 entries
5. TestWebhookPanel: calls receiveWebhook, shows response, includes Pine Script JSON example
6. Webhook URL: display canister URL + "/webhook" path (even though HTTP endpoint is Phase 2)
7. Design: dark theme, monospace font accents, technical/dashboard aesthetic
