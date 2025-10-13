import {MatchResult} from "ohm-js";
import grammar from "./arith.ohm-bundle";
import {arithSemantics} from "./calculate";

export const arithGrammar = grammar;
export {ArithmeticActionDict, ArithmeticSemantics} from './arith.ohm-bundle';

export function evaluate(content: string, params?: {[name:string]:number}): number
{
    return calculate(parse(content), params ?? {});
}
export class SyntaxError extends Error
{
}

export function parse(content: string): MatchResult
{
    const matchResult = grammar.match(content, "Expr");
    if (!matchResult.succeeded()) throw new SyntaxError();
    return matchResult;
}

function calculate(expression: MatchResult, params: {[name:string]: number}): number
{
    return arithSemantics(expression).calculate(params);
}
