import React, { useState } from 'react';
import { 
  FileUp, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Lightbulb,
  ArrowRight,
  Sparkles,
  FileText
} from 'lucide-react';
import Button from '../../components/common/Button';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      // Automatically "analyze" after 2 seconds
      setAnalyzing(true);
      setTimeout(() => {
        setResult({
          score: 82,
          skills: ['Python', 'Machine Learning', 'Leadership', 'Critical Thinking'],
          improvements: [
            'Quantify your impact in the software internship section.',
            'Move the "Awards" section higher to emphasize your scholarship.',
            'Include link to your GitHub repository.'
          ]
        });
        setAnalyzing(false);
      }, 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold tracking-tight">AI Resume Analyzer</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Optimizing your professional profile for university admissions. Get instant feedback on your alignment with target programs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Upload Section */}
        <div className="space-y-8">
          <div className="bg-card p-12 rounded-3xl border-2 border-dashed border-primary/20 hover:border-primary/50 transition-all group flex flex-col items-center justify-center text-center relative overflow-hidden">
            {analyzing && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-6">
                <div className="relative h-20 w-20">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                </div>
                <div className="space-y-1">
                   <p className="font-bold text-lg">AI is Deep-Scanning...</p>
                   <p className="text-sm text-muted-foreground animate-pulse">Extracting skills & experience...</p>
                </div>
              </div>
            )}

            <div className="h-20 w-20 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileUp className="h-10 w-10 text-primary" />
            </div>
            
            <h4 className="text-xl font-bold">Upload Resume</h4>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              PDF or DOCX format. Max size 5MB. Your data is processed securely via OpenAI.
            </p>

            <label className="mt-8">
               <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx" />
               <Button variant="primary" className="rounded-full px-8 gap-2 pointer-events-none">
                 Choose File <ArrowRight className="h-4 w-4" />
               </Button>
            </label>
            
            {file && <p className="mt-4 text-xs font-bold text-primary italic">Current: {file.name}</p>}
          </div>

          <div className="bg-secondary/30 p-8 rounded-3xl border space-y-4">
            <h5 className="font-bold flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Pro Tips
            </h5>
            <ul className="space-y-3">
              {['Ensure keywords match your target field.', 'Use clear, sans-serif fonts.', 'Focus on achievements, not just tasks.'].map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-8">
           {!result && !analyzing && (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-muted/20 border rounded-3xl border-dashed">
                 <Search className="h-12 w-12 text-muted/50 mb-4" />
                 <h4 className="font-bold text-muted-foreground">Awaiting Analysis</h4>
                 <p className="text-sm text-muted-foreground mt-1">Upload your resume to see the AI breakdown here.</p>
              </div>
           )}

           {result && (
              <div className="animate-in slide-in-from-top-4 duration-700 space-y-8">
                 {/* Score Card */}
                 <div className="bg-card p-10 rounded-4xl border shadow-xl flex items-center justify-between overflow-hidden relative">
                    <div className="space-y-1">
                       <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground opacity-50">Profile Score</p>
                       <h3 className="text-6xl font-black text-primary">{result.score}<span className="text-xl">/100</span></h3>
                    </div>
                    <div className="relative h-24 w-24">
                       <svg className="h-full w-full transform -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-secondary" />
                          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - result.score / 100)} className="text-primary transition-all duration-1000" />
                       </svg>
                    </div>
                 </div>

                 {/* Skills Extraction */}
                 <div className="bg-card p-8 rounded-3xl border shadow-sm">
                    <h5 className="font-bold mb-6 flex items-center gap-2">
                       <Sparkles className="h-4 w-4 text-primary" />
                       Extracted Skills
                    </h5>
                    <div className="flex flex-wrap gap-2">
                       {result.skills.map(skill => (
                          <span key={skill} className="px-4 py-2 bg-primary/5 text-primary rounded-full text-xs font-bold border border-primary/10">
                             {skill}
                          </span>
                       ))}
                    </div>
                 </div>

                 {/* Improvement Areas */}
                 <div className="bg-card p-8 rounded-3xl border shadow-sm">
                    <h5 className="font-bold mb-6 flex items-center gap-2 text-destructive">
                       <AlertTriangle className="h-4 w-4" />
                       Actionable Improvements
                    </h5>
                    <div className="space-y-4">
                       {result.improvements.map((imp, i) => (
                          <div key={i} className="flex gap-4 p-4 bg-muted/30 rounded-2xl">
                             <div className="h-6 w-6 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 border">
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                             </div>
                             <p className="text-sm text-foreground leading-relaxed">{imp}</p>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
