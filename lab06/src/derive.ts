import {Expr} from "../../lab04";

function simplify(e: Expr): Expr {
    switch (e.type) {
        case 'num':
        case 'var':
            return e;
        case 'neg':
            const arg = simplify(e.arg);
            if (arg.type === 'num') return arg.value === 0 ? {type: 'num', value: 0} : {type: 'neg', arg};
            if (arg.type === 'neg') return arg.arg;
            return {type: 'neg', arg};
        case 'bin':
            const lExpr = simplify(e.left);
            const rExpr = simplify(e.right);
            if (e.operation === '*') {
                if (isZero(rExpr) || isZero(lExpr)) return {type: 'num', value: 0};
                if (isOne(rExpr)) return lExpr;
                if (isOne(lExpr)) return rExpr;
            } else if (e.operation === '/') {
                if (isZero(lExpr)) return {type: "num", value: 0};
                if (isOne(rExpr)) return lExpr;
                if (lExpr.type === 'neg') return simplify({
                    type: 'neg',
                    arg: {type: 'bin', operation: '/', left: lExpr.arg, right: rExpr}
                });
                if (rExpr.type === 'neg') return simplify({
                    type: 'neg',
                    arg: {type: 'bin', operation: '/', left: lExpr, right: rExpr.arg}
                });
            } else if (e.operation === '+') {
                if (isZero(rExpr)) return lExpr;
                if (isZero(lExpr)) return rExpr;
            } else if (e.operation === '-') {
                if (isZero(rExpr)) return lExpr;
                if (isZero(lExpr)) return simplify({type: "neg", arg: rExpr});
            }
            return {type: 'bin', operation: e.operation, left: lExpr, right: rExpr};
    }
}

export function derive(e: Expr, varName: string): Expr
{
    let result: Expr;
    switch (e.type) {
        case 'num':
            result = {type: 'num', value: 0};
            break;
        case 'var':
            result = {type: 'num', value: e.name === varName ? 1 : 0};
            break;
        case 'neg':
            result = {type: 'neg', arg: derive(e.arg, varName)};
            break;
        case 'bin':
            const lExpr = e.left;
            const rExpr = e.right;
            const lDif = derive(lExpr, varName);
            const rDif = derive(rExpr, varName);
            switch (e.operation) {
                case '+':
                case '-':
                    result = {type: 'bin', operation: e.operation, left: lDif, right: rDif};
                    break;
                case '*':
                    result = {
                        type: 'bin', operation: '+',
                        left: {type: 'bin', operation: '*', left: lDif, right: rExpr},
                        right: {type: 'bin', operation: '*', left: rDif, right: lExpr}
                    };
                    break;
                case '/':
                    result = {
                        type: 'bin', operation: '/',
                        left: {
                            type: 'bin', operation: '-',
                            left: {type: 'bin', operation: '*', left: rExpr, right: lDif},
                            right: {type: 'bin', operation: '*', left: lExpr, right: rDif}
                        },
                        right: {type: 'bin', operation: '*', left: rExpr, right: rExpr}
                    };
                    break;
            }
    }
    return simplify(result);
}

function isZero(e: Expr): boolean {
    return e.type === 'num' && e.value === 0;
}

function isOne(e: Expr): boolean {
    return e.type === 'num' && e.value === 1;
}