"use client";

export default function ConnectGmail() {
  const handleConnect = () => {
    // Placeholder for future Gmail connection logic
    alert("Gmail connection will be implemented in Phase 3!");
  };

  return (
    <button
      onClick={handleConnect}
      className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gray-100">
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </div>
        <div className="text-left">
          <p className="font-medium text-gray-900">Gmail</p>
          <p className="text-sm text-gray-500">Connect your Gmail account</p>
        </div>
      </div>
      <span className="text-sm font-medium text-blue-600">Connect</span>
    </button>
  );
}