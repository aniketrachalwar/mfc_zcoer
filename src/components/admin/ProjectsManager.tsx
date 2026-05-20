import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Briefcase, Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { Project } from '../../types/project';

const emptyForm = {
  title: '',
  desc: '',
  details: '',
  tech: '',
  img: '',
  demoUrl: '',
  githubUrl: '',
  status: 'active' as Project['status'],
};

const defaultProjectImage = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200';

const ProjectsManager = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const { user, setError, setSuccess } = useAuth();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'projects'));
      const fetchedProjects = snapshot.docs
        .map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Project))
        .sort((a, b) => b.createdAt - a.createdAt);
      setProjects(fetchedProjects);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingProject(null);
    setShowForm(false);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      desc: project.desc,
      details: project.details || '',
      tech: project.tech.join(', '),
      img: project.img,
      demoUrl: project.demoUrl || '',
      githubUrl: project.githubUrl || '',
      status: project.status,
    });
    setShowForm(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.desc.trim()) {
      setError('Project title and short description are required');
      return;
    }

    setSaving(true);
    try {
      const projectPayload = {
        title: formData.title.trim(),
        desc: formData.desc.trim(),
        details: formData.details.trim(),
        tech: formData.tech.split(',').map(item => item.trim()).filter(Boolean),
        img: formData.img.trim() || defaultProjectImage,
        demoUrl: formData.demoUrl.trim(),
        githubUrl: formData.githubUrl.trim(),
        status: formData.status,
        updatedAt: Date.now(),
      };

      if (editingProject) {
        await updateDoc(doc(db, 'projects', editingProject.id), projectPayload);
        setSuccess('Project updated successfully');
      } else {
        await addDoc(collection(db, 'projects'), {
          ...projectPayload,
          createdAt: Date.now(),
          createdBy: user?.uid || 'unknown',
        });
        setSuccess('Project added successfully');
      }

      resetForm();
      fetchProjects();
    } catch (err: any) {
      setError(err.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project: Project) => {
    if (!window.confirm(`Delete "${project.title}"?`)) return;

    try {
      await deleteDoc(doc(db, 'projects', project.id));
      setSuccess('Project deleted successfully');
      fetchProjects();
    } catch (err: any) {
      setError(err.message || 'Failed to delete project');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-black uppercase text-white mb-2">
            Project <span className="text-firefox-orange">Management</span>
          </h1>
          <p className="text-zinc-400 text-sm">Admins and core team members can publish project details here.</p>
        </div>
        <button
          onClick={() => {
            setEditingProject(null);
            setFormData(emptyForm);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-firefox-orange text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-colors"
        >
          <Plus size={16} />
          Add Project
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="mb-8 bg-black/30 border border-white/10 rounded-3xl p-6 space-y-5"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-display font-black text-white">
              {editingProject ? 'Edit Project' : 'Add Project'}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Project Title</span>
              <input
                type="text"
                required
                value={formData.title}
                onChange={event => setFormData({ ...formData, title: event.target.value })}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-[16px] text-white focus:outline-none focus:border-firefox-orange transition-colors"
                placeholder="FoxFire Dashboard"
              />
            </label>

            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</span>
              <select
                value={formData.status}
                onChange={event => setFormData({ ...formData, status: event.target.value as Project['status'] })}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-[16px] text-white focus:outline-none focus:border-firefox-orange transition-colors"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </label>
          </div>

          <label className="space-y-2 block">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Short Description</span>
            <textarea
              required
              rows={2}
              value={formData.desc}
              onChange={event => setFormData({ ...formData, desc: event.target.value })}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-[16px] text-white focus:outline-none focus:border-firefox-orange transition-colors resize-none"
              placeholder="One-line summary shown on the projects page."
            />
          </label>

          <label className="space-y-2 block">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Project Details</span>
            <textarea
              rows={5}
              value={formData.details}
              onChange={event => setFormData({ ...formData, details: event.target.value })}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-[16px] text-white focus:outline-none focus:border-firefox-orange transition-colors resize-none"
              placeholder="Problem statement, features, team context, goals, or implementation notes."
            />
          </label>

          <div className="grid md:grid-cols-2 gap-5">
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Tech Stack</span>
              <input
                type="text"
                value={formData.tech}
                onChange={event => setFormData({ ...formData, tech: event.target.value })}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-[16px] text-white focus:outline-none focus:border-firefox-orange transition-colors"
                placeholder="React, Firebase, Tailwind"
              />
            </label>

            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Cover Image URL</span>
              <input
                type="url"
                value={formData.img}
                onChange={event => setFormData({ ...formData, img: event.target.value })}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-[16px] text-white focus:outline-none focus:border-firefox-orange transition-colors"
                placeholder="https://..."
              />
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Demo URL</span>
              <input
                type="url"
                value={formData.demoUrl}
                onChange={event => setFormData({ ...formData, demoUrl: event.target.value })}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-[16px] text-white focus:outline-none focus:border-firefox-orange transition-colors"
                placeholder="https://demo.example.com"
              />
            </label>

            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">GitHub URL</span>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={event => setFormData({ ...formData, githubUrl: event.target.value })}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-[16px] text-white focus:outline-none focus:border-firefox-orange transition-colors"
                placeholder="https://github.com/org/repo"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-7 py-4 bg-firefox-orange text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : editingProject ? 'Save Changes' : 'Publish Project'}
          </button>
        </motion.form>
      )}
      
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-10 h-10 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4 text-zinc-500">
            <Briefcase size={24} />
          </div>
          <h3 className="text-xl font-display font-bold text-white mb-2">No Projects Found</h3>
          <p className="text-zinc-400 text-sm max-w-md">Start by adding a new open-source project.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map(project => (
            <div key={project.id} className="bg-zinc-900 border border-white/10 rounded-2xl p-5 flex flex-col lg:flex-row gap-5">
              <div className="w-full lg:w-48 aspect-video rounded-xl overflow-hidden bg-zinc-950 shrink-0">
                <img loading="lazy" src={project.img} alt={project.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-xl font-display font-black text-white">{project.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    project.status === 'active'
                      ? 'text-green-400 bg-green-500/10 border-green-500/20'
                      : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-zinc-400 text-sm mb-3">{project.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map(item => (
                    <span key={item} className="px-2 py-1 rounded bg-white/5 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex lg:flex-col gap-2">
                <button
                  onClick={() => handleEdit(project)}
                  className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  <Edit3 size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(project)}
                  className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsManager;
