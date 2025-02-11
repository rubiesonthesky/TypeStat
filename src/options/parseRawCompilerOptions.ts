import minimatch from "minimatch";
import { glob } from "glob";
import * as fs from "mz/fs";
import * as path from "path";
import * as ts from "typescript";
import { stringifyDiagnosticMessageText } from "../shared/diagnostics";

export interface ParsedCompilerOptions extends ts.CompilerOptions {
    include?: string[];
}

export const parseRawCompilerOptions = async (cwd: string, projectPath: string): Promise<ts.CompilerOptions> => {
    const configRaw = (await fs.readFile(projectPath)).toString();
    const compilerOptions = ts.parseConfigFileTextToJson(projectPath, configRaw);
    if (compilerOptions.error !== undefined) {
        throw new Error(`Could not parse compiler options from '${projectPath}': ${stringifyDiagnosticMessageText(compilerOptions.error)}`);
    }

    const config = compilerOptions.config as ParsedCompilerOptions;

    // TSConfig includes often come in a glob form like ["src"]
    if (config.include) {
        config.include = ts.parseJsonConfigFileContent(
            compilerOptions.config,
            {
                useCaseSensitiveFileNames: true,
                readDirectory: (rootDir, extensions, excludes, includes) =>
                    includes
                        .flatMap((include) => glob.sync(path.join(rootDir, include)))
                        .filter(
                            (filePath) =>
                                !excludes?.some((exclude) => minimatch(filePath, exclude)) &&
                                extensions.some((extension) => filePath.endsWith(extension)),
                        )
                        .map((filePath) => path.relative(rootDir, filePath)),
                fileExists: (filePath) => fs.statSync(filePath).isFile(),
                readFile: (filePath) => fs.readFileSync(filePath).toString(),
            },
            cwd,
        ).fileNames;
    }

    return config;
};
