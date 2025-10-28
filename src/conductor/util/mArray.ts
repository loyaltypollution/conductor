import { DataType, type ArrayIdentifier, type TypedValue } from "../types";

export function mArray(value: ArrayIdentifier<DataType>): TypedValue<DataType.ARRAY> {
    return {
        type: DataType.ARRAY,
        value
    };
}
