import { DataType, type TypedValue, type PairIdentifier } from "../types";

export function mPair(value: PairIdentifier): TypedValue<DataType.PAIR> {
    return {
        type: DataType.PAIR,
        value
    };
}
