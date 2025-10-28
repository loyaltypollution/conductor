import { EvaluatorTypeError } from "../../../common/errors";
import { DataType, type IDataHandler, type TypedValue } from "../../types";

export async function list_to_vec(this: IDataHandler, xs: TypedValue<DataType.LIST>): Promise<TypedValue<DataType>[]> {
    const vec: TypedValue<DataType>[] = [];
    if (xs.type === DataType.EMPTY_LIST) return vec;
    while (true) {
        vec.push(await this.pair_head(xs));
        const tail = await this.pair_tail(xs);
        if (tail.type === DataType.EMPTY_LIST) return vec;
        if (tail.type !== DataType.PAIR) throw new EvaluatorTypeError("Input is not a list", DataType[DataType.LIST], DataType[tail.type]);
        xs = tail;
    }
}
