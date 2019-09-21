import { createClient, RedisClient } from 'redis';
import { OutputSingleton } from "./util";
import * as vscode from "vscode";

const post = vscode.workspace.getConfiguration().get("xstudio.redisPost") as number;
const host = vscode.workspace.getConfiguration().get("xstudio.redisIp") as string;
const password = vscode.workspace.getConfiguration().get("xstudio.redisPassword") as string;

export const client = !password ? createClient(post, host) : createClient(post, host, { password });

// subscribe console msg.
const sub = client.duplicate();

sub.subscribe('console');

sub.on('message', function (channel, message) {
    OutputSingleton.out.appendLine(`Client A got message from channel ${channel}: ${message}`);
});

export const clientBlocking = client.duplicate();

export class RedisSingleton {
    static Instance: RedisSingleton = new RedisSingleton();
}
