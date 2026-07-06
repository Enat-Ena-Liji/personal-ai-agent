"use client";

import { useState } from "react";
import { Save, Copy, Edit2, Trash2, Plus } from "lucide-react";

export function EmailTemplates() {
  const [templates, setTemplates] = useState([
    { id: '1', name: 'Meeting Request', body: 'Hi {{name}}, Would you be available for a meeting...' },
    { id: '2', name: 'Follow-up', body: 'Hi {{name}}, Just following up on our previous conversation...' },
  ]);
  const [showNew, setShowNew] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', body: '' });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <Save className="w-5 h-5 text-blue-600" />
        Email Templates
      </h3>

      <div className="space-y-3">
        {templates.map((template) => (
          <div key={template.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{template.name}</span>
              <div className="flex gap-2">
                <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-600 hover:bg-gray-200 rounded">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{template.body}</p>
          </div>
        ))}
      </div>

      {showNew && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg">
          <input
            type="text"
            placeholder="Template name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
            value={newTemplate.name}
            onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
          />
          <textarea
            placeholder="Template body (use {{name}}, {{email}}, etc.)"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            value={newTemplate.body}
            onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
          />
          <div className="flex gap-2 mt-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg" onClick={() => setShowNew(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowNew(true)}
        className="mt-4 w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        <Plus className="w-4 h-4 inline mr-2" />
        New Template
      </button>
    </div>
  );
}