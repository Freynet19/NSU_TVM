import { Expr, parseExpr } from "../../lab04/out";

const parseIdentities = (identities: [string, string][]): [Expr, Expr][] => identities.map(([l, r]) => [parseExpr(l), parseExpr(r)]);
export const basicIdentities = () => parseIdentities([
    ["x+0", "x"],
    ["x*0", "0"],
    ["x-0", "x"],
    ["x-x", "0"],
    ["x*1", "x"],
    ["x+x", "2*x"], // ?
    ["x/1", "x"],
    ["x--y", "x+y"]
]);
export const commutativeIdentities = () => parseIdentities([
    ["x+y", "y+x"],
    ["x*y", "y*x"],
    ["x-y", "x+-y"],
]);
export const distributiveIdentities = () => parseIdentities([
    ["a*(b+c)", "a*b + a*c"],
]);
export const regroupIdentities = () => parseIdentities([
    ["a+(b+c)", "b+(c+a)"],
]);
