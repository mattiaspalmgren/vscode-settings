"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const QUOTES = {
    '"': true,
    // tslint:disable-next-line:prettier
    '\'': true,
    '`': true
};
function platformWin32() {
    return process.platform.includes('win32');
}
exports.platformWin32 = platformWin32;
function quote(s) {
    const q = platformWin32() ? '"' : `'`;
    return [q, s, q].join('');
}
exports.quote = quote;
const TEST_NAME_REGEX = /(describe|it|test)\(("([^"]+)"|`([^`]+)`|'([^']+)'),/;
function slash(s) {
    return platformWin32() ? s.replace(/\\/g, '/') : s;
}
exports.slash = slash;
function unquote(s) {
    if (QUOTES[s[0]]) {
        s = s.substring(1);
    }
    if (QUOTES[s[s.length - 1]]) {
        s = s.substring(0, s.length - 1);
    }
    return s;
}
function parseTestName(editor) {
    const { selection, document } = editor;
    if (!selection.isEmpty) {
        return unquote(document.getText(selection));
    }
    for (let currentLine = selection.active.line; currentLine >= 0; currentLine--) {
        const text = document.getText(new vscode.Range(currentLine, 0, currentLine, 100000));
        const match = TEST_NAME_REGEX.exec(text);
        if (match) {
            return unquote(match[2]);
        }
    }
    return '';
}
exports.parseTestName = parseTestName;
//# sourceMappingURL=util.js.map