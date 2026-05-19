'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Check, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import { useWorkspace } from '@/hooks/useWorkspace';
import CreateWorkspaceModal from './CreateWorkspaceModal';

export default function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, setActiveWorkspace, isLoading } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (workspaceId) => {
    setActiveWorkspace(workspaceId);
    setOpen(false);
  };

  return (
    <>
      <div ref={dropdownRef} className="relative border-b border-zinc-200/80 p-3">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50 px-3 py-2.5 text-left transition-all duration-200',
            'hover:border-zinc-300 hover:bg-white hover:shadow-sm',
            open && 'border-zinc-300 bg-white shadow-sm'
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white">
            {activeWorkspace?.type === 'team' ? (
              <Users className="h-4 w-4" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-900">
              {isLoading ? 'Loading...' : activeWorkspace?.name || 'Select workspace'}
            </p>
            <p className="truncate text-xs text-zinc-500">
              {activeWorkspace?.slug || 'No workspace'}
            </p>
          </div>
          <ChevronDown
            className={cn('h-4 w-4 shrink-0 text-zinc-400 transition-transform', open && 'rotate-180')}
          />
        </button>

        {open && (
          <div className="absolute left-3 right-3 top-full z-20 mt-1 overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-lg">
            <div className="max-h-64 overflow-y-auto p-1">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  type="button"
                  onClick={() => handleSelect(workspace.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                    workspace.id === activeWorkspace?.id
                      ? 'bg-zinc-100'
                      : 'hover:bg-zinc-50'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-zinc-900">
                        {workspace.name}
                      </span>
                      <Badge variant={workspace.type}>{workspace.type}</Badge>
                    </div>
                    <p className="truncate text-xs text-zinc-500">{workspace.slug}</p>
                  </div>
                  {workspace.id === activeWorkspace?.id && (
                    <Check className="h-4 w-4 shrink-0 text-zinc-900" />
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-zinc-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setCreateOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                <Plus className="h-4 w-4" />
                Create team workspace
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateWorkspaceModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
