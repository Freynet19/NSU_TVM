import { MatchResult } from "ohm-js";
import grammar, { ArithmeticActionDict, ArithmeticSemantics } from "./arith.ohm-bundle";

export const arithSemantics: ArithSemantics = grammar.createSemantics() as ArithSemantics;


const arithCalc = {
    Expr: function (expr) {
        return expr.calculate(this.args.params);
    },

    AddExp(first, operator, rest) {
        let res = first.calculate(this.args.params);
        const len = operator.children.length;
        for (let i = 0; i < len; i++) {
            const op = operator.child(i).sourceString;
            const rVal = rest.child(i).calculate(this.args.params);
            switch (op) {
                case '+':
                    res += rVal;
                    break;
                case '-':
                    res -= rVal;
                    break;
            }
        }
        return res;
    },

    MulExp(first, operator, rest) {
        let res = first.calculate(this.args.params);
        const len = operator.children.length;
        for (let i = 0; i < len; i++) {
            const op = operator.child(i).sourceString;
            const rVal = rest.child(i).calculate(this.args.params);
            switch (op) {
                case '*':
                    res *= rVal;
                    break;
                case '/':
                    if (rVal === 0) throw new Error("division by zero");
                    res /= rVal;
                    break;
                default: throw new Error();
            }
        }
        return res;
    },

    AtomExp_number: function (num) {
        return num.calculate(this.args.params);
    },
    AtomExp_un_minus: function (_minus, expr) {
        return -expr.calculate(this.args.params);
    },
    AtomExp_variable(_name) {
        const varName = this.sourceString;
        if (this.args.params && this.args.params[varName] !== undefined) {
            return this.args.params[varName];
        }
        return NaN;
    },
    AtomExp_paren(_open_paren, expr, _closeParen) {
        return expr.calculate(this.args.params);
    },

    number_float(_intPart, _dot, _fracPart) {
        return parseFloat(this.sourceString);
    },
    number_int(_int) {
        return parseInt(this.sourceString, 10);
    },
} satisfies ArithmeticActionDict<number | undefined>;


arithSemantics.addOperation<Number>("calculate(params)", arithCalc);


export interface ArithActions {
    calculate(params: {[name:string]:number}): number;
}

export interface ArithSemantics extends ArithmeticSemantics
{
    (match: MatchResult): ArithActions;
}
