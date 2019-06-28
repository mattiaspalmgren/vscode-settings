'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.jumpToTest', () => {
        const splitFileName = path.basename(vscode.window.activeTextEditor.document.fileName).split(".");
        const fileName = splitFileName.slice(0, -1).join('');
        const extension = splitFileName[splitFileName.length - 1];
        let globPattern = `**/*${fileName}`;
        globPattern = determineGlobPattern(globPattern, extension);
        vscode.workspace.findFiles(globPattern, null, 1).then((ps) => {
            if (ps.length === 0) {
                vscode.window.setStatusBarMessage('jumpToTest: Unable to find test file', 3000);
                return;
            }
            vscode.commands.executeCommand('vscode.open', vscode.Uri.file(ps[0].path));
        });
        function determineGlobPattern(globPattern, extension) {
            if (globPattern.toLowerCase().includes('spec') || globPattern.toLowerCase().includes('test')) {
                globPattern = handleSwitchFromTestFile(globPattern);
            }
            else {
                globPattern = handleSwitchToTestFile(globPattern);
            }
            return `${globPattern}.${extension}`;
        }
        function handleSwitchFromTestFile(globPattern) {
            let postfix = addPostfix(globPattern);
            globPattern = globPattern.replace(new RegExp(`${postfix}spec`, 'ig'), '');
            globPattern = globPattern.replace(new RegExp(`${postfix}test`, 'ig'), '');
            return globPattern;
        }
        function handleSwitchToTestFile(globPattern) {
            let postfix = addPostfix(globPattern);
            return `${globPattern + postfix}{spec,test,Spec,Test,.spec,.test}`;
        }
        function addPostfix(globPattern) {
            return globPattern.includes('_') ? '_' : '';
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map