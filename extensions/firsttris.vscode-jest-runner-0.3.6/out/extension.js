'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const vscode = require("vscode");
const util_1 = require("./util");
let previousCommand;
function activate(context) {
    let terminal;
    function getJestCommand() {
        return vscode.workspace.getConfiguration().get('jestrunner.jestCommand');
    }
    function getJestPath() {
        const jestPath = vscode.workspace.getConfiguration().get('jestrunner.jestPath');
        if (jestPath) {
            return jestPath;
        }
        const editor = vscode.window.activeTextEditor;
        const editorFolderPath = vscode.workspace.getWorkspaceFolder(editor.document.uri).uri.fsPath;
        const jestDirectoy = util_1.platformWin32() ? 'node_modules/jest/bin/jest.js' : 'node_modules/.bin/jest';
        return path_1.join(editorFolderPath, jestDirectoy);
    }
    function getConfigPath() {
        const configPath = vscode.workspace.getConfiguration().get('jestrunner.configPath');
        if (!configPath) {
            return '';
        }
        return path_1.join(vscode.workspace.workspaceFolders[0].uri.fsPath, configPath);
    }
    vscode.window.onDidCloseTerminal(() => {
        terminal = null;
    });
    const execRunJest = ({ useTestName, runPrev } = { useTestName: true, runPrev: false }) => __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        let command = previousCommand;
        if (!runPrev) {
            const configuration = util_1.slash(getConfigPath());
            const testName = useTestName ? util_1.parseTestName(editor) : '';
            const fileName = util_1.slash(editor.document.fileName);
            const jestPath = util_1.slash(getJestPath());
            const jestCommand = getJestCommand() || `node ${util_1.quote(jestPath)}`;
            command = `${jestCommand} ${util_1.quote(fileName)}`;
            if (configuration) {
                command += ` -c ${util_1.quote(configuration)}`;
            }
            if (testName !== '') {
                command += ` -t ${util_1.quote(testName)}`;
            }
        }
        previousCommand = command;
        yield editor.document.save();
        if (!terminal) {
            terminal = vscode.window.createTerminal('jest');
        }
        terminal.show();
        yield vscode.commands.executeCommand('workbench.action.terminal.clear');
        terminal.sendText(command);
    });
    const runJestFile = vscode.commands.registerCommand('extension.runJestFile', () => __awaiter(this, void 0, void 0, function* () { return execRunJest({ useTestName: false, runPrev: false }); }));
    const runJest = vscode.commands.registerCommand('extension.runJest', () => __awaiter(this, void 0, void 0, function* () { return execRunJest(); }));
    const runPrev = vscode.commands.registerCommand('extension.runPrevJest', () => __awaiter(this, void 0, void 0, function* () { return execRunJest({ useTestName: false, runPrev: true }); }));
    const debugJest = vscode.commands.registerCommand('extension.debugJest', () => __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const configuration = util_1.slash(getConfigPath());
        const testName = util_1.parseTestName(editor);
        const runOptions = vscode.workspace.getConfiguration().get('jestrunner.runOptions');
        const config = Object.assign({ args: [], console: 'integratedTerminal', internalConsoleOptions: 'neverOpen', name: 'Debug Jest Tests', program: getJestPath(), request: 'launch', type: 'node' }, runOptions);
        config.args.push('-i');
        config.args.push(util_1.slash(editor.document.fileName));
        if (configuration) {
            config.args.push('-c');
            config.args.push(configuration);
        }
        if (testName !== '') {
            config.args.push('-t');
            config.args.push(testName);
        }
        yield editor.document.save();
        vscode.debug.startDebugging(undefined, config);
    }));
    context.subscriptions.push(runJest);
    context.subscriptions.push(runJestFile);
    context.subscriptions.push(debugJest);
    context.subscriptions.push(runPrev);
}
exports.activate = activate;
function deactivate() {
    // deactivate
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map