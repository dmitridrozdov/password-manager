"use client"

import { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function MasterPasswordUnlock() {
  const [masterPassword, setMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleUnlock = async () => {
    if (!masterPassword) {
      setError('Please enter your master password');
      return;
    }

    setIsVerifying(true);
    setError('');

    // Simulate verification
    setTimeout(() => {
      if (masterPassword === 'demo') {
        alert('Vault unlocked! In production, this would decrypt your vault using the master password.');
      } else {
        setError('Incorrect master password. Please try again.');
      }
      setIsVerifying(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
        <div className="flex justify-center mb-6">
          <div className="bg-purple-600 p-4 rounded-full">
            <Lock className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Unlock Your Vault
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Enter your master password to access your passwords
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Master Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={masterPassword}
                onChange={(e) => {
                  setMasterPassword(e.target.value);
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your master password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <div className="mt-3 flex items-start gap-2 text-red-400 text-sm bg-red-900/20 border border-red-600/50 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleUnlock}
            disabled={isVerifying || !masterPassword}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {isVerifying ? 'Unlocking...' : 'Unlock Vault'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700">
          <p className="text-center text-sm text-slate-400 mb-3">
            Forgot your master password?
          </p>
          <p className="text-center text-xs text-slate-500">
            Unfortunately, your master password cannot be recovered. You'll need to reset your vault and lose all stored passwords.
          </p>
        </div>

        <div className="mt-6 bg-slate-700/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-200 mb-2">🔒 Security Notice</h3>
          <p className="text-xs text-slate-400">
            Your master password is never stored or sent to our servers. It's used only to decrypt your vault locally on your device.
          </p>
        </div>
      </div>
    </div>
  );
}