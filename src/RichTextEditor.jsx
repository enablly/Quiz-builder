import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote, Highlighter, Heading4, Undo, Redo, RemoveFormatting, Link as LinkIcon, Code as CodeIcon, Eye } from 'lucide-react';

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Write guidance, key metrics, and insights...", 
  minHeight = "130px",
  id,
  showCodeToggle = false
}) {
  const editorRef = useRef(null);
  const isInternalUpdate = useRef(false);
  const [isRawHtmlMode, setIsRawHtmlMode] = useState(false);

  // Sync external value with editor HTML if changed externally
  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current && !isRawHtmlMode) {
      const currentHtml = editorRef.current.innerHTML;
      const cleanValue = value || '';
      if (currentHtml !== cleanValue) {
        editorRef.current.innerHTML = cleanValue;
      }
    }
    isInternalUpdate.current = false;
  }, [value, isRawHtmlMode]);

  const handleInput = () => {
    if (editorRef.current) {
      isInternalUpdate.current = true;
      const html = editorRef.current.innerHTML;
      // If editor contains just <p><br></p> or <br> or whitespace, treat as empty
      const isBlank = !editorRef.current.textContent.trim() && !editorRef.current.querySelector('img') && !editorRef.current.querySelector('a');
      onChange(isBlank ? '' : html);
    }
  };

  const exec = (command, val = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, val);
    handleInput();
  };

  const formatBlock = (tag) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand('formatBlock', false, tag);
    handleInput();
  };

  const insertLink = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const url = window.prompt("Enter link URL (e.g. https://www.steelcase.com/research):");
    if (url) {
      document.execCommand('createLink', false, url);
      handleInput();
    }
  };

  const formatHighlight = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const isHighlighted = document.queryCommandValue('hiliteColor') === 'rgb(254, 240, 138)';
    if (isHighlighted) {
      document.execCommand('hiliteColor', false, 'transparent');
    } else {
      document.execCommand('hiliteColor', false, '#FEF08A');
    }
    handleInput();
  };

  return (
    <div 
      className="rich-text-editor-container" 
      style={{ 
        border: '1px solid #D1D5DB', 
        borderRadius: '6px', 
        background: 'white',
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
      }}
    >
      {/* Google Docs style intuitive Toolbar */}
      <div 
        style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          alignItems: 'center', 
          gap: '2px', 
          background: '#F9FAFB', 
          padding: '4px 6px', 
          borderBottom: '1px solid #E5E7EB',
          userSelect: 'none'
        }}
      >
        {!isRawHtmlMode && (
          <>
            <button
              type="button"
              title="Bold (Ctrl+B)"
              onMouseDown={e => { e.preventDefault(); exec('bold'); }}
              style={{ background: 'none', border: 'none', padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#374151' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E5E7EB'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <Bold size={13} />
            </button>
            <button
              type="button"
              title="Italic (Ctrl+I)"
              onMouseDown={e => { e.preventDefault(); exec('italic'); }}
              style={{ background: 'none', border: 'none', padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#374151' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E5E7EB'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <Italic size={13} />
            </button>
            <button
              type="button"
              title="Underline (Ctrl+U)"
              onMouseDown={e => { e.preventDefault(); exec('underline'); }}
              style={{ background: 'none', border: 'none', padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#374151' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E5E7EB'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <Underline size={13} />
            </button>
            <button
              type="button"
              title="Strikethrough"
              onMouseDown={e => { e.preventDefault(); exec('strikeThrough'); }}
              style={{ background: 'none', border: 'none', padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#374151' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E5E7EB'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <Strikethrough size={13} />
            </button>

            <div style={{ width: '1px', height: '14px', background: '#D1D5DB', margin: '0 3px' }} />

            <button
              type="button"
              title="Bulleted List"
              onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList'); }}
              style={{ background: 'none', border: 'none', padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#374151' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E5E7EB'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <List size={13} />
            </button>
            <button
              type="button"
              title="Numbered List"
              onMouseDown={e => { e.preventDefault(); exec('insertOrderedList'); }}
              style={{ background: 'none', border: 'none', padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#374151' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E5E7EB'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <ListOrdered size={13} />
            </button>
            <button
              type="button"
              title="Blockquote / Indent Callout"
              onMouseDown={e => { e.preventDefault(); formatBlock('blockquote'); }}
              style={{ background: 'none', border: 'none', padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#374151' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E5E7EB'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <Quote size={13} />
            </button>
            <button
              type="button"
              title="Highlight Text"
              onMouseDown={e => { e.preventDefault(); formatHighlight(); }}
              style={{ background: 'none', border: 'none', padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#B45309' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FEF08A'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <Highlighter size={13} />
            </button>
            <button
              type="button"
              title="Subheading (H4)"
              onMouseDown={e => { e.preventDefault(); formatBlock('h4'); }}
              style={{ background: 'none', border: 'none', padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#1E3A8A' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E5E7EB'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <Heading4 size={13} />
            </button>
            <button
              type="button"
              title="Insert Link"
              onMouseDown={e => { e.preventDefault(); insertLink(); }}
              style={{ background: 'none', border: 'none', padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#2563EB' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#DBEAFE'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <LinkIcon size={13} />
            </button>

            <div style={{ width: '1px', height: '14px', background: '#D1D5DB', margin: '0 3px' }} />

            <button
              type="button"
              title="Clear Formatting"
              onMouseDown={e => { e.preventDefault(); exec('removeFormat'); }}
              style={{ background: 'none', border: 'none', padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#6B7280' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E5E7EB'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <RemoveFormatting size={13} />
            </button>
            <button
              type="button"
              title="Undo (Ctrl+Z)"
              onMouseDown={e => { e.preventDefault(); exec('undo'); }}
              style={{ background: 'none', border: 'none', padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#6B7280' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E5E7EB'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <Undo size={13} />
            </button>
            <button
              type="button"
              title="Redo (Ctrl+Y)"
              onMouseDown={e => { e.preventDefault(); exec('redo'); }}
              style={{ background: 'none', border: 'none', padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#6B7280' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E5E7EB'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <Redo size={13} />
            </button>
          </>
        )}

        {showCodeToggle && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setIsRawHtmlMode(!isRawHtmlMode)}
              style={{ 
                background: isRawHtmlMode ? '#EFF6FF' : '#FFFFFF', 
                border: isRawHtmlMode ? '1px solid #93C5FD' : '1px solid #D1D5DB', 
                padding: '2px 8px', 
                borderRadius: '4px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                fontSize: '11px',
                color: isRawHtmlMode ? '#1D4ED8' : '#4B5563',
                fontWeight: 600
              }}
              title={isRawHtmlMode ? "Switch to Visual WYSIWYG Editor" : "Switch to Raw HTML Code View"}
            >
              {isRawHtmlMode ? <Eye size={12} /> : <CodeIcon size={12} />}
              <span>{isRawHtmlMode ? "Visual Editor" : "HTML Code"}</span>
            </button>
          </div>
        )}
      </div>

      {/* WYSIWYG or Raw HTML Area */}
      {isRawHtmlMode ? (
        <textarea
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            minHeight: minHeight,
            padding: '12px 14px',
            outline: 'none',
            border: 'none',
            fontSize: '12px',
            fontFamily: 'monospace',
            lineHeight: '1.6',
            color: '#1E293B',
            background: '#F8FAFC',
            resize: 'vertical',
            boxSizing: 'border-box',
            display: 'block'
          }}
        />
      ) : (
        <div
          id={id}
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          data-placeholder={placeholder}
          style={{
            minHeight: minHeight,
            padding: '12px 14px',
            outline: 'none',
            fontSize: '13.5px',
            lineHeight: '1.65',
            color: '#1F2937',
            background: 'white',
            overflowY: 'auto'
          }}
          className="wysiwyg-content"
        />
      )}
    </div>
  );
}
