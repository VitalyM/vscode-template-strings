import * as vscode from 'vscode';
import * as fs from 'fs';
import * as promisify from 'util.promisify';
import { process } from '../logic';
import * as path from 'path';

const positionStart = '_s_';
// const positionEnd = '_e_';

export async function prepareTestInput(editor: vscode.TextEditor): Promise<number> {
    const doc = editor.document;
    const text = doc.getText();
    const startIndex = text.indexOf(positionStart);
    if (startIndex < 0) {
        throw new Error('Input has no start marker');
    }

    const start = doc.positionAt(startIndex);
    const end = doc.positionAt(startIndex + 3);
    const range = new vscode.Range(start, end);
    const ok = await editor.edit(edit => {
        edit.replace(range, '');
    });

    if (!ok) {
        throw new Error('cannot prepare input. edit failed.');
    }

    editor.selection = new vscode.Selection(start, start);
    return startIndex;
}

const readFile = promisify(fs.readFile);

export async function compareInAndOut(inFile: vscode.TextEditor, expectedOffset: number, compareWith: string): Promise<void> {
    const actualPosition = inFile.document.offsetAt(inFile.selection.active);
    if (actualPosition !== expectedOffset) {
        throw new Error(`Expected ${expectedOffset} position. Got ${actualPosition}`);
    }

    const inText = inFile.document.getText();
    if (inText !== compareWith) {
        throw new Error(`Expected:

${compareWith}.

Got:

${inText}


`);
    }
}

function testfilePath(file: string) {
    return  path.join(__dirname, '..', '..', 'src/test/test-input', file);
}

export async function testCase(inFile: string, outFile?: string): Promise<void> {
    const inFilePath = testfilePath(inFile);
    const document = await vscode.workspace.openTextDocument(inFilePath);
    const textEditor = await vscode.window.showTextDocument(document);
    const startMarkerOffset = await prepareTestInput(textEditor);
    const compareWith = outFile
        ? (await readFile(testfilePath(outFile))).toString()
        : textEditor.document.getText();
    // need to add 2 as a length of '${'
    const expectedActualPositionOffset = outFile ? startMarkerOffset + 2 : startMarkerOffset;
    await process(textEditor);
    await compareInAndOut(textEditor, expectedActualPositionOffset, compareWith);
    vscode.commands.executeCommand('workbench.action.closeActiveEditor');
}
