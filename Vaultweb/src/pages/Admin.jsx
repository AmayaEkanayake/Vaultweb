import React, { useState, useEffect, useContext } from 'react';
import { Users, Activity, ShieldCheck, UserPlus, MoreVertical, FileText, Plus, Pencil, Trash2, Check, X, Loader2, Database, AlertCircle } from 'lucide-react';
import { UserContext } from '../UserContext';
import { retriveUserInfo, getVaultsByOrg, createVault, updateVault, deleteVault } from '../utilites/netUtilities';

const extractError = (err) =>
  err?.response?.data?.error ?? err?.message ?? 'An unexpected error occurred.';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('users');
  const userInfo = useContext(UserContext);

  // Vault state
  const [orgId, setOrgId] = useState(null);
  const [vaults, setVaults] = useState([]);
  const [vaultsLoading, setVaultsLoading] = useState(false);
  const [vaultsError, setVaultsError] = useState(null);

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newVaultName, setNewVaultName] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Mock data for non-vault tabs
  const users = [
    { id: 1, name: "Sarah Connor", email: "sarah@vault.com", role: "Organiser", status: "Active" },
    { id: 2, name: "John Doe", email: "john@vault.com", role: "Member", status: "Active" },
    { id: 3, name: "Kyle Reese", email: "kyle@vault.com", role: "Auditor", status: "Pending" },
  ];

  const logs = [
    { id: 1, action: "Secret Decrypted", user: "John Doe", target: "AWS_PROD_KEY", time: "2 mins ago" },
    { id: 2, action: "User Invited", user: "Sarah Connor", target: "Kyle Reese", time: "1 hour ago" },
    { id: 3, action: "Login Success", user: "John Doe", target: "N/A", time: "3 hours ago" },
  ];

  useEffect(() => {
    if (activeTab !== 'vaults') return;

    const load = async () => {
      if (!userInfo?.uuID) {
        setVaultsError('You must be logged in to manage vaults.');
        return;
      }
      setVaultsLoading(true);
      setVaultsError(null);
      try {
        let currentOrgId = orgId;
        if (!currentOrgId) {
          const userData = await retriveUserInfo(userInfo.uuID);
          currentOrgId = userData?.result?.user?.orgId;
          if (!currentOrgId) throw new Error('Could not determine your organisation.');
          setOrgId(currentOrgId);
        }
        const data = await getVaultsByOrg(currentOrgId);
        setVaults(data?.result?.vaults ?? []);
      } catch (err) {
        setVaultsError(extractError(err));
      } finally {
        setVaultsLoading(false);
      }
    };

    load();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateVault = async (e) => {
    e.preventDefault();
    if (!newVaultName.trim() || !orgId) return;
    setCreating(true);
    setVaultsError(null);
    try {
      const data = await createVault(orgId, newVaultName.trim(), userInfo.uuID);
      setVaults(prev => [data.result.vault, ...prev]);
      setNewVaultName('');
      setShowCreateForm(false);
    } catch (err) {
      setVaultsError(extractError(err));
    } finally {
      setCreating(false);
    }
  };

  const handleStartEdit = (vault) => {
    setConfirmDeleteId(null);
    setEditingId(vault.id);
    setEditName(vault.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleSaveEdit = async (vaultId) => {
    if (!editName.trim() || !orgId) return;
    setSaving(true);
    setVaultsError(null);
    try {
      const data = await updateVault(orgId, vaultId, editName.trim());
      setVaults(prev => prev.map(v => v.id === vaultId ? data.result.vault : v));
      setEditingId(null);
    } catch (err) {
      setVaultsError(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (vaultId) => {
    if (!orgId) return;
    setDeleting(true);
    setVaultsError(null);
    try {
      await deleteVault(orgId, vaultId);
      setVaults(prev => prev.filter(v => v.id !== vaultId));
      setConfirmDeleteId(null);
    } catch (err) {
      setVaultsError(extractError(err));
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-[Poppins] pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <ShieldCheck className="text-purple-500" /> Organization Admin
            </h1>
            <p className="text-slate-400 mt-1">Manage infrastructure access and monitor security compliance.</p>
          </div>
          {activeTab === 'users' && (
            <button className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">
              <UserPlus size={18} /> Add Member
            </button>
          )}
          {activeTab === 'vaults' && (
            <button
              onClick={() => { setShowCreateForm(true); setVaultsError(null); }}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-900/20"
            >
              <Plus size={18} /> New Vault
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-8 border-b border-white/5 mb-8">
          {[
            { key: 'users', label: 'Team Management' },
            { key: 'vaults', label: 'Vaults' },
            { key: 'logs', label: 'Security Audit' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-4 text-sm font-bold tracking-widest uppercase transition-all ${activeTab === tab.key ? 'text-purple-400 border-b-2 border-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-slate-900/40 border border-white/5 rounded-3xl backdrop-blur-xl overflow-hidden shadow-2xl">

          {/* ── Team Management ── */}
          {activeTab === 'users' && (
            <div className="animate-in fade-in duration-500">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Member</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Access Level</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-8 py-6">
                        <div className="font-bold text-white">{user.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{user.email}</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${user.role === 'Organiser' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {user.status}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Vaults ── */}
          {activeTab === 'vaults' && (
            <div className="animate-in fade-in duration-500">

              {/* Error banner */}
              {vaultsError && (
                <div className="mx-6 mt-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span className="flex-1">{vaultsError}</span>
                  <button onClick={() => setVaultsError(null)} className="hover:text-red-300 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Create form */}
              {showCreateForm && (
                <form
                  onSubmit={handleCreateVault}
                  className="mx-6 mt-6 flex items-center gap-3 p-4 bg-white/[0.02] border border-white/10 rounded-xl"
                >
                  <Database size={16} className="text-purple-400 shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    value={newVaultName}
                    onChange={e => setNewVaultName(e.target.value)}
                    placeholder="Vault name"
                    maxLength={100}
                    className="flex-1 bg-transparent text-white placeholder-slate-600 outline-none text-sm"
                  />
                  <button
                    type="submit"
                    disabled={creating || !newVaultName.trim()}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all"
                  >
                    {creating ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCreateForm(false); setNewVaultName(''); }}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all"
                  >
                    <X size={16} />
                  </button>
                </form>
              )}

              {/* Loading */}
              {vaultsLoading ? (
                <div className="py-24 flex flex-col items-center gap-3 text-slate-600">
                  <Loader2 size={32} className="animate-spin" />
                  <p className="text-sm">Loading vaults...</p>
                </div>
              ) : vaults.length === 0 && !vaultsError ? (
                <div className="py-24 text-center">
                  <Database size={48} className="mx-auto text-slate-800 mb-4" />
                  <p className="text-slate-500 font-medium">No vaults yet.</p>
                  <p className="text-slate-600 text-sm mt-1">Click <span className="text-purple-400 font-bold">New Vault</span> to create one.</p>
                </div>
              ) : (
                <table className="w-full text-left mt-4">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5">
                      <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Vault Name</th>
                      <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Created</th>
                      <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {vaults.map(vault => (
                      <tr key={vault.id} className="hover:bg-white/[0.01] transition-colors group">

                        {/* Name cell */}
                        <td className="px-8 py-5">
                          {editingId === vault.id ? (
                            <input
                              autoFocus
                              type="text"
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              maxLength={100}
                              className="bg-slate-800 border border-purple-500/50 rounded-lg px-3 py-1.5 text-white text-sm outline-none focus:ring-2 focus:ring-purple-500/40 w-64"
                            />
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                <Database size={14} />
                              </div>
                              <span className="font-semibold text-white">{vault.name}</span>
                            </div>
                          )}
                        </td>

                        {/* Date cell */}
                        <td className="px-8 py-5 text-sm text-slate-500 font-mono">
                          {formatDate(vault.createdAt)}
                        </td>

                        {/* Actions cell */}
                        <td className="px-8 py-5 text-right">
                          {editingId === vault.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleSaveEdit(vault.id)}
                                disabled={saving || !editName.trim()}
                                className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all"
                              >
                                {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : confirmDeleteId === vault.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs text-slate-400">Delete this vault?</span>
                              <button
                                onClick={() => handleDelete(vault.id)}
                                disabled={deleting}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all"
                              >
                                {deleting ? <Loader2 size={12} className="animate-spin" /> : null}
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleStartEdit(vault)}
                                className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-purple-400 transition-all"
                                title="Rename vault"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => { setConfirmDeleteId(vault.id); setEditingId(null); }}
                                className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-red-400 transition-all"
                                title="Delete vault"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Bottom padding when table is showing */}
              {!vaultsLoading && vaults.length > 0 && <div className="pb-4" />}
            </div>
          )}

          {/* ── Security Audit ── */}
          {activeTab === 'logs' && (
            <div className="animate-in fade-in duration-500">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} className="text-purple-500" /> System Logs (Last 24h)
                </div>
                <button className="text-[10px] text-purple-400 font-bold uppercase hover:underline">Export CSV</button>
              </div>
              <div className="divide-y divide-white/5">
                {logs.map(log => (
                  <div key={log.id} className="px-8 py-5 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-center text-slate-500">
                        <FileText size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{log.action}</div>
                        <div className="text-xs text-slate-500">User: <span className="text-slate-300">{log.user}</span> • Target: <span className="text-slate-300">{log.target}</span></div>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-slate-600 uppercase">{log.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Admin;
