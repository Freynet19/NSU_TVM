import { MatchResult } from 'ohm-js';
import { arithGrammar, ArithmeticActionDict, ArithmeticSemantics, SyntaxError } from '../../lab03';
import { Expr, sum, sub, mul, div } from './ast';

export const getExprAst: ArithmeticActionDict<Expr> = {
    Expr(expr) { return expr.parse(); },

    AddExp(first, operators, rest) {
        let left: Expr = first.parse();
        const len = operators.children.length;
        for (let i = 0; i < len; i++) {
            const op = operators.child(i).sourceString as '+' | '-';
            const right: Expr = rest.child(i).parse();
            left = op === '+' ? sum(left, right) : sub(left, right);
        }
        return left;
    },

    MulExp(first, operators, rest) {
        let left: Expr = first.parse();
        const len = operators.children.length;
        for (let i = 0; i < len; i++) {
            const op = operators.child(i).sourceString as '*' | '/';
            const right: Expr = rest.child(i).parse();
            left = (op === '*' ? mul : div)(left, right);
        }
        return left;
    },

    AtomExp_number(num) { return num.parse(); },
    AtomExp_un_minus(_minus, expr) { return { type: 'neg', arg: expr.parse() }; },
    AtomExp_variable(varNode) {
        return { type: 'var', name: varNode.sourceString };
    },
    AtomExp_paren(_open_paren, expr, _close_paren) { return expr.parse(); },

    number_float(_intPart, _dot, _fracPart) {
        return { type: 'num', value: parseFloat(this.sourceString) };
    },
    number_int(_int) {
        return { type: 'num', value: parseInt(this.sourceString, 10) };
    },
};

export const semantics = arithGrammar.createSemantics();
semantics.addOperation("parse()", getExprAst);

export interface ArithSemanticsExt extends ArithmeticSemantics
{
    (match: MatchResult): ArithActionsExt
}

export interface ArithActionsExt
{
    parse(): Expr
}
export function parseExpr(source: string): Expr
{
    const matchResult = arithGrammar.match(source, "Expr");
    if (!matchResult.succeeded()) throw new SyntaxError(matchResult.message);
    return semantics(matchResult).parse();
}
