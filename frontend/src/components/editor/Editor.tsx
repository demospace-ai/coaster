import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { Descendant } from 'slate'
import { useMemo } from 'react'
import styles from './editor.m.css'
import classNames from 'classnames'


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
      <Editable className={classNames(styles.editor, props.className)}/>
    </Slate>
  )
}