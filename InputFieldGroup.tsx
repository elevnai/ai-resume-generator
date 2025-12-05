
import React from 'react';
import { ResumeRequest } from './types';
import { ClearIcon, InfoIcon } from './icons';

interface InputFieldGroupProps {
  resumeRequest: ResumeRequest;
  setResumeRequest: React.Dispatch<React.SetStateAction<ResumeRequest>>;
  onSubmit: () => void;
  isLoading: boolean;
  dialDescriptions: string[] | null;
  isGeneratingDial: boolean;
  dialError: string | null;
}

const VentDivider = () => (
    <div className="pt-6 relative overflow-hidden">
        <div className="h-px bg-gradient-to-r from-transparent via-brushed-steel/40 to-transparent"></div>
        <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-transparent via-ice-blue/40 to-transparent animate-shine-sweep"></div>
    </div>
);

const Tooltip: React.FC<{ title?: string; content: React.ReactNode }> = ({ title, content }) => {
  return (
    <div className="group relative flex items-center ml-2">
      <InfoIcon className="h-4 w-4 text-amg-chrome/50 hover:text-ice-blue cursor-help transition-colors duration-200" />
      <div className="absolute left-1/2 bottom-full mb-3 -translate-x-1/2 w-72 p-4 bg-matte-graphite border border-ice-blue/30 rounded-md shadow-deep-panel opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none backdrop-blur-xl">
        {title && <h4 className="text-ice-blue text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b border-amg-chrome/10">{title}</h4>}
        <div className="text-[11px] text-amg-chrome leading-relaxed font-sans font-light">
            {content}
        </div>
        <div className="absolute left-1/2 top-full -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-ice-blue/30"></div>
      </div>
    </div>
  );
};

const EngageOrb: React.FC<{
  onClick: () => void;
  isLoading: boolean;
  isDisabled: boolean;
}> = ({ onClick, isLoading, isDisabled }) => {
  return (
    <div className="pt-8 flex justify-center">
      <button
        onClick={onClick}
        disabled={isDisabled}
        aria-label={isLoading ? 'Generating...' : 'Engage Engine'}
        className={`
          group relative w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out focus:outline-none focus-visible:ring-4 focus-visible:ring-ice-blue/50
          ${isLoading ? 'scale-110' : 'scale-100'}
          ${isDisabled ? 'cursor-not-allowed' : 'hover:scale-105 active:scale-100'}
        `}
      >
        {/* Background & Idle Pulse */}
        <div className={`
          absolute inset-0 rounded-full bg-obsidian-black transition-all duration-300
          ${isDisabled ? 'grayscale brightness-75' : 'animate-orb-idle-pulse group-hover:shadow-[0_0_45px_-5px_rgba(79,184,255,0.7)] group-hover:scale-105'}
        `}></div>

        {/* Turbine Blades (Rotating) */}
        <div className={`
          absolute inset-0 rounded-full bg-[conic-gradient(from_90deg_at_50%_50%,rgba(79,184,255,0.2)_0%,transparent_50%,rgba(79,184,255,0.2)_100%)]
          [mask-image:radial-gradient(ellipse_at_center,transparent_40%,black_41%)]
          transition-all duration-300
          ${isLoading ? 'animate-orb-rotate-fast' : 'animate-orb-rotate'}
          ${isDisabled ? '!animate-none opacity-20' : 'group-hover:opacity-100 opacity-70'}
        `}></div>
        
        {/* Glassy Surface */}
        <div className="absolute inset-0 rounded-full border-2 border-amg-chrome/30 bg-[radial-gradient(ellipse_at_40%_30%,rgba(255,255,255,0.15),transparent_60%)]"></div>
        
        {/* Expanding pulse when generating */}
        {isLoading && (
          <div className="absolute inset-0 rounded-full bg-ice-blue/30 animate-orb-generating-pulse"></div>
        )}

        {/* Text Label / Spinner */}
        <div className={`
          relative font-headline text-lg tracking-[0.2em] transition-colors duration-300 flex justify-center items-center
          ${isDisabled ? 'text-amg-chrome/40' : 'text-amg-chrome group-hover:text-ice-blue'}
        `}>
          {isLoading ? (
            <div className="w-12 h-12 border-2 border-ice-blue/50 border-t-ice-blue rounded-full animate-spin"></div>
          ) : (
            'ENGAGE'
          )}
        </div>
      </button>
    </div>
  );
};

