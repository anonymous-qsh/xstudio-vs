import * as uuidv4 from 'uuid/v4';
import { client, clientBlocking } from './redisManager';
import { decrypt, encrypt } from "./RSA";
import * as vscode from "vscode";
import { OutputSingleton } from "./util";

export interface CallFuncResult {
    code: number;
    data: any;
}

export async function callFunc(apk: string, source: string, args: string | null): Promise<CallFuncResult> {
    const uuid = uuidv4();
    const data = JSON.stringify({
        uuid,
        source,
        args
    });
    const text = encrypt(data);
    clientBlocking.lpush(`${apk}:request`, text);

    return await new Promise(resolve => {
        clientBlocking.blpop(`${apk}:response:${uuid}`, 2, function (err: any, reply: any) {
            if (reply === null) {
                vscode.window.showErrorMessage('can not be null');
            } else {
                const result = JSON.parse(decrypt(reply[1]));
                OutputSingleton.out.appendLine(decrypt(reply[1]));
                resolve(result);
            }
        });
    });
}

export async function hockFunc(source: string): Promise<number> {
    return new Promise(resolve => {
        client.publish('hooks', encrypt(source), (err, reply) => {
            resolve(reply);
        });
    });
}
