import * as ts from "typescript";

import { printNewLine } from "../../../../shared/printing/newlines";
import { FileMutationsRequest } from "../../../fileMutator";

export const addNewTypeNodes = (request: FileMutationsRequest, node: ts.ClassLikeDeclaration, createdTypes: string[]) => {
    const endline = printNewLine(request.options.compilerOptions);

    return {
        insertion: `${endline.repeat(2)}${createdTypes.join(endline)}`,
        range: {
            begin: node.pos,
        },
        type: "text-insert",
    };
};

export const addMissingTemplateTypes = (extension: ts.ExpressionWithTypeArguments, templateTypeNames: string[]) => {
    if (extension.typeArguments === undefined) {
        return {
            insertion: `<${templateTypeNames.join(", ")}>`,
            range: {
                begin: extension.end,
            },
            type: "text-insert",
        };
    }

    const lastExistingTypeArgument = extension.typeArguments[extension.typeArguments.length - 1];

    return {
        insertion: `, ${templateTypeNames.slice(extension.typeArguments.length).join(", ")}`,
        range: {
            begin: lastExistingTypeArgument.end,
        },
        type: "text-insert",
    };
};