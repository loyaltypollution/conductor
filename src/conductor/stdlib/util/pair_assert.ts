import { EvaluatorTypeError } from "../../../common/errors";
import { DataType, type IDataHandler, type TypedValue } from "../../types";
import { isSameType } from "../../util";

export async function pair_assert(this: IDataHandler, p: TypedValue<DataType.PAIR>, headType?: DataType, tailType?: DataType): Promise<void> {
    if (headType) {
        const head = await this.pair_head(p);
        if (!isSameType(head.type, headType)) throw new EvaluatorTypeError("Pair head assertion failure", DataType[headType], DataType[head.type]);
    }
    if (tailType) {
        const tail = await this.pair_tail(p);
        if (!isSameType(tail.type, tailType)) throw new EvaluatorTypeError("Pair tail assertion failure", DataType[tailType], DataType[tail.type]);
    }
}
