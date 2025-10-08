"use client"

import { useState } from 'react';
import { Shield, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function MasterPasswordSetup() {
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState({ score: 0, feedback: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    const feedback = [];

    if (password.length >= 12) score += 2;
    else if (password.length >= 8) score += 1;
    else feedback.push('Use at least 8 characters');

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    else feedback.push('Mix uppercase and lowercase');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Include numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push('Add special characters');

    const feedbackText =
      score >= 5
        ? 'Strong password'
        : score >= 3
        ? feedback.join('. ')
        : 'Weak password. ' + feedback.join('. ');

    return { score, feedback: feedbackText };
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setMasterPassword(pwd);
    setStrength(checkPasswordStrength(pwd));
  };

  const handleSubmit = () => {
    if (masterPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (strength.score < 3) {
      alert('Please use a stronger password');
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      alert('Vault setup successful! In production, this would initialize your encrypted vault.');
      setIsSubmitting(false);
    }, 1500);
  };

  const getStrengthColor = () => {
    if (strength.score >= 5) return 'bg-green-500';
    if (strength.score >= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
        <div className="flex justify-center mb-6">
          <div className="bg-purple-600 p-4 rounded-full">
            <Shield className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Set Up Your Vault
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Create a master password to encrypt your vault. You'll need this to access your passwords.
        </p>

        <div className="bg-amber-900/20 border border-amber-600/50 rounded-lg p-4 mb-6">
          <p className="text-amber-200 text-sm flex items-start gap-2">
            <span className="text-xl">⚠️</span>
            <span>
              <strong>Important:</strong> This password cannot be recovered. If you forget it, you'll lose access to your vault forever.
            </span>
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Master Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={masterPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter a strong master password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {masterPassword && (
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-400">Password Strength</span>
                  <span className="text-xs text-slate-400">{strength.score}/5</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">{strength.feedback}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Re-enter your master password"
            />
            {confirmPassword && masterPassword !== confirmPassword && (
              <p className="text-red-400 text-xs mt-2">Passwords do not match</p>
            )}
            {confirmPassword && masterPassword === confirmPassword && (
              <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Passwords match
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || masterPassword !== confirmPassword || strength.score < 3}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {isSubmitting ? 'Creating Vault...' : 'Create Vault'}
          </button>
        </div>

        <div className="mt-6 bg-slate-700/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-200 mb-2">Security Tips:</h3>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• Use at least 12 characters</li>
            <li>• Mix uppercase, lowercase, numbers, and symbols</li>
            <li>• Don't use personal information</li>
            <li>• Consider using a passphrase</li>
          </ul>
        </div>
      </div>
    </div>
  );
}