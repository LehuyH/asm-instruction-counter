import { prompt } from "./cliUtils";

const optionCache = new Map<string, any>();

export const toBytes = (input: number[], size: 1 | 2 | 4 | 8) => {
    //BigInt if size is qword
    if (size === 8) {
        return new BigUint64Array([...input.map((n) => BigInt(n)), BigInt(-1)]);
    }

    const byteSizeMap = {
        1: Uint8Array,
        2: Uint16Array,
        4: Uint32Array
    };

    const TypedArray = byteSizeMap[size];
    return new TypedArray([...input, -1]);
}

export const createOrdered = async (n: number, size: 1 | 2 | 4 | 8) => {
    const inputArray = new Array(n).fill(0).map((_, i) => i);
    const byteArray = toBytes(inputArray, size);

    return byteArray;
}

export const createNeedleInHaystack = async (n: number, size: 1 | 2 | 4 | 8) => {
    
    const target = (optionCache.get("needleInHaystack-target") || await prompt("Please type the target number", (input) => {
        if (isNaN(parseInt(input))) return "Please type a number";
    }) as string);
    
    optionCache.set("needleInHaystack-target", target);

    const inputArray = new Array(n).fill(0).map((_, i) => 0);
    inputArray[Math.floor(Math.random() * n)] = parseInt(target as string);
    const byteArray = toBytes(inputArray, size);

    return byteArray;
}

export const createRandom = async (n: number, size: 1 | 2 | 4 | 8) => {
    const inputArray = new Array(n).fill(0).map(() => Math.floor(Math.random() * (100 - 0) + 0));
    const byteArray = toBytes(inputArray, size);

    return byteArray;
}

export const datasets = {
    'ordered': createOrdered,
    'needleInHaystack': createNeedleInHaystack,
    'random': createRandom
} as Record<string, (n: number, size: 1 | 2 | 4 | 8) => Promise<Uint8Array | Uint16Array | Uint32Array | BigUint64Array>>;