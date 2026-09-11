import * as vscode from "vscode";

import { ApiContract } from "../core/apiContract";
import { BreakingChange } from "../core/breakingChange";

export function createDiagnostics(
    changes: BreakingChange[],
    contracts: ApiContract[]
): Map<string, vscode.Diagnostic[]> {

    const diagnostics = new Map<string, vscode.Diagnostic[]>();

    for (const change of changes) {

        const contract = findContractForChange(
            change,
            contracts
        );

        if (!contract) {
            continue;
        }

        const line = Math.max(
            contract.line - 1,
            0
        );

        const range = new vscode.Range(
            line,
            0,
            line,
            Number.MAX_SAFE_INTEGER
        );

        const diagnostic = new vscode.Diagnostic(
            range,
            getDiagnosticMessage(change),
            vscode.DiagnosticSeverity.Error
        );

        diagnostic.source = "API Contract Guardian";

        const fileDiagnostics =
            diagnostics.get(contract.file) ?? [];

        fileDiagnostics.push(diagnostic);

        diagnostics.set(
            contract.file,
            fileDiagnostics
        );
    }

    return diagnostics;
}

function findContractForChange(
    change: BreakingChange,
    contracts: ApiContract[]
): ApiContract | undefined {

    return contracts.find(contract =>
        contract.method === change.method &&
        contract.path === change.path
    );
}

function getDiagnosticMessage(
    change: BreakingChange
): string {

    switch (change.type) {

        case "REMOVED_ENDPOINT":
            return (
                `API endpoint removed: ` +
                `${change.method} ${change.path}`
            );

        case "REMOVED_RESPONSE_FIELD":
            return (
                `Response field removed: ` +
                `${change.field}`
            );

        case "CHANGED_RESPONSE_FIELD_TYPE":
            return (
                `Response field type changed: ` +
                `${change.field} ` +
                `(${change.oldType} → ${change.newType})`
            );
    }
}