'use client'

import * as React from 'react'
import { MessageSquarePlus, X, Star, Trash2, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const STORAGE_KEY = 'pm_feedbacks'
const TOGGLE_KEY = 'pm-review'

type Feedback = {
  id: string
  createdAt: string
  url: string
  selector: string
  type: 'bug-ux' | 'feature' | 'improvement' | 'copy' | 'ab-test'
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  rating: number
  title: string
  description: string
  status: 'new' | 'planned' | 'done'
}

function loadFeedbacks(): Feedback[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}

function saveFeedbacks(items: Feedback[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function isReviewEnabled(): boolean {
  if (typeof window === 'undefined') return false
  if (localStorage.getItem(TOGGLE_KEY) === '1') return true
  return new URL(window.location.href).searchParams.get('pm-review') === '1'
}

function getCssSelector(el: Element): string {
  if (el.id) return '#' + el.id
  const path: string[] = []
  let cur: Element | null = el
  while (cur && cur !== document.body && path.length < 6) {
    let part = cur.tagName.toLowerCase()
    if (cur.classList.length > 0) part += '.' + Array.from(cur.classList).slice(0, 2).join('.')
    path.unshift(part)
    cur = cur.parentElement
  }
  return path.join(' > ')
}

export function PMReviewOverlay() {
  const [enabled, setEnabled] = React.useState(false)
  const [picking, setPicking] = React.useState(false)
  const [feedbackCount, setFeedbackCount] = React.useState(0)
  const [openModal, setOpenModal] = React.useState(false)
  const [sel, setSel] = React.useState<string | null>(null)
  const [preview, setPreview] = React.useState<string>('')

  React.useEffect(() => {
    setEnabled(isReviewEnabled())
    setFeedbackCount(loadFeedbacks().length)
  }, [])

  React.useEffect(() => {
    if (!picking) return
    const h = (e: MouseEvent) => {
      const t = e.target as Element
      if (!t || t.closest('[data-pm-review-ui]')) return
      e.preventDefault(); e.stopPropagation()
      setSel(getCssSelector(t))
      setPreview('<' + t.tagName.toLowerCase() + '>' + ((t.textContent ?? '').slice(0, 60)))
      setPicking(false); setOpenModal(true)
    }
    document.addEventListener('click', h, { capture: true })
    return () => document.removeEventListener('click', h, { capture: true })
  }, [picking])

  if (!enabled) return null

  return (
    <div data-pm-review-ui>
      <motion.button
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        onClick={() => setPicking(true)}
        className={'fixed bottom-6 right-6 z-[9999] flex items-center gap-2 rounded-full px-5 py-3 shadow-2xl bg-ink-900 text-white'}
      >
        <MessageSquarePlus className='h-5 w-5' />
        <span className='text-sm font-medium'>{picking ? 'Cliquez...' : 'Review'}</span>
        {feedbackCount > 0 ? (
          <span className='ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-700 px-1.5 text-[11px] font-bold'>
            {feedbackCount}
          </span>
        ) : null}
      </motion.button>

      <AnimatePresence>
        {picking ? (
          <div className='fixed left-1/2 top-6 z-[9999] -translate-x-1/2 rounded-full bg-accent-700 px-4 py-2 text-sm font-medium text-white shadow-lg'>
            Mode annotation active
          </div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {openModal && sel ? (
          <FeedbackModal
            url={typeof window !== 'undefined' ? window.location.href : ''}
            selector={sel}
            elementPreview={preview}
            onClose={() => { setOpenModal(false); setSel(null) }}
            onSubmit={(fb: Feedback) => {
              const list = loadFeedbacks()
              list.push(fb)
              saveFeedbacks(list)
              setFeedbackCount(list.length)
              setOpenModal(false); setSel(null)
            }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function FeedbackModal({ url, selector, elementPreview, onClose, onSubmit }: any) {
  const [type, setType] = React.useState<Feedback['type']>('improvement')
  const [priority, setPriority] = React.useState<Feedback['priority']>('P2')
  const [rating, setRating] = React.useState(0)
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      id: 'fb_' + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      url, selector,
      type, priority, rating,
      title: title.trim(),
      description: description.trim(),
      status: 'new',
    })
  }

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-ink-900/50 backdrop-blur-sm p-4' onClick={onClose} data-pm-review-ui>
      <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} className='w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl' data-pm-review-ui>
        <div className='flex items-start justify-between'>
          <div>
            <h3 className='font-display text-xl font-medium text-ink-900'>Nouveau feedback</h3>
            <p className='mt-1 break-all text-xs text-ink-500'><code className='rounded bg-ink-100 px-1 py-0.5 font-mono'>{selector}</code></p>
          </div>
          <button type='button' onClick={onClose} className='text-ink-500 hover:text-ink-900'><X className='h-5 w-5' /></button>
        </div>
        <p className='mt-2 truncate rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-600'>{elementPreview}</p>
        <div className='mt-4 grid gap-3'>
          <div className='flex flex-wrap gap-2'>
            {['improvement', 'bug-ux', 'feature', 'copy', 'ab-test'].map((t: any) => (
              <button key={t} type='button' onClick={() => setType(t)} className={'rounded-full px-3 py-1 text-xs font-medium ' + (type === t ? 'bg-accent-700 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200')}>
                {t}
              </button>
            ))}
          </div>
          <div className='flex gap-2'>
            {['P0', 'P1', 'P2', 'P3'].map((p: any) => (
              <button key={p} type='button' onClick={() => setPriority(p)} className={'rounded-full px-3 py-1 text-xs font-medium ' + (priority === p ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-700')}>{p}</button>
            ))}
          </div>
          <div className='flex gap-1'>
            {[1,2,3,4,5].map((n) => (
              <button key={n} type='button' onClick={() => setRating(n)}>
                <Star className={'h-6 w-6 transition-colors ' + (n <= rating ? 'fill-accent-700 text-accent-700' : 'text-ink-300')} />
              </button>
            ))}
          </div>
          <input type='text' value={title} onChange={(e) => setTitle(e.target.value)} placeholder='Titre' className='w-full rounded-lg border border-ink-300 px-3 py-2 text-sm' required />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className='w-full rounded-lg border border-ink-300 px-3 py-2 text-sm' placeholder='Description' />
        </div>
        <div className='mt-6 flex justify-end gap-2'>
          <button type='button' onClick={onClose} className='rounded-full px-4 py-2 text-sm font-medium text-ink-600'>Annuler</button>
          <button type='submit' className='rounded-full bg-accent-700 px-5 py-2 text-sm font-medium text-white'>Enregistrer</button>
        </div>
      </form>
    </div>
  )
}
