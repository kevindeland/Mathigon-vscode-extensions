import * as vscode from 'vscode';

import { findContentSectionId, findIdLocationInFunctions, findIdRangeInFunctions } from './utils';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('helloworld.helloWorld', () => {
		vscode.window.showInformationMessage('Hello VS Code!');
	});

	let disp2 = vscode.commands.registerCommand('helloworld.printVars', () => {

		console.log('printing vars');
		let vary = 'null';

		const editor = vscode.window.activeTextEditor;
		const document = editor?.document;
		vary = document?.languageId!;

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

	/**
	 * Switch between content.md to functions.ts, and jump to complementary location in code.
	 * If in content.md, looks for containing `id` and goes to function with the same name.
	 * If in functions.ts, looks for containing exported `function` and goes to markdown section with same name.
	 */
	let filename = vscode.commands.registerCommand('helloworld.filename', () => {
		const editor = vscode.window.activeTextEditor;

		const uri = editor?.document.uri;
		const document = editor?.document!;
		const fullFilePath = document?.fileName;
		
		let array = fullFilePath?.split('/')!;
		const filename = array.pop();

		const filepath = array.join('/');

		const currentLine = vscode.window.activeTextEditor?.selection.active.line!;
		const id = findContentSectionId(document, currentLine);
		// console.log(`found id: ${id}`);

		if (filename?.toString() === 'content.md') {
			// POPUP: Informational message
			// vscode.window.showInformationMessage(`${filename}`);

			vscode.workspace.openTextDocument(filepath.concat('/functions.ts')).then(doc => {
				const options = {selection: findIdRangeInFunctions(doc, id)};
				vscode.window.showTextDocument(doc, options);
			});
		} else if (filename?.toString() === 'functions.ts') {
			// POPUP: More informative
			vscode.window.showInformationMessage(`${filename}`);

			vscode.workspace.openTextDocument(filepath.concat('/content.md')).then(doc => {
				vscode.window.showTextDocument(doc);
			});
		} else {
			vscode.window.showWarningMessage(`${filename} is not the correct file type.`);
		}
		

	});

	let defProvider = vscode.languages.registerDefinitionProvider('markdown', {

		provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {

			const fullFilePath = document?.fileName;

			let array = fullFilePath?.split('/')!;
			const filename = array.pop();

			const filepath = array.join('/');

			const currentLine = vscode.window.activeTextEditor?.selection.active.line!;

			vscode.window.showInformationMessage(`${currentLine}`);

			const lineText = document.lineAt(position.line).text;
			const searchText = '> id: ';

			console.log('Inside of the definition provider');

			// CLEAN: would be better to use regex, I suppose
			if (lineText.startsWith(searchText)) {
				const id =  lineText.substr(lineText.indexOf(searchText)+searchText.length);
				console.log(`found an id ${id}`);

				let resultX;
				return vscode.workspace.openTextDocument(filepath.concat('/functions.ts')).then(doc => {
					console.log('opened new document');
					resultX = findIdLocationInFunctions(doc, id);
					console.log(`inside: ${resultX}`);
					return resultX;
				});

				console.log(`outside: ${resultX}`);
			}
		}

	});

	vscode.languages.registerHoverProvider('typescript', {
		provideHover(doc: vscode.TextDocument) {
			return new vscode.Hover(`Mission Accomplished`);
		}
	})

	context.subscriptions.push(reverser, disposable, disp2, filename, defProvider);
}
export function deactivate() {}
