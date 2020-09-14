import * as vscode from 'vscode';
import * as path from 'path';

export class ContentTreeProvider implements vscode.TreeDataProvider<ContentItem> {

  private doc: vscode.TextDocument | undefined;
  private editor: vscode.TextEditor | undefined;
  private headers: TopLevelHeader[] | undefined;

  private _onDidChangeTreeData: vscode.EventEmitter<null> = new vscode.EventEmitter();
  readonly onDidChangeTreeData: vscode.Event<null> = this._onDidChangeTreeData.event;

  constructor(private context: vscode.ExtensionContext) {
    vscode.window.onDidChangeActiveTextEditor(() => this.onActiveEditorChanged())
    vscode.workspace.onDidChangeTextDocument(e => this.onDocumentChanged(e));

    this.parseHeaders();

    this.onActiveEditorChanged();
  }

  refresh(): void {
    this.parseHeaders();
    this._onDidChangeTreeData.fire(null);
  }
  
  getTreeItem(element: ContentItem): vscode.TreeItem {
    return element;
  }
  getChildren(element?: any): vscode.ProviderResult<any[]> {
    if (element) {
      // If it's a TopLevelHeader, it will have childSteps (not sure if best practice for TypeScript)
      if (element.childSteps) {
        return element.childSteps;
      }
      else {
        return [];
      }
    } else {
      return this.headers;
    }
  }

  select(position: vscode.Position) {
    this.editor!.selection = new vscode.Selection(position, position);
    // can try fiddling with different RevealTypes. If it's a header, I think AtTop is best
    this.editor!.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.AtTop);
  }

  private onActiveEditorChanged(): void {

    if (vscode.window.activeTextEditor) {
      if (vscode.window.activeTextEditor.document.uri.scheme === 'file') {
        const enabled =  vscode.window.activeTextEditor.document.fileName.endsWith('content.md');
        vscode.commands.executeCommand('setContext', 'contentExplorerEnabled', enabled);
        if (enabled) {
          this.refresh();
        }
      }
    }
  }

  private onDocumentChanged(changeEvent: vscode.TextDocumentChangeEvent): void {
    // TODO: complete
  }

  private getIcon(label: string): any {
    switch (label) {
      case 'header':
        return {
          light: this.context.asAbsolutePath(path.join('icons', 'light', 'header.svg')),
          dark:  this.context.asAbsolutePath(path.join('icons', 'dark', 'header.svg'))
        }
      case 'step':
        return {
          light: this.context.asAbsolutePath(path.join('icons', 'light', 'step.svg')),
          dark:  this.context.asAbsolutePath(path.join('icons', 'dark', 'step.svg'))
        }
    }
  }

  private parseHeaders() {
    this.headers = [];

    this.editor = vscode.window.activeTextEditor;
    if (this.editor && this.editor.document) {
      this.doc = this.editor.document
    }

    if (!this.doc) return;

    let currentLine: string;
    let currentHeader: TopLevelHeader | undefined = undefined;

    for (let i=0; i < this.doc.lineCount; i++) {
      currentLine = this.doc.lineAt(i).text;
      const headerBegin = '## ';
      const stepIdBegin = '> id: ';
      if(currentLine.startsWith(headerBegin)) {
        const treeItem: TopLevelHeader = new TopLevelHeader(
          currentLine.substring(headerBegin.length),
          new vscode.Position(i, 0));
        treeItem.command = {
          command: 'extension.navigateToContent',
          title: '',
          arguments: [new vscode.Position(i, 0)]
        }
        treeItem.iconPath = this.getIcon('header');

        currentHeader = treeItem;
        this.headers.push(treeItem);
      } else if (currentLine.startsWith(stepIdBegin)) {
        const step = new StepId(
          currentLine.substring(stepIdBegin.length),
          new vscode.Position(i, 0)
        )
        step.command = {
          command: 'extension.navigateToContent',
          title: '',
          arguments: [new vscode.Position(i, 0)]
        }
        step.iconPath = this.getIcon('step');

        if (currentHeader) {
          currentHeader.childSteps.push(step);
        }
      }

    }

    // post-process to update Collapsible States
    this.headers.forEach(h => {
      h.collapsibleState = h.childSteps.length > 0 ?
        vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
    })

  }

}

export class ContentItem extends vscode.TreeItem {

  constructor(
    public readonly label: string
  ) {
    super(label);
  }
}

export class TopLevelHeader extends ContentItem {

  public childSteps: StepId[];

  constructor(
    public readonly label: string,
    private position: vscode.Position,
  ) {
    super(label)
    this.childSteps = [];
  }
}

export class StepId extends ContentItem {

  constructor(
    public readonly label: string,
    private position: vscode.Position,
    section?: string | undefined,
    sectionStatus?: string | undefined
  ) {
    super(label)
  }
}