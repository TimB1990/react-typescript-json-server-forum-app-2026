import React, { useEffect, useRef } from 'react'

interface RichTextEditorProps {
    value: string,
    onChange: (htmlContent: string) => void;
    placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder = 'Write your response here'
}) => {
    const editorRef = useRef<HTMLDivElement>(null)

    // sync external value stanges (inserted quotes) in to the contentEditable DOM
    useEffect(() => {
        if(editorRef.current && editorRef.current.innerHTML !== value){
            editorRef.current.innerHTML = value;
        }
    }, [value])

    // helper to get current Selection and Range
    const getSelectedRange = (): Range | null => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return null;
        return selection.getRangeAt(0)
    }

    // wrapper helper to enclose selection in an HTML element tag
    const wrapSelectionWithTag = (tagName: string) => {
        const range = getSelectedRange();
        if (!range || range.collapsed) return // Exit is nothing is selected
        const element = document.createElement(tagName)

        try {
            // direct approach
            range.surroundContents(element)
        } catch {
            // fallacbk for complex selection spanning multiple nodes
            const contents = range.extractContents();
            element.appendChild(contents)
            range.insertNode(element); // Insert modified element into DOM
        }

        handleContentChange();
    }

    // helper to insert structured elements like links
    const handleAddLink = () => {
        const range = getSelectedRange();
        if (!range || range.collapsed) return
        const url = prompt('Enter URL:');

        if (url) {
            const anchor = document.createElement('a')
            anchor.href = url;
            anchor.target = '_blank',
                anchor.rel = 'noopener noreferrer'

            try {
                range.surroundContents(anchor); // 
            } catch {
                const contents = range.extractContents();
                anchor.appendChild(contents);
                range.insertNode(anchor); // 
            }
            handleContentChange();
        }
    }

    // notify parent component on DOM change
    const handleContentChange = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML)
        }
    }

    return (
        <div className="wysiwyg-container">
            {/* 1. Editor Toolbar */}
            <div className="wysiwyg-toolbar">
                <button
                    type="button"
                    onClick={() => wrapSelectionWithTag('strong')}
                    title="Bold"
                >
                    <b>B</b>
                </button>
                <button
                    type="button"
                    onClick={() => wrapSelectionWithTag('em')}
                    title="Italic"
                >
                    <i>I</i>
                </button>
                <button
                    type="button"
                    onClick={() => wrapSelectionWithTag('u')}
                    title="Underline"
                >
                    <u>U</u>
                </button>

                <span className="toolbar-divider" />

                <button
                    type="button"
                    onClick={() => wrapSelectionWithTag('h2')}
                    title="Heading 2"
                >
                    H2
                </button>
                <button
                    type="button"
                    onClick={() => wrapSelectionWithTag('h3')}
                    title="Heading 3"
                >
                    H3
                </button>

                <span className="toolbar-divider" />

                <button
                    type="button"
                    onClick={handleAddLink}
                    title="Insert Link"
                >
                    🔗 Link
                </button>
            </div>

            {/* 2. Content Editable Area */}
            <div
                ref={editorRef}
                className="wysiwyg-editor"
                contentEditable={true}
                onInput={handleContentChange}
                onBlur={handleContentChange}
                data-placeholder={placeholder}
                aria-label="Rich text editor"
            />
        </div>
    )
}
