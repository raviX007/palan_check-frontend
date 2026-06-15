import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <SignUp
      fallbackRedirectUrl="/"
      appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "shadow-lg border border-slate-200",
          headerTitle: "font-display text-xl",
          formButtonPrimary:
            "bg-brand-600 hover:bg-brand-700 text-sm font-semibold",
        },
      }}
    />
  );
}