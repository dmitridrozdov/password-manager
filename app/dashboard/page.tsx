'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Eye, EyeOff, Copy, Trash2, Edit2, Lock, Globe, User, RefreshCw, X, Shield } from 'lucide-react';
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel";
import { CopyIcon } from '@/components/copy-icon';

import { EncryptionService } from '@/lib/encryption';

type Password = {
  _id: Id<"passwords">;  // Change from 'id' to '_id'
  website: string;
  username: string;
  encryptedPassword: string;
  category: string;
  iv: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  userId: string;
};

// --- Utility Functions ---

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    work: 'bg-blue-500',
    personal: 'bg-green-500',
    finance: 'bg-yellow-500',
    social: 'bg-purple-500',
  };
  return colors[category] || 'bg-gray-500';
};

// --- Master Password Modal Component (Modified) ---

// Removed isError prop as it's no longer needed
function MasterPasswordModal({ onUnlock }: { onUnlock: (password: string) => void }) {
  const [masterPassword, setMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleUnlock = () => {
    // Check if the input is not empty before attempting to unlock
    if (masterPassword) {
      onUnlock(masterPassword);
      // NOTE: We don't clear the input state here as the modal will disappear
    }
  };

  // Allow unlock on Enter key press
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && masterPassword) {
      handleUnlock();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl p-8 max-w-sm w-full border border-purple-600 shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <Shield className="w-10 h-10 text-purple-400 mb-3" />
          <h2 className="text-2xl font-bold text-white">Unlock Vault</h2>
          <p className="text-sm text-slate-400 mt-1">Enter your Master Password to proceed.</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Master Password"
              // Removed dynamic error border class
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            onClick={handleUnlock}
            disabled={!masterPassword}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            Unlock Vault
          </button>
        </div>
      </div>
    </div>
  );
}


// --- Main Component (Modified) ---

