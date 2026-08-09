import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import adminService from '../../services/adminService';

const EMPTY_FORM = {
  university_id: '',
  canonical_program_id: '',
  specialization_id: '',
  program_name: '',
  degree_level: 'Master',
  track: 'DEFAULT',
  application_deadline: '',
  course_page_url: '',
  tuition: {
    amount: '',
    currency: 'USD',
    amount_usd: ''
  },
  admission_requirements: {
    min_cgpa: '',
    min_ielts_overall: ''
  }
};

const ManagePrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.listPrograms();
      setPrograms(data);
    } catch (err) {
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      // clean up empty nested objects or empty optional IDs
      if (!payload.specialization_id) delete payload.specialization_id;

      if (payload.tuition.amount === '') {
        delete payload.tuition;
      } else {
        payload.tuition.amount = Number(payload.tuition.amount);
        if (payload.tuition.amount_usd !== '') {
           payload.tuition.amount_usd = Number(payload.tuition.amount_usd);
        } else {
           delete payload.tuition.amount_usd;
        }
      }

      if (payload.admission_requirements.min_cgpa === '' && payload.admission_requirements.min_ielts_overall === '') {
        delete payload.admission_requirements;
      } else {
        if (payload.admission_requirements.min_cgpa !== '') payload.admission_requirements.min_cgpa = Number(payload.admission_requirements.min_cgpa);
        else delete payload.admission_requirements.min_cgpa;

        if (payload.admission_requirements.min_ielts_overall !== '') payload.admission_requirements.min_ielts_overall = Number(payload.admission_requirements.min_ielts_overall);
        else delete payload.admission_requirements.min_ielts_overall;
      }

      if (editingId) {
        await adminService.updateProgram(editingId, payload);
        toast.success('Program updated');
      } else {
        await adminService.createProgram(payload);
        toast.success('Program created');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this program?')) return;
    try {
      await adminService.deleteProgram(id);
      toast.success('Deactivated');
      load();
    } catch (err) {
      toast.error('Deactivation failed');
    }
  };

  const handleReactivate = async (id) => {
    if (!window.confirm('Are you sure you want to reactivate this program?')) return;
    try {
      await adminService.updateProgram(id, { is_active: true });
      toast.success('Reactivated');
      load();
    } catch (err) {
      toast.error('Reactivation failed');
    }
  };

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); };
  const openEdit = (p) => {
    setForm({
      university_id: p.university?.id || '',
      canonical_program_id: p.canonical_program?.id || '',
      specialization_id: p.specialization?.id || '',
      program_name: p.program_name || '',
      degree_level: p.degree_level || 'Master',
      track: p.track || 'DEFAULT',
      application_deadline: p.application_deadline || '',
      course_page_url: p.course_page_url || '',
      tuition: {
        amount: p.tuition?.amount || '',
        currency: p.tuition?.currency || 'USD',
        amount_usd: p.tuition?.amount_usd || ''
      },
      admission_requirements: {
        min_cgpa: p.admission_requirements?.min_cgpa || '',
        min_ielts_overall: p.admission_requirements?.min_ielts_overall || ''
      }
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  if (loading && !programs.length) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Programs</h1>
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4"/> Add Program</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <label className="space-y-1">
              <span className="text-sm font-medium">University ID *</span>
              <input required placeholder="ID" value={form.university_id} onChange={e => setForm({...form, university_id: e.target.value})} className="border p-2 rounded w-full" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Core Program ID *</span>
              <input required placeholder="ID" value={form.canonical_program_id} onChange={e => setForm({...form, canonical_program_id: e.target.value})} className="border p-2 rounded w-full" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Specialization ID</span>
              <input placeholder="Optional ID" value={form.specialization_id} onChange={e => setForm({...form, specialization_id: e.target.value})} className="border p-2 rounded w-full" />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium">Program Name *</span>
              <input required placeholder="Name" value={form.program_name} onChange={e => setForm({...form, program_name: e.target.value})} className="border p-2 rounded w-full" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Degree Level *</span>
              <select required value={form.degree_level} onChange={e => setForm({...form, degree_level: e.target.value})} className="border p-2 rounded w-full bg-white">
                <option value="Bachelors">Bachelors</option>
                <option value="Masters">Masters</option>
                <option value="PhD">PhD</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Track</span>
              <input placeholder="e.g. DEFAULT, COOP" value={form.track} onChange={e => setForm({...form, track: e.target.value})} className="border p-2 rounded w-full" />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium">Course URL</span>
              <input placeholder="https://..." value={form.course_page_url} onChange={e => setForm({...form, course_page_url: e.target.value})} className="border p-2 rounded w-full" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Deadline</span>
              <input placeholder="YYYY-MM-DD" value={form.application_deadline} onChange={e => setForm({...form, application_deadline: e.target.value})} className="border p-2 rounded w-full" />
            </label>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50">
             <div className="col-span-full text-sm font-bold text-gray-500 uppercase tracking-wider">Tuition</div>
             <label className="space-y-1">
               <span className="text-sm font-medium">Amount</span>
               <input type="number" placeholder="0" value={form.tuition.amount} onChange={e => setForm({...form, tuition: {...form.tuition, amount: e.target.value}})} className="border p-2 rounded w-full bg-white" />
             </label>
             <label className="space-y-1">
               <span className="text-sm font-medium">Currency</span>
               <input placeholder="USD, EUR, GBP" value={form.tuition.currency} onChange={e => setForm({...form, tuition: {...form.tuition, currency: e.target.value}})} className="border p-2 rounded w-full bg-white" />
             </label>
             <label className="space-y-1">
               <span className="text-sm font-medium">Amount (USD)</span>
               <input type="number" placeholder="0" value={form.tuition.amount_usd} onChange={e => setForm({...form, tuition: {...form.tuition, amount_usd: e.target.value}})} className="border p-2 rounded w-full bg-white" />
             </label>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
             <div className="col-span-full text-sm font-bold text-gray-500 uppercase tracking-wider">Admission Requirements</div>
             <label className="space-y-1">
               <span className="text-sm font-medium">Min CGPA</span>
               <input type="number" step="0.01" placeholder="e.g. 3.0" value={form.admission_requirements.min_cgpa} onChange={e => setForm({...form, admission_requirements: {...form.admission_requirements, min_cgpa: e.target.value}})} className="border p-2 rounded w-full bg-white" />
             </label>
             <label className="space-y-1">
               <span className="text-sm font-medium">Min IELTS</span>
               <input type="number" step="0.5" placeholder="e.g. 6.5" value={form.admission_requirements.min_ielts_overall} onChange={e => setForm({...form, admission_requirements: {...form.admission_requirements, min_ielts_overall: e.target.value}})} className="border p-2 rounded w-full bg-white" />
             </label>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" isLoading={saving}>Save</Button>
          </div>
        </form>
      )}

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Program Name</th>
              <th className="p-4">Degree</th>
              <th className="p-4">University</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {programs.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{p.program_name}</td>
                <td className="p-4">{p.degree_level}</td>
                <td className="p-4">{p.university?.university_name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => openEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><Edit className="w-4 h-4"/></button>
                  {p.is_active ? (
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Deactivate"><Trash2 className="w-4 h-4"/></button>
                  ) : (
                    <button onClick={() => handleReactivate(p.id)} className="p-2 text-green-600 hover:bg-green-50 rounded" title="Activate"><Check className="w-4 h-4"/></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagePrograms;
