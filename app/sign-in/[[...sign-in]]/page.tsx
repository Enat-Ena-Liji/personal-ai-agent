import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: 
              "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg",
            card: "shadow-2xl rounded-2xl p-8"
          }
        }}
      />
    </div>
  );
}