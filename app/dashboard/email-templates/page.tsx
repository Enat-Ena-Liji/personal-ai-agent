"use client";

import { useUser } from "@/hooks/useUser";
import { Loader2 } from "lucide-react";
import { EmailTemplates } from "@/components/EmailTemplates";

export default function EmailTemplatesPage() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to manage email templates.</p>
        </div>
      </div>
    );
  }

  return <EmailTemplates />;
}