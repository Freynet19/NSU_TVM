import { Dict, MatchResult, Semantics } from "ohm-js";
import grammar, { AddMulActionDict } from "./addmul.ohm-bundle";

export const addMulSemantics: AddMulSemantics = grammar.createSemantics() as AddMulSemantics;


const addMulCalc = {
    number(arg0) {
        return parseInt(arg0.sourceString)
    },
    Sum_plus(arg0 : any, _plus, arg1 : any) {
        return arg0.calculate() + arg1.calculate()
    },
    Mul_mul(arg0 : any, _mul, arg1 : any) {
        return arg0.calculate() * arg1.calculate()
    },
    Atom_braces(_lbrace, expr : any, _rbrace) {
        return expr.calculate()
    },
} satisfies AddMulActionDict<number>

addMulSemantics.addOperation<Number>("calculate()", addMulCalc);

interface AddMulDict  extends Dict {
    calculate(): number;
}

interface AddMulSemantics extends Semantics
{
    (match: MatchResult): AddMulDict;
}