export default function PasswordVaultDashboard() {
  const [isVaultLocked, setIsVaultLocked] = useState(true);

  // --- Lock/Unlock Logic (Simplified) ---
  const handleUnlockAttempt = (password: string) => {
    // ⭐️ Simplified logic: any entered password successfully unlocks the vault
    setIsVaultLocked(false);        // ⭐️ Unlocks the vault
    initialiseEncryptionKey(password);      // ⭐️ Initializes encryption key
  };

  const lockVault = () => {
    setIsVaultLocked(true);
  };

  const passwordsFromDB = useQuery(api.passwords.getPasswords);
  const [passwords, setPasswords] = useState<Password[]>(passwordsFromDB ?? []);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);

  const saltFromDB = useQuery(api.vaultSettings.getSalt);
  const setSaltInDB = useMutation(api.vaultSettings.setSalt);

  const deletePassword = useMutation(api.passwords.deletePassword);

  // Update the useEffect to sync when data loads
  useEffect(() => {
    if (passwordsFromDB) {
      setPasswords(passwordsFromDB);
    }
  }, [passwordsFromDB]);

  const initialiseEncryptionKey = async (password: string) => {
    console.log('Initializing encryption key');
    
    if (!password) {
      alert('Vault is locked. Please unlock first.');
      return;
    }

    try {
      let salt: Uint8Array;
      
      if (saltFromDB) {
        // Use existing salt from database
        const saltBuffer = EncryptionService.base64ToArrayBuffer(saltFromDB);
        salt = new Uint8Array(saltBuffer);
        console.log('Using existing salt from database');
      } else {
        // Generate new salt (first time setup)
        salt = crypto.getRandomValues(new Uint8Array(16));
        const saltBase64 = EncryptionService.arrayBufferToBase64(salt.buffer as ArrayBuffer);
        
        try {
          await setSaltInDB({ salt: saltBase64 });
          console.log('Generated and stored new salt in database');
        } catch (error) {
          console.error('Failed to store salt in database:', error);
          alert('Failed to initialize vault. Please try again.');
          return;
        }
      }
      
      // Use your existing deriveKey function
      const key = await EncryptionService.deriveKey(password, salt);
      
      setEncryptionKey(key);
      console.log('Encryption key initialized successfully');
    } catch (error) {
      console.error('Failed to initialize encryption key:', error);
      alert('Failed to initialize encryption. Please try again.');
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  // const [visiblePasswords, setVisiblePasswords] = useState<Record<Id<"passwords">, boolean>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    website: '',
    username: '',
    password: '',
    category: 'personal',
    notes: '',
  });
  const [showFormPassword, setShowFormPassword] = useState(false);

  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [decryptedPasswords, setDecryptedPasswords] = useState<Record<string, string>>({});

  // --- Existing Logic (Unchanged) ---
  const filteredPasswords = passwords.filter(p => 
    p.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // const togglePasswordVisibility = (id: Id<"passwords">) => {
  //   setVisiblePasswords(prev => ({
  //     ...prev,
  //     [id]: !prev[id]
  //   }));
  // };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
  };

  // Modified toggle function to decrypt on first view
 const togglePasswordVisibility = async (id: string) => {
  if (visiblePasswords[id]) {
    setVisiblePasswords(prev => ({ ...prev, [id]: false }));
    return;
  }

  if (!decryptedPasswords[id]) {
    if (!encryptionKey) {
      alert('Vault is locked. Please unlock first.');
      return;
    }

    try {
      const password = passwordsFromDB?.find(p => p._id === id);
      if (!password) {
        alert('Password not found');
        return;
      }

      // DEBUG: Log the data
      console.log('Attempting to decrypt:', {
        id: password._id,
        website: password.website,
        encryptedPassword: password.encryptedPassword,
        iv: password.iv,
        ivLength: password.iv?.length,
        ivEmpty: password.iv === ''
      });

      // Check if IV is valid
      if (!password.iv || password.iv === '') {
        alert('This password was saved without encryption. Please delete and re-add it.');
        return;
      }

      const decrypted = await EncryptionService.decrypt(
        password.encryptedPassword,
        encryptionKey,
        password.iv
      );

      setDecryptedPasswords(prev => ({ ...prev, [id]: decrypted }));
    } catch (error) {
      console.error('Failed to decrypt password:', error);
      alert('Failed to decrypt password. This password may have been corrupted or saved with old code. Please delete and re-add it.');
      return;
    }
  }

  setVisiblePasswords(prev => ({ ...prev, [id]: true }));
};

  // Modified copy function to decrypt before copying
  const copyPasswordToClipboard = async (id: string) => {
    if (!encryptionKey) {
      alert('Vault is locked. Please unlock first.');
      return;
    }

    try {
      // Check if already decrypted
      let decrypted = decryptedPasswords[id];
      
      // If not, decrypt it
      if (!decrypted) {
        const password = passwordsFromDB?.find(p => p._id === id);
        if (!password) {
          alert('Password not found');
          return;
        }

        decrypted = await EncryptionService.decrypt(
          password.encryptedPassword,
          encryptionKey,
          password.iv
        );

        // Store for future use
        setDecryptedPasswords(prev => ({ ...prev, [id]: decrypted }));
      }

      // Copy to clipboard
      await navigator.clipboard.writeText(decrypted);
      copyToClipboard(decrypted, 'Password');
    } catch (error) {
      console.error('Failed to copy password:', error);
      alert('Failed to copy password.');
    }
  };

    const generatePassword = () => {
      const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
      let password = "";
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      
      for (let i = 0; i < 16; i++) {
        password += charset[array[i] % charset.length];
      }
      
      setFormData(prev => ({ ...prev, password }));
    };

  const addPassword = useMutation(api.passwords.addPassword);
  const updatePassword = useMutation(api.passwords.updatePassword);

  const handleSubmit = async () => {
    if (!formData.website || !formData.username || !formData.password) {
      alert('Please fill in all required fields');
      return;
    }

    if (!encryptionKey) {
      alert('Vault is locked. Please unlock first.');
      return;
    }

    try {
      // Always encrypt the password (whether new or edited)
      const { encrypted, iv } = await EncryptionService.encrypt(
        formData.password,
        encryptionKey
      );

      if (editingId) {
        await updatePassword({
          id: editingId as Id<"passwords">,
          website: formData.website,
          username: formData.username,
          encryptedPassword: encrypted,
          iv: iv,
          category: formData.category,
          notes: formData.notes,
        });
      } else {
        await addPassword({
          website: formData.website,
          username: formData.username,
          encryptedPassword: encrypted,
          iv: iv,
          category: formData.category,
          notes: formData.notes,
        });
      }

      setShowAddModal(false);
      setEditingId(null);
      setFormData({ website: '', username: '', password: '', category: 'personal', notes: '' });
    } catch (error) {
      alert('An error occurred while saving the password.');
      console.error(error);
    }
  };

  const handleDecryptPassword = async (password: {
    encryptedPassword: string;
    iv: string;
  }) => {
    if (!encryptionKey) {
      alert('Vault is locked. Please unlock first.');
      return null;
    }

    try {
      const decrypted = await EncryptionService.decrypt(
        password.encryptedPassword,
        encryptionKey,
        password.iv
      );
      return decrypted;
    } catch (error) {
      console.error('Failed to decrypt password:', error);
      alert('Failed to decrypt password. The vault may have been locked with a different master password.');
      return null;
    }
  };

  const handleEdit = async (passwordId: string) => {
    if (!encryptionKey) {
      alert('Vault is locked. Please unlock first.');
      return;
    }

    // Find the password from the database (which has encryptedPassword and iv)
    const password = passwordsFromDB?.find(p => p._id === passwordId);
    
    if (!password) {
      alert('Password not found');
      return;
    }

    try {
      let decryptedPassword: string;

      // Check if already decrypted
      if (decryptedPasswords[passwordId]) {
        decryptedPassword = decryptedPasswords[passwordId];
      } else {
        // Decrypt it
        decryptedPassword = await EncryptionService.decrypt(
          password.encryptedPassword,
          encryptionKey,
          password.iv
        );
        
        // Cache for future use
        setDecryptedPasswords(prev => ({ ...prev, [passwordId]: decryptedPassword }));
      }

      setEditingId(passwordId);
      setFormData({
        website: password.website,
        username: password.username,
        password: decryptedPassword,
        category: password.category,
        notes: password.notes || '',
      });
      setShowAddModal(true);
    } catch (error) {
      console.error('Failed to decrypt password for editing:', error);
      alert('Failed to decrypt password. Please make sure the vault is unlocked with the correct master password.');
    }
  };

