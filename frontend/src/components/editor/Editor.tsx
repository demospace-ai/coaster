import classNames from 'classnames';
import Prism, { Token } from 'prismjs';
import { useCallback, useMemo } from 'react';
import { createEditor, Descendant, NodeEntry, Range, Text } from 'slate';
import { Editable, RenderLeafProps, Slate, withReact } from 'slate-react';
import styles from './editor.m.css';

type Record = {
  [P in any]: any;
}

  // eslint-disable-next-line
  ; Prism.languages.markdown = Prism.languages.extend("markup", {}), Prism.languages.insertBefore("markdown", "prolog", { blockquote: { pattern: /^>(?:[\t ]*>)*/m, alias: "punctuation" }, code: [{ pattern: /^(?: {4}|\t).+/m, alias: "keyword" }, { pattern: /``.+?``|`[^`\n]+`/, alias: "keyword" }], title: [{ pattern: /\w+.*(?:\r?\n|\r)(?:==+|--+)/, alias: "important", inside: { punctuation: /==+$|--+$/ } }, { pattern: /(^\s*)#+.+/m, lookbehind: !0, alias: "important", inside: { punctuation: /^#+|#+$/ } }], hr: { pattern: /(^\s*)([*-])([\t ]*\2){2,}(?=\s*$)/m, lookbehind: !0, alias: "punctuation" }, list: { pattern: /(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m, lookbehind: !0, alias: "punctuation" }, "url-reference": { pattern: /!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/, inside: { variable: { pattern: /^(!?\[)[^\]]+/, lookbehind: !0 }, string: /(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/, punctuation: /^[\[\]!:]|[<>]/ }, alias: "url" }, bold: { pattern: /(^|[^\\])(\*\*|__)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/, lookbehind: !0, inside: { punctuation: /^\*\*|^__|\*\*$|__$/ } }, italic: { pattern: /(^|[^\\])([*_])(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/, lookbehind: !0, inside: { punctuation: /^[*_]|[*_]$/ } }, url: { pattern: /!?\[[^\]]+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)| ?\[[^\]\n]*\])/, inside: { variable: { pattern: /(!?\[)[^\]]+(?=\]$)/, lookbehind: !0 }, string: { pattern: /"(?:\\.|[^"\\])*"(?=\)$)/ } } } }), (Prism.languages.markdown as Record)['bold'].inside.url = Prism.util.clone(Prism.languages.markdown.url), (Prism.languages.markdown as Record)['italic'].inside.url = Prism.util.clone(Prism.languages.markdown.url), (Prism.languages.markdown as Record)['bold'].inside.italic = Prism.util.clone((Prism.languages.markdown as Record)['italic']), (Prism.languages.markdown as Record)['italic'].inside.bold = Prism.util.clone((Prism.languages.markdown as Record)['bold']); // prettier-ignore

const emptyText: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

type EditorProps = {
  onChange: (value: Descendant[]) => void;
  className?: string;
  readonly?: boolean;
  initialValue?: Descendant[];
};

export const Editor: React.FC<EditorProps> = props => {
  // Create a Slate editor object that won't change across renders.
  const editor = useMemo(() => withReact(createEditor()), []);
  const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, []);
  const decorate = useCallback(([node, path]: NodeEntry) => {
    const ranges: Range[] = [];

    if (!Text.isText(node) || node.text.length === 0) {
      return ranges;
    }

    const getLength = (token: Token | string): number => {
      if (typeof token === 'string') {
        return token.length;
      } else if (typeof token.content === 'string') {
        return token.content.length;
      } else {
        return (token.content as Array<Token | string>).reduce((l, t) => l + getLength(t), 0);
      }
    };

    const tokens = Prism.tokenize(node.text, Prism.languages.markdown);
    let start = 0;

    for (const token of tokens) {
      const length = getLength(token);
      const end = start + length;

      if (typeof token !== 'string') {
        ranges.push({
          [token.type]: true,
          anchor: { path, offset: start },
          focus: { path, offset: end },
        });
      }

      start = end;
    }

    console.log(ranges);
    return ranges;
  }, []);

  return (
    <Slate editor={editor} value={props.initialValue ? props.initialValue : emptyText} onChange={props.onChange}>
      <Editable
        className={classNames(styles.editor, props.className)}
        decorate={decorate}
        renderLeaf={renderLeaf}
        readOnly={props.readonly}
      />
    </Slate>
  );
};

const Leaf: React.FC<RenderLeafProps> = (props) => {
  return (
    <span
      {...props.attributes}
      className={classNames(
        props.leaf.bold ? styles.bold : null,
        props.leaf.italic ? styles.italic : null,
      )}
    >
      {props.children}
    </span>
  );
};