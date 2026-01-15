
import React, { useState, useCallback } from 'react';
import { EmailInput, AnalysisResult } from './types';
import { analyzeEmails } from './geminiService';

const INITIAL_EMAILS: EmailInput[] = [
  {
    id: '1',
    sender: 'Sarah Jenkins (HR)',
    subject: 'Urgent: Payroll Discrepancy for Q3',
    body: 'Hello, we noticed a major error in the payroll calculations for the executive team. We need your approval to correct this by end of day to ensure everyone is paid correctly tomorrow.'
  },
  {
    id: '2',
    sender: 'John Doe (Marketing)',
    subject: 'Newsletter Draft for October',
    body: 'Hi, here is the first draft of our upcoming newsletter. Please take a look whenever you have a chance this week. No rush on the feedback.'
  },
  {
    id: '3',
    sender: 'Security Alerts',
    subject: 'Unauthorized Login Attempt Detected',
    body: 'Alert: An unrecognized device attempted to log into your account from a location in Eastern Europe. If this was not you, please secure your account immediately.'
  }
];

const PriorityBadge = ({ score }: { score: number }) => {
  const colors = [
    'bg-gray-100 text-gray-800',
    'bg-blue-100 text-blue-800',
    'bg-yellow-100 text-yellow-800',
    'bg-orange-100 text-orange-800',
    'bg-red-100 text-red-800',
    'bg-red-600 text-white'
  ];
  const labels = ['', 'Low', 'Normal', 'Elevated', 'High', 'Urgent'];
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[score] || colors[0]}`}>
      {labels[score]} ({score})
    </span>
  );
};

export default function App() {
  const [emails, setEmails] = useState<EmailInput[]>(INITIAL_EMAILS);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (id: string, field: keyof EmailInput, value: string) => {
    setEmails(prev => prev.map(email => email.id === id ? { ...email, [field]: value } : email));
  };

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const analyses = await analyzeEmails(emails);
      const combined = emails.map((email, index) => ({
        ...email,
        ...analyses[index]
      }));
      setResults(combined);
    } catch (err) {
      setError('Failed to analyze emails. Please check your API configuration.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <i className="fas fa-envelope-open-text text-white"></i>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Executive Assistant</h1>
          </div>
          <button
            onClick={runAnalysis}
            disabled={loading}
            className={`flex items-center space-x-2 px-6 py-2 rounded-full font-medium transition-all ${
              loading 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-200'
            }`}
          >
            {loading ? (
              <><i className="fas fa-circle-notch fa-spin"></i> <span>Analyzing...</span></>
            ) : (
              <><i className="fas fa-bolt"></i> <span>Summarize & Prioritize</span></>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 space-y-8">
        {/* Input Section */}
        <section className="bg-white rounded-2xl border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <i className="fas fa-list-ul mr-2 text-indigo-500"></i> Incoming Emails (3)
            </h2>
            <p className="text-sm text-gray-500 italic">Edit the text below to test different scenarios</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {emails.map((email) => (
              <div key={email.id} className="flex flex-col space-y-3">
                <input
                  type="text"
                  placeholder="Sender"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={email.sender}
                  onChange={(e) => handleInputChange(email.id, 'sender', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full px-3 py-2 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={email.subject}
                  onChange={(e) => handleInputChange(email.id, 'subject', e.target.value)}
                />
                <textarea
                  placeholder="Email body content..."
                  className="w-full px-3 py-2 border rounded-lg text-sm min-h-[120px] focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  value={email.body}
                  onChange={(e) => handleInputChange(email.id, 'body', e.target.value)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Results Section */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
            <i className="fas fa-exclamation-circle mr-3"></i>
            {error}
          </div>
        )}

        <section className={`transition-opacity duration-500 ${results.length > 0 ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <i className="fas fa-chart-pie mr-2 text-indigo-500"></i> Executive Briefing
          </h2>
          
          {results.length > 0 ? (
            <div className="space-y-4">
              {results.sort((a, b) => b.priorityScore - a.priorityScore).map((res) => (
                <div key={res.id} className="bg-white border rounded-xl p-5 shadow-sm hover:border-indigo-300 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <PriorityBadge score={res.priorityScore} />
                        <span className="text-xs text-gray-400 font-mono">ID: {res.id}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 leading-tight mb-2">
                        {res.summary}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span className="flex items-center"><i className="far fa-user mr-1"></i> {res.sender}</span>
                        <span className="flex items-center"><i className="far fa-folder mr-1"></i> {res.subject}</span>
                      </div>
                    </div>
                    <div className="hidden md:block w-px h-12 bg-gray-100"></div>
                    <div className="flex items-center justify-center bg-gray-50 rounded-lg p-3 min-w-[100px]">
                      <div className="text-center">
                        <div className="text-2xl font-black text-indigo-600">{res.priorityScore}</div>
                        <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Score</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <i className="fas fa-sparkles text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">Analysis results will appear here. Click "Summarize & Prioritize" to begin.</p>
            </div>
          )}
        </section>
      </main>

      <footer className="mt-20 text-center text-gray-400 text-sm">
        <p>© 2024 Executive Assistant Tool • Powered by Gemini AI</p>
      </footer>
    </div>
  );
}
