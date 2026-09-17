import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Mon compte",
};

export default function ComptePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-4xl font-medium text-ink-900">Mon compte</h1>
      <p className="mt-4 text-ink-600">Espace client.</p>
      <Link href="/" className="mt-6 inline-flex rounded-full bg-accent-700 px-6 py-3 font-medium text-white">Retour</Link>
    </main>
  );
}
