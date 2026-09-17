import Link from "next/link";
import { Target, GitBranch, Layers, MessageSquare, Sparkles, BookOpen, Plus } from "lucide-react";

export const metadata = { title: "PM Dashboard - Maison 14" };

export default function PMDashboardPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-medium text-ink-900">Tableau de bord PM</h1>
      <p className="mt-2 text-sm text-ink-600">Metriques produit, feedbacks UX et backlog.</p>
      <Link href="/?pm-review=1" className="mt-6 inline-flex rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white">Mode review</Link>
    </main>
  );
}
