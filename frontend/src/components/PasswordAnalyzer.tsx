import { useState, useEffect, useCallback } from 'react';
import type { PasswordAnalysis } from '../services/api';
import { analyzePassword } from '../services/api';

export default function PasswordAnalyzer() {
  // State management
  const [password, setPassword] = useState('');
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Generator options
  const [length, setLength] = useState(16);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);

  // Password analysis function
  const handleAnalyze = useCallback(async () => {
    if (!password) return;
    
    setLoading(true);
    try {
      const result = await analyzePassword(password);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  }, [password]);

  // Auto-analyze on password change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (password) {
        handleAnalyze();
      } else {
        setAnalysis(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [password, handleAnalyze]);

  // Password generator
  const generatePassword = () => {
    let charset = '';
    if (useLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (useUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useNumbers) charset += '0123456789';
    if (useSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset === '') {
      charset = 'abcdefghijklmnopqrstuvwxyz';
    }

    let newPassword = '';
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    setPassword(newPassword);
    setShowGenerator(false);
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  // Get strength color
  const getStrengthColor = (strength: string) => {
    const colors = {
      'Very Weak': 'bg-red-500',
      'Weak': 'bg-orange-500',
      'Moderate': 'bg-yellow-500',
      'Strong': 'bg-emerald-500',
      'Very Strong': 'bg-green-500'
    };
    return colors[strength as keyof typeof colors] || 'bg-gray-500';
  };

  // Get strength gradient
  const getStrengthGradient = (strength: string) => {
    const gradients = {
      'Very Weak': 'from-red-500 to-red-600',
      'Weak': 'from-orange-500 to-orange-600',
      'Moderate': 'from-yellow-500 to-amber-600',
      'Strong': 'from-emerald-500 to-green-600',
      'Very Strong': 'from-green-500 to-emerald-600'
    };
    return gradients[strength as keyof typeof gradients] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
      
      {/* Background effects */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none"></div>
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 ${darkMode ? 'bg-violet-600/20' : 'bg-violet-400/20'} rounded-full blur-3xl`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 ${darkMode ? 'bg-fuchsia-600/20' : 'bg-fuchsia-400/20'} rounded-full blur-3xl`}></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-8 sm:py-12">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${darkMode ? 'bg-linear-to-br from-violet-600 to-fuchsia-600' : 'bg-linear-to-br from-violet-500 to-fuchsia-500'} flex items-center justify-center shadow-lg`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                PasswordGuardian
              </h1>
              <p className={`text-xs ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>
                AI-Powered Security Analysis
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-white hover:bg-zinc-100'} shadow-sm`}
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <svg className="w-5 h-5 text-zinc-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-zinc-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </header>

        {/* Main Card */}
        <div className={`rounded-2xl p-6 shadow-xl ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
          
          {/* Password Input */}
          <div className="mb-6">
            <label className={`block text-xs font-medium mb-2 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Enter Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 pr-32 rounded-lg text-sm transition-all ${
                  darkMode 
                    ? 'bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:border-violet-500' 
                    : 'bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-violet-500'
                } outline-none`}
                placeholder="Type or paste password..."
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className={`p-1.5 rounded ${darkMode ? 'hover:bg-zinc-700' : 'hover:bg-zinc-100'}`}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <svg className={`w-4 h-4 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
                {password && (
                  <button
                    onClick={copyToClipboard}
                    className={`p-1.5 rounded ${darkMode ? 'hover:bg-zinc-700' : 'hover:bg-zinc-100'}`}
                    aria-label="Copy password"
                  >
                    <svg className={`w-4 h-4 ${copied ? 'text-green-500' : darkMode ? 'text-zinc-400' : 'text-zinc-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {copied ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      )}
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => setShowGenerator(!showGenerator)}
                  className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>

          {/* Password Generator */}
          {showGenerator && (
            <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-zinc-50 border border-zinc-200'}`}>
              <h3 className={`text-sm font-bold mb-3 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Password Generator</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className={`text-xs ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Length: {length}</label>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="32"
                    value={length}
                    onChange={(e) => setLength(parseInt(e.target.value))}
                    className="w-full accent-violet-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'uppercase', label: 'Uppercase (A-Z)', state: useUppercase, setter: setUseUppercase },
                    { key: 'lowercase', label: 'Lowercase (a-z)', state: useLowercase, setter: setUseLowercase },
                    { key: 'numbers', label: 'Numbers (0-9)', state: useNumbers, setter: setUseNumbers },
                    { key: 'symbols', label: 'Symbols (!@#$)', state: useSymbols, setter: setUseSymbols },
                  ].map((option) => (
                    <label key={option.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={option.state}
                        onChange={(e) => option.setter(e.target.checked)}
                        className="w-4 h-4 accent-violet-600"
                      />
                      <span className={`text-xs ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>{option.label}</span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={generatePassword}
                  className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded transition-colors"
                >
                  Generate Password
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && !loading && (
            <div className="space-y-6">
              
              {/* Score Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>Strength</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{analysis.strength}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>Score</p>
                  <p className={`text-4xl font-bold bg-linear-to-r ${getStrengthGradient(analysis.strength)} bg-clip-text text-transparent`}>
                    {analysis.score}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                <div
                  className={`h-full ${getStrengthColor(analysis.strength)} transition-all duration-700`}
                  style={{ width: `${analysis.score}%` }}
                ></div>
              </div>

              {/* Breach Alert */}
              {analysis.breach_count > 0 && (
                <div className="bg-linear-to-r from-red-500 to-rose-500 rounded-xl p-4">
                  <div className="flex items-start gap-3 text-white">
                    <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-bold text-sm">Compromised Password</p>
                      <p className="text-xs opacity-90 mt-0.5">Found in {analysis.breach_count.toLocaleString()} data breaches</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Character Requirements */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'A-Z', active: analysis.has_uppercase },
                  { label: 'a-z', active: analysis.has_lowercase },
                  { label: '0-9', active: analysis.has_numbers },
                  { label: '@#$', active: analysis.has_special },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg text-center transition-colors ${
                      item.active
                        ? darkMode ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'
                        : darkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-zinc-50 border border-zinc-200'
                    }`}
                  >
                    <p className={`text-sm font-bold ${item.active ? 'text-green-500' : darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
                  <p className={`text-xs mb-1 ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>Entropy</p>
                  <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{analysis.entropy.toFixed(1)}</p>
                  <p className={`text-xs ${darkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>bits</p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
                  <p className={`text-xs mb-1 ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>Crack Time</p>
                  <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{analysis.crack_time}</p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
                  <p className={`text-xs mb-1 ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>Length</p>
                  <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{analysis.length}</p>
                  <p className={`text-xs ${darkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>chars</p>
                </div>
              </div>

              {/* Warnings */}
              {(analysis.common_pattern_detected || analysis.leet_speak_detected) && (
                <div className="space-y-2">
                  {analysis.common_pattern_detected && (
                    <div className={`p-3 rounded-lg border-l-2 ${darkMode ? 'bg-yellow-500/10 border-yellow-500' : 'bg-yellow-50 border-yellow-400'}`}>
                      <p className={`text-xs font-medium ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>Common patterns detected</p>
                    </div>
                  )}
                  {analysis.leet_speak_detected && (
                    <div className={`p-3 rounded-lg border-l-2 ${darkMode ? 'bg-orange-500/10 border-orange-500' : 'bg-orange-50 border-orange-400'}`}>
                      <p className={`text-xs font-medium ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>Simple substitutions found</p>
                    </div>
                  )}
                </div>
              )}

              {/* AI Recommendations */}
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                  <p className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>AI Recommendations</p>
                </div>
                <ul className="space-y-2">
                  {analysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex gap-2 text-xs">
                      <span className="text-blue-500 font-bold">•</span>
                      <span className={darkMode ? 'text-zinc-400' : 'text-zinc-600'}>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className={`mt-6 text-center text-xs ${darkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>
          <p>Secure client-side analysis • Powered by HaveIBeenPwned API</p>
        </footer>
      </div>
    </div>
  );
}