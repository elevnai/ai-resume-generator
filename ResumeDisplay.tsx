
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { exportResumeAsDocx, generateDocxBlob } from './services/googleDocsService';
import { LoadingSpinner, DownloadIcon, EditIcon, SaveIcon, CopyIcon, ChevronIcon, ShareIcon } from './icons';

interface ResumeDisplayProps {
  resumeText: string;
  isLoading: boolean;
  error: string | null;
  onSaveEdit: (newText: string) => void;
  jobTitle: string;
}

const CommandCenterLoader: React.FC = () => {
    const [text, setText] = useState('');
    const phrases = [
        "Analyzing mission parameters...",
        "Cross-referencing operator experience...",
        "Calibrating tactical focus dial...",
        "Generating strategic countermeasures...",
        "Optimizing for ATS interception...",
        "Finalizing document integrity..."
    ];
    const [phraseIndex, setPhraseIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setText(phrases[phraseIndex]);
    }, [phraseIndex]);

    return (
        <div className="flex flex-col items-center justify-center h-96 space-y-6 text-amg-chrome">
             <div className="relative w-24 h-24">
                 <div className="absolute inset-0 border-4 border-ice-blue/20 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-t-ice-blue rounded-full animate-spin"></div>
                 <div className="absolute inset-4 border-4 border-amg-chrome/10 rounded-full"></div>
                 <div className="absolute inset-4 border-4 border-b-amg-chrome/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
             </div>
             <div className="font-headline tracking-widest-ui text-sm uppercase animate-pulse text-center">
                {text}
             </div>
        </div>
    );
};

export const ResumeDisplay: React.FC<ResumeDisplayProps> = ({
  resumeText,
  isLoading,
  error,
  onSaveEdit,
  jobTitle,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [canShare, setCanShare] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditText(resumeText);
  }, [resumeText]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    if (copyStatus === 'copied') {
      const timer = setTimeout(() => setCopyStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [copyStatus]);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      setCanShare(true);
    }
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
    onSaveEdit(editText);
  };

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(editText);
      setCopyStatus('copied');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownloadClick = () => {
    const safeJobTitle = jobTitle 
        ? jobTitle.replace(/[^a-z0-9]/gi, '_').replace(/_{2,}/g, '_') 
        : 'Tailored_Resume';
    const filename = `Nicholas_Richardson_${safeJobTitle}.docx`;
    exportResumeAsDocx(editText, filename);
  };

  const handleShareClick = async () => {
    if (!navigator.share) return;

    const safeJobTitle = jobTitle 
        ? jobTitle.replace(/[^a-z0-9]/gi, '_').replace(/_{2,}/g, '_') 
        : 'Tailored_Resume';
    const filename = `Nicholas_Richardson_${safeJobTitle}.docx`;

    try {
        const blob = await generateDocxBlob(editText);
        const file = new File([blob], filename, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        
        const shareData = {
            files: [file],
            title: 'Tailored Resume',
            text: `Here is the tailored resume for ${jobTitle}.`,
        };

        // Check if sharing files is supported, otherwise try sharing just the title/text? 
        // For resume app, file is the main point.
        if (navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);
        } else {
             // If files aren't supported (desktop sometimes), just share text or fallback
             console.warn("Device cannot share this file type via native share.");
             alert("Your device does not support sharing files natively. Please use the Download button.");
        }
    } catch (err: any) {
        if (err.name !== 'AbortError') {
            console.error("Share failed:", err);
            alert("Share action failed. Please try downloading instead.");
        }
    }
  };

  if (isLoading) {
    return <CommandCenterLoader />;
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-6 rounded-xl text-center shadow-deep-panel">
        <p className="font-headline uppercase tracking-wide-ui mb-2">System Malfunction</p>
        <p className="font-light text-sm">{error}</p>
      </div>
    );
  }

  if (!resumeText) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-matte-graphite/40 backdrop-blur-lg rounded-xl border border-amg-chrome/30 shadow-deep-panel text-amg-chrome/40">
        <div className="w-16 h-16 border-2 border-amg-chrome/20 rounded-full flex items-center justify-center mb-4">
             <div className="w-2 h-2 bg-amg-chrome/40 rounded-full"></div>
        </div>
        <p className="font-headline tracking-widest-ui uppercase text-xs">Awaiting Generation Protocol</p>
      </div>
    );
  }

  return (
    <div className="bg-matte-graphite/40 backdrop-blur-lg rounded-xl border border-amg-chrome/30 shadow-deep-panel shadow-soft-underglow overflow-hidden flex flex-col h-full min-h-[600px]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-brushed-steel/20 bg-matte-graphite/60">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <div className={`w-2 h-2 rounded-full shadow-glow-ice-blue ${isEditing ? 'bg-amber-400 animate-pulse' : 'bg-ice-blue'}`}></div>
          <span className="text-xs font-headline tracking-wide-ui text-amg-chrome uppercase">
            Status: {isEditing ? 'Manual Override' : 'Output Generated'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
            {/* Copy Button */}
            <button
                onClick={handleCopyClick}
                className="p-2 rounded-lg text-amg-chrome/70 hover:text-ice-blue hover:bg-obsidian-black/50 transition-all duration-300 focus:outline-none group relative"
                aria-label="Copy to Clipboard"
                title="Copy to Clipboard"
            >
                <CopyIcon />
                {copyStatus === 'copied' && (
                    <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-ice-blue text-obsidian-black text-[10px] font-bold py-1 px-2 rounded shadow-glow-ice-blue whitespace-nowrap animate-pulse z-20">
                        COPIED
                    </span>
                )}
            </button>
            
            {/* Download Button */}
            <button
                onClick={handleDownloadClick}
                className="p-2 rounded-lg text-amg-chrome/70 hover:text-ice-blue hover:bg-obsidian-black/50 transition-all duration-300 focus:outline-none"
                aria-label="Download DOCX"
                title="Download DOCX"
            >
                <DownloadIcon />
            </button>

            {/* Share Button - Native iOS Style Trigger */}
            {canShare && (
                <button
                    onClick={handleShareClick}
                    className="p-2 rounded-lg text-ice-blue hover:text-white hover:bg-ice-blue/20 transition-all duration-300 focus:outline-none"
                    aria-label="Share Resume"
                    title="Share (iOS Native)"
                >
                    <ShareIcon className="h-4 w-4" />
                </button>
            )}

            <div className="h-6 w-px bg-amg-chrome/20 mx-2"></div>

            {/* Edit/Save Button */}
            <button
                onClick={isEditing ? handleSaveClick : handleEditClick}
                className={`
                    flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all duration-300
                    ${isEditing 
                        ? 'border-ice-blue text-ice-blue bg-ice-blue/10 shadow-glow-ice-blue' 
                        : 'border-amg-chrome/30 text-amg-chrome/70 hover:text-ice-blue hover:border-ice-blue/50'}
                `}
            >
                {isEditing ? <SaveIcon /> : <EditIcon />}
                <span className="text-xs font-bold tracking-wide uppercase hidden sm:inline">
                    {isEditing ? 'Save' : 'Edit'}
                </span>
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden bg-matte-graphite/20">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full h-full p-6 bg-transparent text-amg-chrome font-mono text-sm leading-relaxed resize-none focus:outline-none focus:bg-obsidian-black/20 transition-colors"
            spellCheck={false}
          />
        ) : (
          <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-8">
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-mono text-sm text-amg-chrome/90 leading-relaxed">
                {resumeText}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
