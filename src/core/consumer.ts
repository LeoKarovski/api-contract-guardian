export interface ConsumerReference {
    file: string;
    line: number;
    field: string;
    method?: string;
    path?: string;
}