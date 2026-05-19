'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Spinner from '@/components/ui/Spinner';
import ChatComposer from '@/components/chat/ChatComposer';
import MessageFile from '@/components/chat/MessageFile';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import messageService from '@/services/messageService';
import fileService from '@/services/fileService';
import { formatMessageDate, formatMessageTime } from '@/lib/date';
import { cn } from '@/lib/utils';

const POLL_MS = 4000;

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function ChatPanel({
  workspaceId,
  projectId = null,
  recipientId = null,
  title = 'Team chat',
  subtitle,
  className,
  compact = false,
  showHeader = true,
}) {
  const { user } = useAuth();
  const { error: toastError } = useToast();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef(null);
  const lastFetchRef = useRef(null);

  const isDm = Boolean(recipientId);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = useCallback(
    async (initial = false) => {
      if (!workspaceId) {
        setMessages([]);
        setIsLoading(false);
        return;
      }

      if (initial) setIsLoading(true);

      try {
        const since = initial ? null : lastFetchRef.current;
        const data = await messageService.getMessages({
          workspaceId,
          projectId,
          recipientId,
          since,
        });

        const incoming = data.messages || [];

        if (initial) {
          setMessages(incoming);
          if (incoming.length > 0) {
            lastFetchRef.current = incoming[incoming.length - 1].createdAt;
          }
        } else if (incoming.length > 0) {
          setMessages((prev) => {
            const ids = new Set(prev.map((m) => m.id));
            const merged = [...prev];
            incoming.forEach((m) => {
              if (!ids.has(m.id)) merged.push(m);
            });
            return merged;
          });
          lastFetchRef.current = incoming[incoming.length - 1].createdAt;
        }
      } catch (err) {
        if (initial) {
          toastError(err.response?.data?.message || 'Failed to load messages');
        }
      } finally {
        if (initial) setIsLoading(false);
      }
    },
    [workspaceId, projectId, recipientId, toastError]
  );

  useEffect(() => {
    lastFetchRef.current = null;
    setInput('');
    loadMessages(true);
  }, [loadMessages]);

  useEffect(() => {
    if (!workspaceId) return undefined;

    const interval = setInterval(() => loadMessages(false), POLL_MS);
    return () => clearInterval(interval);
  }, [workspaceId, projectId, recipientId, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async ({ text, file }) => {
    if ((!text && !file) || !workspaceId || isSending) return;

    setIsSending(true);
    try {
      let fileId = null;

      if (file) {
        const uploadData = await fileService.upload({
          file,
          workspaceId,
          projectId: projectId || undefined,
        });
        fileId = uploadData.file?.id;
      }

      const data = await messageService.sendMessage({
        workspaceId,
        projectId,
        recipientId,
        content: text,
        fileId,
      });
      setMessages((prev) => [...prev, data.message]);
      lastFetchRef.current = data.message.createdAt;
      setInput('');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const emptyTitle = isDm ? 'Start a private chat' : 'Start the conversation';
  const emptyDesc = isDm
    ? 'Send a message — only you and this person can see it.'
    : 'Send a message to your team. Everyone in this channel can see it.';

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900',
        compact ? 'h-[min(400px,60dvh)]' : 'h-full min-h-[min(400px,50dvh)]',
        className
      )}
    >
      {showHeader && (
        <div className="shrink-0 border-b border-zinc-200/80 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{emptyTitle}</p>
            <p className="mt-1 max-w-xs text-xs text-zinc-500 dark:text-zinc-400">{emptyDesc}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                {formatMessageDate(messages[0]?.createdAt)}
              </span>
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            </div>

            <ul className="space-y-5">
              {messages.map((msg) => {
                const isOwn =
                  user?.id && msg.sender?.id && String(msg.sender.id) === String(user.id);
                const senderName = isOwn ? 'You' : msg.sender?.name || 'Member';

                return (
                  <li key={msg.id} className="flex gap-3">
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                        isOwn
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                          : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200'
                      )}
                    >
                      {getInitials(msg.sender?.name)}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                          {senderName}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          {formatMessageTime(msg.createdAt)}
                        </span>
                      </div>
                      {msg.content ? (
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                          {msg.content}
                        </p>
                      ) : null}
                      {msg.file ? <MessageFile file={msg.file} /> : null}
                    </div>
                  </li>
                );
              })}
            </ul>
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <ChatComposer
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={!workspaceId || (isDm && !recipientId)}
        isSending={isSending}
        placeholder={isDm ? 'Write a private message...' : 'Write a message...'}
      />
    </div>
  );
}
