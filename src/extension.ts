'use strict';
import * as vscode from 'vscode';
import { process } from './logic';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('template-strings.insertArg', async () => {
        const editor = vscode.window.activeTextEditor;
        await process(editor);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
