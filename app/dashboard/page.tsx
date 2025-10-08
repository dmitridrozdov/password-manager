"use client"

import { useState } from 'react';
import { Plus, Search, Eye, EyeOff, Copy, Trash2, Edit2, Lock, Globe, User, RefreshCw, X, Shield } from 'lucide-react';

export default function PasswordVaultDashboard() {
  const [passwords, setPasswords] = useState([
    { id: 1, website: 'github.com', username: 'john@example.com', password: 'Gh#9kL2$pQ4x', category: 'work', notes: 'Development account' },
    { id: 2, website: 'gmail.com', username: 'personal@gmail.com', password: 'Em@il2024!Sec', category: 'personal', notes: '' },
    { id: 3, website: 'aws.amazon.com', username: 'admin@company.com', password: 'Aws$3cr3t#2024', category: 'work', notes: 'Production access' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    website: '',
    username: '',
    password: '',
    category: 'personal',
    notes: '',
  });
  const [showFormPassword, setShowFormPassword] = useState(false);

  const filteredPasswords = passwords.filter(p => 
    p.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePasswordVisibility = (id: number) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
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

  const handleSubmit = () => {
    if (!formData.website || !formData.username || !formData.password) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingId) {
      setPasswords(prev => prev.map(p => 
        p.id === editingId ? { ...formData, id: editingId } : p
      ));
    } else {
      setPasswords(prev => [...prev, { ...formData, id: Date.now() }]);
    }

    setShowAddModal(false);
    setEditingId(null);
    setFormData({ website: '', username: '', password: '', category: 'personal', notes: '' });
  };

  const handleEdit = (password: {
    id: number;
    website: string;
    username: string;
    password: string;
    category: string;
    notes: string;
  }) => {
    setFormData(password);
    setEditingId(password.id);
    setShowAddModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this password?')) {
      setPasswords(prev => prev.filter(p => p.id !== id));
    }
  };

  const openAddModal = () => {
    setFormData({ website: '', username: '', password: '', category: 'personal', notes: '' });
    setEditingId(null);
    setShowAddModal(true);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      work: 'bg-blue-500',
      personal: 'bg-green-500',
      finance: 'bg-yellow-500',
      social: 'bg-purple-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-3 rounded-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              {/* <h1 className="text-3xl font-bold text-white">Password Vault</h1> */}
              <p className="text-slate-400 text-sm">{passwords.length} passwords stored securely</p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Password
          </button>
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
            <div key={pwd.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
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
                    onClick={() => handleEdit(pwd)}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pwd.id)}
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
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 flex-1 font-mono">
                    {visiblePasswords[pwd.id] ? pwd.password : '••••••••••••'}
                  </span>
                  <button
                    onClick={() => togglePasswordVisibility(pwd.id)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  >
                    {visiblePasswords[pwd.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(pwd.password, 'Password')}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4" />
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

        {/* Add/Edit Modal */}
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
      </div>
    </div>
  );
}