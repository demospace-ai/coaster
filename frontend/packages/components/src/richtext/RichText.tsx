"use client";

import { mergeClasses } from "@coaster/utils/common";
import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";

export const RichTextEditor: React.FC<{
  value: string;
  setValue: (value: string) => void;
  onBlur?: () => void;
  label?: string;
  className?: string;
}> = ({ value, setValue, onBlur, label, className }) => {
  const editor = useEditor({
    editorProps: {
      attributes: {
        class:
          "tw-w-full tw-h-full tw-outline-none tw-text-base [&_ul]:tw-list-disc [&_ul]:tw-ml-5 [&_ol]:tw-list-decimal [&_ol]:tw-ml-5",
      },
    },
    extensions: [StarterKit, Link],
    content: value,
    onUpdate: ({ editor }) => {
      if (editor.getText() == "") {
        setValue("");
      } else {
        setValue(editor.getHTML());
      }
    },
    onBlur,
    injectCSS: false,
  });
  const classes = [
    "tw-relative tw-w-full tw-border tw-border-solid tw-border-slate-300 tw-bg-white tw-rounded-md tw-px-3 tw-py-3 focus-within:tw-border-slate-400 tw-resize-y tw-overflow-hidden tw-cursor-text",
    label && "tw-pt-6",
    className,
  ];

  return (
    <div className={mergeClasses(...classes)} onClick={() => editor?.chain().focus()}>
      {label && (
        <label className="tw-absolute tw-text-slate-600 tw-cursor-[inherit] tw-select-none tw-inline-block tw-transition-all tw-duration-150 tw-top-1.5 tw-text-xs">
          {label}
        </label>
      )}
      <EditorContent editor={editor} className="tw-w-full tw-h-full tw-overflow-auto" />
    </div>
  );
};
