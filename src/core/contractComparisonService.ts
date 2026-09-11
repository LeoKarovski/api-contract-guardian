import { compareApiContracts } from "./apiComparator";
import { ContractLoader } from "./contract/contractLoader";
import { GitService } from "./git/gitService";
import { getChangedFiles } from "./git/changedFiles";
import { LanguageParser } from "./parser";

export class ContractComparisonService {

    constructor(
        private readonly repositoryPath: string,
        private readonly parsers: LanguageParser[]
    ) {}

    compare(
        oldRevision: string,
        newRevision: string
    ) {

        const changes = getChangedFiles(
            oldRevision,
            newRevision,
            this.repositoryPath
        );

        const loader = new ContractLoader(
            new GitService(this.repositoryPath),
            this.parsers
        );

        const oldContracts =
            loader.loadFromRevision(
                changes
                    .filter(change =>
                        change.type !== "ADDED"
                    )
                    .map(change => change.path),
                oldRevision
            );

        const newContracts =
            loader.loadFromFiles(
                changes
                    .filter(change =>
                        change.type !== "DELETED"
                    )
                    .map(change => change.path),
                this.repositoryPath
            );

        return {
            changes,
            oldContracts,
            newContracts,
            breakingChanges: compareApiContracts(
                oldContracts,
                newContracts
            )
        };
    }
}