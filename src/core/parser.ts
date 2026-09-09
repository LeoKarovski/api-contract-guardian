import { ApiContract } from "./apiContract";

export interface LanguageParser {
    supports(filePath: string): boolean;

    parse(
        sourceCode: string,
        filePath: string
    ): ApiContract[];
}