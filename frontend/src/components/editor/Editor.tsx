import {
  EditorComponent,
  OnChangeJSON,
  Remirror,
  ThemeProvider,
  useRemirror,
  useTheme
} from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';
import React, { useCallback } from 'react';
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
import {
  ComponentItem,
  Toolbar,
  ToolbarItemUnion
} from 'src/components/remirror/react-components';


type EditorProps = {
  onChange: (value: RemirrorJSON) => void;
  className?: string;
  editable?: boolean;
  placeholder?: string;
  initialValue?: string;
};

export const Editor: React.FC<EditorProps> = props => {
  const { manager } = useMarkdownEditor();
  const originalTheme = useTheme();
  const theme = {
    ...originalTheme.theme,
    color: {
      ...originalTheme.theme.color,
      hover: {
        primary: '#44749e',
      },
      active: {
        primary: 'rgb(80, 145, 248)',
      },
      primary: 'rgb(80, 145, 248)',
      outline: 'none',
    }
  };

  return (
    <AllStyledComponent>
      <ThemeProvider theme={theme}>
        <Remirror manager={manager} editable={props.editable} initialContent={props.initialValue} classNames={[props.className]}>
          <Toolbar items={toolbarItems} refocusEditor label='Top Toolbar' />
          <EditorComponent />
          <OnChangeJSON onChange={props.onChange} />
        </Remirror>
      </ThemeProvider>
    </AllStyledComponent>
  );
};

type DisplayProps = {
  initialValue: string;
};

export const Display: React.FC<DisplayProps> = ({ initialValue }) => {
  const { manager } = useMarkdownEditor();

  return (
    <Remirror manager={manager} editable={false} initialContent={initialValue}>
      <EditorComponent />
    </Remirror>
  );
};

const toolbarItems: ToolbarItemUnion[] = [
  {
    type: ComponentItem.ToolbarGroup,
    label: 'Simple Formatting',
    items: [
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleBold', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleItalic', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleStrike', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleCode', display: 'icon' },
    ],
    separator: 'end',
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: 'Heading Formatting',
    items: [
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleHeading',
        display: 'icon',
        attrs: { level: 1 },
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleHeading',
        display: 'icon',
        attrs: { level: 2 },
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleHeading',
        display: 'icon',
        attrs: { level: 3 },
      },
    ],
    separator: 'end',
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: 'Simple Formatting',
    items: [
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleBlockquote',
        display: 'icon',
      },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleCodeBlock', display: 'icon' },
    ],
    separator: 'end',
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: 'History',
    items: [
      { type: ComponentItem.ToolbarCommandButton, commandName: 'undo', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'redo', display: 'icon' },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleColumns',
        display: 'icon',
        attrs: { count: 2 },
      },
    ],
    separator: 'none',
  },
];

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

