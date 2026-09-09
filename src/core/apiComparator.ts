import { ApiContract } from "./apiContract";
import { BreakingChange } from "./breakingChange";
import { compareContracts } from "./comparator";

export function compareApiContracts(
    oldContracts: ApiContract[],
    newContracts: ApiContract[]
): BreakingChange[] {

    const changes: BreakingChange[] = [];

    const newContractMap = new Map(
        newContracts.map(contract => [
            `${contract.method} ${contract.path}`,
            contract
        ])
    );

    for (const oldContract of oldContracts) {

        const key = `${oldContract.method} ${oldContract.path}`;

        const newContract = newContractMap.get(key);

        if (!newContract) {

            changes.push({
                type: "REMOVED_ENDPOINT",
                method: oldContract.method,
                path: oldContract.path
            });

            continue;
        }

        changes.push(
            ...compareContracts(oldContract, newContract)
        );
    }

    return changes;
}