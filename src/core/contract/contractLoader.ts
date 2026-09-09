import { ApiContract } from "../apiContract";
import { LanguageParser } from "../parser";
import { GitService } from "../git/gitService";

export class ContractLoader {

    constructor(
        private readonly gitService: GitService,
        private readonly parsers: LanguageParser[]
    ) {}

    loadFromRevision(
        filePaths: string[],
        revision: string
    ): ApiContract[] {

        const contracts: ApiContract[] = [];

        for (const filePath of filePaths) {

            const parser = this.parsers.find(
                candidate => candidate.supports(filePath)
            );

            if (!parser) {
                continue;
            }

            const sourceCode =
                this.gitService.getFileAtRevision(
                    filePath,
                    revision
                );

            contracts.push(
                ...parser.parse(
                    sourceCode,
                    filePath
                )
            );
        }

        return contracts;
    }
}