import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAuditLog(): Promise<Array<AuditLogEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getKillSwitchStatus(): Promise<boolean>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    receiveWebhook(alertId: string, timestamp: string, symbol: string, side: string, signal: string, secretToken: string): Promise<string>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setKillSwitch(status: boolean): Promise<void>;
    setWebhookSecret(secret: string): Promise<void>;
}
