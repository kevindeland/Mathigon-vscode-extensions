import * as vscode from 'vscode';

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
      console.log(element);
      return [];
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
      // console.log(vscode.window.activeTextEditor.document.uri.scheme);
      if (vscode.window.activeTextEditor.document.uri.scheme === 'file') {
        // console.log(vscode.window.activeTextEditor.document.fileName);
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

  private parseHeaders() {
    this.headers = [];

    this.editor = vscode.window.activeTextEditor;
    if (this.editor && this.editor.document) {
      this.doc = this.editor.document
    }

    let currentLine: string;
    if (!this.doc) return;
    for (let i=0; i < this.doc.lineCount; i++) {
      currentLine = this.doc.lineAt(i).text;
      const headerBegin = '## ';
      if(currentLine.startsWith(headerBegin)) {
        const treeItem: TopLevelHeader = new TopLevelHeader(
          currentLine.substring(headerBegin.length),
          new vscode.Position(i, 0));
        treeItem.command = {
          command: 'extension.navigateToContent',
          title: '',
          arguments: [new vscode.Position(i, 0)]
        }
        this.headers.push(treeItem);
      }

    }

  }

}

export class ContentItem extends vscode.TreeItem {

  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(label, collapsibleState);
  }
}

export class TopLevelHeader extends ContentItem {

  constructor(
    public readonly label: string,
    private position: vscode.Position,
  ) {
    super(label, vscode.TreeItemCollapsibleState.None)
  }
}