import { ResultStatus } from "..";
import { version } from "../../package.json";

import { runCli } from "./runCli";

const createTestArgs = (...argv: string[]) => ({
    argv: ["node.exe", "typestat", ...argv],
    initializationRunner: jest.fn().mockResolvedValueOnce({
        status: ResultStatus.ConfigurationError,
    }),
    output: {
        log: jest.fn(),
        stderr: jest.fn(),
        stdout: jest.fn(),
    },
    mainRunner: jest.fn(),
});

describe("runCli", () => {
    it("runs initializationRunner when no args are provided", async () => {
        // Arrange
        const { argv, initializationRunner, output, mainRunner } = createTestArgs();

        // Act
        await runCli(argv, { initializationRunner, output, mainRunner });

        // Assert
        expect(initializationRunner).toHaveBeenCalledTimes(1);
        expect(mainRunner).not.toHaveBeenCalled();
    });

    it("logs the current version when --version is provided", async () => {
        // Arrange
        const { argv, initializationRunner, output, mainRunner } = createTestArgs("--version");

        // Act
        const resultStatus = await runCli(argv, { initializationRunner, output, mainRunner });

        // Assert
        expect(output.stdout).toHaveBeenLastCalledWith(`${version}`);
        expect(resultStatus).toEqual(ResultStatus.Succeeded);
    });

    it("logs a string when the main runner rejects with one", async () => {
        // Arrange
        const { argv, initializationRunner, output, mainRunner } = createTestArgs("--config", "typestat.json");
        const message = "Error message";

        mainRunner.mockRejectedValue(message);

        // Act
        const resultStatus = await runCli(argv, { initializationRunner, output, mainRunner });

        // Assert
        expect(output.stderr).toHaveBeenCalledWith(expect.stringMatching(message));
        expect(resultStatus).toEqual(ResultStatus.Failed);
    });

    it("logs an error with a stack when the main runner rejects with one", async () => {
        // Arrange
        const { argv, initializationRunner, output, mainRunner } = createTestArgs("--config", "typestat.json");
        const message = "Error message";
        const error = new Error(message);

        mainRunner.mockRejectedValue(error);

        // Act
        const resultStatus = await runCli(argv, { initializationRunner, output, mainRunner });

        // Assert
        expect(output.stderr).toHaveBeenCalledWith(expect.stringMatching(message));
        expect(output.stderr).toHaveBeenLastCalledWith(expect.stringMatching("  at"));
        expect(resultStatus).toEqual(ResultStatus.Failed);
    });

    it("logs help and the error when a configuration error is reported", async () => {
        // Arrange
        const { argv, initializationRunner, output, mainRunner } = createTestArgs("--config", "typestat.json");
        const message = "Error message";

        mainRunner.mockResolvedValue({
            error: message,
            status: ResultStatus.ConfigurationError,
        });

        // Act
        const resultStatus = await runCli(argv, { initializationRunner, output, mainRunner });

        // Assert
        expect(output.stdout).toHaveBeenLastCalledWith(expect.stringMatching("typestat \\[options\\]"));
        expect(output.stderr).toHaveBeenLastCalledWith(expect.stringMatching(message));
        expect(resultStatus).toEqual(ResultStatus.ConfigurationError);
    });

    it("logs a happy message when it finishes succesfully", async () => {
        // Arrange
        const { argv, initializationRunner, output, mainRunner } = createTestArgs("--config", "typestat.json");

        mainRunner.mockResolvedValue({
            status: ResultStatus.Succeeded,
        });

        // Act
        const resultStatus = await runCli(argv, { initializationRunner, output, mainRunner });

        // Assert
        expect(output.stdout).toHaveBeenLastCalledWith(expect.stringMatching("All done!"));
        expect(resultStatus).toEqual(ResultStatus.Succeeded);
    });
});
