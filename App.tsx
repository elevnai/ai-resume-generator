
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { InputFieldGroup } from './InputFieldGroup';
import { ResumeDisplay } from './ResumeDisplay';
import { generateResumeStream, generateDialDescriptions } from './services/geminiService';
import { ResumeRequest } from './types';
import { HelpIcon, ClearIcon } from './icons';

// --- Dashboard Widget Components ---

const DashboardCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
  <div className={`bg-matte-graphite/40 backdrop-blur-lg p-4 rounded-xl border border-amg-chrome/30 shadow-deep-panel shadow-soft-underglow h-full ${className}`}>
    <h3 className="text-sm font-headline tracking-wide-ui text-amg-chrome/80 uppercase border-b border-amg-chrome/20 pb-2 mb-3">{title}</h3>
    {children}
  </div>
);

const JobsProcessedWidget: React.FC<{ count: number }> = ({ count }) => (
  <DashboardCard title="Jobs Processed">
    <div className="flex items-center justify-center h-full py-4">
      <span className="text-4xl font-headline text-ice-blue font-bold">{count}</span>
    </div>
  </DashboardCard>
);

const TodaysActionsWidget: React.FC = () => (
  <DashboardCard title="Today's Actions">
    <ul className="space-y-2 text-sm text-amg-chrome/80 pt-2">
      <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-ice-blue/50 mr-3 shrink-0"></span>Input Target Role</li>
      <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-ice-blue/50 mr-3 shrink-0"></span>Paste Job Description</li>
      <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-ice-blue mr-3 shrink-0 shadow-glow-ice-blue"></span>Calibrate Focus Dial</li>
      <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-ice-blue/50 mr-3 shrink-0"></span>Engage Engine</li>
    </ul>
  </DashboardCard>
);

const ProgressBar: React.FC<{ label: string; percentage: number }> = ({ label, percentage }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-amg-chrome/70">{label}</span>
            <span className="text-xs font-mono text-ice-blue">{percentage}%</span>
        </div>
        <div className="w-full bg-obsidian-black/50 rounded-full h-1.5 border border-brushed-steel/20">
            <div 
                className="bg-ice-blue h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    </div>
);

const QueueOverviewWidget: React.FC = () => (
  <DashboardCard title="Queue Overview">
    <div className="space-y-3 pt-1">
        <ProgressBar label="Analyst Roles" percentage={65} />
        <ProgressBar label="Engineer Roles" percentage={25} />
        <ProgressBar label="GRC Roles" percentage={10} />
    </div>
  </DashboardCard>
);

const HelpModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian-black/80 backdrop-blur-sm p-4 animate-cockpit-startup-left">
    <div className="bg-matte-graphite border border-amg-chrome/30 rounded-xl shadow-deep-panel max-w-md w-full p-6 relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-amg-chrome/50 hover:text-ice-blue transition-colors">
        <ClearIcon className="h-6 w-6" />
      </button>
      <h3 className="text-xl font-headline text-ice-blue mb-6 uppercase tracking-wide-ui flex items-center">
        <HelpIcon className="mr-3 h-6 w-6" /> Operator's Manual
      </h3>
      <div className="space-y-5 text-sm text-amg-chrome/90 font-light">
        <div className="flex gap-4">
           <span className="text-ice-blue font-headline font-bold text-lg">01</span>
           <div>
             <strong className="block text-amg-chrome uppercase tracking-wide text-xs mb-1">Input Target</strong>
             <p className="text-amg-chrome/70">Enter the Job Title exactly as listed. This aligns the resume's primary keywords.</p>
           </div>
        </div>
        <div className="flex gap-4">
           <span className="text-ice-blue font-headline font-bold text-lg">02</span>
           <div>
             <strong className="block text-amg-chrome uppercase tracking-wide text-xs mb-1">Paste Intel</strong>
             <p className="text-amg-chrome/70">Copy the full Job Description. The engine extracts key skills and requirements.</p>
           </div>
        </div>
        <div className="flex gap-4">
           <span className="text-ice-blue font-headline font-bold text-lg">03</span>
           <div>
             <strong className="block text-amg-chrome uppercase tracking-wide text-xs mb-1">Calibrate Focus</strong>
             <p className="text-amg-chrome/70">Use the slider. Left prioritizes hands-on technical work; Right prioritizes strategy & leadership.</p>
           </div>
        </div>
        <div className="flex gap-4">
           <span className="text-ice-blue font-headline font-bold text-lg">04</span>
           <div>
             <strong className="block text-amg-chrome uppercase tracking-wide text-xs mb-1">Engage</strong>
             <p className="text-amg-chrome/70">Click the orb to generate. Review the output, edit manually if necessary, and export to DOCX.</p>
           </div>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  const [resumeRequest, setResumeRequest] = useState<ResumeRequest>({
    jobTitle: 'Cyber Security Analyst',
    companyName: '',
    roleDial: 50,
    jobDescription: '',
  });

  const [generatedResume, setGeneratedResume] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [dialDescriptions, setDialDescriptions] = useState<string[] | null>(null);
  const [isGeneratingDial, setIsGeneratingDial] = useState<boolean>(false);
  const [dialError, setDialError] = useState<string | null>(null);
  
  const [jobsProcessed, setJobsProcessed] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const debounceTimeoutRef = useRef<number | null>(null);
  
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  useEffect(() => {
    setIsPageLoaded(true);
    try {
      const storedCount = localStorage.getItem('jobsProcessedCount');
      if (storedCount) {
        setJobsProcessed(parseInt(storedCount, 10));
      }
    } catch (e) {
      console.error("Could not load jobs processed count from local storage.", e);
    }
  }, []);
  
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = window.setTimeout(() => {
      const { jobTitle, jobDescription } = resumeRequest;
      if (jobTitle.trim().length > 3 && jobDescription.trim().length > 50) {
        setIsGeneratingDial(true);
        setDialError(null);
        setDialDescriptions(null);
        generateDialDescriptions(jobTitle, jobDescription)
          .then(descriptions => {
            setDialDescriptions(descriptions);
          })
          .catch(err => {
            const msg = err.message || '';
            if (msg.includes('Invalid API Key')) {
                 setDialError("API Configuration Error. Check your key.");
            } else {
                 console.error("Failed to generate dial descriptions:", err);
                 setDialError("Could not generate tailored focus descriptions.");
            }
          })
          .finally(() => {
            setIsGeneratingDial(false);
          });
      } else {
        setDialDescriptions(null);
      }
    }, 1500); // Increased debounce to 1.5s to avoid 429 errors

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [resumeRequest.jobTitle, resumeRequest.jobDescription]);
  

  const handleGenerateClick = useCallback(async () => {
    if (isLoading || !resumeRequest.jobDescription.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedResume('');

    try {
      const selectedDialDescription = dialDescriptions 
        ? dialDescriptions[resumeRequest.roleDial / 10] 
        : 'A balance of technical and leadership focus.';
      
      const stream = generateResumeStream(resumeRequest, selectedDialDescription);
      for await (const chunk of stream) {
        setGeneratedResume((prev) => prev + chunk);
      }

      setJobsProcessed(prevCount => {
        const newCount = prevCount + 1;
        try {
          localStorage.setItem('jobsProcessedCount', newCount.toString());
        } catch (e) {
          console.error("Could not save jobs processed count to local storage.", e);
        }
        return newCount;
      });

    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      let friendlyMessage = 'Failed to generate resume. An unknown error occurred.';
      
      if (errorMessage.toLowerCase().includes('quota') || errorMessage.includes('429')) {
        friendlyMessage = 'The AI model is currently busy (Rate Limit). Please wait a few seconds and try again.';
      } else if (errorMessage.toLowerCase().includes('api key') || errorMessage.toLowerCase().includes('access denied')) {
        friendlyMessage = 'Access Denied. Please check your API Key configuration.';
      } else if (errorMessage.toLowerCase().includes('timed out') || errorMessage.toLowerCase().includes('network error')) {
        friendlyMessage = 'The connection to the AI model timed out. Please check your internet connection and try again.';
      }
      
      setError(friendlyMessage);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, resumeRequest, dialDescriptions]);

  const handleSaveEdit = (newText: string) => {
    setGeneratedResume(newText);
  };


  return (
    <>
      <div className={`min-h-screen text-amg-chrome font-sans transition-all duration-500 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <header className="border-b border-brushed-steel/20 bg-matte-graphite/50 backdrop-blur-sm animate-header-sweep shadow-header-shadow" style={{ animationFillMode: 'backwards' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
              <h1 className="text-3xl sm:text-4xl font-headline font-bold text-amg-chrome tracking-widest-ui uppercase">
                AI <span className="font-bold text-ice-blue">Resume</span> Engine
              </h1>
              <p className="text-amg-chrome/60 mt-2 text-sm font-light hidden sm:block">
                Enter job details, adjust resume focus, and generate your tailored resume.
              </p>
            </div>
            <div className="ml-auto z-10">
               <button 
                 onClick={() => setShowHelp(true)}
                 className="flex items-center space-x-2 text-xs text-amg-chrome/70 hover:text-ice-blue transition-colors uppercase tracking-widest-ui font-headline border border-amg-chrome/20 hover:border-ice-blue/50 rounded-full px-3 py-1"
               >
                 <HelpIcon className="w-4 h-4" />
                 <span className="hidden sm:inline">Guide</span>
               </button>
            </div>
          </div>
        </header>

        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 animate-cockpit-startup-left" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
              <InputFieldGroup
                resumeRequest={resumeRequest}
                setResumeRequest={setResumeRequest}
                onSubmit={handleGenerateClick}
                isLoading={isLoading}
                dialDescriptions={dialDescriptions}
                isGeneratingDial={isGeneratingDial}
                dialError={dialError}
              />
            </div>
            
            <div className="lg:col-span-3 flex flex-col gap-8">
                <div className="animate-cockpit-startup-right" style={{ animationDelay: '400ms', animationFillMode: 'backwards' }}>
                    <ResumeDisplay
                        resumeText={generatedResume}
                        isLoading={isLoading}
                        error={error}
                        onSaveEdit={handleSaveEdit}
                        jobTitle={resumeRequest.jobTitle}
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-cockpit-startup-right" style={{ animationDelay: '600ms', animationFillMode: 'backwards' }}>
                    <JobsProcessedWidget count={jobsProcessed} />
                    <QueueOverviewWidget />
                    <TodaysActionsWidget />
                </div>
            </div>

          </div>
        </main>

        <footer className="text-center py-6 mt-8 text-amg-chrome/40 text-xs opacity-0 animate-cockpit-startup-left" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
          <p>Powered by Google Gemini</p>
        </footer>

        {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      </div>
    </>
  );
}

export default App;
