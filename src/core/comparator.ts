import { ApiContract } from "./apiContract";
import {
    BreakingChange,
    BreakingChangeType
} from "./breakingChange";

export function compareContracts(
    oldContract: ApiContract,
    newContract: ApiContract
): BreakingChange[] {

    const changes: BreakingChange[] = [];

    if (
        !oldContract.response ||
        !newContract.response
    ) {
        return changes;
    }

    const newFields = new Map(
        newContract.response.fields.map(field => [
            field.name,
            field.type
        ])
    );

    for (const oldField of oldContract.response.fields) {

        const newType = newFields.get(oldField.name);

        if (newType === undefined) {

            changes.push({
                type: "REMOVED_RESPONSE_FIELD",
                method: newContract.method,
                path: newContract.path,
                field: oldField.name,
                oldType: oldField.type
            });

            continue;
        }

        if (oldField.type !== newType) {

            changes.push({
                type: "CHANGED_RESPONSE_FIELD_TYPE",
                method: newContract.method,
                path: newContract.path,
                field: oldField.name,
                oldType: oldField.type,
                newType
            });
        }
    }

    return changes;
}