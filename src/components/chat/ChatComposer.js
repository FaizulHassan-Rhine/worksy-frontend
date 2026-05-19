'use client';

import { useRef, useState } from 'react';
import { Paperclip, Send, Smile, X } from 'lucide-react';
import { EMOJI_GROUPS } from '@/constants/emojis';
import { cn } from '@/lib/utils';

export default function ChatComposer({
  value,
  onChange,
  onSend,
  disabled = false,
  isSending = false,
  placeholder = 'Write a message...',
}) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleEmoji = (emoji) => {
    onChange(value + emoji);
    setEmojiOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    e.target.value = '';
  };

  const canSend = (value.trim().length > 0 || pendingFile) && !disabled && !isSending;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSend) return;
    onSend({ text: value.trim(), file: pendingFile });
    setPendingFile(null);
    setEmojiOpen(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t border-zinc-200/80 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-950/50"
    >
      {pendingFile && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-zinc-200/80 bg-white px-3 py-2 text-xs dark:border-zinc-700 dark:bg-zinc-900">
          <Paperclip className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
          <span className="min-w-0 flex-1 truncate text-zinc-700 dark:text-zinc-300">
            {pendingFile.name}
          </span>
          <button
            type="button"
            onClick={() => setPendingFile(null)}
            className="rounded p-0.5 text-zinc-400 hover:text-zinc-600"
            aria-label="Remove file"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="relative rounded-xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        {emojiOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-10"
              aria-label="Close emoji picker"
              onClick={() => setEmojiOpen(false)}
            />
            <div className="absolute bottom-full left-0 z-20 mb-2 w-72 rounded-xl border border-zinc-200/80 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              <div className="max-h-40 space-y-2 overflow-y-auto">
                {EMOJI_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                      {group.label}
                    </p>
                    <div className="flex flex-wrap gap-0.5">
                      {group.emojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleEmoji(emoji)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder={placeholder}
          rows={2}
          maxLength={4000}
          disabled={disabled || isSending}
          className="w-full resize-none rounded-t-xl bg-transparent px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none disabled:opacity-50 dark:text-zinc-50"
        />

        <div className="flex items-center justify-between border-t border-zinc-100 px-2 py-1.5 dark:border-zinc-800">
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setEmojiOpen((o) => !o)}
              disabled={disabled || isSending}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800',
                emojiOpen && 'bg-zinc-100 dark:bg-zinc-800'
              )}
              title="Add emoji"
            >
              <Smile className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isSending}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
              title="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <button
            type="submit"
            disabled={!canSend}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white transition-opacity hover:opacity-90 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  );
}
