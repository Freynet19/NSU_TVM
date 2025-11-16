import {c as C, I32, Op} from "../../wasm";
import {Expr} from "../../lab04";
import {buildOneFunctionModule, Fn} from "./emitHelper";

const {i32, get_local} = C;

export function getVariables(e: Expr): string[] {
    const s: string[] = [];
    (function walk(x: Expr) {
        switch (x.type) {
            case 'num':
                break;
            case 'var':
                if (s.findIndex(e => e == x.name) < 0)
                    s.push(x.name);
                break;
            case 'neg':
                walk(x.arg);
                break;
            case 'bin':
                walk(x.left);
                walk(x.right);
                break;
        }
    })(e);
    return s;
}

export async function buildFunction(e: Expr, variables: string[]): Promise<Fn<number>>
{
    let expr = wasm(e, variables)
    return await buildOneFunctionModule("test", variables.length, [expr]);
}

function wasm(e: Expr, args: readonly string[]): Op<I32> {
    const nameToIndex = new Map<string, number>();
    for (let i = 0; i < args.length; i++) nameToIndex.set(args[i], i);

    function emit(x: Expr): Op<I32> {
        switch (x.type) {
            case 'num':
                return i32.const(x.value);
            case 'var': {
                const idx = nameToIndex.get(x.name);
                if (idx == null) throw new Error(`Unknown variable: ${x.name}`);
                return get_local(i32, idx);
            }
            case 'neg':
                return i32.sub(i32.const(0), emit(x.arg));
            case 'bin':
                switch (x.operation) {
                    case '+':
                        return i32.add(emit(x.left), emit(x.right));
                    case '-':
                        return i32.sub(emit(x.left), emit(x.right));
                    case '*':
                        return i32.mul(emit(x.left), emit(x.right));
                    case '/':
                        return i32.div_s(emit(x.left), emit(x.right));
                }
        }
    }

    return emit(e);
}

