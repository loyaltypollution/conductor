import { EvaluatorTypeError } from "../../../common/errors";
import { DataType, type IDataHandler, type TypedValue } from "../../types"

/**
 * Gets the length of a List.
 * @param xs The List to get the length of.
 * @returns The length of the List.
 */
export async function length(this: IDataHandler, xs: TypedValue<DataType.LIST>): Promise<number> {
    let length = 0;
    if (xs.type === DataType.EMPTY_LIST) return length;
    while (true) {
        length++;
        const tail = await this.pair_tail(xs);
        if (tail.type === DataType.EMPTY_LIST) return length;
        if (tail.type !== DataType.PAIR) throw new EvaluatorTypeError("Input is not a list", DataType[DataType.LIST], DataType[tail.type]);
        xs = tail;
    }
}
