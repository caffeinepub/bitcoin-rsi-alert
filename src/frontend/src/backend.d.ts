import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AuditLogEntry {
    status: string;
    side: string;
    alertId: string;
    receivedAt: bigint;
    timestamp: string;
    signal: string;
    symbol: string;
    reason: string;
}
export type UserRole = "admin" | "user" | "guest";
export interface backendInterface {
    _initializeAccessControlWithSecret(token: string): Promise<void>;
    clearBinanceCredentials(): Promise<void>;
    getAuditLog(): Promise<Array<AuditLogEntry>>;
    getDefaultOrderQuantity(): Promise<string>;
    getKillSwitchStatus(): Promise<boolean>;
    getTestnetMode(): Promise<boolean>;
    hasBinanceCredentials(): Promise<boolean>;
    hasWebhookSecret(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    receiveWebhook(alertId: string, timestamp: string, symbol: string, side: string, signal: string, secretToken: string): Promise<string>;
    setBinanceCredentials(apiKey: string, apiSecret: string): Promise<void>;
    setDefaultOrderQuantity(quantity: string): Promise<void>;
    setKillSwitch(status: boolean): Promise<void>;
    setTestnetMode(mode: boolean): Promise<void>;
    setWebhookSecret(secret: string): Promise<void>;
}
