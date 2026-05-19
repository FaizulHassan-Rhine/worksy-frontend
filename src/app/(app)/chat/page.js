'use client';

import { Suspense } from 'react';
import Spinner from '@/components/ui/Spinner';
import ChatPageContent from '@/components/chat/ChatPageContent';

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
