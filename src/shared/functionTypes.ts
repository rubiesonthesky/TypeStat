import * as ts from "typescript";

import { FileMutationsRequest } from "./fileMutator";
import { getValueDeclarationOfType } from "./nodeTypes";

/**
 * @returns Declared type of a function-like expression.
 */
export const getValueDeclarationOfFunction = (request: FileMutationsRequest, node: ts.Expression) => {
    const functionLikeValueDeclaration = getValueDeclarationOfType(request, node);
    if (functionLikeValueDeclaration === undefined || !ts.isFunctionLike(functionLikeValueDeclaration)) {
        return undefined;
    }

    return functionLikeValueDeclaration;
};
