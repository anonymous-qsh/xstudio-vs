// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Uri } from 'vscode';
import { ReflectionClazz } from "./reflectionClazz";
import { callFunc, hockFunc } from "./clientManager";
import { JS_REFLECT } from "./constants";
import { genericSimpleness, getCurrentDocumentText, OutputSingleton } from "./util";
import SQLite from './sqlite';
import { PropertyData, SQLiteSingleton } from "./dataManager";
import Clipboard from "./utils/clipboard";
import { FileExplorer, InjectingFileSingleton, readFilesObservable } from "./fileExplorer";


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "xstudio-vs" is now active!');

    // init sql
    const sqlite = SQLiteSingleton.Instance;
    sqlite.setSqliteCommand('', context.extensionPath);
    sqlite.setSqlite(new SQLite(context.extensionPath));

    const packageName = vscode.workspace.getConfiguration().get('xstudio.packageName') as string;

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    // let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
    //     // The code you place here will be executed every time your command is executed
    //
    //     // Display a message box to the user
    //     vscode.window.showInformationMessage('Hello World!');
    // });

    const reflectionClazzProvider = new ReflectionClazz('');
    vscode.window.registerTreeDataProvider('reflectionClazz', reflectionClazzProvider);
    vscode.commands.registerCommand('extension.getReflectionClazzCode', (data: PropertyData) => {
        const code = genericSimpleness(data.clazz, data.desc);
        Clipboard.copy(code).then(_ => {
            vscode.window.showInformationMessage("Auto generated code copied to clipboard successful!");
        });
    });
    vscode.commands.registerCommand('xstudio.refreshEntry', () => reflectionClazzProvider.refresh());

    let searchClazz = vscode.commands.registerCommand('extension.searchClazz', () => {
        vscode.window.showInputBox({
            password: false,
            ignoreFocusOut: false,
            placeHolder: "Place Input Full Path of Android App",
            prompt: "Like :"
        }).then(async (msg) => {
            if (msg === undefined || !msg) {
                vscode.window.showInformationMessage("Place Input Method Full Path.");
                return;
            }
            const result = await callFunc(packageName, JS_REFLECT, msg);
            if (!result['code']) {
                sqlite.saveReflectClazz(result['data']['name'], JSON.stringify(result['data']['property']));
            }
        });
    });

    let callback = vscode.commands.registerCommand('xstudio.callback', _ => {
        const jscode = getCurrentDocumentText();
        callFunc(packageName, jscode, null).then(_ => {
        });
    });

    let inject = vscode.commands.registerCommand('xstudio.inject', async () => {
        const x = InjectingFileSingleton.Instance.getContent();
        readFilesObservable(x).subscribe(async files => {
            const ret = await hockFunc(JSON.stringify(files));
            OutputSingleton.out.appendLine('broadcast: ' + ret);
        });
    });

    OutputSingleton.out.show(true);

    let addFileToInjectionList = vscode.commands.registerCommand('xstudio.addFileToBeInjection', (uri: Uri) => {
        InjectingFileSingleton.Instance.addFile({ uri, needInjection: false });
        vscode.commands.executeCommand('xstudio.refreshInjectingFile');
    });

    // tslint:disable-next-line:no-unused-expression
    new FileExplorer(context);

    // command quick change package name
    const changePackageName = vscode.commands.registerCommand('xstudio.changePackageName', _ => {
        vscode.window.showInputBox({
            password: false,
            ignoreFocusOut: false,
            placeHolder: 'Place Input Package Name',
            prompt: 'PackageName:'
        }).then((msg) => {
            vscode.workspace.getConfiguration().update('xstudio.packageName', msg, true);
            vscode.window.showInformationMessage('Update Package Name To -> ' + msg);
        });
    });
    context.subscriptions.push(changePackageName);

    // context.subscriptions.push(disposable);
    context.subscriptions.push(searchClazz);
    context.subscriptions.push(callback);
    context.subscriptions.push(inject);
    context.subscriptions.push(addFileToInjectionList);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
