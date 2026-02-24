import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-[#F6F2FF] to-white">
      <SignUp appearance={{ elements: { card: "bg-zinc-900 border border-zinc-800" } }} />
    </main>
  );
}

