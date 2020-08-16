import * as vscode from 'vscode';

import { findFunctionsSectionId, findContentSectionId,
	findIdRangeInFunctions, findIdRangeInContent,
	findYamlDefRange } from './utils';

export function activate(context: vscode.ExtensionContext) {

	/**
	 * Switch between content.md to functions.ts, and jump to complementary location in code.
	 * If in content.md, looks for containing `id` and goes to function with the same name.
	 * If in functions.ts, looks for containing exported `function` and goes to markdown section with same name.
	 */
	let filename = vscode.commands.registerCommand('helloworld.stepFinder', () => {
		const editor = vscode.window.activeTextEditor;

		const document = editor?.document!;
		const fullFilePath = document?.fileName;
		
		let path = fullFilePath?.split('/')!;
		const filename = path.pop();

		const filepath = path.join('/');

		const currentLine = vscode.window.activeTextEditor?.selection.active.line!;

		if (filename?.toString() === 'content.md') {
			vscode.window.showInformationMessage('Switching from content.md to functions.ts');

			const id = findContentSectionId(document, currentLine);

			vscode.workspace.openTextDocument(filepath.concat('/functions.ts')).then(doc => {
				const options = {selection: findIdRangeInFunctions(doc, id)};
				vscode.window.showTextDocument(doc, options);
			});


		} else if (filename?.toString() === 'functions.ts') {
			vscode.window.showInformationMessage('Switching from functions.ts to content.md');

			const id = findFunctionsSectionId(document, currentLine);

			vscode.workspace.openTextDocument(filepath.concat('/content.md')).then(doc => {
				const options = {selection: findIdRangeInContent(doc, id)};
				vscode.window.showTextDocument(doc, options);
			});


		} else {
			vscode.window.showWarningMessage(`${filename} is not the correct file type.`);
		}
		

	});

	/**
	 * Register a Definition for IDs used in content.md
	 */
	let markdownDef = vscode.languages.registerDefinitionProvider('markdown', {

		provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {

			const fullFilePath = document?.fileName;

			let path = fullFilePath?.split('/')!;
			path.pop();
			const filepath = path.join('/');

			const lineText = document.lineAt(position.line).text;
			const searchText = '> id: ';

			// CLEAN: would be better to use regex, I suppose
			if (lineText.startsWith(searchText)) {
				const id =  lineText.substr(lineText.indexOf(searchText)+searchText.length);
				console.log(`found an id ${id}`);

				return vscode.workspace.openTextDocument(filepath.concat('/functions.ts')).then(doc => {
					const range = findIdRangeInFunctions(doc, id);
					return new vscode.Location(doc.uri, range);
				});
			}
		}

	});

	/**
	 * Register a definition for IDs used in functions.ts
	 */
	let typescriptDef = vscode.languages.registerDefinitionProvider('typescript', {

		provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {
			console.log('In def provider for TS');

			const fullFilePath = document?.fileName;
			let path = fullFilePath?.split('/')!;
			path.pop();
			const filepath = path.join('/');
			const targetFile = filepath.concat('/content.md');

			const currentLine = vscode.window.activeTextEditor?.selection.active.line;
			const lineText = document.lineAt(position.line).text;

			const s2: RegExp = /^export (?:async )?function ([a-zA-Z][a-zA-Z0-9_]*?)\((.*)\: Step\)/;

			let arr = s2.exec(lineText);
			if (arr) {
				const id = arr[1];
				console.log(`found an id ${id}`);

				return vscode.workspace.openTextDocument(targetFile).then(doc => {
					const range = findIdRangeInContent(doc, id);
					return new vscode.Location(doc.uri, range);
				});
			}
		}
	});

	let glossDef = vscode.languages.registerDefinitionProvider('markdown', {

		provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {

			const fullFilePath = document?.fileName;

			let path = fullFilePath?.split('/')!;
			path.pop(); // pop content.md
			path.pop(); // pop course folder

			let filepath = path.join('/');

			// looks for lowercases and dashes
			const glossSyntax = new RegExp(`\(gloss:([a-z\-]+)\)`);
			const bioSyntax = new RegExp(`\(bio:([a-z\-]+)\)`);

			// okay so the current character has to be within the term for gloss.
			// Gotta look behind and also look ahead...

			const line = document.lineAt(position.line).text;
			// console.log(`CHAR: ${line.charAt(position.character)}`);

			// TODO: refactor into a single function that takes a filename
			let find;
			if (find = glossSyntax.exec(line)) {
				// i don't know why it's capturing gloss:term
				const id = find[2];
				// console.log(`Found glossary term ${id}`);
				// console.log(find);

				const firstChar = line.indexOf(find[0]);
				const lastChar = firstChar + find[0].length;
				if (
					firstChar > position.character ||
					lastChar <= position.character
				) {
					return;
				}

				filepath = filepath.concat('/shared/glossary.yaml');
				// console.log(filepath);
				return vscode.workspace.openTextDocument(filepath).then(doc => {

					const glossaryRange = findYamlDefRange(doc, id);
					return new vscode.Location(doc.uri, glossaryRange);
				});
			}

			if (find = bioSyntax.exec(line)) {
				const id = find[2];

				const firstChar = line.indexOf(find[0]);
				const lastChar = firstChar + find[0].length;
				if (
					firstChar > position.character ||
					lastChar <= position.character
				) {
					return;
				}

				filepath = filepath.concat('/shared/bios.yaml');
				// console.log(filepath);
				return vscode.workspace.openTextDocument(filepath).then(doc => {

					const bioRange = findYamlDefRange(doc, id);
					return new vscode.Location(doc.uri, bioRange);
				});
			}
		}

	});


	vscode.languages.registerHoverProvider('typescript', {
		provideHover(doc: vscode.TextDocument) {
			return new vscode.Hover(`Mission Accomplished`);
		}
	})

	context.subscriptions.push(filename, markdownDef, typescriptDef, glossDef);
}
export function deactivate() {}
