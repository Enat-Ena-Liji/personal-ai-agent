"use client";

import { useState } from "react";
import { Loader2, Copy, Send, Sparkles, RefreshCw, Wand2 } from "lucide-react";

type EmailTone = 'professional' | 'friendly' | 'formal' | 'casual' | 'persuasive';
type EmailLength = 'short' | 'medium' | 'detailed';

interface EmailDraftAssistantProps {
  originalEmail: string;
  onUseDraft: (subject: string, body: string) => void;
}

export function EmailDraftAssistant({ originalEmail, onUseDraft }: EmailDraftAssistantProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [tone, setTone] = useState<EmailTone>("professional");
  const [length, setLength] = useState<EmailLength>("medium");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [customInstructions, setCustomInstructions] = useState("");

  const generateDraft = async () => {
    if (!originalEmail.trim()) return;
    
    setLoading(true);
    setGenerated(false);
    
    try {
      const response = await fetch("/api/email/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalEmail,
          tone,
          length,
          instructions: customInstructions || undefined,
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.draft) {
        setSubject(data.draft.subject);
        setBody(data.draft.body);
        setGenerated(true);
      }
    } catch (error) {
      console.error("Failed to generate draft:", error);
    } finally {
      setLoading(false);
    }
  };

  const improveDraft = async (type: 'make_shorter' | 'make_longer' | 'more_professional' | 'more_friendly' | 'add_urgency') => {
    if (!body) return;
    
    setIsImproving(true);
    try {
      const response = await fetch("/api/email/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentDraft: body, improvementType: type }),
      });
      
      const data = await response.json();
      
      if (data.success && data.improved) {
        setBody(data.improved);
      }
    } catch (error) {
      console.error("Failed to improve draft:", error);
    } finally {
      setIsImproving(false);
    }
  };

  const toneOptions: { value: EmailTone; label: string; icon: string }[] = [
    { value: 'professional', label: 'Professional', icon: '💼' },
    { value: 'friendly', label: 'Friendly', icon: '😊' },
    { value: 'formal', label: 'Formal', icon: '📜' },
    { value: 'casual', label: 'Casual', icon: '✌️' },
    { value: 'persuasive', label: 'Persuasive', icon: '🎯' },
  ];

  const lengthOptions: { value: EmailLength; label: string }[] = [
    { value: 'short', label: 'Short (2-3 sentences)' },
    { value: 'medium', label: 'Medium (4-6 sentences)' },
    { value: 'detailed', label: 'Detailed (7-10 sentences)' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          AI Email Assistant
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as EmailTone)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {toneOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.icon} {opt.label}
              </option>
            ))}
          </select>
          <select
            value={length}
            onChange={(e) => setLength(e.target.value as EmailLength)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {lengthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {/* Custom Instructions */}
        <div>
          <input
            type="text"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Add custom instructions (e.g., 'Focus on the pricing discussion')"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={generateDraft}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4" />
          )}
          {loading ? "Generating..." : "Generate Draft"}
        </button>

        {/* Generated Draft */}
        {generated && (
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
              />
            </div>

            {/* Improvement Options */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => improveDraft('make_shorter')}
                disabled={isImproving}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Make Shorter
              </button>
              <button
                onClick={() => improveDraft('make_longer')}
                disabled={isImproving}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Make Longer
              </button>
              <button
                onClick={() => improveDraft('more_professional')}
                disabled={isImproving}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                More Professional
              </button>
              <button
                onClick={() => improveDraft('more_friendly')}
                disabled={isImproving}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                More Friendly
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => onUseDraft(subject, body)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                Use Draft
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(body)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}