import type { DataType, IFunctionSignature, ExternCallable } from "../../types";

export function moduleMethod<const Arg extends readonly DataType[], Ret extends DataType>(args: Arg, returnType: Ret) {
    const signature = {args, returnType} as const satisfies IFunctionSignature<Arg, Ret>;
    function externalClosureDecorator(method: ExternCallable<Arg, Ret> & {signature?: IFunctionSignature<Arg, Ret>}, _context: ClassMemberDecoratorContext) {
        method.signature = signature;
    }
    return externalClosureDecorator;
}
