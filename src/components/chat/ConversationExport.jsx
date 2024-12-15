// src/components/chat/ConversationExport.jsx
import React, { useState } from 'react';
import { Download, File, Share2, Save, FileText, FileCog } from 'lucide-react';
import { useStore } from '../../store/globalStore';
import { eventBus, EventTypes } from '../../services/events/EventBus';
import { performanceMonitor } from '../../services/performance/PerformanceMonitor';

const ExportFormats = {
  JSON: 'json',
  MARKDOWN: 'markdown',
  TEXT: 'text',
  HTML: 'html'
};

const ConversationExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(ExportFormats.MARKDOWN);
  const { messages, currentSession } = useStore();

  const formatMessage = (message, format) => {
    switch (format) {
      case ExportFormats.MARKDOWN:
        return `### ${message.type === 'user' ? '👤 Utilisateur' : '🤖 Assistant'}\n${message.content}\n\n` +
               (message.documents?.length ? 
                `📎 Documents référencés:\n${message.documents.map(d => `- ${d.source}`).join('\n')}\n\n` : '');

      case ExportFormats.TEXT:
        return `[${message.type === 'user' ? 'Utilisateur' : 'Assistant'}]\n${message.content}\n\n`;

      case ExportFormats.HTML:
        return `<div class="message ${message.type}">
          <h3>${message.type === 'user' ? 'Utilisateur' : 'Assistant'}</h3>
          <p>${message.content}</p>
          ${message.documents?.length ? 
            `<div class="documents">
              <h4>Documents référencés:</h4>
              <ul>${message.documents.map(d => `<li>${d.source}</li>`).join('')}</ul>
            </div>` : ''}
        </div>`;

      default:
        return message;
    }
  };

  const exportConversation = async () => {
    const perfMark = performanceMonitor.startMeasure('export_conversation');
    setIsExporting(true);

    try {
      let content = '';
      const metadata = {
        exportDate: new Date().toISOString(),
        sessionId: currentSession?.session_id,
        messageCount: messages.length
      };

      switch (selectedFormat) {
        case ExportFormats.JSON:
          content = JSON.stringify({ metadata, messages }, null, 2);
          break;

        case ExportFormats.MARKDOWN:
          content = `# Conversation Export\n\n` +
                   `Date: ${new Date().toLocaleString()}\n` +
                   `Session: ${currentSession?.session_id}\n\n` +
                   messages.map(m => formatMessage(m, ExportFormats.MARKDOWN)).join('---\n\n');
          break;

        case ExportFormats.HTML:
          content = `<!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>Conversation Export</title>
                <style>
                  .message { margin: 1em 0; padding: 1em; border-radius: 0.5em; }
                  .user { background: #f0f9ff; }
                  .assistant { background: #f0fdf4; }
                  .documents { margin-top: 1em; font-size: 0.9em; }
                </style>
              </head>
              <body>
                <h1>Conversation Export</h1>
                <div class="metadata">
                  <p>Date: ${new Date().toLocaleString()}</p>
                  <p>Session: ${currentSession?.session_id}</p>
                </div>
                ${messages.map(m => formatMessage(m, ExportFormats.HTML)).join('\n')}
              </body>
            </html>`;
          break;

        default:
          content = messages.map(m => formatMessage(m, ExportFormats.TEXT)).join('\n');
      }

      // Créer et télécharger le fichier
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${currentSession?.session_id}-${new Date().toISOString()}.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      eventBus.emit(EventTypes.SYSTEM.INFO, {
        message: `Conversation exportée en ${selectedFormat}`,
        sessionId: currentSession?.session_id
      });

    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      eventBus.emit(EventTypes.SYSTEM.ERROR, {
        message: 'Erreur lors de l\'export de la conversation',
        error
      });
    } finally {
      setIsExporting(false);
      performanceMonitor.endMeasure(perfMark);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Exporter la conversation
        </h3>
        {isExporting && (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
        )}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {Object.values(ExportFormats).map(format => (
            <button
              key={format}
              onClick={() => setSelectedFormat(format)}
              className={`flex items-center justify-center p-3 rounded-lg border 
                ${selectedFormat === format 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700'}`}
            >
              {format === ExportFormats.JSON && <FileCog className="w-5 h-5 mr-2" />}
              {format === ExportFormats.MARKDOWN && <FileText className="w-5 h-5 mr-2" />}
              {format === ExportFormats.TEXT && <File className="w-5 h-5 mr-2" />}
              {format === ExportFormats.HTML && <Save className="w-5 h-5 mr-2" />}
              <span className="text-sm capitalize">{format}</span>
            </button>
          ))}
        </div>

        <button
          onClick={exportConversation}
          disabled={isExporting || !messages.length}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 
                   text-white rounded-lg hover:bg-blue-700 disabled:opacity-50
                   disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Export en cours...
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              Exporter ({messages.length} messages)
            </>
          )}
        </button>

        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            eventBus.emit(EventTypes.SYSTEM.INFO, {
              message: 'Lien de la conversation copié'
            });
          }}
          className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 
                   dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg 
                   hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Partager le lien
        </button>
      </div>
    </div>
  );
};

export default ConversationExport;
