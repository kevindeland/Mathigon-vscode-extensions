
import * as vscode from 'vscode';
import { resolveCliPathFromVSCodeExecutablePath } from 'vscode-test';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('helloworld.helloWorld', () => {
		vscode.window.showInformationMessage('Hello VS Code!');
	});

	let disp2 = vscode.commands.registerCommand('helloworld.printVars', () => {

		const vary = 'null';

		vscode.workspace.openTextDocument();
		vscode.window.showInformationMessage(`${vary}`);

	});

	let reverser = vscode.commands.registerCommand('helloworld.reverse', () => {
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const document = editor.document;
			const selection = editor.selection;
			
			const word = document.getText(selection);
			const reversed = word.split('').reverse().join('');
			editor.edit(editBuilder => {
				editBuilder.replace(selection, reversed);
			});
		}
	});

	let filename = vscode.commands.registerCommand('helloworld.filename', () => {
		const editor = vscode.window.activeTextEditor;

		const uri = editor?.document.uri;
		const document = editor?.document;
		const fullFilePath = document?.fileName;
		
		let array = fullFilePath?.split('/')!;
		const filename = array.pop();

		const filepath = array.join('/');

		const currentLine = vscode.window.activeTextEditor?.selection.active.line;
		vscode.window.showInformationMessage(`${currentLine}`);

		if (filename?.toString() === 'content.md') {
			vscode.window.showInformationMessage(`${filename}`);

			vscode.workspace.openTextDocument(filepath.concat('/functions.ts')).then(doc => {
				const options = {selection: new vscode.Range(3,0,5,0)};
				vscode.window.showTextDocument(doc, options);
			});
		} else if (filename?.toString() === 'functions.ts') {
			vscode.window.showInformationMessage(`${filename}`);

			vscode.workspace.openTextDocument(filepath.concat('/content.md')).then(doc => {
				vscode.window.showTextDocument(doc);
			});
		} else {
			vscode.window.showWarningMessage(`${filename} is not the correct file type.`);
		}
		

	});

	context.subscriptions.push(reverser, disposable, disp2, filename);
}
export function deactivate() {}
