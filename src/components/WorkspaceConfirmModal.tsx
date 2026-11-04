import React from 'react';
import { ExternalLink, FileSpreadsheet, FileText, X } from 'lucide-react';
import { useAcademy } from '../context/AcademyContext.tsx';

export function WorkspaceConfirmModal() {
  const {
    pendingWorkspaceExport,
    workspaceExportResult,
    workspaceExportLoading,
    workspaceExportError,
    hasWorkspaceToken,
    cancelWorkspaceExport,
    confirmWorkspaceExport,
  } = useAcademy();

  if (!pendingWorkspaceExport) return null;

  const isDoc = pendingWorkspaceExport.kind === 'doc';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sky-600 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-400">
              {isDoc ? <FileText className="h-5 w-5" /> : <FileSpreadsheet className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {workspaceExportResult
                  ? isDoc
                    ? 'Google Doc Created'
                    : 'Google Sheet Created'
                  : isDoc
                    ? 'Confirm Export to Google Docs'
                    : 'Confirm Export to Google Sheets'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Google Workspace Integration · Explicit User Confirmation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={cancelWorkspaceExport}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!workspaceExportResult ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-sm dark:border-slate-800 dark:bg-slate-950/60">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Target File Title
              </div>
              <div className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                {pendingWorkspaceExport.title}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {pendingWorkspaceExport.summary}
              </p>
            </div>

            {!hasWorkspaceToken && (
              <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                Note: Confirming will open a Google Sign-In popup so you can authorize Google{' '}
                {isDoc ? 'Docs' : 'Sheets'} access for your account.
              </p>
            )}

            {workspaceExportError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                {workspaceExportError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={cancelWorkspaceExport}
                disabled={workspaceExportLoading}
                className="shrink-0 whitespace-nowrap rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmWorkspaceExport()}
                disabled={workspaceExportLoading}
                className="shrink-0 whitespace-nowrap rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
              >
                {workspaceExportLoading
                  ? 'Creating in Google Workspace...'
                  : isDoc
                    ? 'Create Google Doc'
                    : 'Create Google Sheet'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your {isDoc ? 'investigation document' : 'progress spreadsheet'}{' '}
              <span className="font-medium text-slate-900 dark:text-white">
                {workspaceExportResult.title}
              </span>{' '}
              is ready in your Google Drive.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={cancelWorkspaceExport}
                className="shrink-0 whitespace-nowrap rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Done
              </button>
              <a
                href={workspaceExportResult.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
              >
                <span>Open in Google {isDoc ? 'Docs' : 'Sheets'}</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
