import classNames from 'classnames'
import { useMemo } from 'react'
import { createEditor, Descendant } from 'slate'
import { Editable, Slate, withReact } from 'slate-react'
import styles from './editor.m.css'


const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

type EditorProps = {
  onChange: (value: Descendant[]) => void;
  className?: string;
}

export const Editor: React.FC<EditorProps> = props => {
  // Create a Slate editor object that won't change across renders.
  const editor = useMemo(() => withReact(createEditor()), [])

  return (
    <Slate editor={editor} value={initialValue} onChange={props.onChange}>
      <Editable className={classNames(styles.editor, props.className)} />
    </Slate>
  )
}