'use client';

import * as React from 'react';
import { cn } from '@ecommerce/ui';

/**
 * ProductAccordion — sections depliables pour la PDP.
 *
 * - Sections accessibles (button + aria-expanded + aria-controls).
 * - Une seule section ouverte a la fois (mode exclusive) ou plusieurs
 *   selon la prop `multiple`.
 * - Pas de dependance Radix — implementation maison pour eviter le cout bundle.
 * - Animation : on utilise un wrapper CSS grid-template-rows (technique
 *   moderne compatible tous browsers recents).
 */

export interface AccordionSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  sections: ReadonlyArray<AccordionSection>;
  multiple?: boolean;
  defaultOpen?: string | string[];
}

export function ProductAccordion({
  sections,
  multiple = false,
  defaultOpen,
}: AccordionProps): React.ReactElement {
  const initialOpen = React.useMemo(() => {
    if (!defaultOpen) return new Set<string>();
    return new Set(Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen]);
  }, [defaultOpen]);

  const [openIds, setOpenIds] = React.useState<Set<string>>(initialOpen);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="divide-y divide-ink-200 rounded-2xl border border-ink-200 bg-white">
      {sections.map((section) => {
        const isOpen = openIds.has(section.id);
        const panelId = `accordion-panel-${section.id}`;
        const buttonId = `accordion-button-${section.id}`;
        return (
          <div key={section.id}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(section.id)}
                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left text-base font-medium text-ink-900 transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
              >
                <span>{section.title}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-ink-300 transition-transform',
                    isOpen && 'rotate-45 border-accent-700 text-accent-700',
                  )}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="px-6 pb-6 text-sm text-ink-700"
            >
              {section.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}