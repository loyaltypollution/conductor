import { DataType, type TypedValue, type OpaqueIdentifier } from "../types";

export function mOpaque(value: OpaqueIdentifier): TypedValue<DataType.OPAQUE> {
    return {
        type: DataType.OPAQUE,
        value
    };
}
