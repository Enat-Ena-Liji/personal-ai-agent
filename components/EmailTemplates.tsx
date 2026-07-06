"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Loader2,
  Plus,
  Search,
  Star,
  Edit2,
  Trash2,
  Copy,
  Send,
  X,
  Check,
  Sparkles,
  Folder,
  Clock,
  TrendingUp
} from "lucide-react";

interface Template {
  _id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  variables: string[];
  isFavorite: boolean;
  usageCount: number;
  lastUsed?: number;
  createdAt: number;
}

interface TemplateFormData {
  name: string;
  subject: string;
  body: string;
  category: string;
  isFavorite: boolean;
}

export function EmailTemplates() {
  const { isLoaded, isSignedIn } = useUser();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: "",
    subject: "",
    body: "",
    category: "work",
    isFavorite: false,
  });
  const [generating, setGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const categories = [
    { value: "work", label: "💼 Work" },
    { value: "personal", label: "👤 Personal" },
    { value: "sales", label: "📈 Sales" },
    { value: "support", label: "🛠️ Support" },
    { value: "follow-up", label: "🔄 Follow-up" },
    { value: "meeting", label: "📅 Meeting" },
    { value: "introduction", label: "🤝 Introduction" },
    { value: "other", label: "📝 Other" },
  ];

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const url = `/api/templates${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchTemplates();
    }
  }, [isLoaded, isSignedIn, selectedCategory]);

  const handleGenerateTemplate = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/templates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose: formData.name || "general email",
          tone: "professional",
          length: "medium",
        }),
      });
      const data = await response.json();
      if (data.success) {
        setFormData({
          ...formData,
          subject: data.template.subject,
          body: data.template.body,
          variables: data.template.variables,
        });
      }
    } catch (error) {
      console.error("Failed to generate template:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!formData.name || !formData.subject || !formData.body) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("/api/templates", {
        method: editingTemplate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingTemplate && { templateId: editingTemplate._id }),
          name: formData.name,
          subject: formData.subject,
          body: formData.body,
          category: formData.category,
          variables: formData.body.match(/\{\{([^}]+)\}\}/g)?.map(v => v.replace(/[{}]/g, '')) || [],
          isFavorite: formData.isFavorite,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setShowCreateModal(false);
        setEditingTemplate(null);
        setFormData({
          name: "",
          subject: "",
          body: "",
          category: "work",
          isFavorite: false,
        });
        fetchTemplates();
      }
    } catch (error) {
      console.error("Failed to save template:", error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Delete this template?")) return;

    try {
      const response = await fetch("/api/templates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      const data = await response.json();
      if (data.success) {
        fetchTemplates();
      }
    } catch (error) {
      console.error("Failed to delete template:", error);
    }
  };

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setPreviewMode(true);
    const variables: Record<string, string> = {};
    template.variables.forEach((v) => {
      variables[v] = "";
    });
    setPreviewValues(variables);
  };

  const renderPreview = (body: string, variables: Record<string, string>) => {
    let preview = body;
    Object.entries(variables).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), value || `[${key}]`);
    });
    return preview;
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Email Templates</h2>
            <p className="text-sm text-gray-500">Create and manage email templates with variables</p>
          </div>
          <button
            onClick={() => {
              setEditingTemplate(null);
              setFormData({
                name: "",
                subject: "",
                body: "",
                category: "work",
                isFavorite: false,
              });
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <button
            onClick={fetchTemplates}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Template List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p>No templates found</p>
          <p className="text-sm">Create your first template using the button above</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          {filteredTemplates.map((template) => (
            <div key={template._id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleUseTemplate(template)}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    {template.isFavorite && (
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    )}
                    {template.variables.length > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        {template.variables.length} variables
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">Subject: {template.subject}</p>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{template.body}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Folder className="w-3 h-3" />
                      {categories.find(c => c.value === template.category)?.label || template.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Used {template.usageCount} times
                    </span>
                    {template.lastUsed && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(template.lastUsed).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Use template"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingTemplate(template);
                      setFormData({
                        name: template.name,
                        subject: template.subject,
                        body: template.body,
                        category: template.category,
                        isFavorite: template.isFavorite,
                      });
                      setShowCreateModal(true);
                    }}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template._id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingTemplate ? "Edit Template" : "New Template"}
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Sales Follow-up"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Email subject with {{variables}}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Email body with {{variables}}"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Use {'{{variable}}'} placeholders for personalization
                </p>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.isFavorite}
                    onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Favorite
                </label>
                <button
                  onClick={handleGenerateTemplate}
                  disabled={generating}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors disabled:opacity-70"
                >
                  <Sparkles className="w-4 h-4" />
                  {generating ? "Generating..." : "AI Generate"}
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {editingTemplate ? "Update" : "Create"} Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewMode && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Preview: {selectedTemplate.name}</h3>
                <button
                  onClick={() => setPreviewMode(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <p className="text-gray-900">{selectedTemplate.subject}</p>
                </div>

                {selectedTemplate.variables.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Variables</label>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedTemplate.variables.map((v) => (
                        <input
                          key={v}
                          type="text"
                          placeholder={`{{${v}}}`}
                          value={previewValues[v] || ""}
                          onChange={(e) => setPreviewValues({ ...previewValues, [v]: e.target.value })}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preview</label>
                  <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm text-gray-700">
                    {renderPreview(selectedTemplate.body, previewValues)}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  onClick={() => {
                    // Use template in email composer
                    setPreviewMode(false);
                    alert("Template ready to use!");
                  }}
                >
                  <Send className="w-4 h-4 inline mr-2" />
                  Use Template
                </button>
                <button
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(renderPreview(selectedTemplate.body, previewValues));
                    alert("Copied to clipboard!");
                  }}
                >
                  <Copy className="w-4 h-4 inline mr-2" />
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}