import { useEffect, useRef } from 'react';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { keymap } from 'prosemirror-keymap';
import { history, undo, redo } from 'prosemirror-history';
import { baseKeymap, toggleMark, setBlockType, wrapIn } from 'prosemirror-commands';

// Custom schema extending the basic schema
const mySchema = new Schema({
  nodes: addListNodes(basicSchema.spec.nodes, 'paragraph block*', 'block')
    .append({
      scene_break: {
        inline: false,
        group: 'block',
        parseDOM: [{ tag: 'div.scene-break' }],
        toDOM() {
          return ['div', { class: 'scene-break' }, '* * *'];
        },
      },
      ornamental_break: {
        inline: false,
        group: 'block',
        attrs: { symbol: { default: '✦' } },
        parseDOM: [
          {
            tag: 'div.ornamental-break',
            getAttrs(dom) {
              const symbol = (dom as HTMLElement).textContent || '✦';
              return { symbol };
            },
          },
        ],
        toDOM(node) {
          return ['div', { class: 'ornamental-break' }, node.attrs.symbol];
        },
      },
      verse: {
        content: 'text*',
        group: 'block',
        parseDOM: [{ tag: 'div.verse' }],
        toDOM() {
          return ['div', { class: 'verse' }, 0];
        },
      },
    }),
  marks: basicSchema.spec.marks.append({
    subhead: {
      parseDOM: [{ tag: 'span.subhead' }],
      toDOM() {
        return ['span', { class: 'subhead' }, 0];
      },
    },
    footnote: {
      attrs: { id: {} },
      parseDOM: [
        {
          tag: 'span.footnote',
          getAttrs(dom) {
            return { id: (dom as HTMLElement).getAttribute('data-id') };
          },
        },
      ],
      toDOM(mark) {
        return ['span', { class: 'footnote', 'data-id': mark.attrs.id }, 0];
      },
    },
  }),
});

interface ProseMirrorEditorProps {
  content?: any;
  onChange?: (doc: any) => void;
  editable?: boolean;
}

export function ProseMirrorEditor({ content, onChange, editable = true }: ProseMirrorEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Create initial document
    let doc;
    if (content) {
      doc = mySchema.nodeFromJSON(content);
    } else {
      doc = mySchema.node('doc', null, [mySchema.node('paragraph')]);
    }

    // Create editor state
    const state = EditorState.create({
      doc,
      plugins: [
        history(),
        keymap({
          'Mod-z': undo,
          'Mod-y': redo,
          'Mod-Shift-z': redo,
          'Mod-b': toggleMark(mySchema.marks.strong),
          'Mod-i': toggleMark(mySchema.marks.em),
          'Mod-`': toggleMark(mySchema.marks.code),
          'Shift-Ctrl-1': setBlockType(mySchema.nodes.heading, { level: 1 }),
          'Shift-Ctrl-2': setBlockType(mySchema.nodes.heading, { level: 2 }),
          'Shift-Ctrl-3': setBlockType(mySchema.nodes.heading, { level: 3 }),
          'Mod-Shift-b': wrapIn(mySchema.nodes.blockquote),
        }),
        keymap(baseKeymap),
      ],
    });

    // Create editor view
    const view = new EditorView(editorRef.current, {
      state,
      editable: () => editable,
      dispatchTransaction(transaction) {
        const newState = view.state.apply(transaction);
        view.updateState(newState);

        // Call onChange if document changed
        if (transaction.docChanged && onChange) {
          onChange(newState.doc.toJSON());
        }
      },
    });

    viewRef.current = view;

    // Cleanup
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [editable]);

  // Update content when it changes externally
  useEffect(() => {
    if (viewRef.current && content) {
      const currentDoc = viewRef.current.state.doc.toJSON();
      if (JSON.stringify(currentDoc) !== JSON.stringify(content)) {
        const doc = mySchema.nodeFromJSON(content);
        const state = EditorState.create({
          doc,
          plugins: viewRef.current.state.plugins,
        });
        viewRef.current.updateState(state);
      }
    }
  }, [content]);

  return (
    <div className="prose-editor-container">
      <div ref={editorRef} className="ProseMirror-wrapper" />
    </div>
  );
}

// Export functions for toolbar commands
export function execCommand(view: EditorView | null, command: () => boolean) {
  if (view) {
    command();
    view.focus();
  }
}

export function toggleBold(view: EditorView | null) {
  if (view) {
    const { state, dispatch } = view;
    toggleMark(mySchema.marks.strong)(state, dispatch);
    view.focus();
  }
}

export function toggleItalic(view: EditorView | null) {
  if (view) {
    const { state, dispatch } = view;
    toggleMark(mySchema.marks.em)(state, dispatch);
    view.focus();
  }
}

export function setHeading(view: EditorView | null, level: number) {
  if (view) {
    const { state, dispatch } = view;
    setBlockType(mySchema.nodes.heading, { level })(state, dispatch);
    view.focus();
  }
}

export function toggleBlockquote(view: EditorView | null) {
  if (view) {
    const { state, dispatch } = view;
    wrapIn(mySchema.nodes.blockquote)(state, dispatch);
    view.focus();
  }
}

export function insertSceneBreak(view: EditorView | null) {
  if (view) {
    const { state, dispatch } = view;
    const { tr } = state;
    const node = mySchema.nodes.scene_break.create();
    tr.replaceSelectionWith(node);
    dispatch(tr);
    view.focus();
  }
}

export function insertOrnamentalBreak(view: EditorView | null, symbol: string = '✦') {
  if (view) {
    const { state, dispatch } = view;
    const { tr } = state;
    const node = mySchema.nodes.ornamental_break.create({ symbol });
    tr.replaceSelectionWith(node);
    dispatch(tr);
    view.focus();
  }
}

export { mySchema };