const handleDelete = (id: Id<"passwords">) => {
  if (confirm('Are you sure you want to delete this password?')) {
    deletePassword({ id });
  }
};

  const openAddModal = () => {
    setFormData({ website: '', username: '', password: '', category: 'personal', notes: '' });
    setEditingId(null);
    setShowAddModal(true);
  };


  // --- Render Logic (Modified) ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Master Password Modal (Appears when locked) */}
        {isVaultLocked && (
          <MasterPasswordModal 
            onUnlock={handleUnlockAttempt} 
          />
        )}

        {/* --- LOCKED View: Only the Unlock Button --- */}
        {isVaultLocked && (
          <div className="text-center py-48">
            <h1 className="text-4xl font-extrabold text-white mb-8 flex items-center justify-center gap-3">
              <Shield className="w-10 h-10 text-purple-600" />
              Password Vault
            </h1>
            <button
              onClick={() => { /* No action needed here, modal is already rendered */ }} 
              disabled // Disable the button to ensure unlock happens only through the modal
              className="flex items-center gap-2 px-8 py-4 bg-purple-600 text-white text-xl font-semibold rounded-lg transition-colors shadow-lg opacity-80 cursor-default"
            >
              <Lock className="w-6 h-6" />
              Unlock Vault
            </button>
          </div>
        )}

        {/* --- UNLOCKED View: Dashboard Content --- */}
        {!isVaultLocked && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-purple-600 p-3 rounded-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Password Vault</h1>
                  <p className="text-slate-400 text-sm">{passwords.length} passwords stored securely</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={lockVault}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                  title="Lock Vault"
                >
                  <Lock className="w-5 h-5" />
                  Lock
                </button>
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Password
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search passwords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Password List */}
            <div className="grid gap-4">
              {filteredPasswords.map((pwd) => (
                <div key={pwd._id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-700 p-3 rounded-lg">
                        <Globe className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{pwd.website}</h3>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full text-white mt-1 ${getCategoryColor(pwd.category)}`}>
                          {pwd.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(pwd._id)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pwd._id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300 flex-1">{pwd.username}</span>
                      <button
                        onClick={() => copyToClipboard(pwd.username, 'Username')}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                      >
                        <CopyIcon result=''/>
                      </button>
                    </div>

                    {/* <div className="flex items-center gap-3">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300 flex-1 font-mono">
                        {visiblePasswords[pwd._id] ? pwd.encryptedPassword : '••••••••••••'}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(pwd._id)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                      >
                        {visiblePasswords[pwd._id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(pwd.encryptedPassword, 'Password')}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                      >
                        <CopyIcon result=''/>
                      </button>
                    </div> */}

                    <div className="flex items-center gap-3">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300 flex-1 font-mono">
                        {visiblePasswords[pwd._id] 
                          ? (decryptedPasswords[pwd._id] || 'Decrypting...') 
                          : '••••••••••••'
                        }
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(pwd._id)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                      >
                        {visiblePasswords[pwd._id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => copyPasswordToClipboard(pwd._id)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                      >
                        <CopyIcon result=''/>
                      </button>
                    </div>

                    {pwd.notes && (
                      <div className="mt-3 p-3 bg-slate-900/50 rounded-lg">
                        <p className="text-sm text-slate-400">{pwd.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredPasswords.length === 0 && (
                <div className="text-center py-12">
                  <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">No passwords found</p>
                </div>
              )}
            </div>
            
            {/* Add/Edit Modal (Unchanged) */}
            {showAddModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      {editingId ? 'Edit Password' : 'Add New Password'}
                    </h2>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Website *
                      </label>
                      <input
                        type="text"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="example.com"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Username *
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="user@example.com"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Password *
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showFormPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="Enter password"
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <button
                            onClick={() => setShowFormPassword(!showFormPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                          >
                            {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <button
                          onClick={generatePassword}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                          title="Generate password"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="personal">Personal</option>
                        <option value="work">Work</option>
                        <option value="finance">Finance</option>
                        <option value="social">Social</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Notes (optional)
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add any additional notes..."
                        rows={3}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      {editingId ? 'Update' : 'Add'} Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}