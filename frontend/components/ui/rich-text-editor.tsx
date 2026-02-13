'use client';

import { Extension } from '@tiptap/core';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Mention, { type MentionNodeAttrs } from '@tiptap/extension-mention';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import Youtube from '@tiptap/extension-youtube';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type {
  SuggestionKeyDownProps,
  SuggestionOptions,
  SuggestionProps,
} from '@tiptap/suggestion';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  AtSign,
  Bold,
  ChevronDown,
  Code,
  FileCode2,
  Hash,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Paintbrush,
  Quote,
  Redo2,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  Underline as UnderlineIcon,
  Undo2,
  Video,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  value: string; // HTML
  onChange: (html: string) => void;
  placeholder?: string;
  minHeightClassName?: string; // ex: "min-h-[90px]"
  disabled?: boolean;
};

function IconBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type='button'
      title={title}
      onClick={onClick}
      disabled={disabled}
      variant='ghost'
      size='icon'
      className={['h-9 w-9 rounded-lg', active ? 'bg-slate-100' : ''].join(' ')}
    >
      {children}
    </Button>
  );
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            renderHTML: attrs => {
              if (!attrs.fontSize) return {};
              return { style: `font-size: ${attrs.fontSize}` };
            },
            parseHTML: element => {
              const size = (element as HTMLElement).style.fontSize;
              return size || null;
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        size =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: null }).run(),
    };
  },
});

/**
 * ✅ Row resize (approx) + column resize:
 * - Column resize: géré par Table.configure({ resizable: true }) + CSS .column-resize-handle
 * - Row resize: on wrappe le contenu des cellules dans un div "tt-cell-content" avec resize: vertical
 */
const ResizableTableCell = TableCell.extend({
  renderHTML({ HTMLAttributes }) {
    return ['td', HTMLAttributes, ['div', { class: 'tt-cell-content' }, 0]];
  },
});

const ResizableTableHeader = TableHeader.extend({
  renderHTML({ HTMLAttributes }) {
    return ['th', HTMLAttributes, ['div', { class: 'tt-cell-content' }, 0]];
  },
});

const createSuggestion = (
  items: string[],
  char: string,
  nodeType: string
): Omit<SuggestionOptions<string, MentionNodeAttrs>, 'editor'> => {
  let currentItems: string[] = [];
  let currentCommand: ((props: MentionNodeAttrs) => void) | null = null;
  let root: HTMLDivElement | null = null;
  let list: HTMLDivElement | null = null;
  let selectedIndex = 0;

  const updateSelection = () => {
    if (!list) return;
    Array.from(list.children).forEach((child, idx) => {
      child.classList.toggle('is-selected', idx === selectedIndex);
    });
  };

  const renderList = (props: SuggestionProps<string, MentionNodeAttrs>) => {
    if (!list) return;
    list.innerHTML = '';
    props.items.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tiptap-suggestion-item';
      btn.textContent = item;
      btn.addEventListener('click', () => props.command({ id: item, label: item }));
      if (idx === selectedIndex) btn.classList.add('is-selected');
      list?.appendChild(btn);
    });
  };

  const position = (props: SuggestionProps) => {
    const rect = props.clientRect?.();
    if (!rect || !root) return;
    root.style.left = `${rect.left}px`;
    root.style.top = `${rect.bottom + 6}px`;
  };

  const onKeyDown = (props: SuggestionKeyDownProps) => {
    if (!props.event) return false;
    if (props.event.key === 'Escape') {
      root?.remove();
      return true;
    }
    if (!currentItems.length || !currentCommand) return false;
    if (props.event.key === 'ArrowDown') {
      selectedIndex = (selectedIndex + 1) % currentItems.length;
      updateSelection();
      return true;
    }
    if (props.event.key === 'ArrowUp') {
      selectedIndex = (selectedIndex - 1 + currentItems.length) % currentItems.length;
      updateSelection();
      return true;
    }
    if (props.event.key === 'Enter') {
      currentCommand({
        id: currentItems[selectedIndex],
        label: currentItems[selectedIndex],
      });
      return true;
    }
    return false;
  };

  return {
    char,
    items: ({ query }) => {
      if (!query) return items.slice(0, 8);
      return items.filter(item => item.toLowerCase().startsWith(query.toLowerCase())).slice(0, 8);
    },
    command: ({ editor, range, props }) => {
      const id = props.id ?? props.label ?? '';
      const label = props.label ?? props.id ?? '';
      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          { type: nodeType, attrs: { id, label } },
          { type: 'text', text: ' ' },
        ])
        .run();
    },
    render: () => ({
      onStart: props => {
        root = document.createElement('div');
        root.className = 'tiptap-suggestion';
        list = document.createElement('div');
        list.className = 'tiptap-suggestion-list';
        root.appendChild(list);
        document.body.appendChild(root);

        currentItems = props.items;
        currentCommand = props.command;
        selectedIndex = 0;
        renderList(props);
        position(props);
      },
      onUpdate: props => {
        if (!root || !list) return;
        currentItems = props.items;
        currentCommand = props.command;
        selectedIndex = 0;
        renderList(props);
        position(props);
      },
      onKeyDown,
      onExit: () => {
        root?.remove();
        root = null;
        list = null;
        currentItems = [];
        currentCommand = null;
      },
    }),
  };
};

