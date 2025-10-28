import { EvaluatorTypeError } from "../../../common/errors";
import { DataType, type IDataHandler, type TypedValue } from "../../types";
import { isSameType } from "../../util";

export async function array_assert<T extends DataType>(this: IDataHandler, a: TypedValue<DataType.ARRAY>, type?: T, length?: number): Promise<void> {
    if (type) {
        const t = await this.array_type(a);
        if (!isSameType(t, type)) throw new EvaluatorTypeError("Array type assertion failure", DataType[type], DataType[t]);
    }
    if (length) {
        const l = await this.array_length(a);
        if (l !== length) throw new EvaluatorTypeError("Array length assertion failure", String(length), String(l));
    }
}
