// qa/e2e/helpers/a11y.ts
// Maison 14 — helper axe-core/playwright pour assertions a11y WCAG 2.1 AA.
// Politique par défaut : fail sur critical + serious, tags wcag2{a,aa} + wcag21{a,aa}.

import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

export type A11yImpact = 'minor' | 'moderate' | 'serious' | 'critical';

export const DEFAULT_A11Y_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const;
export const DEFAULT_A11Y_FAIL_ON: A11yImpact[] = ['critical', 'serious'];

export interface ExpectNoA11yOptions {
  /** Rule tags axe à inclure. Défaut = wcag2a/2aa/21a/21aa */
  tags?: readonly string[];
  /** Impacts considérés comme fail. Défaut = critical + serious */
  failOn?: A11yImpact[];
  /** Liste de rule ids à désactiver */
  disabledRules?: string[];
  /** Sélecteur CSS pour scoper l'analyse (axe `include`) */
  contextSelector?: string;
  /** Libellé affiché dans le message d'erreur (ex: nom du test) */
  testName?: string;
}

export interface A11yViolationSummary {
  id: string;
  impact: A11yImpact;
  description: string;
  helpUrl: string;
  nodeCount: number;
  firstTarget: string;
  firstHtml: string;
}

function formatViolation(v: A11yViolationSummary): string {
  const html = v.firstHtml.length > 160 ? `${v.firstHtml.slice(0, 160)}…` : v.firstHtml;
  return [
    `  • [${v.impact}] ${v.id} — ${v.description}`,
    `      help: ${v.helpUrl}`,
    `      nodes: ${v.nodeCount} — first target: ${v.firstTarget}`,
    `      first html: ${html}`,
  ].join('\n');
}

/**
 * Lance axe-core sur la page et asserte qu'aucune règle de niveau
 * `failOn` (défaut = critical + serious) ne déclenche de violation.
 * Échoue avec un rapport détaillé (rule id, count, help URL, premier node).
 *
 * Tags par défaut : wcag2a, wcag2aa, wcag21a, wcag21aa.
 */
export async function expectNoA11yViolations(
  page: Page,
  options: ExpectNoA11yOptions = {},
): Promise<void> {
  const tags = [...(options.tags ?? DEFAULT_A11Y_TAGS)];
  const failOn = options.failOn ?? DEFAULT_A11Y_FAIL_ON;

  let axe = new AxeBuilder({ page }).withTags(tags);

  if (options.disabledRules?.length) {
    axe = axe.disableRules(options.disabledRules);
  }
  if (options.contextSelector) {
    axe = axe.include(options.contextSelector);
  }

  const results = await axe.analyze();

  const blocking: A11yViolationSummary[] = results.violations
    .filter((v) => failOn.includes((v.impact ?? 'minor') as A11yImpact))
    .map((v) => ({
      id: v.id,
      impact: (v.impact ?? 'minor') as A11yImpact,
      description: v.description,
      helpUrl: v.helpUrl,
      nodeCount: v.nodes.length,
      firstTarget: v.nodes[0]?.target?.join(' ') ?? '(no target)',
      firstHtml: v.nodes[0]?.html ?? '(no html)',
    }));

  if (blocking.length === 0) return;

  const report = blocking.map(formatViolation).join('\n');
  const label = options.testName ? `a11y (${options.testName})` : 'a11y';

  expect(
    blocking,
    `${label} — ${blocking.length} rule(s) failing:\n${report}`,
  ).toEqual([]);
}

/**
 * Variante "soft" : retourne la liste détaillée sans asserter.
 * Utile pour snapshots ou logs sans faire échouer le test.
 */
export async function getA11yViolations(
  page: Page,
  options: ExpectNoA11yOptions = {},
): Promise<A11yViolationSummary[]> {
  const tags = [...(options.tags ?? DEFAULT_A11Y_TAGS)];
  const failOn = options.failOn ?? DEFAULT_A11Y_FAIL_ON;

  let axe = new AxeBuilder({ page }).withTags(tags);
  if (options.disabledRules?.length) {
    axe = axe.disableRules(options.disabledRules);
  }
  if (options.contextSelector) {
    axe = axe.include(options.contextSelector);
  }

  const results = await axe.analyze();

  return results.violations
    .filter((v) => failOn.includes((v.impact ?? 'minor') as A11yImpact))
    .map((v) => ({
      id: v.id,
      impact: (v.impact ?? 'minor') as A11yImpact,
      description: v.description,
      helpUrl: v.helpUrl,
      nodeCount: v.nodes.length,
      firstTarget: v.nodes[0]?.target?.join(' ') ?? '(no target)',
      firstHtml: v.nodes[0]?.html ?? '(no html)',
    }));
}