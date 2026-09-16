# Maison 14 — Plateforme e-commerce premium

> Boutique de design premium en ligne. Objets et pièces sélectionnés pour leur exigence esthétique, pensés pour durer.

---

## 🗂 Organisation

| Dossier | Contenu | Owner |
|---|---|---|
| `BOARD.md` | Feed d'équipe temps-réel (statuts, callouts, livrables) | @Chief |
| `BLOCKERS.md` | Arbitrages en attente user (B-XX) | @Chief |
| `DECISIONS.md` | Log des décisions actées (D-XX) | @Chief |
| `specs/` | PRD, user stories, roadmap, archi, stack | @PM / @TechLead |
| `infra/` | Plan hébergement, CI/CD, monitoring, Docker | @DevOps |
| `qa/` | Plan de test, scénarios, critères d'acceptation | @QA |
| `apps/` | Code (web, api, admin) | @TechLead |
| `packages/` | Code partagé (db, ui, shared) | @TechLead |
| `design/` | Design system, tokens, maquettes | @Designer (à pourvoir) |

## 🧭 Comment lire

- **Tu suis l'avancement** : lis `BOARD.md` (ordre chronologique, du plus vieux au plus récent).
- **Tu arbitres** : lis `BLOCKERS.md` (une décision par ligne, format `B-XX — question — arbitrage par défaut`).
- **Tu sais pourquoi on a fait un choix** : lis `DECISIONS.md` (format `D-XX — décision — rationale — date — owner`).

## 🚦 Règle non-négociable

**Aucune livraison sans preuve disque** : `ls -la <path>` collée dans le post du BOARD. Pas d'exception.
