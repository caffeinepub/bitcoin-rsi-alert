# TV Webhook Trading Pipeline

## Current State
- Phase 1 is complete: webhook receiver, kill switch, deduplication by alert_id (90s TTL), audit log (last 100 entries), webhook secret token validation
- Authorization (role-based, admin-only for sensitive ops) is integrated
- No Binance credential storage exists yet
- No testnet/live mode toggle exists yet
- Webhook receiver currently logs accepted alerts but does NOT execute any Binance trade

## Requested Changes (Diff)

### Add
- `binanceApiKey` and `binanceApiSecret` stored as `?Text` opaque blobs in backend stable memory
- `testnestMode` boolean flag (defaults `true` = testnet, must be explicitly set to false for live)
- `setBinanceCredentials(apiKey, apiSecret)` admin-only function to store credentials
- `hasBinanceCredentials()` admin-only query returning Bool (masked check, never returns actual keys)
- `setTestnetMode(Bool)` admin-only function
- `getTestnetMode()` admin-only query
- Frontend: "Binance Credentials" section in AdminControlPanel with masked API key + secret inputs and save button
- Frontend: Testnet/Live mode toggle with clear visual indicator

### Modify
- AdminControlPanel to include two new sections: Binance credentials and testnet mode
- AuditLogEntry `reason` field to include testnet/live mode context when available

### Remove
- Nothing removed

## Implementation Plan
1. Add `binanceApiKey`, `binanceApiSecret` as `var ?Text` in backend
2. Add `testnetMode` as `var Bool = true` in backend
3. Add `setBinanceCredentials` (admin only), `hasBinanceCredentials` (admin only query)
4. Add `setTestnetMode` / `getTestnetMode` (admin only)
5. Wire new backend functions into frontend queries/mutations
6. Add Binance credentials section to AdminControlPanel (masked inputs, save button, credential status indicator)
7. Add testnet/live mode toggle to AdminControlPanel with confirmation on switching to live