export const InputFieldGroup: React.FC<InputFieldGroupProps> = ({
  resumeRequest,
  setResumeRequest,
  onSubmit,
  isLoading,
  dialDescriptions,
  isGeneratingDial,
  dialError,
}) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setResumeRequest((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeRequest((prev) => ({ ...prev, roleDial: parseInt(e.target.value, 10) }));
  };

  const isDialReady = resumeRequest.jobTitle.trim().length > 3 && resumeRequest.jobDescription.trim().length > 50;
  const currentDialDescription = dialDescriptions ? dialDescriptions[resumeRequest.roleDial / 10] : '';


  return (
    <div className="bg-matte-graphite/40 backdrop-blur-lg p-6 sm:p-8 rounded-xl border border-amg-chrome/30 space-y-6 shadow-deep-panel shadow-soft-underglow">
      <h2 className="text-2xl font-headline font-bold text-amg-chrome tracking-wide-ui uppercase">Input Parameters</h2>
      
      <div>
        <label htmlFor="jobTitle" className="flex items-center text-sm font-medium text-amg-chrome/80 mb-2">
          Target Job Title
          <Tooltip 
            title="Target Identity"
            content={
                <>
                    Enter the exact job title from the posting. This aligns the resume headline and primary keywords.
                    <div className="mt-2 pt-2 border-t border-amg-chrome/10">
                        <span className="text-ice-blue font-medium">Effective Input:</span> <span className="italic">"Cyber Security Analyst II"</span> instead of just "Analyst".
                    </div>
                </>
            }
          />
        </label>
        <div className="relative">
          <input
            type="text"
            id="jobTitle"
            name="jobTitle"
            value={resumeRequest.jobTitle}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-obsidian-black/50 border border-brushed-steel/30 rounded-md shadow-input-inset focus:outline-none focus:border-ice-blue focus:ring-1 focus:ring-ice-blue focus:shadow-glow-ice-blue text-ice-blue transition-all duration-300 placeholder:text-amg-chrome/40 pr-10"
            placeholder="e.g., Cyber Security Analyst"
          />
          {resumeRequest.jobTitle && (
            <button
              type="button"
              onClick={() => setResumeRequest((prev) => ({ ...prev, jobTitle: '' }))}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-amg-chrome/40 hover:text-ice-blue transition-colors duration-200 focus:outline-none"
              aria-label="Clear Target Job Title"
            >
              <ClearIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="companyName" className="flex items-center text-sm font-medium text-amg-chrome/80 mb-2">
          Company Name (Optional)
          <Tooltip 
            title="Target Target"
            content={
                <>
                    Optional. Generates a professional summary tailored to this specific employer's mission.
                    <div className="mt-2 pt-2 border-t border-amg-chrome/10">
                        <span className="text-ice-blue font-medium">Example:</span> Entering <span className="italic">"Acme Corp"</span> adds "eager to contribute to Acme Corp's security posture..."
                    </div>
                </>
            }
          />
        </label>
        <div className="relative">
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={resumeRequest.companyName}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-obsidian-black/50 border border-brushed-steel/30 rounded-md shadow-input-inset focus:outline-none focus:border-ice-blue focus:ring-1 focus:ring-ice-blue focus:shadow-glow-ice-blue text-ice-blue transition-all duration-300 placeholder:text-amg-chrome/40 pr-10"
            placeholder="e.g., Acme Corporation"
          />
          {resumeRequest.companyName && (
            <button
              type="button"
              onClick={() => setResumeRequest((prev) => ({ ...prev, companyName: '' }))}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-amg-chrome/40 hover:text-ice-blue transition-colors duration-200 focus:outline-none"
              aria-label="Clear Company Name"
            >
              <ClearIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      
      <div>
        <label htmlFor="jobDescription" className="flex items-center text-sm font-medium text-amg-chrome/80 mb-2">
          Job Description
          <Tooltip 
            title="Mission Intel"
            content={
                <>
                    Paste the full job text. The engine extracts hard skills (e.g., "SIEM", "NIST") to mirror the employer's language.
                    <div className="mt-2 pt-2 border-t border-amg-chrome/10">
                        <span className="text-ice-blue font-medium">Tip:</span> Ensure you include the <span className="italic">"Qualifications"</span> and <span className="italic">"Responsibilities"</span> sections.
                    </div>
                </>
            }
          />
        </label>
        <div className="relative">
          <textarea
            id="jobDescription"
            name="jobDescription"
            value={resumeRequest.jobDescription}
            onChange={handleInputChange}
            rows={12}
            className="w-full px-4 py-2 bg-obsidian-black/50 border border-brushed-steel/30 rounded-md shadow-input-inset focus:outline-none focus:border-ice-blue focus:ring-1 focus:ring-ice-blue focus:shadow-glow-ice-blue text-ice-blue transition-all duration-300 placeholder:text-amg-chrome/40 pr-10"
            placeholder="Paste the full job description here..."
          />
          {resumeRequest.jobDescription && (
            <button
              type="button"
              onClick={() => setResumeRequest((prev) => ({ ...prev, jobDescription: '' }))}
              className="absolute top-3 right-3 text-amg-chrome/40 hover:text-ice-blue transition-colors duration-200 focus:outline-none"
              aria-label="Clear Job Description"
            >
              <ClearIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <VentDivider />
        <div className="flex justify-between items-center">
           <label htmlFor="roleDial" className="flex items-center text-sm font-medium text-amg-chrome/80">
             Resume Focus
             <Tooltip 
                title="Tactical vs. Strategic"
                content={
                    <>
                        Adjusts the narrative voice of your bullet points.
                        <div className="mt-2 space-y-1">
                            <div><span className="text-ice-blue font-bold">0%:</span> "Configured firewalls, repaired pumps"</div>
                            <div><span className="text-ice-blue font-bold">100%:</span> "Led security initiatives, optimized workflows"</div>
                        </div>
                    </>
                }
             />
           </label>
           {isGeneratingDial && (
             <div className="flex items-center text-xs text-ice-blue/80">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-ice-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calibrating...
              </div>
           )}
           {dialError && !isGeneratingDial && (
              <div className="text-xs text-red-400">{dialError}</div>
           )}
        </div>
        
        {!isDialReady ? (
           <div className="text-center text-xs text-amg-chrome/50 bg-obsidian-black/50 py-4 px-2 rounded-md border border-brushed-steel/20">
             Provide Target Job Title and Job Description to activate the focus dial.
           </div>
        ) : (
          <div>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-amg-chrome/60 w-16 text-center font-semibold tracking-wide-ui">TACTICAL</span>
              <input
                type="range"
                id="roleDial"
                name="roleDial"
                min="0"
                max="100"
                step="10"
                value={resumeRequest.roleDial}
                onChange={handleSliderChange}
                className="w-full custom-slider"
                disabled={!dialDescriptions || isGeneratingDial}
              />
              <span className="text-xs text-amg-chrome/60 w-16 text-center font-semibold tracking-wide-ui">STRATEGIC</span>
            </div>
            <div className="text-center text-xs text-ice-blue/90 font-medium mt-3 h-4 transition-opacity duration-300">
              {currentDialDescription}
            </div>
          </div>
        )}
      </div>
      
      <EngageOrb 
        onClick={onSubmit}
        isLoading={isLoading}
        isDisabled={isLoading || !resumeRequest.jobDescription.trim()}
      />
    </div>
  );
};
