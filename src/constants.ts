export const JS_REFLECT = `var log = android.util.Log;
var ref = org.joor.Reflect;

var main = function(lpparm, ctx, param) {
    try {
        var clazz = ref.on(param).type();
        return toJson(clazz);
    } catch (e) {
\t\tvar clazz = ref.on(param, ctx.getClassLoader()).type();
        return toJson(clazz);
    }
}

var toJson = function(clazz) {
    var fields = clazz.getDeclaredFields();
    var methods = clazz.getDeclaredMethods();
    var constructors = clazz.getDeclaredConstructors();

    var array = new Array();

    for (var i = 0; i < fields.length; i++) {
        var data = {
            name: fields[i].getName(),
            type: 'field',
            desc: fields[i].toString()
        };
        array.push(data);
    }

    for (var i = 0; i < methods.length; i++) {
        var data = {
            name: methods[i].getName(),
            type: 'method',
            desc: methods[i].toString()
        };
        array.push(data);
    }

    for (var i = 0; i < constructors.length; i++) {
        var data = {
            name: constructors[i].getName(),
            type: 'constructor',
            desc: constructors[i].toString()
        };
        array.push(data);
    }

    return {name:clazz.getName(),property:array};
}`;

