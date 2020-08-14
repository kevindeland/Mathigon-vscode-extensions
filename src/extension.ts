
import * as vscode from 'vscode';

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
	 * Given a document and a line, give the id of the containing section.
	 * @param doc content.md document
	 * @param line current line.
	 */
	function findContentSectionId(doc: vscode.TextDocument, line: number): string {

		const searchText = "> id: ";

		let found = false;
		while (!found && line > -1) {
			const currentLine = doc.lineAt(line).text;
			if (currentLine.includes(searchText)) {
				return currentLine.substr(currentLine.indexOf(searchText)+searchText.length);
			}
			line--;
		}
		return '';
	}

	function findIdLocationInFunctions(doc: vscode.TextDocument, id: string): vscode.Location {

		// first convert from this-convention to thisConvention.
		let toCamelCase = "";
		// easier way: only find instances of '-' (but it's gonna iterate anyways)
		let nextUpper = false;
		for (let i=0; i < id.length; i++) {
			if (id.charAt(i) === '-') {
				nextUpper = true;
			} else {
				toCamelCase += nextUpper ? id.charAt(i).toUpperCase() : id.charAt(i);
				nextUpper = false;
			}
		}

		const searchText = "export function " + toCamelCase;

		// iterate til you find the right line.
		// TODO: need exception for when there's no function.
		let lineNum = 0;
		while (lineNum < doc.lineCount) {

			const currentLine = doc.lineAt(lineNum).text;
			if (currentLine.includes(searchText)) {

				// TODO: should also handle "export async function" (or just function).
				// TODO: beware of functions with same beginnings e.g. pythagoras and pythagorasProof
				const beginLine = "export function ".length;;
				const endLine = beginLine + toCamelCase.length;
				return new vscode.Location(doc.uri, new vscode.Range(lineNum, beginLine, lineNum, endLine));
			}
			lineNum++;
		}
		throw Error('Not found');
	}

	/**
	 * Given a document for functions.ts, find the location of id and return its Range.
	 *
	 * @param doc functions.ts document
	 * @param id section id.
	 */
	function findIdRangeInFunctions(doc: vscode.TextDocument, id: string): vscode.Range {

		// first convert from this-convention to thisConvention.
		let toCamelCase = "";
		// easier way: only find instances of '-' (but it's gonna iterate anyways)
		let nextUpper = false;
		for (let i=0; i < id.length; i++) {
			if (id.charAt(i) === '-') {
				nextUpper = true;
			} else {
				toCamelCase += nextUpper ? id.charAt(i).toUpperCase() : id.charAt(i);
				nextUpper = false;
			}
		}

		const searchText = "export function " + toCamelCase;

		// iterate til you find the right line.
		// TODO: need exception for when there's no function.
		let lineNum = 0;
		while (lineNum < doc.lineCount) {

			const currentLine = doc.lineAt(lineNum).text;
			if (currentLine.includes(searchText)) {

				// TODO: should also handle "export async function" (or just function).
				// TODO: beware of functions with same beginnings e.g. pythagoras and pythagorasProof
				const beginLine = "export function ".length;;
				const endLine = beginLine + toCamelCase.length;
				return new vscode.Range(lineNum,beginLine,lineNum,endLine);
			}
			lineNum++;
		}

		throw Error('Not found');
	}


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
		console.log(`found id: ${id}`);

		vscode.window.showInformationMessage(`${currentLine}`);

		if (filename?.toString() === 'content.md') {
			vscode.window.showInformationMessage(`${filename}`);

			vscode.workspace.openTextDocument(filepath.concat('/functions.ts')).then(doc => {
				const options = {selection: findIdRangeInFunctions(doc, id)};
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
