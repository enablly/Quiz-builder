import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote, Highlighter, Heading4, Undo, Redo, RemoveFormatting } from 'lucide-react';

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Write guidance, key metrics, and insights...", 
  minHeight = "130px",
  id
}) {
  const editorRef = useRef(null);
  const isInternalUpdate = useRef(false);

  // Sync external value with editor HTML if changed externally
  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      const currentHtml = editorRef.current.innerHTML;
      const cleanValue = value || '';
      if (currentHtml !== cleanValue) {
        editorRef.current.innerHTML = cleanValue;
      }
    }
    isInternalUpdate.current = false;
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isInternalUpdate.current = true;
      const html = editorRef.current.innerHTML;
      // If editor contains just <p><br></p> or <br> or whitespace, treat as empty
      const isBlank = !editorRef.current.textContent.trim() && !editorRef.current.querySelector('img');
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
    // Check if selection is already in this tag or format
    document.execCommand('formatBlock', false, tag);
    handleInput();
  };

  const formatHighlight = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    // Toggle highlight using hiliteColor or mark
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
      </div>

      {/* WYSIWYG Content Editable Area with Google Docs-like typography & Enter handling */}
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
    </div>
  );
}
