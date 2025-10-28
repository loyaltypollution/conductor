import { EvaluatorTypeError } from "../../../common/errors";
import { DataType, type IDataHandler, type TypedValue } from "../../types";

export async function closure_arity_assert(this: IDataHandler, c: TypedValue<DataType.CLOSURE>, arity: number): Promise<void> {
    const a = await this.closure_arity(c);
    if ((await this.closure_is_vararg(c)) ? arity < a : arity !== a) {
        throw new EvaluatorTypeError("Closure arity assertion failure", String(arity), String(a));
    }
}
