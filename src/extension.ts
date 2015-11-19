import { window, ExtensionContext, commands, Range, workspace } from 'vscode';
import * as _ from 'lodash';

const table = require('text-table');

const config = workspace.getConfiguration('align');

export function activate(context: ExtensionContext) {

  const disposable = commands.registerCommand('extension.align', () => {
    const aligner = new Aligner();
    aligner.alignAllSelections();
	});

  context.subscriptions.push(disposable);
}

class Aligner {

  private static beforeSeparators = <string[]>config.get('beforeSeparators');
  private static afterSeparators  = <string[]>config.get('afterSeparators');

  private static beforeSeparatorsString = Aligner.beforeSeparators.map(_.escapeRegExp).join('|');
  private static afterSeparatorsString  = Aligner.afterSeparators.map(_.escapeRegExp).join('|');

  private static alignBefore = new RegExp(`\\s?(${Aligner.beforeSeparatorsString})`);
  private static alignAfter  = new RegExp(`(${Aligner.afterSeparatorsString})\\s?`);

  constructor(private editor = window.activeTextEditor) {
    // Do nothing, the constructor param sets this.editor for us
  }

  alignAllSelections(selections = this.editor.selections) {
    const editor = window.activeTextEditor;

    if (!editor.selections.length) {
      window.showWarningMessage('You must select text to align');
    }

    editor.selections.forEach((selection) => {
      this.alignSelection(selection);
    });
  }

  alignSelection(selection = this.editor.selection) {
    const range = new Range(selection.start, selection.end);
    const text = this.editor.document.getText(range);

    const rows = text
      .split(/\n/)
      .map(item => this.makeColumn(item));

    const newText = table(rows, { hsep: ' ' });

    window.activeTextEditor.edit((editBuilder) => {
      editBuilder.replace(range, newText);
    });
  }

  private makeColumn(str: string) {
    // Arbitrary string we will insert in as
    // our split point and then remove
    const replaceString = Date.now().toString() + Math.random().toString();

    return str
      .replace(Aligner.alignBefore, `${replaceString}$1`)
      .replace(Aligner.alignAfter, `$1${replaceString}`)
      .split(replaceString);
  }
}
