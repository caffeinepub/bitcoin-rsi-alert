# TV Webhook Trading Pipeline — Version 14 Phase 1

## Current State
The backend has a minimal alert logging system (RSI-based). The authorization and http-outcalls components are already selected. The frontend (Version 13) shows a blueprint/architecture overview of the pipeline without real backend wiring.

## Requested Changes (Diff)

### Add
- `receiveWebhook` endpoint: accepts JSON payload with `alert_id`, `timestamp`, `symbol`, `side`, `signal`, `secret_token`
- Secret token validation: reject if token does not match stored secret
- Kill switch: stable boolean, defaults OFF on deploy; `setKillSwitch(bool)` admin-only
- Deduplication: store seen `alert_id` values with TTL of 90 seconds; reject duplicates
- Audit log: last 100 webhook alerts stored (no secrets), with timestamp, symbol, side, signal, status (accepted/rejected + reason)
- `setWebhookSecret(text)` admin-only function to update the secret token
- `getAuditLog()` query returning last 100 entries
- `getKillSwitchStatus()` query
- Frontend: Pipeline status panel, kill switch toggle (admin only), webhook secret input (masked), live audit log table

### Modify
- Replace the old minimal `checkAndLogAlert` / `alertHistory` with the new webhook-based audit log
- Backend actor incorporates the authorization mixin for admin-only access control

### Remove
- Old RSI-based `checkAndLogAlert` and `clearAlertHistory` functions (replaced by new pipeline)

## Implementation Plan
1. Rewrite `main.mo` with:
   - Stable variables: `killSwitch`, `webhookSecret`, `auditLog` buffer (max 100), `seenAlertIds` map with timestamps
   - `receiveWebhook` public shared func: validate secret, check kill switch, deduplicate, log with status
   - `setKillSwitch` admin-only, `setWebhookSecret` admin-only
   - `getAuditLog` and `getKillSwitchStatus` query funcs
   - TTL cleanup on each `receiveWebhook` call (remove alert_ids older than 90s)
2. Frontend page with:
   - Pipeline status indicator (TradingView → Webhook → Caffeine → Binance)
   - Kill switch toggle (calls `setKillSwitch`)
   - Webhook secret field (masked, calls `setWebhookSecret`)
   - Audit log table (calls `getAuditLog`, refreshes every 5s)
   - Status badges per log entry (accepted/rejected)
