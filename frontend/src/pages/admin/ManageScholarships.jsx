import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Award, Edit, Loader2, AlertCircle, Save, X, Power, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import { cn } from '../../utils/cn';
import adminService from '../../services/adminService';

const EMPTY_FORM = {
  title: '', provider: '', university_name: '', country: '', level: '', field_of_study: '',
  funding_type: '', amount: '', deadline: '', eligibility: '', apply_url: '', description: '',
  is_active: true,
};

const TEXT_FIELDS = [
  'provider', 'university_name', 'country', 'level', 'field_of_study',
  'funding_type', 'amount', 'deadline', 'eligibility', 'apply_url', 'description',
];

const buildPayload = (f) => {
  const p = { title: f.title.trim(), is_active: f.is_active };
  TEXT_FIELDS.forEach((k) => { if (String(f[k]).trim()) p[k] = String(f[k]).trim(); });
  return p;
};

const ManageScholarships = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await adminService.listScholarships();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (s) => {
    setEditingId(s.id);
    setForm({
      title: s.title || '', provider: s.provider || '', university_name: s.university_name || '',
      country: s.country || '', level: s.level || '', field_of_study: s.field_of_study || '',
      funding_type: s.funding_type || '', amount: s.amount || '', deadline: s.deadline || '',
      eligibility: s.eligibility || '', apply_url: s.apply_url || '', description: s.description || '',
      is_active: s.is_active !== false,
    });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); };
  const onField = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const payload = buildPayload(form);
      if (editingId) {
        await adminService.updateScholarship(editingId, payload);
        toast.success('Scholarship updated');
      } else {
        await adminService.createScholarship(payload);
        toast.success('Scholarship created');
      }
      closeForm();
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save scholarship');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (s) => {
    const deactivating = s.is_active !== false;
    if (deactivating && !window.confirm(`Deactivate "${s.title}"? Students will no longer see it.`)) return;
    setBusyId(s.id);
    try {
      if (deactivating) {
        await adminService.deleteScholarship(s.id);   // soft delete (is_active=false)
        toast.success('Scholarship deactivated');
      } else {
        await adminService.updateScholarship(s.id, { is_active: true });
        toast.success('Scholarship reactivated');
      }
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setBusyId(null);
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = q
    ? items.filter((s) => [s.title, s.country, s.level, s.provider].filter(Boolean).some((v) => v.toLowerCase().includes(q)))
    : items;

  const fieldCls = "w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none";
  const Labeled = ({ label, children }) => (
    <div>
      <label className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input className={cn(fieldCls, "pl-10 py-3")} placeholder="Search by title, country, level or provider..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button size="sm" className="rounded-xl gap-2 h-11 px-8" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Scholarship
        </Button>
      </div>

      {showForm && (
        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">{editingId ? 'Edit Scholarship' : 'Add Scholarship'}</h3>
            <button onClick={closeForm} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Labeled label="Title *"><input className={fieldCls} value={form.title} onChange={onField('title')} placeholder="Scholarship title" /></Labeled>
            <Labeled label="Provider"><input className={fieldCls} value={form.provider} onChange={onField('provider')} placeholder="Provider" /></Labeled>
            <Labeled label="University Name"><input className={fieldCls} value={form.university_name} onChange={onField('university_name')} placeholder="University" /></Labeled>
            <Labeled label="Country"><input className={fieldCls} value={form.country} onChange={onField('country')} placeholder="Country" /></Labeled>
            <Labeled label="Level"><input className={fieldCls} value={form.level} onChange={onField('level')} placeholder="Undergraduate / Graduate" /></Labeled>
            <Labeled label="Field of Study"><input className={fieldCls} value={form.field_of_study} onChange={onField('field_of_study')} placeholder="e.g. Computer Science" /></Labeled>
            <Labeled label="Funding Type"><input className={fieldCls} value={form.funding_type} onChange={onField('funding_type')} placeholder="Merit / Need-based / Fully Funded" /></Labeled>
            <Labeled label="Amount"><input className={fieldCls} value={form.amount} onChange={onField('amount')} placeholder="e.g. Full tuition" /></Labeled>
            <Labeled label="Deadline"><input className={fieldCls} value={form.deadline} onChange={onField('deadline')} placeholder="e.g. 2026-12-15" /></Labeled>
            <Labeled label="Apply URL"><input className={fieldCls} value={form.apply_url} onChange={onField('apply_url')} placeholder="https://..." /></Labeled>
            <div className="md:col-span-2">
              <Labeled label="Eligibility"><input className={fieldCls} value={form.eligibility} onChange={onField('eligibility')} placeholder="Who can apply" /></Labeled>
            </div>
            <div className="md:col-span-2">
              <Labeled label="Description"><textarea className={cn(fieldCls, "min-h-[70px]")} value={form.description} onChange={onField('description')} placeholder="Short description" /></Labeled>
            </div>
            <label className="flex items-center gap-3 md:col-span-2 text-sm text-slate-300">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4 rounded accent-blue-600" />
              Active (visible to students)
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" size="sm" className="rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700" onClick={closeForm} disabled={saving}>Cancel</Button>
            <Button size="sm" className="rounded-xl gap-2 px-8" onClick={submit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editingId ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </div>
      )}

      {loading && <div className="flex items-center justify-center py-16 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>}

      {!loading && error && (
        <div className="py-12 text-center">
          <AlertCircle className="h-9 w-9 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">Couldn't load scholarships</h3>
          <p className="text-slate-400 mt-1">Please ensure you're signed in as an admin and the backend is running.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-slate-800/50 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-700">
                  {['Scholarship', 'Country', 'Level', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-7 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-7 py-10 text-center text-slate-500 text-sm">No scholarships found.</td></tr>
                ) : filtered.map((s) => {
                  const active = s.is_active !== false;
                  const busy = busyId === s.id;
                  return (
                    <tr key={s.id} className={cn("hover:bg-slate-700/30 transition-all", !active && "opacity-60")}>
                      <td className="px-7 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-blue-400">
                            <Award className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{s.title}</p>
                            <p className="text-xs text-slate-500">{s.provider || s.university_name || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-7 py-5 text-sm text-slate-400">{s.country || '—'}</td>
                      <td className="px-7 py-5 text-sm text-slate-400">{s.level || '—'}</td>
                      <td className="px-7 py-5">
                        <div className="flex items-center gap-2">
                          {active ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-slate-600" />}
                          <span className={cn('text-xs font-bold', active ? 'text-emerald-500' : 'text-slate-600')}>{active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </td>
                      <td className="px-7 py-5">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(s)} title="Edit"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => toggleActive(s)} disabled={busy}
                            title={active ? 'Deactivate' : 'Reactivate'}
                            className={cn('p-2 rounded-xl transition-all disabled:opacity-40',
                              active ? 'bg-slate-800 hover:bg-amber-500/20 text-amber-400' : 'bg-slate-800 hover:bg-emerald-500/20 text-emerald-400')}>
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-7 py-5 bg-slate-900 border-t border-slate-700">
            <p className="text-xs text-slate-500">Showing {filtered.length} of {items.length} scholarships</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageScholarships;
