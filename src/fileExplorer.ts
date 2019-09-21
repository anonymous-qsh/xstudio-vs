import * as vscode from 'vscode';
import { TreeItem, TreeItemCollapsibleState, Uri } from 'vscode';
import * as fs from "fs";
import { Observable } from "rxjs";
import * as path from "path";

export interface Entry {
    uri: vscode.Uri;
    needInjection: boolean;
}

export class FileEntry extends vscode.TreeItem implements Entry {

    constructor(
        public uri: Uri,
        public needInjection: boolean,
        public readonly command?: vscode.Command,
    ) {
        super(uri, TreeItemCollapsibleState.None);
    }

    private getIcon() {
        return this.needInjection ? 'checkbox-selected.png' : 'checkbox-unselected.png';
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', this.getIcon()),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', this.getIcon())
    };

    contextValue = 'file';
}

export class InjectingFileSingleton {
    public static readonly Instance: InjectingFileSingleton = new InjectingFileSingleton();

    public files = [] as Entry[];

    public clearAllFiles() {
        this.files = [];
    }

    public addFile(entry: Entry) {
        for (let i = 0; i < this.files.length; i++) {
            if (this.files[i].uri.fsPath === entry.uri.fsPath) {
                return;
            }
        }
        this.files.push(entry);
    }

    public removeFile(uri: Uri) {
        this.files = this.files.filter(v => v.uri.fsPath !== uri.fsPath);
    }

    public getContent() {
        return this.files.filter(v => v.needInjection).map(v => v.uri.fsPath);
    }

    public changeSelectStatus(uri: Uri) {
        for (let i = 0; i < this.files.length; i++) {
            if (this.files[i].uri.fsPath === uri.fsPath) {
                this.files[i].needInjection = !this.files[i].needInjection;
            }
        }
    }
}

// # region Utilities.
namespace _ {
    function handleResult<T>(resolve: (result: T) => void, reject: (error: Error) => void, error: Error | null | undefined, result: T): void {
        if (error) {
            console.log(error, 'lq-error');
            // reject(massageError(error));
        } else {
            resolve(result);
        }
    }

    export function readFile(path: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            fs.readFile(path, (error, buffer) => handleResult(resolve, reject, error, buffer));
        });
    }
}

// # endregion

export function readFilesObservable(fileList: string[]): Observable<string[]> {
    let ret: string[] = [];
    let count = 0;
    return new Observable(subscriber => {
        fileList.map((v) => {
            _.readFile(v).then(res => {
                count++;
                ret.push(res.toString());
                if (count === fileList.length) {
                    subscriber.next(ret);
                }
            });
        });
    });
}


export class InjectingFileProvider implements vscode.TreeDataProvider<FileEntry> {

    private _onDidChangeTreeData: vscode.EventEmitter<FileEntry | undefined> = new vscode.EventEmitter<FileEntry | undefined>();
    readonly onDidChangeTreeData: vscode.Event<FileEntry | undefined> = this._onDidChangeTreeData.event;

    constructor() {
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getChildren(element?: FileEntry): Thenable<FileEntry[] | undefined | null> | FileEntry[] | undefined | null {
        return InjectingFileSingleton.Instance.files.map(v => new FileEntry(v.uri, v.needInjection, {
            command: 'xstudio.openFile', title: "Open File", arguments: [v.uri]
        }));
    }

    getTreeItem(element: FileEntry): TreeItem | Thenable<TreeItem> {
        return element;
    }
}

export class FileExplorer {

    private fileExplorer: vscode.TreeView<Entry>;

    constructor(context: vscode.ExtensionContext) {
        const treeDataProvider = new InjectingFileProvider();
        this.fileExplorer = vscode.window.createTreeView('xstudio.toBeInjected', { treeDataProvider });
        vscode.commands.registerCommand('xstudio.openFile', (resource) => this.openResource(resource));
        vscode.commands.registerCommand('xstudio.refreshInjectingFile', _ => treeDataProvider.refresh());
    }

    // noinspection JSMethodCanBeStatic
    private openResource(resource: vscode.Uri): void {
        vscode.window.showTextDocument(resource);
        InjectingFileSingleton.Instance.changeSelectStatus(resource);
        vscode.commands.executeCommand('xstudio.refreshInjectingFile');
    }
}
