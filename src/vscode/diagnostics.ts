import * as vscode from "vscode";

import { ApiContract } from "../core/apiContract";
import { BreakingChange } from "../core/breakingChange";
import { ConsumerReference } from "../core/consumer";

export function createDiagnostics(
    changes: BreakingChange[],
    contracts: ApiContract[],
    consumers: ConsumerReference[] = []
): Map<string, vscode.Diagnostic[]> {

    const diagnostics =
        new Map<string, vscode.Diagnostic[]>();

    for (const change of changes) {

        const contract =
            findContractForChange(
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

        const diagnostic =
            new vscode.Diagnostic(
                range,
                getDiagnosticMessage(change),
                vscode.DiagnosticSeverity.Error
            );

        diagnostic.source =
            "API Contract Guardian";

        addDiagnostic(
            diagnostics,
            contract.file,
            diagnostic
        );
    }

    for (const consumer of consumers) {

        const line = Math.max(
            consumer.line - 1,
            0
        );

        const range = new vscode.Range(
            line,
            0,
            line,
            Number.MAX_SAFE_INTEGER
        );

        const diagnostic =
            new vscode.Diagnostic(
                range,
                getConsumerDiagnosticMessage(
                    consumer
                ),
                vscode.DiagnosticSeverity.Warning
            );

        diagnostic.source =
            "API Contract Guardian";

        addDiagnostic(
            diagnostics,
            consumer.file,
            diagnostic
        );
    }

    return diagnostics;
}

function addDiagnostic(
    diagnostics: Map<string, vscode.Diagnostic[]>,
    file: string,
    diagnostic: vscode.Diagnostic
): void {

    const fileDiagnostics =
        diagnostics.get(file) ?? [];

    fileDiagnostics.push(diagnostic);

    diagnostics.set(
        file,
        fileDiagnostics
    );
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
                `API endpoint ${change.method} ${change.path} was removed.\n` +
                `This may break clients that depend on this endpoint.`
            );

        case "REMOVED_RESPONSE_FIELD":
            return (
                `Response field "${change.field}" was removed from ${change.method} ${change.path}.\n` +
                `This may break consumers that depend on this field.`
            );

        case "CHANGED_RESPONSE_FIELD_TYPE":
            return (
                `Response field "${change.field}" changed from ${change.oldType} to ${change.newType} in ${change.method} ${change.path}.\n` +
                `This may break consumers expecting the previous type.`
            );
    }
}

function getConsumerDiagnosticMessage(
    consumer: ConsumerReference
): string {

    return (
        `Potentially affected consumer: ` +
        `response field "${consumer.field}" ` +
        `is used for ${consumer.method} ${consumer.path}`
    );
}