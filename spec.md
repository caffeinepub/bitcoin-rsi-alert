# TradingView → Webhook → Caffeine → Binance Trading Pipeline

## Current State
New project. Starting fresh. The previous app (v11) was a read-only Bitcoin indicator dashboard fetching Binance OHLCV data. This new project shifts from observation to execution: it implements the full pipeline from TradingView alert → webhook receiver → trade execution on Binance via HTTP outcalls.

## Requested Changes (Diff)

### Add
- **Webhook receiver endpoint** on the backend: accepts HTTP POST from TradingView, validates a shared secret token in the payload before doing anything else
- **Binance API module**: signs requests with HMAC-SHA256 using stored API key/secret, supports placing market and limit orders via Binance REST API
- **Secure credential storage**: Binance API key and secret stored in backend stable memory, never exposed to the frontend — frontend only sends/receives masked values
- **Kill switch**: a boolean flag in backend stable memory; when OFF, all incoming webhooks are accepted and logged but no orders are sent to Binance
- **Deduplication guard**: every TradingView alert carries a unique `alert_id`; backend rejects duplicate IDs within a 60-second window to prevent double-execution on retry
- **Alert log**: stores last 100 incoming webhook payloads with status (received / validated / executed / rejected)
- **Trade log**: stores last 100 trade attempts with Binance response (filled, error, rejected)
- **Pipeline status dashboard** (frontend): visual representation of the 4 stages (TradingView → Webhook → Caffeine → Binance), each with live status indicator
- **Config panel** (frontend): set/update Binance API key and secret (masked), set webhook secret, toggle kill switch
- **Alert & trade log panels** (frontend): real-time view of incoming alerts and outgoing trade executions
- **Architecture explanation panel**: annotated diagram of the full pipeline with security notes at each stage

### Modify
N/A — new project.

### Remove
N/A — new project.

## Implementation Plan

### Security model (senior dev reasoning)
1. **Webhook authentication**: TradingView cannot sign requests with HMAC. Instead, embed a long random secret string inside the Pine Script alert JSON payload. Backend checks this on every call before any processing. Simple but effective — the secret never appears in the URL.
2. **Binance API key scope**: API key stored in backend stable memory. The key should be created on Binance with "Enable Spot & Margin Trading" only — no withdrawal permissions ever. This limits blast radius if the key is compromised.
3. **No secrets in frontend**: The frontend never receives the raw API key or webhook secret. It can trigger a "set credentials" call but the backend never returns the stored values.
4. **Kill switch first**: Kill switch defaults to OFF (trading disabled) on first deploy. The user must explicitly enable it. Any unhandled backend error automatically flips it back OFF.
5. **Deduplication**: TradingView can fire duplicate webhooks on retries. Each alert payload must include a client-generated `alert_id`. Backend stores seen IDs with a TTL to reject duplicates.
6. **Rate limiting**: Backend enforces a max of 1 trade per 5 seconds to prevent runaway alert loops.
7. **HTTP outcall consensus**: On ICP, HTTP outcalls go through consensus — the canister makes the Binance API call deterministically. This means Binance API calls are auditable on-chain.

### Backend
- `receiveWebhook(payload: Text) : async WebhookResult` — main entry point
  - Parse JSON payload
  - Validate webhook secret
  - Check kill switch
  - Deduplicate alert_id
  - Rate limit check
  - Log alert
  - Call Binance order endpoint via HTTP outcall
  - Log trade result
- `setCredentials(apiKey: Text, apiSecret: Text, webhookSecret: Text) : async ()` — admin only
- `setKillSwitch(enabled: Bool) : async ()` — admin only
- `getAlertLog() : async [AlertEntry]`
- `getTradeLog() : async [TradeEntry]`
- `getPipelineStatus() : async PipelineStatus`

### Frontend
- Pipeline diagram: 4 nodes (TradingView / Webhook Receiver / Caffeine Backend / Binance), each with a status dot
- Config panel: masked API key input, masked secret input, webhook secret input, kill switch toggle
- Alert log table: timestamp, alert_id, symbol, side, status
- Trade log table: timestamp, symbol, side, qty, Binance response code
- Architecture notes: annotated callout boxes explaining the security measure at each stage
