import { ConsumerReference } from "./consumer";

export interface ConsumerParser {
    supports(filePath: string): boolean;

    findConsumers(
        sourceCode: string,
        filePath: string,
        breakingChanges: {
            method: string;
            path: string;
            field?: string;
        }[]
    ): ConsumerReference[];
}