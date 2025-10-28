import { DataType, type ClosureIdentifier, type TypedValue } from "../types";

export function mClosure(value: ClosureIdentifier<DataType>): TypedValue<DataType.CLOSURE> {
    return {
        type: DataType.CLOSURE,
        value
    };
}
