import { Uri, window } from "vscode";
import { String, StringBuilder } from "./utils/stringBuilder";
import * as vscode from "vscode";
import { Observable } from "rxjs";

// output 单例
export class OutputSingleton {
    public static readonly Instance: OutputSingleton = new OutputSingleton();

    static out = window.createOutputChannel('xstudio');
}

export function getCurrentDocumentText() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return '';
    }
    return editor.document.getText();
}

export const baseType: { [key: string]: string } = {
    "boolean": "java.lang.Boolean",
    "byte": "java.lang.Byte",
    "char": "java.lang.Character",
    "short": "java.lang.Short",
    "int": "java.lang.Integer",
    "long": "java.lang.Long",
    "float": "java.lang.Float",
    "double": "java.lang.Double"
};

export function genericSimpleness(clazz: string, desc: string) {
    let sb = new StringBuilder();

    sb.AppendLine("// " + desc);

    sb.AppendLine("");

    sb.AppendLine("//call");
    sb.AppendLine("var ref = org.joor.Reflect");
    sb.AppendLine("var main = function(lpparm, ctx, param) {");

    // desc: private static long com.wch.zx.common.lq.a$a.a(long)

    const param = new RegExp("[\\w\\.\\[\\]\\$]+(?=[,\\)])").exec(desc) || [] as String[];

    for (let i = 0; i < param.length; i++) {
        let type = param[i] + String.Empty;

        if (type.endsWith('[]')) {
            let tmp = type.replace("[]", "");
            if (baseType.hasOwnProperty(tmp)) {
                sb.AppendLine(String.Format("    var param_{0} = java.lang.reflect.Array.newInstance({1}.TYPE, 0);", i, baseType[tmp]));
                if (tmp === "byte") {
                    sb.AppendLine(String.Format("    //var param_{0} = android.util.Base64.decode('',2);", i));
                }
            } else {
                sb.AppendLine(String.Format("    var clazz_{0} = ref.on('{1}',ctx.getClassLoader()).type();", i,
                    tmp));
                sb.AppendLine(String.Format("    var param_{0} = java.lang.reflect.Array.newInstance(clazz_{0}, 0);", i));
            }
        } else {
            if (baseType.hasOwnProperty(type)) {
                sb.AppendLine(String.Format("    var param_{0} = new {1}('');", i, baseType[type]));
            } else {
                if (type === "java.lang.String") {
                    sb.AppendLine(String.Format("    var param_{0} = ''; //{1}", i, type));
                } else {
                    sb.AppendLine(String.Format("    var param_{0} = ref.on('{1}',ctx.getClassLoader()).create().get();", i, type));
                }
            }
        }
    }

    let args = [] as string[];
    for (let j = param.length; j > 0; j--) {
        args[j] = "param_" + (j - 1);
    }

    let name;
    const nameMatchResult = desc.match(/\w+(?=\()/);

    if (nameMatchResult !== null) {
        name = nameMatchResult.toString();
    } else {
        name = '';
    }

    args[0] = String.Format("'{0}'", name);

    sb.AppendLine("    ");
    sb.AppendLine(String.Format("    var result = ref.on('{0}', ctx.getClassLoader()).call({1}).get();", clazz, String.Join(" ,", args)));
    sb.AppendLine("    return result;");

    sb.Append("}");
    sb.AppendLine("    ");
    sb.AppendLine("    ");

    let func;

    const funcMatchResult = desc.match(/[\w$]+\(.*?\)/);

    if (funcMatchResult !== null) {
        func = funcMatchResult.toString();
    } else {
        func = '';
    }

    sb.Append(`//hook
var find = function(lpparm, ctx, param) {
    var methods = org.joor.Reflect.on('#clazz', ctx.getClassLoader()).type().getDeclaredMethods();
    var func = '#func';
    for (var i = 0; i < methods.length; i++) {
        if (methods[i].toString().contains(func)){
            return methods[i];
        }
    }
    return null;
}
var before_func = function(param) {
    //todo
}

var after_func = function(param) {
    //todo
}`.replace("#clazz", clazz).replace("#desc", desc).replace("#func", func));

    return sb.ToString();
}
