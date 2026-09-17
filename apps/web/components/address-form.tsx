'use client';

import * as React from 'react';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Input, Button, cn } from '@ecommerce/ui';

/**
 * AddressForm — formulaire adresse (livraison + facturation optionnelle).
 *
 * - Toggle "Adresse de facturation differente" (defaut false).
 * - Validation Zod cote client.
 * - Persistance localStorage cle `maison14.address.v1` (autosave silencieux).
 * - On submit : appelle onSubmit(values), peut naviguer via ctaHref.
 * - Erreurs affichees sous chaque champ (role=alert + ring rouge).
 */

const COUNTRIES = ['FR', 'BE', 'CH', 'CA'] as const;
export type Country = (typeof COUNTRIES)[number];

const COUNTRY_LABELS: Record<Country, string> = {
  FR: 'France',
  BE: 'Belgique',
  CH: 'Suisse',
  CA: 'Canada',
};

export const AddressSchema = z.object({
  fullName: z.string().min(2, 'Veuillez renseigner votre nom complet.'),
  line1: z.string().min(2, 'Veuillez renseigner une adresse.'),
  line2: z.string().optional(),
  city: z.string().min(2, 'Veuillez renseigner une ville.'),
  postalCode: z.string().min(3, 'Code postal invalide.'),
  country: z.enum(COUNTRIES),
  phone: z.string().regex(/^[+\d\s().-]{6,}$/, 'Numero de telephone invalide.'),
});

export const BillingSchema = z.object({
  different: z.boolean(),
  fullName: z.string().optional(),
  line1: z.string().optional(),
  line2: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.enum(COUNTRIES).optional(),
});

export interface AddressValues {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: Country;
  phone: string;
}

export interface BillingValues {
  different: boolean;
  fullName?: string;
  line1?: string;
  line2?: string;
  city?: string;
  postalCode?: string;
  country?: Country;
}

export interface AddressFormPayload {
  shipping: AddressValues;
  billing: BillingValues;
}

export interface AddressFormProps {
  defaultValues?: Partial<AddressValues>;
  billingDefault?: Partial<BillingValues>;
  onSubmit?: (values: AddressFormPayload) => void | Promise<void>;
  submitLabel?: string;
  formId?: string;
  ctaHref?: string;
}

const STORAGE_KEY = 'maison14.address.v1';

type ErrorMap = Partial<Record<string, string>>;

