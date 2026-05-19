'use client';

import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '@/constants/branding';

export default function AuthShell({ children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(24,24,27,0.06),_transparent_55%)]"
      />

      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-lg">
            <Layers className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-zinc-500">{APP_TAGLINE}</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: 'easeOut' }}
          className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.06)] sm:p-8"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
