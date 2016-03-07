import { window, ExtensionContext, commands, Range, workspace } from 'vscode';
import { block } from 'alignment';

const config = workspace.getConfiguration('align');

export function activate(context: ExtensionContext) {
    const disposable = commands.registerCommand('extension.align', () => {
        alignSelections();
    });

    context.subscriptions.push(disposable);
}

export function alignSelections() {
    let leftConfig = <string[]>config.get('leftSeparators');
    let rightConfig = <string[]>config.get('rightSeparators');
    let ignoreConfig = <string[]>config.get('ignoreSeparators');
    let spaceConfig = <string[]>config.get('spaceSeparators');
    
    let editor = window.activeTextEditor;
    let selections = editor.selections;
    
    selections.forEach((selection) => {
        let range = new Range(selection.start.line, 0, selection.end.line, 999);
        let text = editor.document.getText(range);
        
        let newBlock = block(text, { 
            leftSeparators: leftConfig,
            rightSeparators: rightConfig,
            ignoreSeparators: ignoreConfig,
            spaceSeparators: spaceConfig
         });
        
        editor.edit((editBuilder) => {
            editBuilder.replace(range, newBlock[0]);
        });
    });
}