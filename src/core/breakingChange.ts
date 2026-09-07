export type BreakingChangeType =
    | "REMOVED_RESPONSE_FIELD"
    | "CHANGED_RESPONSE_FIELD_TYPE";

export interface BreakingChange {
    type: BreakingChangeType;
    method: string;
    path: string;
    field: string;
    oldType: string;
    newType?: string;
}