export function AddressForm({
  defaultValues,
  billingDefault,
  onSubmit,
  submitLabel = 'Continuer vers la livraison',
  formId = 'address-form',
  ctaHref,
}: AddressFormProps): React.ReactElement {
  const [shipping, setShipping] = React.useState<AddressValues>(() => ({
    fullName: '',
    line1: '',
    line2: '',
    city: '',
    postalCode: '',
    country: 'FR',
    phone: '',
    ...defaultValues,
  }));

  const [billingDifferent, setBillingDifferent] = React.useState<boolean>(
    billingDefault?.different ?? false,
  );
  const [billing, setBilling] = React.useState<BillingValues>(() => ({
    different: billingDefault?.different ?? false,
    fullName: '',
    line1: '',
    line2: '',
    city: '',
    postalCode: '',
    country: 'FR',
    ...billingDefault,
  }));

  const [errors, setErrors] = React.useState<ErrorMap>({});
  const [submitting, setSubmitting] = React.useState(false);
  const isFirstMount = React.useRef(true);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<AddressFormPayload>;
      if (parsed.shipping) setShipping((prev) => ({ ...prev, ...parsed.shipping }));
      if (parsed.billing) {
        setBilling((prev) => ({ ...prev, ...parsed.billing }));
        setBillingDifferent(parsed.billing.different ?? false);
      }
    } catch {
      // localStorage indisponible ou JSON corrompu
    }
    isFirstMount.current = false;
  }, []);

  React.useEffect(() => {
    if (isFirstMount.current || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          shipping,
          billing: { ...billing, different: billingDifferent },
        }),
      );
    } catch {
      // quota plein
    }
  }, [shipping, billing, billingDifferent]);

  const handleShippingChange =
    (key: keyof AddressValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const v = e.target.value;
      setShipping((prev) => ({ ...prev, [key]: v }));
      if (errors[key]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    };

  const handleBillingChange =
    (key: keyof BillingValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const v = e.target.value;
      setBilling((prev) => ({ ...prev, [key]: v }));
      if (errors[`billing.${key}`]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[`billing.${key}`];
          return next;
        });
      }
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrors({});

    const nextErrors: ErrorMap = {};

    const shippingResult = AddressSchema.safeParse(shipping);
    if (!shippingResult.success) {
      for (const issue of shippingResult.error.issues) {
        const path = issue.path[0];
        if (typeof path === 'string') nextErrors[path] = issue.message;
      }
    }

    if (billingDifferent) {
      const billingResult = BillingSchema.safeParse({ ...billing, different: true });
      if (!billingResult.success) {
        for (const issue of billingResult.error.issues) {
          const path = issue.path[0];
          if (typeof path === 'string' && path !== 'different') {
            const v = (billing as unknown as Record<string, unknown>)[path];
            if (typeof v === 'string' && v.length > 0) {
              nextErrors[`billing.${path}`] = issue.message;
            }
          }
        }
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitting(false);
      if (typeof window !== 'undefined') {
        const firstKey = Object.keys(nextErrors)[0];
        const root = firstKey?.split('.')[0] ?? '';
        const el = document.querySelector(`[name="${root}"]`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      await onSubmit?.({
        shipping: shippingResult.success ? shippingResult.data : shipping,
        billing: billingDifferent
          ? { ...billing, different: true }
          : { different: false },
      });
      if (ctaHref && typeof window !== 'undefined') {
        window.location.href = ctaHref;
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-8" noValidate>
      <Section title="Adresse de livraison" description="Nous livrons en France, Belgique, Suisse et Canada.">
        <Field label="Nom complet" htmlFor="fullName" error={errors.fullName}>
          <Input id="fullName" name="fullName" type="text" autoComplete="name" value={shipping.fullName} onChange={handleShippingChange('fullName')} invalid={!!errors.fullName} data-testid="address-fullName" />
        </Field>
        <Field label="Adresse" htmlFor="line1" error={errors.line1}>
          <Input id="line1" name="line1" type="text" autoComplete="address-line1" value={shipping.line1} onChange={handleShippingChange('line1')} invalid={!!errors.line1} placeholder="N° et rue" data-testid="address-line1" />
        </Field>
        <Field label="Complement (optionnel)" htmlFor="line2">
          <Input id="line2" name="line2" type="text" autoComplete="address-line2" value={shipping.line2 ?? ''} onChange={handleShippingChange('line2')} placeholder="Etage, batiment, digicode..." />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Code postal" htmlFor="postalCode" error={errors.postalCode}>
            <Input id="postalCode" name="postalCode" type="text" inputMode="numeric" autoComplete="postal-code" value={shipping.postalCode} onChange={handleShippingChange('postalCode')} invalid={!!errors.postalCode} data-testid="address-postalCode" />
          </Field>
          <Field label="Ville" htmlFor="city" error={errors.city} className="sm:col-span-2">
            <Input id="city" name="city" type="text" autoComplete="address-level2" value={shipping.city} onChange={handleShippingChange('city')} invalid={!!errors.city} data-testid="address-city" />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Pays" htmlFor="country" error={errors.country}>
            <select id="country" name="country" value={shipping.country} onChange={handleShippingChange('country') as React.ChangeEventHandler<HTMLSelectElement>} aria-invalid={!!errors.country} data-testid="address-country" className={cn('flex h-11 w-full rounded-full bg-white px-4 py-2 text-sm text-ink-900 border focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent', errors.country ? 'border-danger-500 focus:ring-danger-500' : 'border-ink-300')}>
              {COUNTRIES.map((c) => (<option key={c} value={c}>{COUNTRY_LABELS[c]}</option>))}
            </select>
          </Field>
          <Field label="Telephone" htmlFor="phone" error={errors.phone}>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" value={shipping.phone} onChange={handleShippingChange('phone')} invalid={!!errors.phone} placeholder="+33 6 12 34 56 78" data-testid="address-phone" />
          </Field>
        </div>
      </Section>

      <div className="rounded-2xl border border-ink-200 bg-ink-50/60 p-4">
        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-ink-900">
          <input type="checkbox" checked={billingDifferent} onChange={(e) => setBillingDifferent(e.target.checked)} className="h-4 w-4 rounded border-ink-300 text-accent-700 focus:ring-2 focus:ring-accent-600" data-testid="billing-different" />
          <span>Utiliser une adresse de facturation differente</span>
        </label>
      </div>

      {billingDifferent ? (
        <Section title="Adresse de facturation" description="Si differente de l'adresse de livraison.">
          <Field label="Nom complet" htmlFor="billing-fullName" error={errors['billing.fullName']}>
            <Input id="billing-fullName" name="billing-fullName" type="text" autoComplete="name" value={billing.fullName ?? ''} onChange={handleBillingChange('fullName')} invalid={!!errors['billing.fullName']} />
          </Field>
          <Field label="Adresse" htmlFor="billing-line1" error={errors['billing.line1']}>
            <Input id="billing-line1" name="billing-line1" type="text" autoComplete="address-line1" value={billing.line1 ?? ''} onChange={handleBillingChange('line1')} invalid={!!errors['billing.line1']} placeholder="N° et rue" />
          </Field>
          <Field label="Complement (optionnel)" htmlFor="billing-line2">
            <Input id="billing-line2" name="billing-line2" type="text" autoComplete="address-line2" value={billing.line2 ?? ''} onChange={handleBillingChange('line2')} placeholder="Etage, batiment..." />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Code postal" htmlFor="billing-postalCode" error={errors['billing.postalCode']}>
              <Input id="billing-postalCode" name="billing-postalCode" type="text" inputMode="numeric" autoComplete="postal-code" value={billing.postalCode ?? ''} onChange={handleBillingChange('postalCode')} invalid={!!errors['billing.postalCode']} />
            </Field>
            <Field label="Ville" htmlFor="billing-city" error={errors['billing.city']} className="sm:col-span-2">
              <Input id="billing-city" name="billing-city" type="text" autoComplete="address-level2" value={billing.city ?? ''} onChange={handleBillingChange('city')} invalid={!!errors['billing.city']} />
            </Field>
          </div>
          <Field label="Pays" htmlFor="billing-country" error={errors['billing.country']}>
            <select id="billing-country" name="billing-country" value={billing.country ?? 'FR'} onChange={handleBillingChange('country') as React.ChangeEventHandler<HTMLSelectElement>} aria-invalid={!!errors['billing.country']} className={cn('flex h-11 w-full rounded-full bg-white px-4 py-2 text-sm text-ink-900 border focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent', errors['billing.country'] ? 'border-danger-500 focus:ring-danger-500' : 'border-ink-300')}>
              {COUNTRIES.map((c) => (<option key={c} value={c}>{COUNTRY_LABELS[c]}</option>))}
            </select>
          </Field>
        </Section>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" variant="primary" size="lg" disabled={submitting} data-testid="address-submit">
          {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /><span>Enregistrement...</span></>) : (submitLabel)}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, htmlFor, error, className, children }: { label: string; htmlFor: string; error?: string; className?: string; children: React.ReactNode; }): React.ReactElement {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink-800">{label}</label>
      {children}
      {error ? (<p className="mt-1.5 text-xs text-danger-600" role="alert">{error}</p>) : null}
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode; }): React.ReactElement {
  return (
    <fieldset className="space-y-4">
      <div>
        <legend className="font-display text-base font-medium text-ink-900">{title}</legend>
        {description ? (<p className="mt-1 text-xs text-ink-500">{description}</p>) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}
