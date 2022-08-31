import {
  EditorComponent,
  OnChangeJSON,
  Remirror,
  ThemeProvider,
  useKeymap,
  useRemirror,
  useRemirrorContext,
  useTheme
} from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';
import React, { forwardRef, Ref, useCallback, useImperativeHandle } from 'react';
import jsx from 'refractor/lang/jsx.js';
import typescript from 'refractor/lang/typescript.js';
import { ExtensionPriority, RemirrorJSON } from 'remirror';
import {
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  CodeBlockExtension,
  CodeExtension,
  HardBreakExtension,
  HeadingExtension,
  ItalicExtension,
  LinkExtension,
  ListItemExtension,
  MarkdownExtension,
  OrderedListExtension,
  PlaceholderExtension,
  StrikeExtension,
  TableExtension,
  TrailingNodeExtension
} from 'remirror/extensions';

const HOOKS = [
  () => {
    const ignoreModEnter = useCallback(
      () => {
        return true; // Prevents any further key handlers from being run.
      }, []);

    useKeymap('Mod-Enter', ignoreModEnter);
  },
];

type EditorProps = {
  onChange: (value: RemirrorJSON) => void;
  className?: string;
  editable?: boolean;
  placeholder?: string;
  initialValue?: string;
  editorRef?: Ref<EditorRef>;
};

export const Editor: React.FC<EditorProps> = props => {
  const { manager } = useMarkdownEditor({ placeholder: props.placeholder });
  const originalTheme = useTheme();
  const theme = {
    ...originalTheme.theme,
    color: {
      ...originalTheme.theme.color,
      hover: {
        primary: '#5fc58f',
      },
      active: {
        primary: '#449e6e',
      },
      primary: '#449e6e',
      outline: 'none',
    },
    space: {
      3: 0,
      6: "50px",
    },
    fontFamily: {
      default: 'Inter',
    }
  };

  return (
    <AllStyledComponent>
      <ThemeProvider theme={theme} >
        <Remirror manager={manager} editable={props.editable} initialContent={props.initialValue} classNames={[props.className]} hooks={HOOKS}>
          {/*<Toolbar items={toolbarItems} refocusEditor label='Top Toolbar' />*/}
          <EditorComponent />
          <ImperativeHandle ref={props.editorRef} />
          <OnChangeJSON onChange={props.onChange} />
        </Remirror>
      </ThemeProvider>
    </AllStyledComponent>
  );
};

type DisplayProps = {
  initialValue: string;
};

export interface EditorRef {
  setContent: (content: any) => void;
}

const ImperativeHandle = forwardRef((_: unknown, ref: Ref<EditorRef>) => {
  const { setContent } = useRemirrorContext({
    autoUpdate: true,
  });

  // Expose content handling to outside
  useImperativeHandle(ref, () => ({ setContent }));

  return <></>;
});

export const Display: React.FC<DisplayProps> = ({ initialValue }) => {
  const { manager } = useMarkdownEditor();

  return (
    <Remirror manager={manager} editable={false} initialContent={initialValue}>
      <EditorComponent />
    </Remirror>
  );
};

type UseMarkdownProps = {
  initialValue?: string;
  placeholder?: string;
};

const useMarkdownEditor = (props: UseMarkdownProps = {}) => {
  const extensions = useCallback(
    () => [
      new PlaceholderExtension({ placeholder: props.placeholder }),
      new LinkExtension({ autoLink: true }),
      new BoldExtension(),
      new StrikeExtension(),
      new ItalicExtension(),
      new HeadingExtension(),
      new LinkExtension(),
      new BlockquoteExtension(),
      new BulletListExtension({ enableSpine: true }),
      new OrderedListExtension(),
      new ListItemExtension({ priority: ExtensionPriority.High, enableCollapsible: true }),
      new CodeExtension(),
      new CodeBlockExtension({ supportedLanguages: [jsx, typescript] }),
      new TrailingNodeExtension(),
      new TableExtension(),
      new MarkdownExtension({ copyAsMarkdown: false }),
      /**
       * `HardBreakExtension` allows us to create a newline inside paragraphs.
       * e.g. in a list item
       */
      new HardBreakExtension(),
    ],
    [props.placeholder],
  );

  return useRemirror({
    extensions,
    stringHandler: 'markdown',
    content: props.initialValue,
  });
};

