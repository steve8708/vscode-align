import { window, ExtensionContext, commands, Range, workspace } from 'vscode';
import { block } from 'alignment';

const config = workspace.getConfiguration('align');

export function activate(context: ExtensionContext) {
    const disposable = commands.registerCommand('extension.align', () => {
        let editor = window.activeTextEditor;
        let selections = editor.selections;
        
        if (selections.length > 1) {
            alignCursors();
        } else {
            alignSelections();
        }
    });

    context.subscriptions.push(disposable);
}

export function alignCursors() {
    let editor = window.activeTextEditor;
    let selections = editor.selections;
    let cursors = new Array<number>();
    
    selections.forEach((selection, idx) => {
        cursors[idx] = selection.active.character;
    });

    let padLen = cursorPadding(cursors);
    
    editor.edit((editBuilder) => {
        selections.forEach((selection, idx) => {
            editBuilder.insert(selection.active, Array(padLen[idx] + 1).join(' '));
        })
    })
    
    function cursorPadding(cursors: number[]): number[] {  
        let padLen = new Array<number>();
        
        const maxIndent = Math.max(...cursors);
        
        cursors.forEach((pos, idx) => {
            padLen[idx] = maxIndent - pos;
        });
        
        return padLen;
    }
}


export function alignSelections() {
    const leftConfig = <string[]>config.get('leftSeparators');
    const rightConfig = <string[]>config.get('rightSeparators');
    const ignoreConfig = <string[]>config.get('ignoreSeparators');
    const spaceConfig = <string[]>config.get('spaceSeparators');
    
    let editor = window.activeTextEditor;
    let selections = editor.selections;
    
    selections.forEach((selection) => {
        let maxLen = Math.max(editor.document.lineAt(selection.active).text.length);
        let range = new Range(selection.start.line, 0, selection.end.line, maxLen);
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