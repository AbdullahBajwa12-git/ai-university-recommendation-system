import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, MapPin, Star, Globe, Edit, Trash2, Loader2, AlertCircle, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import { cn } from '../../utils/cn';
import adminService from '../../services/adminService';

const EMPTY_FORM = {
  university_name: '', country: '', city: '', qs_ranking: '',
  website: '', yearly_tuition_usd: '', acceptance_rate: '', description: '',
};

// Form values → API payload: required name/country, numbers coerced, empties dropped.
const buildPayload = (f) => {
  const p = { university_name: f.university_name.trim(), country: f.country.trim() };
  if (f.city.trim()) p.city = f.city.trim();
  if (f.website.trim()) p.website = f.website.trim();
  if (f.description.trim()) p.description = f.description.trim();
  if (String(f.qs_ranking).trim() !== '') p.qs_ranking = Number(f.qs_ranking);
  if (String(f.yearly_tuition_usd).trim() !== '') p.yearly_tuition_usd = Number(f.yearly_tuition_usd);
  if (String(f.acceptance_rate).trim() !== '') p.acceptance_rate = Number(f.acceptance_rate);
  return p;
};

const ManageUniversities = () => {
  const [universities, setUniversities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = creating
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [unis, ctrs] = await Promise.all([
        adminService.listUniversities(),
        adminService.listCountries().catch(() => []),
      ]);
      setUniversities(Array.isArray(unis) ? unis : []);
      setCountries(Array.isArray(ctrs) ? ctrs : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (u) => {
    setEditingId(u.id);
    setForm({
      university_name: u.university_name || '',
      country: u.country || '',
      city: u.city || '',
      qs_ranking: u.qs_ranking ?? '',
      website: u.website || '',
      yearly_tuition_usd: u.yearly_tuition_usd ?? '',
      acceptance_rate: u.acceptance_rate ?? '',
      description: u.description || '',
    });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); };

  const onField = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const submit = async () => {
    if (!form.university_name.trim() || !form.country.trim()) {
      toast.error('University name and country are required');
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload(form);
      if (editingId) {
        await adminService.updateUniversity(editingId, payload);
        toast.success('University updated');
      } else {
        await adminService.createUniversity(payload);
        toast.success('University created');
      }
      closeForm();
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save university');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete "${u.university_name}"? This removes it from the public catalog.`)) return;
    try {
      await adminService.deleteUniversity(u.id);
      toast.success('University deleted');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete university');
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = q
    ? universities.filter((u) => [u.university_name, u.country, u.city].filter(Boolean).some((v) => v.toLowerCase().includes(q)))
    : universities;

  const fieldCls = "w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none";

  return (
    <div className="space-y-8">
      {/* Search + Add */}
      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            className={cn(fieldCls, "pl-10 py-3")}
            placeholder="Search universities by name, country or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button size="sm" className="rounded-xl gap-2 h-11 px-8" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add University
        </Button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">{editingId ? 'Edit University' : 'Add University'}</h3>
            <button onClick={closeForm} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Name *</label>
              <input className={fieldCls} value={form.university_name} onChange={onField('university_name')} placeholder="University name" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Country *</label>
              <input list="admin-country-list" className={fieldCls} value={form.country} onChange={onField('country')} placeholder="Select or type a country" />
              <datalist id="admin-country-list">
                {countries.map((c) => <option key={c.id || c.name} value={c.name} />)}
              </datalist>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">City</label>
              <input className={fieldCls} value={form.city} onChange={onField('city')} placeholder="City" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">QS Ranking</label>
              <input type="number" className={fieldCls} value={form.qs_ranking} onChange={onField('qs_ranking')} placeholder="e.g. 42" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Website</label>
              <input className={fieldCls} value={form.website} onChange={onField('website')} placeholder="https://example.edu" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Yearly Tuition (USD)</label>
              <input type="number" className={fieldCls} value={form.yearly_tuition_usd} onChange={onField('yearly_tuition_usd')} placeholder="e.g. 40000" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Acceptance Rate (%)</label>
              <input type="number" step="0.1" className={fieldCls} value={form.acceptance_rate} onChange={onField('acceptance_rate')} placeholder="e.g. 15" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Description</label>
              <textarea className={cn(fieldCls, "min-h-[70px]")} value={form.description} onChange={onField('description')} placeholder="Short description" />
            </div>
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

      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
      )}

      {!loading && error && (
        <div className="py-12 text-center">
          <AlertCircle className="h-9 w-9 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">Couldn't load universities</h3>
          <p className="text-slate-400 mt-1">Please ensure you're signed in as an admin and the backend is running.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-slate-800/50 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-700">
                  {['University', 'Location', 'QS Rank', 'Website', 'Actions'].map((h) => (
                    <th key={h} className="px-7 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-7 py-10 text-center text-slate-500 text-sm">No universities found.</td></tr>
                ) : filtered.map((uni) => (
                  <tr key={uni.id} className="hover:bg-slate-700/30 transition-all group">
                    <td className="px-7 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-black text-blue-400 text-sm">
                          {(uni.university_name || '?').charAt(0)}
                        </div>
                        <p className="font-bold text-white text-sm">{uni.university_name}</p>
                      </div>
                    </td>
                    <td className="px-7 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <MapPin className="h-3.5 w-3.5" /> {[uni.city, uni.country].filter(Boolean).join(', ') || '—'}
                      </div>
                    </td>
                    <td className="px-7 py-5">
                      {uni.qs_ranking != null ? (
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-bold text-white">#{uni.qs_ranking}</span>
                        </div>
                      ) : <span className="text-sm text-slate-600">—</span>}
                    </td>
                    <td className="px-7 py-5">
                      {uni.website ? (
                        <a href={uni.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400">
                          <Globe className="h-3 w-3" />{uni.website.replace(/^https?:\/\//, '')}
                        </a>
                      ) : <span className="text-sm text-slate-600">—</span>}
                    </td>
                    <td className="px-7 py-5">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(uni)} title="Edit"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => remove(uni)} title="Delete"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-7 py-5 bg-slate-900 border-t border-slate-700">
            <p className="text-xs text-slate-500">Showing {filtered.length} of {universities.length} universities</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUniversities;
