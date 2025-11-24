import { Expr } from "../../lab04";
import { cost } from "./cost";

type Rule = [Expr, Expr];
type MatchMap = { [name: string]: Expr };

const bin = (op: string, left: Expr, right: Expr): Expr => ({
    type: "bin",
    operation: op as any,
    left,
    right,
});

function exprEquals(a: Expr, b: Expr): boolean {
    if (a.type !== b.type) return false;
    switch (a.type) {
        case "num": return a.value === (b as any).value;
        case "var": return a.name === (b as any).name;
        case "neg": return exprEquals(a.arg, (b as any).arg);
        case "bin": {
            const bb = b as any;
            return a.operation === bb.operation &&
                exprEquals(a.left, bb.left) &&
                exprEquals(a.right, bb.right);
        }
    }
}

function mergeMaps(a: MatchMap, b: MatchMap): MatchMap | null {
    const res: MatchMap = { ...a };
    for (const k in b) {
        if (k in res && !exprEquals(res[k], b[k])) return null;
        res[k] = b[k];
    }
    return res;
}

function getMatchMap(p: Expr, e: Expr): MatchMap | null {
    if (p.type === "var") return { [p.name]: e };
    if (p.type !== e.type) return null;
    const ee = e as any;

    switch (p.type) {
        case "num":
            return p.value === ee.value ? {} : null;
        case "neg":
            return getMatchMap(p.arg, ee.arg);
        case "bin": {
            if (p.operation !== ee.operation) return null;
            const lm = getMatchMap(p.left, ee.left);
            if (!lm) return null;
            const rm = getMatchMap(p.right, ee.right);
            if (!rm) return null;
            return mergeMaps(lm, rm);
        }
    }
}

function substitute(e: Expr, m: MatchMap): Expr {
    switch (e.type) {
        case "num": return e;
        case "var": return m[e.name] || e;
        case "neg": return { type: "neg", arg: substitute(e.arg, m) };
        case "bin": return bin(e.operation, substitute(e.left, m), substitute(e.right, m));
    }
}

function foldConstants(e: Expr): Expr {
    switch (e.type) {
        case "num":
        case "var":
            return e;

        case "neg": {
            const a = foldConstants(e.arg);
            return a.type === "num"
                ? { type: "num", value: -a.value }
                : { type: "neg", arg: a };
        }

        case "bin": {
            const l = foldConstants(e.left);
            const r = foldConstants(e.right);

            if (l.type === "num" && r.type === "num") {
                const a = l.value, b = r.value;
                switch (e.operation) {
                    case "+": return { type: "num", value: a + b };
                    case "-": return { type: "num", value: a - b };
                    case "*": return { type: "num", value: a * b };
                    case "/":
                        if (b === 0) return bin(e.operation, l, r);
                        return { type: "num", value: a / b };
                }
            }
            return bin(e.operation, l, r);
        }
    }
}

function collectVars(e: Expr, out: Set<string>) {
    switch (e.type) {
        case "num": return;
        case "var": out.add(e.name); return;
        case "neg": collectVars(e.arg, out); return;
        case "bin": collectVars(e.left, out); collectVars(e.right, out); return;
    }
}

function sameVarSet(a: Expr, b: Expr): boolean {
    const sa = new Set<string>(), sb = new Set<string>();
    collectVars(a, sa);
    collectVars(b, sb);
    if (sa.size !== sb.size) return false;
    for (const v of sa) if (!sb.has(v)) return false;
    return true;
}

const key = (e: Expr) => JSON.stringify(e);

function applyRuleEverywhere(expr: Expr, from: Expr, to: Expr): Expr[] {
    const res: Expr[] = [];

    const mm = getMatchMap(from, expr);
    if (mm) res.push(foldConstants(substitute(to, mm)));

    switch (expr.type) {
        case "num":
        case "var":
            break;

        case "neg":
            for (const s of applyRuleEverywhere(expr.arg, from, to))
                res.push(foldConstants({ type: "neg", arg: s }));
            break;

        case "bin":
            for (const l of applyRuleEverywhere(expr.left, from, to))
                res.push(foldConstants(bin(expr.operation, l, expr.right)));
            for (const r of applyRuleEverywhere(expr.right, from, to))
                res.push(foldConstants(bin(expr.operation, expr.left, r)));
            break;
    }

    return res;
}

function greedyReduce(e: Expr, rules: Rule[]): Expr {
    while (true) {
        const curCost = cost(e);
        let best = e;
        let bestCost = curCost;

        for (const [from, to] of rules) {
            for (const c of applyRuleEverywhere(e, from, to)) {
                const cc = cost(c);
                if (cc < bestCost) {
                    bestCost = cc;
                    best = c;
                }
            }
        }

        if (bestCost < curCost) e = best;
        else return e;
    }
}

export function simplify(e: Expr, identities: Rule[]): Expr {
    const rules: Rule[] = [...identities];
    for (const [l, r] of identities) {
        if (sameVarSet(l, r)) rules.push([r, l]);
    }

    const startCost = cost(e);

    const MAX_EXTRA_COST = 2;
    const MAX_NODES = 2500;

    const visited = new Set<string>();
    const queue: Expr[] = [];

    let best = e;
    let bestCost = startCost;

    const enqueue = (expr: Expr) => {
        const c = cost(expr);
        if (c > startCost + MAX_EXTRA_COST) return;

        const k = key(expr);
        if (visited.has(k)) return;
        visited.add(k);
        queue.push(expr);

        if (c < bestCost) {
            bestCost = c;
            best = expr;
        }
    };

    enqueue(e);

    while (queue.length && visited.size < MAX_NODES) {
        const cur = queue.shift()!;
        for (const [from, to] of rules) {
            for (const n of applyRuleEverywhere(cur, from, to)) {
                enqueue(n);
            }
        }
    }

    return greedyReduce(best, rules);
}
