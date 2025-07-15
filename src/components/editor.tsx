"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon,
  List, ListOrdered, RemoveFormatting, Send, Smile, ImageIcon
} from "lucide-react";
import { useCallback, useState, useEffect, useRef } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

// Helper function to handle file reading
const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const Tiptap = () => {
  const [hasContent, setHasContent] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        validate: href => /^https?:\/\//.test(href),
      }),
    ],
    content: ``,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none p-4 min-h-[100px] max-h-[250px] overflow-y-auto",
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              readFileAsDataURL(file).then(url => {
                // Insert the image at the current cursor position
                const { schema } = view.state;
                if (schema.nodes.image) {
                  const node = schema.nodes.image.create({ src: url });
                  const transaction = view.state.tr.replaceSelectionWith(node);
                  view.dispatch(transaction);
                }
              }).catch(error => {
                console.error('Error pasting image:', error);
              });
              return true;
            }
          }
        }
        return false;
      }
    },
    onUpdate: ({ editor }) => {
      setHasContent(editor.getText().trim().length > 0);
    },
    immediatelyRender: false,
  });

  return (
    <div className="border rounded-lg bg-gray-100 dark:bg-gray-800 flex flex-col">
      <MenuBar editor={editor} />
      <div className="flex-grow">
        <EditorContent editor={editor} />
      </div>
      <Footer editor={editor} hasContent={hasContent} />
    </div>
  );
};

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const [isLinkEditorVisible, setLinkEditorVisible] = useState(false);
  const [, setForceUpdate] = useState(0);

  useEffect(() => {
    if (!editor) {
      return;
    }
    const handleUpdate = () => setForceUpdate(c => c + 1);

    editor.on('transaction', handleUpdate);
    return () => {
      editor.off('transaction', handleUpdate);
    };
  }, [editor]);


  const toggleLinkEditor = useCallback(() => {
    setLinkEditorVisible(prev => !prev);
  }, []);

  const setLink = useCallback((url: string) => {
    if (!editor) return;
    toggleLinkEditor();
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor, toggleLinkEditor]);

  if (!editor) {
    return null;
  }

  const activeClass = "bg-blue-500 text-white";
  const buttonClass = (isActive: boolean) => "hover:bg-slate-200 dark:hover:bg-slate-700 " + (isActive ? activeClass : "") + " px-2 py-1 rounded text-sm transition-colors";
  const iconButtonClass = (isActive: boolean) => "hover:bg-slate-200 dark:hover:bg-slate-700 " + (isActive ? activeClass : "") + " p-1 rounded transition-colors";

  return (
    <div className="relative flex items-center gap-2 border-b p-2 flex-wrap">
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={buttonClass(editor.isActive('heading', { level: 1 }))} title="Heading 1">H1</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={buttonClass(editor.isActive('heading', { level: 2 }))} title="Heading 2">H2</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={buttonClass(editor.isActive('heading', { level: 3 }))} title="Heading 3">H3</button>
      <button onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={iconButtonClass(editor.isActive("bold"))} title="Bold"><Bold className="w-5 h-5" /></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={iconButtonClass(editor.isActive("italic"))} title="Italic"><Italic className="w-5 h-5" /></button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={iconButtonClass(editor.isActive("underline"))} title="Underline"><UnderlineIcon className="w-5 h-5" /></button>
      <button onClick={toggleLinkEditor} className={iconButtonClass(editor.isActive("link"))} title="Link"><LinkIcon className="w-5 h-5" /></button>
      <button onClick={
        () => editor.chain().focus().toggleBulletList().run()
      }

        className={
          iconButtonClass(editor.isActive('bulletList'))
        }

        title="Bullet List"><List className="w-5 h-5" /></button><button onClick={
          () => editor.chain().focus().toggleOrderedList().run()
        }

          className={
            iconButtonClass(editor.isActive('orderedList'))
          }

          title="Ordered List"><ListOrdered className="w-5 h-5" /></button>
      <button onClick={() => editor.chain().focus().unsetAllMarks().run()} title="Clear Formatting"><RemoveFormatting className="w-5 h-5" /></button>
      {isLinkEditorVisible && <LinkEditor currentUrl={editor.getAttributes('link').href} onSetLink={setLink} onCancel={toggleLinkEditor} />}
    </div>
  );
};

const LinkEditor = ({ currentUrl, onSetLink, onCancel }: { currentUrl: string, onSetLink: (url: string) => void, onCancel: () => void }) => {
  const [url, setUrl] = useState(currentUrl);

  return (
    <div className="absolute top-full left-2 z-10 mt-1 p-2 bg-white dark:bg-black border rounded-lg shadow-lg flex items-center gap-2">
      <input type="url" placeholder="Enter URL" value={url} onChange={(e) => setUrl(e.target.value)} className="p-1 border rounded bg-transparent focus:outline-none" />
      <button onClick={() => onSetLink(url)} className="p-1 bg-blue-500 text-white rounded">Set</button>
      <button onClick={onCancel} className="p-1 bg-gray-300 dark:bg-gray-600 rounded">Cancel</button>
    </div>
  )
}

const Footer = ({ editor, hasContent }: { editor: Editor | null, hasContent: boolean }) => {
  const [isEmojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const onEmojiClick = (emojiData: EmojiClickData, event: MouseEvent) => {
    editor.chain().focus().insertContent(emojiData.emoji).run();
    setEmojiPickerVisible(false);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editor) {
      try {
        const url = await readFileAsDataURL(file);
        // Insert image using insertContent which is the correct API
        editor.chain().focus().insertContent({
          type: 'image',
          attrs: { src: url }
        }).run();

        // Clear the input for future selection
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center p-2 border-t relative">
      {isEmojiPickerVisible && (
        <div className="absolute bottom-full mb-2">
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}
      <div className="flex items-center gap-2 text-gray-500">
        <button title="Emojis" onClick={() => setEmojiPickerVisible(!isEmojiPickerVisible)}>
          <Smile className="w-5 h-5" />
        </button>
        <button title="Attach file" onClick={handleImageUpload}>
          <ImageIcon className="w-5 h-5" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          aria-label="File upload"
        />
      </div>
      <div className="ml-auto">
        <button title="Send" disabled={!hasContent} className={`p-2 rounded-md ${hasContent ? 'bg-green-500 text-white' : 'bg-green-300 text-white cursor-not-allowed'}`}
          onClick={() => {
            console.log(editor.getHTML());
            editor.commands.clearContent();
          }}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default Tiptap;