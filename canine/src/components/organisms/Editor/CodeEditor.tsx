// @flow
import React from "react";
import {
  CodeMirror,
  CodeMirrorOptions,
  CodeMirrorType
} from "~/components/organisms/CodeMirror";
import { resolveLanguageMode } from "~/utils/resolveLanguageMode";
import { CompilerList } from "~/hooks/compilerList";
import { CompilerContextState } from "~/contexts/CompilerContext";
import { EditorContextState } from "~/contexts/EditorContext";

interface CodeEditorProps {
  editor: EditorContextState;
  compiler: CompilerContextState;
  compilerList: CompilerList;
}

export const CodeEditor: React.FC<CodeEditorProps> = (
  props
): React.ReactElement => {
  const { editor, compiler } = props;

  const insertTabSpace = React.useCallback((cm: CodeMirrorType): void => {
    const cursor = cm.getCursor()["ch"];
    const indentUnit = cm.getOption("indentUnit");
    const newCursor =
      Math.floor((cursor + indentUnit) / indentUnit) * indentUnit;
    const indentNum = newCursor - cursor;
    const spaces = Array(indentNum + 1).join(" ");
    cm.replaceSelection(spaces, "end", "+input");
  }, []);

  const settings = editor.settings;
  const options = React.useMemo((): CodeMirrorOptions => {
    let options = {
      keyMap: settings.editor,
      smartIndent: settings.smartIndent,
      tabSize: parseInt(settings.tabWidth, 10),
      extraKeys: {
        "Ctrl-Enter": (): void => {
          // TODO(melpon): コンパイルを開始する
        }
      }
    };

    if (settings.tabKey === "tab") {
      return {
        ...options,
        indentWithTabs: true
      };
    } else {
      return {
        ...options,
        extraKeys: {
          ...options.extraKeys,
          Tab: insertTabSpace
        },
        indentUnit: parseInt(settings.tabKey, 10),
        indentWithTabs: true
      };
    }
  }, [settings, insertTabSpace]);

  const source = editor.sources[editor.currentTab];
  const mode = resolveLanguageMode(
    source.filename,
    compiler.currentLanguage,
    "text/x-text"
  );
  const onBeforeChange = React.useCallback(
    (_editor, _data, value): void => {
      editor.setText(editor.currentTab, value);
    },
    [editor.currentTab]
  );

  return (
    <CodeMirror
      expand={editor.settings.expand}
      value={source.text}
      options={{
        lineNumbers: true,
        theme: "material",
        mode: mode,
        ...options
      }}
      onBeforeChange={onBeforeChange}
    />
  );
};