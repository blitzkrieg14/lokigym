import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, ExternalLink, X, Sparkles, ArrowRight, ShieldCheck, FileBox } from 'lucide-react';
import { AppUpdateInfo, triggerDownload, dismissUpdate } from '../services/updateService';

interface AppUpdateModalProps {
  updateInfo: AppUpdateInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AppUpdateModal({ updateInfo, isOpen, onClose }: AppUpdateModalProps) {
  if (!isOpen || !updateInfo) return null;

  const handleDownload = () => {
    triggerDownload(updateInfo.downloadUrl);
  };

  const handleDismiss = () => {
    dismissUpdate(updateInfo.latestVersion);
    onClose();
  };

  const formattedDate = updateInfo.publishedAt
    ? new Date(updateInfo.publishedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : '';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg bg-[#0e0e10] border border-brand/40 shadow-[0_0_50px_rgba(255,215,0,0.15)] flex flex-col max-h-[90vh] overflow-hidden rounded-none"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-border-dark flex items-start justify-between bg-dark-surface/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand/10 border border-brand/30 flex items-center justify-center text-brand">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-brand uppercase tracking-widest font-extrabold block">
                  GitHub Release Update
                </span>
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                  {updateInfo.releaseTitle || `Loki Gym v${updateInfo.latestVersion}`}
                </h3>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition rounded-none cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 font-sans text-xs">
            {/* Version Diff Banner */}
            <div className="bg-dark-surface border border-border-dark p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase block">Installed</span>
                <span className="font-mono text-sm font-bold text-zinc-300">v{updateInfo.currentVersion}</span>
              </div>
              <div className="text-brand">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-mono text-brand uppercase block font-bold">Latest Release</span>
                <span className="font-mono text-sm font-black text-brand">v{updateInfo.latestVersion}</span>
              </div>
              {formattedDate && (
                <div className="text-right">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block">Published</span>
                  <span className="font-mono text-[11px] text-zinc-400">{formattedDate}</span>
                </div>
              )}
            </div>

            {/* APK Asset Tag */}
            {updateInfo.apkFileName && (
              <div className="flex items-center justify-between p-2.5 bg-brand/5 border border-brand/20 text-zinc-300 font-mono text-[11px]">
                <div className="flex items-center gap-2 truncate">
                  <FileBox className="w-4 h-4 text-brand shrink-0" />
                  <span className="truncate">{updateInfo.apkFileName}</span>
                </div>
                {updateInfo.apkSizeFormatted && (
                  <span className="font-bold text-brand shrink-0 ml-2">{updateInfo.apkSizeFormatted}</span>
                )}
              </div>
            )}

            {/* Release Notes */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-extrabold block">
                What's New in this Release:
              </span>
              <div className="bg-black/60 border border-border-dark p-3.5 font-mono text-[11px] text-zinc-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap select-text">
                {updateInfo.releaseNotes}
              </div>
            </div>

            {/* Android Install Note */}
            <div className="flex items-start gap-2 text-[10px] text-zinc-400 font-mono border-l-2 border-brand/40 pl-2.5 py-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
              <span>
                Direct APK download from <strong className="text-white">github.com/blitzkrieg14/lokigym</strong>. Tap Download, then tap the downloaded APK notification to install the update over your current app.
              </span>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 sm:p-5 border-t border-border-dark bg-dark-surface/40 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <a
              href={updateInfo.releaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-zinc-400 hover:text-brand flex items-center gap-1 transition"
            >
              <span>View GitHub Page</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 sm:flex-initial py-2 px-4 border border-border-dark text-zinc-400 hover:text-white text-xs font-mono uppercase tracking-wider transition rounded-none cursor-pointer"
              >
                Later
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 sm:flex-initial py-2 px-5 bg-brand hover:bg-white text-black font-black font-mono text-xs uppercase tracking-wider transition rounded-none cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(255,215,0,0.3)]"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Download APK</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
