import React, { useState } from 'react';
import { X, Download, Copy, Check } from 'lucide-react';
import { CSTerm, TranscriptSentence } from '../types';

interface ExportModalProps {
  transcriptHistory: TranscriptSentence[];
  customGlossary: CSTerm[];
  onClose: () => void;
}

export default function ExportModal({
  transcriptHistory,
  onClose
}: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'markdown' | 'txt' | 'html'>('markdown');
  const [includeBookmarksOnly, setIncludeBookmarksOnly] = useState(false);
  const [includeGlossary, setIncludeGlossary] = useState(true);
  const [copied, setCopied] = useState(false);

  const generateExportContent = () => {
    const linesToExport = includeBookmarksOnly
      ? transcriptHistory.filter(i => i.bookmarked)
      : transcriptHistory;

    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const termMap = new Map<string, CSTerm>();
    linesToExport.forEach(item => {
      if (item.detectedTerms) {
        item.detectedTerms.forEach(t => termMap.set(t.id, t));
      }
    });

    if (exportFormat === 'markdown') {
      let md = `# CS & AI Academic Lecture Transcript & Notes\n`;
      md += `**Date:** ${dateStr} | **Total Captions:** ${linesToExport.length}\n\n`;
      md += `---\n\n## 📝 Lecture Transcripts & Bilingual Captions\n\n`;

      linesToExport.forEach((item, idx) => {
        const starTag = item.bookmarked ? '⭐ [BOOKMARKED] ' : '';
        md += `### ${idx + 1}. [${item.time || 'Live'}] ${starTag}${item.speaker ? item.speaker : ''}\n`;
        md += `- **EN:** ${item.english}\n`;
        md += `- **CN:** ${item.chinese}\n\n`;
      });

      if (includeGlossary && termMap.size > 0) {
        md += `---\n\n## 📚 CS Key Terminology Glossary\n\n`;
        termMap.forEach(term => {
          md += `### 🔹 ${term.term} (${term.chinese}) - *${term.category}*\n`;
          md += `**Definition:** ${term.definition}\n`;
          md += `**解析:** ${term.definitionCn || term.chinese}\n`;
          if (term.codeExample) {
            md += `\`\`\`\n${term.codeExample}\n\`\`\`\n`;
          }
          md += `\n`;
        });
      }

      return md;
    } else if (exportFormat === 'txt') {
      let txt = `CS ACADEMIC LECTURE TRANSCRIPT (${dateStr})\n`;
      txt += `=`.repeat(50) + `\n\n`;

      linesToExport.forEach((item) => {
        txt += `[${item.time || 'Live'}] ${item.english}\n`;
        txt += `[译] ${item.chinese}\n\n`;
      });

      return txt;
    } else {
      let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Lecture Notes</title></head><body style="font-family:sans-serif;padding:30px;max-width:800px;margin:0 auto;line-height:1.6;">`;
      html += `<h1>CS Academic Lecture Notes (${dateStr})</h1><hr/>`;
      linesToExport.forEach(item => {
        html += `<div style="margin-bottom:16px;">`;
        html += `<strong>[${item.time || 'Live'}]</strong> <p style="font-weight:600;margin:4px 0;">${item.english}</p>`;
        html += `<p style="color:#0284c7;margin:4px 0;">${item.chinese}</p>`;
        html += `</div>`;
      });
      html += `</body></html>`;
      return html;
    }
  };

  const handleDownload = () => {
    const content = generateExportContent();
    const extension = exportFormat === 'markdown' ? 'md' : (exportFormat === 'txt' ? 'txt' : 'html');
    const mimeType = exportFormat === 'html' ? 'text/html' : 'text/plain';

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CS_Lecture_Notes_${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const content = generateExportContent();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel animate-float-up" style={{
        width: '100%',
        maxWidth: '560px',
        padding: '28px',
        borderRadius: '24px',
        background: 'var(--bg-main)',
        border: '1px solid var(--border-glow)'
      }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)' }}>
              <Download size={20} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
                Export CS Lecture Notes & Captions
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Download structured transcripts, star notes & CS terminology glossary
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-secondary" style={{ padding: '8px', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Format Selection */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
            Export File Format
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'markdown', label: 'Markdown (.md)' },
              { id: 'txt', label: 'Plain Text (.txt)' },
              { id: 'html', label: 'HTML Notes (.html)' }
            ].map(fmt => (
              <button
                key={fmt.id}
                onClick={() => setExportFormat(fmt.id as 'markdown' | 'txt' | 'html')}
                className={exportFormat === fmt.id ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, padding: '8px', fontSize: '0.82rem', justifyContent: 'center' }}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Checkboxes */}
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={includeBookmarksOnly}
              onChange={(e) => setIncludeBookmarksOnly(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#38bdf8' }}
            />
            Export bookmarked (starred) lines only ({transcriptHistory.filter(i => i.bookmarked).length} items)
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={includeGlossary}
              onChange={(e) => setIncludeGlossary(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#38bdf8' }}
            />
            Append CS Terminology Glossary & Code Examples
          </label>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleCopy} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>
            {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
            {copied ? 'Copied to Clipboard' : 'Copy to Clipboard'}
          </button>

          <button onClick={handleDownload} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>
            <Download size={16} /> Download File
          </button>
        </div>

      </div>
    </div>
  );
}
