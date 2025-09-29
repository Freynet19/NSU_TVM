import { ReversePolishNotationActionDict } from "./rpn.ohm-bundle";

export const rpnStackDepth = {
    number(_num) {
        return { max: 1, out: 1 };
    },
    Expr_sum(arg0 : any, arg1 : any, _plus) {
        const depth0 = arg0.stackDepth;
        const depth1 = arg1.stackDepth;
        const res = depth0.out + depth1.out;
        const mx = Math.max(depth0.max, depth1.max + depth0.out);
        return {max: mx, out: res - 1};
    },
    Expr_mul(arg0 : any, arg1 : any, _mul) {
        const depth0 = arg0.stackDepth;
        const depth1 = arg1.stackDepth;
        const res = depth0.out + depth1.out;
        const mx = Math.max(depth0.max, depth1.max + depth0.out);
        return {max: mx, out: res - 1};
    },
} satisfies ReversePolishNotationActionDict<StackDepth>;
export type StackDepth = {max: number, out: number};
