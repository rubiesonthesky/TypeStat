import { TypeStatArgv } from "../index";
import { ProcessOutput } from "../output/types";
import { collectOptionals } from "../shared/arrays";
import { ReactPropTypesHint, ReactPropTypesOptionality } from "./enums";
import { ParsedCompilerOptions } from "./parseRawCompilerOptions";

import { collectAddedMutators } from "./parsing/collectAddedMutators";
import { collectFileOptions } from "./parsing/collectFileOptions";
import { collectNoImplicitAny } from "./parsing/collectNoImplicitAny";
import { collectNoImplicitThis } from "./parsing/collectNoImplicitThis";
import { collectPackageOptions } from "./parsing/collectPackageOptions";
import { collectStrictNullChecks } from "./parsing/collectStrictNullChecks";
import { PendingTypeStatOptions, RawTypeStatOptions } from "./types";

export interface OptionsFromRawOptionsSettings {
    argv: TypeStatArgv;
    compilerOptions: Readonly<ParsedCompilerOptions>;
    cwd: string;
    output: ProcessOutput;
    projectPath: string;
    rawOptions: RawTypeStatOptions;
}

/**
 * Combines Node and CLi argument options with project and file metadata into pending TypeStat options.
 *
 * @returns Parsed TypeStat options, or a string for an error complaint.
 */
export const fillOutRawOptions = ({
    compilerOptions,
    cwd,
    output,
    projectPath,
    rawOptions,
}: OptionsFromRawOptionsSettings): PendingTypeStatOptions => {
    const rawOptionTypes = rawOptions.types ?? {};
    const noImplicitAny = collectNoImplicitAny(compilerOptions, rawOptions);
    const noImplicitThis = collectNoImplicitThis(compilerOptions, rawOptions);
    const { compilerStrictNullChecks, typeStrictNullChecks } = collectStrictNullChecks(compilerOptions, rawOptionTypes);

    const packageOptions = collectPackageOptions(cwd, rawOptions);

    const shell: (readonly string[])[] = [];
    if (rawOptions.postProcess?.shell !== undefined) {
        shell.push(...rawOptions.postProcess.shell);
    }

    return {
        compilerOptions: {
            ...compilerOptions,
            noImplicitAny,
            noImplicitThis,
            strictNullChecks: compilerStrictNullChecks,
        },
        files: collectFileOptions(rawOptions),
        filters: collectOptionals(rawOptions.filters),
        fixes: {
            importExtensions: false,
            incompleteTypes: false,
            missingProperties: false,
            noImplicitAny: false,
            noImplicitThis: false,
            noInferableTypes: false,
            strictNonNullAssertions: false,
            ...rawOptions.fixes,
        },
        hints: {
            react: {
                propTypes: rawOptions.hints?.react?.propTypes ?? ReactPropTypesHint.WhenRequired,
                propTypesOptionality: rawOptions.hints?.react?.propTypesOptionality ?? ReactPropTypesOptionality.AsWritten,
            },
        },
        include: rawOptions.include ?? compilerOptions.include,
        mutators: collectAddedMutators(rawOptions, packageOptions.directory, output),
        output,
        package: packageOptions,
        postProcess: { shell },
        projectPath,
        cleanups: {
            suppressTypeErrors: false,
            ...rawOptions.cleanups,
        },
        types: {
            strictNullChecks: typeStrictNullChecks,
        },
    };
};
