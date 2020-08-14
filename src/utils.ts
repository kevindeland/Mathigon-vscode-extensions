import * as vscode from 'vscode';

/**
 * Given a document and a line, give the id of the containing section.
 * @param doc content.md document
 * @param line current line.
 */
export function findContentSectionId(doc: vscode.TextDocument, line: number): string {

  // CLEAN: put this in a CONST or something.
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

/**
 * Convert Step ID from its Markdown syntax to Typescript.
 * Markdown: like-this
 * Typscript: likeThis
 * 
 * @param id
 */
function idMarkdownToTypescript(id: string): string {
  
  let toCamelCase = "";
  
  // easier way? Only find instances of '-' (but it's gonna iterate anyways)
  let nextUpper = false;
  for (let i=0; i < id.length; i++) {
    if (id.charAt(i) === '-') {
      nextUpper = true;
    } else {
      toCamelCase += nextUpper ? id.charAt(i).toUpperCase() : id.charAt(i);
      nextUpper = false;
    }
  }

  return toCamelCase;
}

/**
 * Given a document for functions.ts, find the location of id and return its Range.
 *
 * @param doc functions.ts document
 * @param id section id.
 */
export function findIdLocationInFunctions(doc: vscode.TextDocument, id: string): vscode.Location {

  const idTs = idMarkdownToTypescript(id);

  const searchText = "export function " + idTs;

  // iterate til you find the right line.
  // TODO: need exception for when there's no function.
  let lineNum = 0;
  while (lineNum < doc.lineCount) {

    const currentLine = doc.lineAt(lineNum).text;
    if (currentLine.includes(searchText)) {

      // TODO: should also handle "export async function" (or just function).
      // TODO: beware of functions with same beginnings e.g. pythagoras and pythagorasProof
      const beginLine = "export function ".length;;
      const endLine = beginLine + idTs.length;
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
export function findIdRangeInFunctions(doc: vscode.TextDocument, id: string): vscode.Range {

  // first convert from this-convention to thisConvention.
  const idTs = idMarkdownToTypescript(id);

  const searchText = "export function " + idTs;

  // iterate til you find the right line.
  // TODO: need exception for when there's no function.
  let lineNum = 0;
  while (lineNum < doc.lineCount) {

    const currentLine = doc.lineAt(lineNum).text;
    if (currentLine.includes(searchText)) {

      // TODO: should also handle "export async function" (or just function).
      // TODO: beware of functions with same beginnings e.g. pythagoras and pythagorasProof
      const beginLine = "export function ".length;;
      const endLine = beginLine + idTs.length;
      return new vscode.Range(lineNum,beginLine,lineNum,endLine);
    }
    lineNum++;
  }

  throw Error('Not found');
}