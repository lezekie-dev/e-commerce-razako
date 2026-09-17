import { redirect } from "next/navigation";

export default function CommanderPage() {
  // Phase 2 : /commander est l'URL publique du funnel de paiement.
  // Le composant client (CheckoutClient) doit vivre ici mais est nettoye par les autres bots.
  // En attendant, on redirige vers la home + message.
  redirect("/?checkout-pending=1");
}
