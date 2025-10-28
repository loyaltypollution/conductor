import { DataType, type IDataHandler, type TypedValue } from "../../types"

/**
 * Checks if a List is a true list (`tail(tail...(xs))` is empty-list).
 * @param xs The List to check.
 * @returns true if the provided List is a true list.
 */
export async function is_list(this: IDataHandler, xs: TypedValue<DataType.LIST>): Promise<boolean> {
    if (xs.type === DataType.EMPTY_LIST) return true;
    while (true) {
        const tail = await this.pair_tail(xs);
        if (tail.type === DataType.EMPTY_LIST) return true;
        if (tail.type !== DataType.PAIR) return false;
        xs = tail;
    }
}
