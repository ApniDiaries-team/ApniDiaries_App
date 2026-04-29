import React, { useState, useRef, useEffect } from 'react'
import Icon from '../../../components/AppIcon'

const RichTextEditor = ({ content, onChange, placeholder, disabled = false, maxLength = 5000 }) => {
  const [isFocused, setIsFocused] = useState(false)
  const [activeFormats, setActiveFormats] = useState({})
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const editorRef = useRef(null)

  const formatOptions = [
    { icon: 'Bold', command: 'bold', tooltip: 'Bold (Ctrl+B)', shortcut: '⌘B' },
    { icon: 'Italic', command: 'italic', tooltip: 'Italic (Ctrl+I)', shortcut: '⌘I' },
    { icon: 'Underline', command: 'underline', tooltip: 'Underline (Ctrl+U)', shortcut: '⌘U' },
    { icon: 'List', command: 'insertUnorderedList', tooltip: 'Bullet List' },
    { icon: 'ListOrdered', command: 'insertOrderedList', tooltip: 'Numbered List' },
    { icon: 'Link', command: 'createLink', tooltip: 'Insert Link' },
    { icon: 'Heading', command: 'formatBlock', arg: 'h3', tooltip: 'Heading' },
    { icon: 'Quote', command: 'formatBlock', arg: 'blockquote', tooltip: 'Quote' },
    { icon: 'Code', command: 'formatBlock', arg: 'pre', tooltip: 'Code Block' },
  ]

  const emojiSuggestions = ['😊', '👍', '❤️', '✨', '🎉', '🏔️', '🌄', '🌊', '🌴', '🏖️', '🍛', '☕', '🚗', '✈️', '🏕️', '🎒', '📸', '🎯', '💡', '🌟']

  // Update counts when content changes
  useEffect(() => {
    if (content) {
      const text = stripHtml(content)
      setCharCount(text.length)
      setWordCount(
        text
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length,
      )
    } else {
      setCharCount(0)
      setWordCount(0)
    }
  }, [content])

  const stripHtml = (html) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const handleFormat = (command, arg = null) => {
    if (disabled) return

    if (command === 'createLink') {
      const url = prompt('Enter URL:')
      if (url) {
        document.execCommand(command, false, url)
      }
    } else if (command === 'insertEmoji') {
      const emoji = prompt('Enter emoji:', '😊')
      if (emoji) {
        document.execCommand('insertText', false, emoji)
      }
    } else {
      document.execCommand(command, false, arg)
    }

    updateActiveFormats()
    editorRef?.current?.focus()
    onChange(editorRef?.current?.innerHTML || '')
  }

  const handleInput = (e) => {
    if (disabled) return

    const newContent = e?.currentTarget?.innerHTML
    onChange(newContent)

    // Update active formats
    updateActiveFormats()

    // Check character limit
    const text = stripHtml(newContent)
    if (text.length > maxLength) {
      // Trim to max length
      const trimmed = text.substring(0, maxLength)
      editorRef.current.innerHTML = trimmed
      onChange(trimmed)
    }
  }

  const handlePaste = (e) => {
    if (disabled) return

    e?.preventDefault()
    const text = e?.clipboardData?.getData('text/plain')
    document.execCommand('insertText', false, text)
    onChange(editorRef?.current?.innerHTML || '')
  }

  const handleKeyDown = (e) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault()
          handleFormat('bold')
          break
        case 'i':
          e.preventDefault()
          handleFormat('italic')
          break
        case 'u':
          e.preventDefault()
          handleFormat('underline')
          break
        case 'l':
          e.preventDefault()
          handleFormat('createLink')
          break
        case 'e':
          e.preventDefault()
          setShowEmojiPicker(!showEmojiPicker)
          break
      }
    }

    // Handle Enter key for better formatting
    if (e.key === 'Enter' && !e.shiftKey) {
      setTimeout(() => {
        updateActiveFormats()
      }, 10)
    }
  }

  const updateActiveFormats = () => {
    if (!editorRef.current) return

    const formats = {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
    }

    setActiveFormats(formats)
  }

  const insertEmoji = (emoji) => {
    if (disabled) return

    document.execCommand('insertText', false, emoji)
    setShowEmojiPicker(false)
    editorRef?.current?.focus()
    onChange(editorRef?.current?.innerHTML || '')
  }

  const clearEditor = () => {
    if (disabled) return

    if (editorRef.current) {
      editorRef.current.innerHTML = ''
      onChange('')
      setActiveFormats({})
    }
  }

  const handleEditorClick = () => {
    if (!disabled) {
      editorRef?.current?.focus()
    }
  }

  return (
    <div
      className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 animate-fade-in-up ${
        isFocused ? 'border-saffron ring-4 ring-saffron/10 shadow-glow' : 'border-border-soft'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      {/* Toolbar */}
      <div className='flex items-center gap-1 px-4 py-3 bg-gradient-to-r from-bg-cream to-bg-soft border-b border-border-soft flex-wrap'>
        {formatOptions?.map((option) => {
          const isActive =
            activeFormats[option.command] || (option.command === 'formatBlock' && document.queryCommandValue('formatBlock') === option.arg)

          return (
            <button
              key={option.command + (option.arg || '')}
              type='button'
              onClick={() => handleFormat(option.command, option.arg)}
              disabled={disabled}
              className={`p-2 rounded-lg transition-all duration-200 group relative ${
                disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-white hover:shadow-sm active:scale-95'
              } ${isActive ? 'bg-gradient-to-r from-saffron/10 to-orange/10 text-saffron' : ''}`}
              title={option.tooltip}
            >
              <Icon
                name={option.icon}
                size={18}
                className={`${disabled ? 'text-text-muted' : isActive ? 'text-saffron' : 'text-text-light group-hover:text-saffron'}`}
              />
              {option.shortcut && (
                <span className='absolute -top-1 -right-1 text-[10px] px-1 py-0.5 bg-saffron/10 text-saffron rounded'>{option.shortcut}</span>
              )}
            </button>
          )
        })}

        {/* Emoji Picker Button */}
        <button
          type='button'
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          disabled={disabled}
          className={`p-2 rounded-lg transition-all duration-200 ${
            disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-white hover:shadow-sm active:scale-95'
          } ${showEmojiPicker ? 'bg-gradient-to-r from-saffron/10 to-orange/10' : ''}`}
          title='Emoji (Ctrl+E)'
        >
          <span className='text-lg'>😊</span>
        </button>

        <div className='flex-1'></div>

        {/* Stats */}
        <div className='flex items-center gap-4 text-xs'>
          <div className='text-text-muted'>
            <span className='font-medium'>{wordCount}</span> words
          </div>
          <div
            className={`font-medium ${
              charCount > maxLength * 0.9 ? 'text-red-500' : charCount > maxLength * 0.7 ? 'text-yellow-500' : 'text-saffron'
            }`}
          >
            {charCount} / {maxLength} chars
          </div>
        </div>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className='px-4 py-3 border-b border-border-soft bg-gradient-to-r from-bg-cream to-white'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-xs font-medium text-text-dark'>Quick Emojis</p>
            <button onClick={() => setShowEmojiPicker(false)} className='text-xs text-text-muted hover:text-saffron'>
              Close
            </button>
          </div>
          <div className='flex flex-wrap gap-2'>
            {emojiSuggestions.map((emoji) => (
              <button
                key={emoji}
                type='button'
                onClick={() => insertEmoji(emoji)}
                className='text-lg w-8 h-8 flex items-center justify-center hover:bg-saffron/10 hover:scale-110 rounded transition-all duration-200'
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={() => !disabled && setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        onClick={handleEditorClick}
        className={`min-h-[200px] md:min-h-[250px] lg:min-h-[300px] p-5 md:p-6 text-base md:text-lg text-text-dark focus:outline-none font-sans leading-relaxed ${
          disabled ? 'cursor-not-allowed' : 'cursor-text'
        }`}
        dangerouslySetInnerHTML={{ __html: content }}
        data-placeholder={placeholder}
        style={{
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          lineHeight: '1.6',
        }}
      />

      {/* Editor Tips & Actions */}
      <div className='px-5 py-3 bg-gradient-to-r from-saffron/5 to-orange/5 border-t border-border-soft'>
        <div className='flex items-center justify-between text-xs'>
          <div className='flex items-center gap-4 flex-wrap'>
            <span className='text-text-muted flex items-center gap-1'>
              <Icon name='Zap' size={12} className='text-saffron' />
              Tips: Use **Bold**, *Italic*
            </span>
            <span className='text-text-muted flex items-center gap-1'>
              <Icon name='Keyboard' size={12} className='text-saffron' />
              Ctrl+B/I/U for formatting
            </span>
            <span className='text-text-muted flex items-center gap-1'>
              <Icon name='Maximize2' size={12} className='text-saffron' />
              Shift+Enter for new line
            </span>
          </div>
          <div className='flex items-center gap-3'>
            <button
              type='button'
              onClick={clearEditor}
              disabled={disabled || !content}
              className='text-xs text-text-muted hover:text-saffron transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Clear
            </button>
            <button
              type='button'
              onClick={() => editorRef.current && editorRef.current.focus()}
              disabled={disabled}
              className='text-xs text-saffron hover:text-saffron-dark font-medium flex items-center gap-1'
            >
              <Icon name='Maximize2' size={12} />
              Focus
            </button>
          </div>
        </div>
      </div>

      {/* Character Limit Warning */}
      {charCount > maxLength * 0.9 && (
        <div className='px-5 py-2 bg-gradient-to-r from-red-500/10 to-red-600/10 border-t border-red-200'>
          <p className='text-xs font-medium text-red-600 flex items-center gap-2'>
            <Icon name='AlertTriangle' size={12} />
            {charCount >= maxLength ? `Character limit reached (${maxLength})` : `Approaching character limit (${charCount}/${maxLength})`}
          </p>
        </div>
      )}

      {/* Placeholder Styling */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--text-muted);
          pointer-events: none;
          font-style: italic;
          opacity: 0.7;
        }

        [contenteditable] h1,
        [contenteditable] h2,
        [contenteditable] h3 {
          font-family: var(--font-family-heading);
          font-weight: bold;
          margin: 1em 0 0.5em;
          color: var(--text-dark);
        }

        [contenteditable] h1 {
          font-size: 1.5em;
        }
        [contenteditable] h2 {
          font-size: 1.3em;
        }
        [contenteditable] h3 {
          font-size: 1.1em;
        }

        [contenteditable] ul,
        [contenteditable] ol {
          margin-left: 1.5em;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }

        [contenteditable] li {
          margin-bottom: 0.25em;
        }

        [contenteditable] a {
          color: var(--color-saffron);
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        [contenteditable] a:hover {
          color: var(--color-saffron-dark);
        }

        [contenteditable] blockquote {
          border-left: 3px solid var(--color-saffron);
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
          color: var(--text-light);
        }

        [contenteditable] pre {
          background: var(--bg-soft);
          padding: 1em;
          border-radius: 0.5em;
          font-family: monospace;
          margin: 1em 0;
          border: 1px solid var(--border-soft);
        }

        [contenteditable]:focus {
          outline: none;
        }
      `}</style>
    </div>
  )
}

export default RichTextEditor
