import { useState, useEffect } from "react";
import { X, Edit2 } from "lucide-react";

export function NodeInspector({ node, onClose, onAddConnection, onUpdateNode }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ targetType: 'Person', relationshipType: 'FRIEND_OF', name: '', firstName: '', lastName: '' });
  const [submitting, setSubmitting] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(node ? { ...node.data } : {});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (node) {
      setEditForm({ ...node.data });
    }
    setIsEditing(false);
    setAdding(false);
  }, [node]);

  if (!node) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    let targetData = {};
    if (form.targetType === 'Person') {
      targetData = { firstName: form.firstName, lastName: form.lastName };
    } else {
      targetData = { name: form.name };
    }
    await onAddConnection(node.id, form.targetType, form.relationshipType, targetData);
    setSubmitting(false);
    setAdding(false);
  };

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 shadow-2xl p-6 flex flex-col transition-transform z-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-white">Node Details</h2>
        <div className="flex gap-2">
          {!isEditing && !adding && (
            <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors">
              <Edit2 size={16} />
            </button>
          )}
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={async (e) => {
          e.preventDefault();
          setUpdating(true);
          await onUpdateNode(node.id, editForm);
          setUpdating(false);
          setIsEditing(false);
        }} className="mb-6 flex flex-col gap-3">
          {node.type === 'Person' ? (
            <>
              <input required placeholder="First Name" value={editForm.firstName || ''} onChange={e => setEditForm({...editForm, firstName: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-blue-500" />
              <input required placeholder="Last Name" value={editForm.lastName || ''} onChange={e => setEditForm({...editForm, lastName: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-blue-500" />
              <input placeholder="Gender" value={editForm.gender || ''} onChange={e => setEditForm({...editForm, gender: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-blue-500" />
              <textarea placeholder="Bio" value={editForm.bio || ''} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-blue-500 min-h-[80px]" />
            </>
          ) : (
            <input required placeholder="Name" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-blue-500" />
          )}
          <div className="flex gap-2 mt-2">
            <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm">Cancel</button>
            <button type="submit" disabled={updating} className="flex-1 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-medium">
              {updating ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700/50">
          <p className="text-xs text-gray-400 mb-1">{node.type}</p>
          <p className="text-xl font-medium text-white">
            {node.type === "Person" ? `${node.data.firstName || ''} ${node.data.lastName || ''}` : node.data.name}
          </p>
          {node.type === "Person" && <p className="text-sm text-gray-300 mt-2">{node.data.bio}</p>}
        </div>
      )}

      {!adding && !isEditing ? (
        <button 
          onClick={() => setAdding(true)}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors shadow-lg"
        >
          Add Connection
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
          <h3 className="text-sm font-medium text-gray-300">New Connection</h3>
          
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Target Entity Type</label>
            <select 
              value={form.targetType} 
              onChange={e => setForm({...form, targetType: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="Person">Person</option>
              <option value="Institution">Institution</option>
              <option value="Organization">Organization</option>
              <option value="Place">Place</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400">Relationship Type</label>
            <input 
              value={form.relationshipType}
              onChange={e => setForm({...form, relationshipType: e.target.value})}
              placeholder="e.g. FRIEND_OF, WORKED_AT"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2 mt-2">
            {form.targetType === 'Person' ? (
              <>
                <input required placeholder="First Name" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-blue-500"/>
                <input required placeholder="Last Name" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-blue-500"/>
              </>
            ) : (
              <input required placeholder="Entity Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-blue-500"/>
            )}
          </div>

          <div className="mt-auto flex gap-2">
            <button type="button" onClick={() => setAdding(false)} className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-medium">
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
