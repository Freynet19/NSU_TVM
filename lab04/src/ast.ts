export type Expr = Number | Variable | Negative | Binary;

export interface Number {
    type: 'num';
    value: number;
}

export interface Variable {
    type: 'var';
    name: string;
}

export interface Negative {
    type: 'neg';
    arg: Expr;
}

export interface Binary {
    type: 'bin';
    left: Expr;
    operation: '+' | '-' | '*' | '/';
    right: Expr;
}

export const bin = (left: Expr, right: Expr, operation: '+' | '-' | '*' | '/'): Expr => ({
    type: 'bin',
    operation,
    left,
    right
});

export const mul = (left: Expr, right: Expr): Expr => bin(left, right, '*');
export const div = (left: Expr, right: Expr): Expr => bin(left, right, '/');
export const sum = (left: Expr, right: Expr): Expr => bin(left, right, '+');
export const sub = (left: Expr, right: Expr): Expr => bin(left, right, '-');

