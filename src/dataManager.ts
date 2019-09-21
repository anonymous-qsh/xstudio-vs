import SQLite from "./sqlite";
import { validateSqliteCommand } from "./sqlite/sqliteCommandValidation";
import * as path from "path";
import * as vscode from "vscode";

interface ClazzData {
    name: string;
    property: string;
}

export interface PropertyData {
    name: string;
    desc: string;
    type: string;
    clazz: string;
}

export class SQLiteSingleton {
    public static readonly Instance: SQLiteSingleton = new SQLiteSingleton();
    private sqlite: SQLite;
    private sqliteCommand: string;
    private dbPath: string = path.join(__filename, '..', '..', 'bin', 'xstudio.db');

    public setSqlite(_sqlite: SQLite) {
        this.sqlite = _sqlite;
    }

    public getSqlite() {
        return this.sqlite;
    }

    public setSqliteCommand(command: string, extensionPath: string) {
        try {
            this.sqliteCommand = validateSqliteCommand(command, extensionPath);
        } catch (e) {
            console.log(e.message);
            this.sqliteCommand = "";
        }
    }

    public runQuery(dbPath: string, query: string) {
        return this.sqlite.query(this.sqliteCommand, dbPath, query).then(({ resultSet, error }) => {
            // log and show if there is any error
            if (error) {
                console.log(error.message, 'err');
                return;
            }

            return Promise.resolve(resultSet);
        });
    }

    public saveReflectClazz(name: string, property: string) {
        const query = `REPLACE INTO CLAZZ (NAME, PROPERTY) VALUES ('${name}', '${property}');`;
        this.runQuery(this.dbPath, query).then(ret => {
            vscode.commands.executeCommand('xstudio.refreshEntry');
        });
    }

    public async getAllReflectClass(): Promise<ClazzData[]> {
        const query = 'SELECT * FROM CLAZZ;';
        return new Promise(resolve => {
            this.runQuery(this.dbPath, query).then(ret => {
                if (ret === undefined) {
                    resolve([]);
                } else {
                    resolve(ret[0]['rows'].map(v => ({
                        name: v[0],
                        property: v[1]
                    })));
                }
            });
        });
    }
}





