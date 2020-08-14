import * as vscode from 'vscode';


const SEARCH = {
  contentId: '> id: ',
}

/**
 * Given a document and a line, give the id of the containing section.
 * @param doc content.md document
 * @param line current line.
 */
export function findContentSectionId(doc: vscode.TextDocument, line: number): string {

  let found = false;
  while (!found && line > -1) {
    const currentLine = doc.lineAt(line).text;
    if (currentLine.includes(SEARCH.contentId)) {
      return currentLine.substr(currentLine.indexOf(SEARCH.contentId)+SEARCH.contentId.length);
    }
    line--;
  }
  return '';
}

/**
 * When in functions.ts, find the id of the containing function (actually the next highest line).
 *
 * @param doc
 * @param line
 */
export function findFunctionsSectionId(doc: vscode.TextDocument, line: number): string {

  const s2: RegExp = /^export (?:async )?function ([a-zA-Z][a-zA-Z0-9_]*?)\((.*)\: Step\)/;

  while (line > -1) {
    const currentLine = doc.lineAt(line).text;
    let arr = s2.exec(currentLine);
    if(arr) {
      console.log(arr);
      return arr[1];
    }
    line--;
  }

  throw Error('No ID found.');
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

/**
 * Look for an ID in the content.md file, return its Range.
 *
 * @param doc
 * @param id
 */
export function findIdRangeInContent(doc: vscode.TextDocument, id: string): vscode.Range {

  const searchText: RegExp = new RegExp(`${SEARCH.contentId}\s*(${id})`);
  console.log(searchText);

  let lineNum = 0, currentLine, find;
  while (lineNum < doc.lineCount) {
    currentLine = doc.lineAt(lineNum).text;

    if (find = searchText.exec(currentLine)) {
      console.log(`Found id ${find[1]} at line ${lineNum}`);

      return new vscode.Range(lineNum, 0, lineNum, 0);
    }

    lineNum++;
  }

  throw Error('ID not found in Content.md');
}