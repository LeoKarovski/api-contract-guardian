import * as vscode from "vscode";
import { logger } from "./logger";

export function activate(context: vscode.ExtensionContext) {
    logger.info("API Contract Guardian activated");

    const disposable = vscode.commands.registerCommand(
        "api-contract-guardian.helloWorld",
        () => {
            logger.info("Hello World command executed");

            vscode.window.showInformationMessage(
                "Hello World from API Contract Guardian!"
            );
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {
    logger.info("API Contract Guardian deactivated");
}