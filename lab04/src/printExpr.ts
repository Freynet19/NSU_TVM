import { Expr, Binary } from "./ast";

function printExprRecursive(e: Expr, isParentOperation?: Binary['operation'], isRightChild: boolean = false): string {
    switch (e.type) {
        case "num":
            return e.value.toString();
        case "var":
            return e.name;
        case "neg":
            return `-${printExprRecursive(e.arg)}`;
        case "bin":
            const lStr = printExprRecursive(e.left, e.operation, false);
            const rStr = printExprRecursive(e.right, e.operation, true);
            const str = `${lStr} ${e.operation} ${rStr}`;

            if (isParentOperation && needParens(e, isParentOperation, isRightChild)) {
                return `(${str})`;
            }

            return str;
    }
}

function getExprPriority(e: Expr): number {
    switch (e.type) {
        case 'num': return 0;
        case 'var': return 4;
        case 'neg': return 3;
        case 'bin': return getOperationPriority(e.operation);
    }
}

function getOperationPriority(op: Binary['operation']): number {
    switch (op) {
        case '+': return 1;
        case '-': return 1;
        case '*': return 2;
        case '/': return 2;
    }
}

function isBinOperation(e: Expr, operations: Array<Binary['operation']>): e is Binary {
    return e.type === 'bin' && operations.includes(e.operation);
}

function needParens(child: Expr, parentOperation: Binary['operation'], isRightChild: boolean): boolean {
    if (child.type !== 'bin') return false;

    const childPr = getExprPriority(child);
    const parentPr = getOperationPriority(parentOperation);

    if (childPr > parentPr) return false;
    if (childPr < parentPr) return true;

    switch (parentOperation) {
        case '+':
            return false;
        case '-':
            return isRightChild && isBinOperation(child, ['+', '-']);
        case '*':
            return false;
        case '/':
            return isRightChild && isBinOperation(child, ['*', '/']);
    }
}

export function printExpr(e: Expr): string {
    return printExprRecursive(e);
}
