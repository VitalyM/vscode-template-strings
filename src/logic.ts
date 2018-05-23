'use strict';
import * as vscode from 'vscode';
import * as ts from 'typescript';

export async function process(editor: vscode.TextEditor | undefined): Promise<void> {
    if (!editor || !editor.selection.isEmpty) {
        return;
    }

    const source = ts.createSourceFile(editor.document.fileName, editor.document.getText(), ts.ScriptTarget.Latest, true);
    let token = (ts as any).getTokenAtPosition(source, editor.document.offsetAt(editor.selection.active));
    switch (token.kind) {
        case ts.SyntaxKind.TemplateHead:
        case ts.SyntaxKind.TemplateMiddle:
        case ts.SyntaxKind.TemplateTail:
            const parentTemplate = findParentTemplate(token);
            if (!parentTemplate) {
                return;
            }
            await insertArg(editor, parentTemplate);
            break;
        case ts.SyntaxKind.TemplateExpression:
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
        case ts.SyntaxKind.TemplateSpan:
        case ts.SyntaxKind.StringLiteral:
            await insertArg(editor, token);
            break;
    }
}

function findParentTemplate(token: any): any {
    let parent = token.parent;
    while (parent && parent.kind !== ts.SyntaxKind.TemplateExpression && parent.kind !== ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
        parent = parent.parent;
    }

    return parent;
}

async function insertArg(editor: vscode.TextEditor, token: any): Promise<void> {
    let moveAddition = 0;
    let edited = await editor.edit(edit => {
        moveAddition = addArg(edit, editor, token);
    });

    // argument wasn't inserted
    if (moveAddition === 0) {
        return;
    }

    if (!edited) {
        throw new Error('Cannot insert arg. Editing not allowed.');
    }

    const position = editor.selection.active;
    const newPosition = new vscode.Position(position.line, position.character + moveAddition);
    editor.selection = new vscode.Selection(newPosition, newPosition);
}

const backtick = '`';

function addArg(edit: vscode.TextEditorEdit, editor: vscode.TextEditor, token: any): number {
    const arg = '${}';

    const doc = editor.document;

    const positionStart = doc.positionAt(token.pos);
    const rangeToCurrentPos = new vscode.Range(positionStart, editor.selection.active);
    const textToCurrentPos = doc.getText(rangeToCurrentPos);

    const positionEnd = doc.positionAt(token.end);
    const rangeAfterCurrentPos = new vscode.Range(editor.selection.active, positionEnd);
    const textAfterCurrentPos = doc.getText(rangeAfterCurrentPos);

    const actualQuoteMark = textAfterCurrentPos.slice(-1);

    // need to check the case when curson is before opening quote (or backtick)
    if (textToCurrentPos.indexOf(actualQuoteMark) < 0) {
        return 0;
    }

    if (actualQuoteMark === backtick) {
        edit.insert(editor.selection.active, arg);
        // current position is moved to the length of 3 forward.
        // so, need to move cursor back 1 item.
        return -1;
    }

    const firstQuoteMark = textToCurrentPos.indexOf(actualQuoteMark);
    if (firstQuoteMark < 0) {
        return 0;
    }

    const newTextToCurrentPos =
        escape(textToCurrentPos.substring(0, firstQuoteMark)) + backtick + escape(textToCurrentPos.substring(firstQuoteMark + 1));
    const newTextAfterCurrentPos = escape(textAfterCurrentPos.substring(0, textAfterCurrentPos.length - 1)) + backtick;
    const newText = newTextToCurrentPos + arg + newTextAfterCurrentPos;

    const range = new vscode.Range(positionStart, positionEnd);
    edit.replace(range, newText);
    // when text is replaced, then cursor stays in its current position.
    // so, need to move it forward number of escaped '`' plus length of '${'
    return (textToCurrentPos.match(/`/g) || []).length + 2;
}

function escape(input: string) {
    return input.replace(new RegExp(backtick, 'g'), '\\' + backtick);
}