const Hashtag = Mention.extend({
  name: 'hashtag',
});

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Écrivez ici…',
  minHeightClassName = 'min-h-[90px]',
  disabled = false,
}: Props) {
  const NONE = '__none__';

  // ✅ Hooks TOUJOURS avant tout return (sinon erreur "order of hooks")
  const imageInputRef = React.useRef<HTMLInputElement | null>(null);

  const [tablePicker, setTablePicker] = React.useState({ rows: 0, cols: 0 });
  const [openTableMenu, setOpenTableMenu] = React.useState(false);
  const tableMenuRef = React.useRef<HTMLDivElement | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      Image.configure({ inline: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,

      Table.configure({ resizable: true }),
      TableRow,
      ResizableTableHeader,
      ResizableTableCell,

      TaskList,
      TaskItem.configure({ nested: true }),
      Youtube.configure({ nocookie: true }),
      Mention.configure({
        HTMLAttributes: { class: 'tiptap-mention' },
        suggestion: createSuggestion(
          ['admin', 'professeur', 'finance', 'student', 'support'],
          '@',
          'mention'
        ),
      }),
      Hashtag.configure({
        HTMLAttributes: { class: 'tiptap-hashtag' },
        suggestion: createSuggestion(
          ['budget', 'epargne', 'investissement', 'credit', 'assurance', 'fiscalite'],
          '#',
          'hashtag'
        ),
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    editable: !disabled,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: `tiptap-content focus:outline-none px-3 py-2 ${minHeightClassName} prose max-w-none`,
      },
    },
  });

  // Sync valeur externe -> editor
  React.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || '';
    if (current !== next) editor.commands.setContent(next, { emitUpdate: false });
  }, [value, editor]);

  // ✅ Fermer le menu Table si click dehors + Escape
  React.useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!openTableMenu) return;
      const target = e.target as Node;
      if (tableMenuRef.current && !tableMenuRef.current.contains(target)) {
        setOpenTableMenu(false);
        setTablePicker({ rows: 0, cols: 0 });
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!openTableMenu) return;
      if (e.key === 'Escape') {
        setOpenTableMenu(false);
        setTablePicker({ rows: 0, cols: 0 });
      }
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openTableMenu]);

  if (!editor) return null;

  const headingValue = editor.isActive('heading', { level: 1 })
    ? 'h1'
    : editor.isActive('heading', { level: 2 })
      ? 'h2'
      : editor.isActive('heading', { level: 3 })
        ? 'h3'
        : 'p';

  const setHeading = (v: string) => {
    if (disabled) return;
    const chain = editor.chain().focus();
    if (v === 'p') chain.setParagraph().run();
    if (v === 'h1') chain.toggleHeading({ level: 1 }).run();
    if (v === 'h2') chain.toggleHeading({ level: 2 }).run();
    if (v === 'h3') chain.toggleHeading({ level: 3 }).run();
  };

  const align =
    (editor.getAttributes('heading')?.textAlign as string | undefined) ??
    (editor.getAttributes('paragraph')?.textAlign as string | undefined);

  const AlignIcon =
    align === 'center'
      ? AlignCenter
      : align === 'right'
        ? AlignRight
        : align === 'justify'
          ? AlignJustify
          : AlignLeft;

  const fontFamilyValue =
    (editor.getAttributes('textStyle')?.fontFamily as string | undefined) ?? NONE;
  const fontSizeValue = (editor.getAttributes('textStyle')?.fontSize as string | undefined) ?? NONE;

  const setLink = () => {
    if (disabled) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Lien (https://...)', prev ?? '');
    if (url === null) return;
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  const insertImage = () => {
    if (disabled) return;
    const url = window.prompt("URL de l'image (https://...)");
    if (!url?.trim()) return;
    editor.chain().focus().setImage({ src: url.trim() }).run();
  };

  const insertImageFromFile = (file: File) => {
    if (disabled) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = typeof reader.result === 'string' ? reader.result : '';
      if (!src) return;
      editor.chain().focus().setImage({ src }).run();
    };
    reader.readAsDataURL(file);
  };

  const insertYoutube = () => {
    if (disabled) return;
    const url = window.prompt('URL YouTube (https://...)');
    if (!url?.trim()) return;
    editor.chain().focus().setYoutubeVideo({ src: url.trim() }).run();
  };

  const clearFormatting = () => {
    if (disabled) return;
    editor.chain().focus().unsetAllMarks().clearNodes().run();
  };

  return (
    <div className='rounded-xl border border-primary-200 bg-primary-50 focus-within:ring-1 focus-within:ring-cyan-500 focus-within:border-transparent'>
      <input
        ref={imageInputRef}
        type='file'
        accept='image/*'
        className='hidden'
        aria-label='Uploader une image'
        onChange={e => {
          const file = e.currentTarget.files?.[0];
          if (file) insertImageFromFile(file);
          e.currentTarget.value = '';
        }}
      />

      <div className='flex rounded-t-xl flex-wrap items-center gap-1 bg-primary-200 px-1'>
        <IconBtn
          title='Annuler'
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().undo()}
        >
          <Undo2 className='h-3.5 w-3.5' />
        </IconBtn>

        <IconBtn
          title='Rétablir'
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().redo()}
        >
          <Redo2 className='h-3.5 w-3.5' />
        </IconBtn>

        <div className='mx-1 h-6 w-px bg-slate-200' />

        {/* ✅ Style (Heading) */}
        <div className=''>
          <Select value={headingValue} onValueChange={setHeading} disabled={disabled}>
            <SelectTrigger
              size='sm'
              className='h-9 w-full bg-transparent hover:bg-slate-100 border-0 shadow-none'
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='border border-slate-200 bg-white p-1 shadow'>
              <SelectItem value='p'>Normal text</SelectItem>
              <SelectItem value='h1'>Heading 1</SelectItem>
              <SelectItem value='h2'>Heading 2</SelectItem>
              <SelectItem value='h3'>Heading 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ✅ Font */}
        <div className=''>
          <Select
            value={fontFamilyValue}
            onValueChange={v => {
              if (disabled) return;
              if (v === NONE) editor.chain().focus().unsetFontFamily().run();
              else editor.chain().focus().setFontFamily(v).run();
            }}
            disabled={disabled}
          >
            <SelectTrigger
              size='sm'
              className='h-9 w-full bg-transparent hover:bg-slate-100 border-0 shadow-none'
            >
              <SelectValue placeholder='Font' />
            </SelectTrigger>
            <SelectContent className='border border-slate-200 bg-white p-1 shadow'>
              {/* ⚠️ pas de value="" */}
              <SelectItem value={NONE}>Font</SelectItem>
              <SelectItem value='Inter, sans-serif'>Inter</SelectItem>
              <SelectItem value='Georgia, serif'>Georgia</SelectItem>
              <SelectItem value='Times New Roman, serif'>Times</SelectItem>
              <SelectItem value='Tahoma, sans-serif'>Tahoma</SelectItem>
              <SelectItem value='Courier New, monospace'>Courier</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ✅ Size */}
        <div className=''>
          <Select
            value={fontSizeValue}
            onValueChange={v => {
              if (disabled) return;
              if (v === NONE) editor.chain().focus().unsetFontSize().run();
              else editor.chain().focus().setFontSize(v).run();
            }}
            disabled={disabled}
          >
            <SelectTrigger
              size='sm'
              className='h-9 w-full bg-transparent hover:bg-slate-100 border-0 shadow-none'
            >
              <SelectValue placeholder='Size' />
            </SelectTrigger>
            <SelectContent className='border border-slate-200 bg-white p-1 shadow'>
              <SelectItem value={NONE}>Size</SelectItem>
              {['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'].map(sz => (
                <SelectItem key={sz} value={sz}>
                  {sz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <details className='relative'>
          <summary className='list-none cursor-pointer'>
            <span className='h-9 w-12 rounded-lg hover:bg-slate-100 flex items-center justify-center gap-1'>
              <AlignIcon className='h-3.5 w-3.5' />
              <ChevronDown className='h-3.5 w-3.5 opacity-70' />
            </span>
          </summary>
          <div className='absolute z-10 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow'>
            {[
              { key: 'left', label: 'Align left' },
              { key: 'center', label: 'Align center' },
              { key: 'right', label: 'Align right' },
              { key: 'justify', label: 'Justify' },
            ].map(it => (
              <button
                key={it.key}
                type='button'
                disabled={disabled}
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .setTextAlign(it.key as any)
                    .run()
                }
                className='w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-100 disabled:opacity-50'
              >
                {it.label}
              </button>
            ))}
          </div>
        </details>

        <label className='h-9 w-12 rounded-lg hover:bg-slate-100 flex items-center justify-center gap-1 cursor-pointer'>
          <span
            className='h-3.5 w-3.5 rounded border border-slate-300'
            style={{
              background: (editor.getAttributes('textStyle')?.color as string) ?? '#111827',
            }}
          />
          <ChevronDown className='h-3.5 w-3.5 opacity-70' />
          <input
            type='color'
            className='hidden'
            aria-label='Couleur du texte'
            disabled={disabled}
            onChange={e => editor.chain().focus().setColor(e.target.value).run()}
          />
        </label>

        <label className='h-9 w-12 rounded-lg hover:bg-slate-100 flex items-center justify-center gap-1 cursor-pointer'>
          <Highlighter className='h-3.5 w-3.5' />
          <ChevronDown className='h-3.5 w-3.5 opacity-70' />
          <input
            type='color'
            className='hidden'
            aria-label='Couleur de surlignage'
            disabled={disabled}
            onChange={e => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
          />
        </label>

        <div className='mx-1 h-6 w-px bg-slate-200' />

        <IconBtn
          title='Gras'
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          disabled={disabled}
        >
          <Bold className='h-3.5 w-3.5' />
        </IconBtn>
        <IconBtn
          title='Italique'
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          disabled={disabled}
        >
          <Italic className='h-3.5 w-3.5' />
        </IconBtn>
        <IconBtn
          title='Souligné'
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          disabled={disabled}
        >
          <UnderlineIcon className='h-3.5 w-3.5' />
        </IconBtn>
        <IconBtn
          title='Barré'
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          disabled={disabled}
        >
          <Strikethrough className='h-3.5 w-3.5' />
        </IconBtn>
        <IconBtn
          title='Code (inline)'
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          disabled={disabled}
        >
          <Code className='h-3.5 w-3.5' />
        </IconBtn>
        <IconBtn
          title='Exposant'
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          active={editor.isActive('superscript')}
          disabled={disabled}
        >
          <SuperscriptIcon className='h-3.5 w-3.5' />
        </IconBtn>
        <IconBtn
          title='Indice'
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          active={editor.isActive('subscript')}
          disabled={disabled}
        >
          <SubscriptIcon className='h-3.5 w-3.5' />
        </IconBtn>
        <IconBtn title='Nettoyer le format' onClick={clearFormatting} disabled={disabled}>
          <Paintbrush className='h-3.5 w-3.5' />
        </IconBtn>

        <div className='mx-1 h-6 w-px bg-slate-200' />

        <IconBtn
          title='Liste à puces'
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          disabled={disabled}
        >
          <List className='h-3.5 w-3.5' />
        </IconBtn>
        <IconBtn
          title='Liste numérotée'
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          disabled={disabled}
        >
          <ListOrdered className='h-3.5 w-3.5' />
        </IconBtn>
        <IconBtn
          title='Checklist'
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          active={editor.isActive('taskList')}
          disabled={disabled}
        >
          <ListTodo className='h-3.5 w-3.5' />
        </IconBtn>

        <IconBtn
          title='Lien'
          onClick={setLink}
          active={editor.isActive('link')}
          disabled={disabled}
        >
          <Link2 className='h-3.5 w-3.5' />
        </IconBtn>
        <IconBtn title='Image' onClick={insertImage} disabled={disabled}>
          <ImageIcon className='h-3.5 w-3.5' />
        </IconBtn>
        <IconBtn
          title='Uploader image'
          onClick={() => imageInputRef.current?.click()}
          disabled={disabled}
        >
          <ImageIcon className='h-3.5 w-3.5' />
        </IconBtn>
        <IconBtn title='YouTube' onClick={insertYoutube} disabled={disabled}>
          <Video className='h-3.5 w-3.5' />
        </IconBtn>

        <IconBtn
          title='Bloc de code'
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          disabled={disabled}
        >
          <FileCode2 className='h-3.5 w-3.5' />
        </IconBtn>
        <IconBtn
          title='Citation'
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          disabled={disabled}
        >
          <Quote className='h-3.5 w-3.5' />
        </IconBtn>
        <IconBtn
          title='Séparateur'
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          disabled={disabled}
        >
          <Minus className='h-4 w-4' />
        </IconBtn>
        <div className='relative' ref={tableMenuRef}>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            disabled={disabled}
            onClick={() => setOpenTableMenu(v => !v)}
            className='h-9 w-12 px-0 rounded-lg hover:bg-slate-100 flex items-center justify-center gap-1'
            aria-label='Tableau'
            aria-expanded={openTableMenu}
          >
            <TableIcon className='h-3.5 w-3.5' />
            <ChevronDown className='h-3.5 w-3.5 opacity-70' />
          </Button>

          {openTableMenu && (
            <div className='absolute z-10 mt-1 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow'>
              <div className='text-xs text-slate-600 px-1 pb-2'>
                {tablePicker.rows > 0 && tablePicker.cols > 0
                  ? `Tableau ${tablePicker.rows} × ${tablePicker.cols}`
                  : 'Choisir la taille du tableau'}
              </div>

              <div className='grid grid-cols-6 gap-1 px-1 pb-2'>
                {Array.from({ length: 6 }).map((_, r) =>
                  Array.from({ length: 6 }).map((_, c) => {
                    const active = r < tablePicker.rows && c < tablePicker.cols;
                    return (
                      <button
                        key={`${r}-${c}`}
                        type='button'
                        aria-label={`Tableau ${r + 1} par ${c + 1}`}
                        onMouseEnter={() => setTablePicker({ rows: r + 1, cols: c + 1 })}
                        onFocus={() => setTablePicker({ rows: r + 1, cols: c + 1 })}
                        onClick={() => {
                          editor
                            .chain()
                            .focus()
                            .insertTable({ rows: r + 1, cols: c + 1, withHeaderRow: true })
                            .run();
                          setOpenTableMenu(false);
                          setTablePicker({ rows: 0, cols: 0 });
                        }}
                        className={[
                          'h-5 w-5 rounded border',
                          active ? 'bg-sky-200 border-sky-400' : 'bg-white border-slate-300',
                        ].join(' ')}
                      />
                    );
                  })
                )}
              </div>

              <div className='space-y-1'>
                {[
                  {
                    label: 'Colonne avant',
                    action: () => editor.chain().focus().addColumnBefore().run(),
                  },
                  {
                    label: 'Colonne après',
                    action: () => editor.chain().focus().addColumnAfter().run(),
                  },
                  {
                    label: 'Ligne avant',
                    action: () => editor.chain().focus().addRowBefore().run(),
                  },
                  {
                    label: 'Ligne après',
                    action: () => editor.chain().focus().addRowAfter().run(),
                  },
                  {
                    label: 'Supprimer colonne',
                    action: () => editor.chain().focus().deleteColumn().run(),
                  },
                  {
                    label: 'Supprimer ligne',
                    action: () => editor.chain().focus().deleteRow().run(),
                  },
                  {
                    label: 'Supprimer tableau',
                    action: () => editor.chain().focus().deleteTable().run(),
                  },
                ].map(item => (
                  <Button
                    key={item.label}
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='w-full justify-start'
                    onClick={() => {
                      if (disabled) return;
                      item.action();
                      setOpenTableMenu(false);
                      setTablePicker({ rows: 0, cols: 0 });
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <IconBtn
          title='Insérer @'
          onClick={() => editor.chain().focus().insertContent('@').run()}
          disabled={disabled}
        >
          <AtSign className='h-3.5 w-3.5' />
        </IconBtn>
        <IconBtn
          title='Insérer #'
          onClick={() => editor.chain().focus().insertContent('#').run()}
          disabled={disabled}
        >
          <Hash className='h-3.5 w-3.5' />
        </IconBtn>
      </div>

      <EditorContent editor={editor} />

      <style>{`
  /* TABLE (equal columns by default + wrap long words) */
  .tiptap-content table,
  .tiptap-content .ProseMirror table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
  }

  .tiptap-content .ProseMirror .tableWrapper {
    overflow-x: auto;
  }

  .tiptap-content td,
  .tiptap-content th,
  .tiptap-content .ProseMirror td,
  .tiptap-content .ProseMirror th {
    border: 1px solid #94a3b8 !important;
    padding: 6px 8px;
    vertical-align: top;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  .tiptap-content tr,
  .tiptap-content .ProseMirror tr {
    border-bottom: 1px solid #94a3b8 !important;
  }

  /* ✅ Column resize handle (Tiptap/ProseMirror) */
  .tiptap-content .column-resize-handle {
    position: absolute;
    right: -2px;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: transparent;
    pointer-events: auto;
  }
  .tiptap-content .column-resize-handle:hover {
    background-color: rgba(56, 189, 248, 0.35);
  }

  .resize-cursor {
    cursor: col-resize !important;
  }

  /* ✅ Row resize (vertical) via cell inner wrapper */
  .tiptap-content .tt-cell-content {
    display: block;
    min-height: 28px;
    resize: vertical;
    overflow: auto;
  }

  /* Task list */
  .tiptap-content ul[data-type='taskList'] {
    list-style: none;
    padding-left: 0;
  }
  .tiptap-content ul[data-type='taskList'] li {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }

  /* Mention / hashtag */
  .tiptap-content .tiptap-mention,
  .tiptap-content .tiptap-hashtag {
    background: #e0f2fe;
    color: #0f172a;
    border-radius: 6px;
    padding: 0 6px;
  }

  /* Suggestions */
  .tiptap-suggestion {
    position: fixed;
    z-index: 50;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
    padding: 6px;
    min-width: 180px;
  }
  .tiptap-suggestion-item {
    display: block;
    width: 100%;
    text-align: left;
    font-size: 12px;
    padding: 6px 8px;
    border-radius: 8px;
  }
  .tiptap-suggestion-item.is-selected {
    background: #e2e8f0;
  }
`}</style>
    </div>
  );
}
