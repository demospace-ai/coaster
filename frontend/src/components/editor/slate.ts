import { BaseEditor, Descendant } from 'slate';
import { ReactEditor } from 'slate-react';

export type ElementTypes =
  BlockQuoteElement['type'] |
  BulletedListElement['type'] |
  NumberedListElement['type'] |
  ListItemElement['type'] |
  HeadingOneElement['type'] |
  HeadingTwoElement['type'] |
  ParagraphElement['type'] |
  TitleElement['type'];

type BlockQuoteElement = {
  type: 'block-quote';
  align?: string;
  children: Descendant[];
};

export type BulletedListElement = {
  type: 'bulleted-list';
  align?: string;
  children: Descendant[];
};

type NumberedListElement = {
  type: 'numbered-list';
  align?: string;
  children: Descendant[];
};

type ListItemElement = { type: 'list-item'; children: Descendant[]; };

type HeadingOneElement = {
  type: 'heading-one';
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

type CustomElement =
  BlockQuoteElement |
  BulletedListElement |
  NumberedListElement |
  ListItemElement |
  HeadingOneElement |
  HeadingTwoElement |
  ParagraphElement |
  TitleElement;

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}