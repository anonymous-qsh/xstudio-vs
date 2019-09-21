import * as vscode from 'vscode';
import { TreeItemCollapsibleState } from 'vscode';
import * as path from 'path';
import { PropertyData, SQLiteSingleton } from "./dataManager";

export class ReflectionClazz implements vscode.TreeDataProvider<Clazz> {

    private _onDidChangeTreeData: vscode.EventEmitter<Clazz | undefined> = new vscode.EventEmitter<Clazz | undefined>();
    readonly onDidChangeTreeData: vscode.Event<Clazz | undefined> = this._onDidChangeTreeData.event;

    constructor(private workspaceRoot: string) {
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: Clazz): vscode.TreeItem {
        return element;
    }

    getChildren(element?: Clazz): Thenable<Clazz[]> {
        if (element) {
            return Promise.resolve(element.properties.map(v => new Clazz(v.name, v.desc, TreeItemCollapsibleState.None, {
                command: 'extension.getReflectionClazzCode',
                title: '',
                arguments: [v]
            }, v.type)));
        } else {
            return Promise.resolve(ReflectionClazz.getClazz());
        }
    }

    private static async getClazz(): Promise<Clazz[]> {
        const sqlite = SQLiteSingleton.Instance;
        const ret = await sqlite.getAllReflectClass();
        return ret.map(v => new Clazz(v.name, v.property, vscode.TreeItemCollapsibleState.Collapsed));
    }
}


export class Clazz extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public text: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,
        public readonly type?: string,
    ) {
        super(label, collapsibleState);
    }

    get description(): string {
        return this.type ? this.text : '';
    }

    get properties(): PropertyData[] {
        return JSON.parse(this.text).map((v: PropertyData) => {
            return ({ ...v, clazz: this.label });
        });
    }

    private getIcon() {
        switch (this.type) {
            case 'method':
                return 'method.png';
            case 'constructor':
                return 'operator.png';
            case 'field':
                return 'field.png';
        }
        return 'class.png';
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', this.getIcon()),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', this.getIcon())
    };

    contextValue = 'clazz';
}
