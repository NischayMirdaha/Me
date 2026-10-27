import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Radio, X } from 'lucide-react'

interface CompanionProps {
  section?: string
}

const MESSAGES: Record<string, { code: string; line: string }> = {
  home: {
    code: 'NM // 00 · PROFILE',
    line: 'IT graduate with practical production software experience.',
  },
  about: {
    code: 'NM // 01 · SYSTEMS',
    line: 'Municipal Digital Profile and multi-tenant School Management systems.',
  },
  work: {
    code: 'NM // 02 · EXPERIENCE',
    line: 'Municipal data, requirements analysis, and system implementation support.',
  },
  skills: {
    code: 'NM // 03 · SKILLS',
    line: 'API development, SQL databases, testing, documentation, and Git.',
  },
  contact: {
    code: 'NM // 04 · CONTACT',
    line: 'Contact Nischay Mirdaha by email or phone.',
  },
}

export default function Companion({ section }: CompanionProps) {
  const [minimized, setMinimized] = useState(false)
  const active = MESSAGES[section ?? 'home'] ?? MESSAGES.home

  if (minimized) {
    return (
      <button
        type="button"
        className="companion-pill-mini inline-flex items-center gap-[7px] px-[0.9rem] py-[0.55rem] rounded-full border border-line-2 bg-[rgba(11,11,15,0.92)] backdrop-blur-[12px] text-text font-semibold text-[0.8rem] cursor-pointer hover:bg-[rgba(255,255,255,0.14)] transition-all duration-200"
        onClick={() => setMinimized(false)}
        aria-label="Open profile status"
      >
        <Radio size={14} />
        <span>NM</span>
      </button>
    )
  }

  return (
    <aside
      className="companion fixed z-40 bottom-[16px] left-[16px] flex items-center gap-[0.7rem] w-[min(344px,100%-2rem)] px-[0.85rem] py-[0.72rem] border border-line-2 rounded-[14px] bg-[rgba(11,11,15,0.9)] backdrop-blur-[14px] shadow-[0_20px_45px_-20px_rgba(0,0,0,0.95)]"
      aria-live="polite"
    >
      <div className="companion-dot grid w-[28px] h-[28px] flex-0-0-auto place-items-center border border-line rounded-full bg-[rgba(255,255,255,0.05)]">
        <span className="pulseDot" />
      </div>

      <div className="companion-body flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.code}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="companion-content"
          >
            <p className="companion-code mb-0 font-mono text-[0.64rem] tracking-[0.05em] text-faint text-uppercase">
              {active.code}
            </p>
            <p className="companion-text mt-[0.16rem] text-body text-[0.79rem] leading-[1.4]">
              {active.line}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        type="button"
        className="companion-close grid flex-0-0-auto ml-auto p-[4px] border-0 bg-transparent text-faint cursor-pointer hover:text-text hover:rotate-[90deg] transition-all duration-250"
        onClick={() => setMinimized(true)}
        aria-label="Minimize profile status"
      >
        <X size={13} />
      </button>
    </aside>
  )
}