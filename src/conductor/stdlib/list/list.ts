import { DataType, type IDataHandler, type TypedValue } from "../../types";
import { mEmptyList } from "../../util";

/**
 * Creates a new List from given elements.
 * @param elements The elements of the List, given as typed values.
 * @returns The newly created List.
 */
export async function list(this: IDataHandler, ...elements: TypedValue<DataType>[]): Promise<TypedValue<DataType.LIST>> {
    let theList: TypedValue<DataType.LIST> = mEmptyList();
    for (let i = elements.length - 1; i >= 0; --i) {
        const p = await this.pair_make(elements[i], theList);
        theList = p;
    }
    return theList;
}
