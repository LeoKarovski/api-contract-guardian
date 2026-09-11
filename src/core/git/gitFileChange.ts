export type GitFileChangeType =
    | "ADDED"
    | "MODIFIED"
    | "DELETED";

export interface GitFileChange {
    path: string;
    type: GitFileChangeType;
}