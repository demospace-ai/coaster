import { BaseEditor, Descendant } from 'slate';
import { ReactEditor } from 'slate-react';

type BlockQuoteElement = {
  type: 'block-quote';
  align?: string;
  children: Descendant[];
};

type BulletedListElement = {
  type: 'bulleted-list';
  align?: string;
  children: Descendant[];
};

type HeadingElement = {
  type: 'heading';
  align?: string;
  children: Descendant[];
};

type HeadingTwoElement = {
  type: 'heading-two';
  align?: string;
  children: Descendant[];
};

type ParagraphElement = {
  type: 'paragraph';
  align?: string;
  children: Descendant[];
};

type TitleElement = { type: 'title'; children: Descendant[]; };

type CustomText = {
  text: string,
  bold?: boolean;
  italic?: boolean;
};

type CustomElement = ParagraphElement | TitleElement;

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}