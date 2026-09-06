export type HttpMethod =
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE";

export interface ApiContract {
    method: HttpMethod;
    path: string;
    file: string;
    line: number;
}