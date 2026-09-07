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
    response?: ResponseContract;
}

export interface ResponseField {
    name: string;
    type: string;
}

export interface ResponseContract {
    fields: ResponseField[];
}