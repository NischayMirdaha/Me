import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  Copy,
  Mail,
  MapPin,
  Phone,
  Terminal,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import PhotoSlot from './components/PhotoSlot'
import HeroPhoto from './components/HeroPhoto'
import Companion from './components/Companion'
import {
  education,
  experience,
  profile,
  projects,
  skills,
} from './data'

const nav = [
  { id: 'home', label: 'Signal', num: '01', desc: 'Hero & Availability' },
  { id: 'about', label: 'Profile', num: '02', desc: 'Core Competencies' },
  { id: 'work', label: 'Work', num: '03', desc: 'Production Systems' },
  { id: 'skills', label: 'Stack', num: '04', desc: 'Tech & Tooling' },
  { id: 'contact', label: 'Link', num: '05', desc: 'Get in Touch' },
]

function useActiveSection() {
  const [active, setActive] = useState('home')

  useEffect(() => {
    const ids = nav.map((n) => n.id)
    const observers: IntersectionObserver[] = []

    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id)
        },
        { threshold: 0.25, rootMargin: '-10% 0px -40% 0px' }
      )

      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  return active
}

interface SectionHeadProps {
  kicker: string
  title: string
  copy?: string
}

function SectionHead({ kicker, title, copy }: SectionHeadProps) {
  return (
    <motion.header
      className="section-head mb-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.55 }}
    >
      <p className="kicker mb-2 font-mono text-xs tracking-wider text-slate-500 uppercase">
        {kicker}
      </p>
      <h2 className="mb-0 max-w-[26ch] font-display text-[clamp(1.85rem,_4.2vw,_2.8rem)] font-bold leading-[1.12] tracking-[-0.04em] text-white">
        {title}
      </h2>
      {copy ? (
        <p className="lede mb-0 mt-3 max-w-[62ch] text-slate-400 text-base leading-relaxed">
          {copy}
        </p>
      ) : null}
    </motion.header>
  )
}

export default function App() {
  const active = useActiveSection()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  const handleCopyEmail = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(profile.email)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const handleNavClick = (id: string) => {
    setOpen(false)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="app bg-[#0b0d13] min-h-screen text-slate-200 isolation-isolate relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-white">
      {/* Ambient background glows */}
      <div className="bg-orb orb-a" />
      <div className="bg-orb orb-b" />
      <div className="noise" />

      {/* RESPONSIVE NAVBAR */}
      <header className="nav z-50 sticky top-0 w-full border-b border-white/10 bg-[#0b0d13]/85 backdrop-blur-xl transition-all duration-300">
        <div className="max-w-[var(--maxw)] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
          {/* Brand */}
          <a
            className="brand font-display text-[1.25rem] font-black tracking-tight text-white hover:opacity-90 transition-opacity flex items-center gap-1.5"
            href="#home"
            onClick={() => setOpen(false)}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
            <span>NM</span>
            <span className="text-slate-500 font-mono text-sm font-semibold">/DEV</span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10 shadow-inner">
            {nav.map((item) => {
              const isActive = active === item.id
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activePill"
                      className="absolute inset-0 rounded-full bg-white/10 border border-white/15 shadow-sm"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                    {item.label}
                  </span>
                </a>
              )
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick hire button - always accessible or responsive */}
            <a
              className="nav-cta inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#d7d0ea] text-xs font-bold text-slate-950 hover:bg-white hover:shadow-[0_0_16px_rgba(215,208,234,0.4)] hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
              href={`mailto:${profile.email}`}
            >
              <Sparkles size={13} className="text-indigo-900" />
              <span>Hire me</span>
            </a>

            {/* Mobile Toggle Button */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-white/15 bg-white/[0.06] hover:bg-white/10 active:scale-95 text-slate-200 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              type="button"
              aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((prev) => !prev)}
            >
              {open ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Drawer */}
        <AnimatePresence>
          {open && (
            <>
              {/* Backdrop blur overlay */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setOpen(false)}
                className="fixed inset-0 top-[57px] bg-slate-950/75 backdrop-blur-md z-40 md:hidden"
                aria-hidden="true"
              />

              {/* Mobile Drawer panel */}
              <motion.div
                key="drawer"
                id="mobile-nav"
                initial={{ opacity: 0, y: -16, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -16, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="relative z-50 border-b border-white/10 bg-[#0d1018] shadow-2xl overflow-hidden md:hidden"
              >
                <div className="px-5 py-5 max-w-lg mx-auto space-y-4">
                  {/* Status Indicator */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-2">
                      <span className="pulseDot" />
                      <span>{profile.status}</span>
                    </span>
                    <span className="text-slate-500">Kathmandu, NP</span>
                  </div>

                  {/* Section Links */}
                  <div className="grid gap-1.5 py-1">
                    {nav.map((item) => {
                      const isActive = active === item.id
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all ${
                            isActive
                              ? 'bg-indigo-600/20 border border-indigo-500/30 text-white font-medium shadow-sm'
                              : 'text-slate-300 hover:bg-white/[0.05] hover:text-white border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`font-mono text-xs px-2 py-0.5 rounded-md ${
                                isActive
                                  ? 'bg-indigo-500/40 text-indigo-200'
                                  : 'bg-white/5 text-slate-500'
                              }`}
                            >
                              {item.num}
                            </span>
                            <div>
                              <div className="text-sm font-semibold tracking-wide">
                                {item.label}
                              </div>
                              <div className="text-[11px] font-mono text-slate-400">
                                {item.desc}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isActive && (
                              <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                                Current
                              </span>
                            )}
                            <ChevronRight
                              size={16}
                              className={isActive ? 'text-indigo-400' : 'text-slate-600'}
                            />
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Mobile Quick Contacts Footer */}
                  <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 font-mono text-xs">
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/10 active:scale-95 transition-all"
                    >
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copied ? 'Copied' : 'Copy Email'}</span>
                    </button>
                    <a
                      href={`mailto:${profile.email}`}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 active:scale-95 transition-all shadow-md"
                    >
                      <Mail size={14} />
                      <span>Direct Email</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION */}
      <section
        id="home"
        className="hero grid grid-cols-1 lg:grid-cols-[minmax(0,_1.15fr)_minmax(320px,_0.85fr)] items-center gap-8 sm:gap-12 lg:gap-16 max-w-[var(--maxw)] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20"
      >
        <div className="hero-copy order-2 lg:order-1">
          <motion.div
            className="status inline-flex items-center gap-2.5 mb-5 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] font-mono text-xs text-slate-300 shadow-inner"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="pulseDot" />
            <span>Open to IT roles · Nepal / remote</span>
          </motion.div>

          <motion.h1
            className="hero-h1 mb-3 font-display text-[clamp(2.6rem,_7.2vw,_5.2rem)] font-black leading-[0.98] text-white tracking-[-0.05em]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {profile.name.split(' ')[0]}
            <span className="text-slate-500 hover:text-slate-300 transition-colors">
              {' '}
              {profile.name.split(' ')[1]}
            </span>
          </motion.h1>

          <motion.p
            className="role mb-3 font-sans text-[clamp(1.1rem,_2vw,_1.3rem)] font-bold text-[#f7eedb] tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {profile.role}
          </motion.p>

          <motion.p
            className="tagline mb-0 max-w-[58ch] text-slate-400 text-base sm:text-lg leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {profile.tagline}
          </motion.p>

          <motion.div
            className="hero-actions flex flex-wrap items-center gap-3 mt-7"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <a
              className="btn primary inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-950 bg-[#d7d0ea] hover:bg-white hover:shadow-[0_0_20px_rgba(215,208,234,0.4)] transition-all duration-200 active:scale-95"
              href={`mailto:${profile.email}`}
            >
              <Mail size={16} />
              <span>Start a conversation</span>
            </a>
            <a
              className="btn ghost inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-white/[0.04] border border-white/15 hover:bg-white/10 hover:border-white/25 transition-all duration-200 active:scale-95"
              href="#about"
            >
              <span>View production work</span>
            </a>
            <a
              className="btn subtle-link inline-flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold font-mono text-slate-400 bg-white/[0.02] border border-white/10 hover:text-white hover:border-white/20 transition-all duration-200"
              href="#contact"
            >
              <Terminal size={14} className="text-indigo-400" />
              <span>3D Dev Desk ↓</span>
            </a>
          </motion.div>

          <ul className="meta flex flex-wrap gap-x-6 gap-y-2 mt-8 pt-4 border-t border-white/10 font-mono text-xs text-slate-400 list-none">
            <li className="flex items-center gap-1.5">
              <MapPin size={13} className="text-slate-500" />
              <span>{profile.location}</span>
            </li>
            <li>
              <a
                className="hover:text-white transition-colors duration-200 flex items-center gap-1.5"
                href={`tel:${profile.phone}`}
              >
                <Phone size={13} className="text-slate-500" />
                <span>{profile.phone}</span>
              </a>
            </li>
            <li>
              <a
                className="hover:text-white transition-colors duration-200 flex items-center gap-1.5"
                href={`mailto:${profile.email}`}
              >
                <Mail size={13} className="text-slate-500" />
                <span>{profile.email}</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="hero-stage flex justify-center order-1 lg:order-2">
          <HeroPhoto name={profile.name} />
        </div>
      </section>

      <Companion section={active} />

      {/* ABOUT / PROFILE */}
      <section id="about" className="panel max-w-[var(--maxw)] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <SectionHead
          kicker="01 — Profile"
          title="Turning complex user needs into robust software systems."
          copy="Software development, spatial data pipelines, and system implementation grounded in real-world production experience."
        />

        <motion.div
          className="about-copy glass p-6 sm:p-8 mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <p className="mb-0 text-slate-300 text-base sm:text-lg leading-relaxed">
            {profile.summary}
          </p>
          <div className="chips flex flex-wrap gap-2 mt-5">
            <span className="px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-slate-300 text-xs font-mono hover:bg-white/10 hover:text-white transition-all">
              Municipal GIS &amp; Cadastre
            </span>
            <span className="px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-slate-300 text-xs font-mono hover:bg-white/10 hover:text-white transition-all">
              PostgreSQL / PostGIS
            </span>
            <span className="px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-slate-300 text-xs font-mono hover:bg-white/10 hover:text-white transition-all">
              RESTful &amp; GraphQL APIs
            </span>
            <span className="px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-slate-300 text-xs font-mono hover:bg-white/10 hover:text-white transition-all">
              High Availability Databases
            </span>
            <span className="px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-slate-300 text-xs font-mono hover:bg-white/10 hover:text-white transition-all">
              Testing &amp; SRS Documentation
            </span>
          </div>
        </motion.div>

        {/* Selected Systems Grid */}
        <div className="project-grid grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((p, i) => (
            <motion.article
              key={p.name}
              className="glass project flex flex-col p-6 sm:p-7 hover:border-white/20 transition-all duration-300 group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="kicker text-xs font-mono text-slate-500 uppercase">
                  Selected System
                </p>
                {p.metrics && (
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[11px]">
                    {p.metrics}
                  </span>
                )}
              </div>

              <h3 className="font-display text-xl font-bold text-white group-hover:text-indigo-200 transition-colors mb-2.5">
                {p.name}
              </h3>

              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {p.blurb}
              </p>

              <div className="chips mt-auto pt-4 border-t border-white/10 flex flex-wrap gap-1.5">
                {(p.focus ?? []).map((item) => (
                  <span
                    key={item}
                    className="px-2.5 py-1 rounded-md border border-white/10 bg-white/[0.03] text-slate-300 text-xs font-mono"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* WORK / EXPERIENCE */}
      <section id="work" className="panel max-w-[var(--maxw)] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <SectionHead
          kicker="02 — Experience"
          title="Implementation and system analysis history."
          copy="A track record of shipping reliable public sector platforms and resilient full-stack systems."
        />

        <div className="timeline grid gap-5">
          {experience.map((job, i) => (
            <motion.article
              key={job.org}
              className="glass job p-6 sm:p-7 border-l-4 border-l-[#d7d0ea]"
              initial={{ opacity: 0, x: i % 2 ? 20 : -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5 }}
            >
              <div className="job-top flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                  {job.title}
                </h3>
                <time className="font-mono text-xs text-indigo-300 font-medium px-2.5 py-0.5 rounded bg-white/5 border border-white/10">
                  {job.period}
                </time>
              </div>

              <p className="org mb-4 font-semibold text-sm text-slate-400">
                {job.org} · <span className="text-slate-500 font-normal">{job.place}</span>
              </p>

              <ul className="grid gap-2 text-slate-300 text-sm leading-relaxed list-disc list-inside">
                {job.points.map((pt) => (
                  <li key={pt} className="leading-relaxed">
                    <span className="text-slate-300">{pt}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>

        {/* Education Row */}
        <div className="edu-row grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          {education.map((ed) => (
            <article key={ed.title} className="glass edu p-6 flex flex-col justify-between">
              <div>
                <p className="kicker text-xs font-mono text-slate-500 mb-2">{ed.period}</p>
                <h3 className="font-display text-base font-bold text-white leading-snug mb-2">
                  {ed.title}
                </h3>
                <p className="org text-xs font-semibold text-slate-400 mb-3">
                  {ed.org} · <span className="text-slate-500">{ed.place}</span>
                </p>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed border-t border-white/10 pt-3 mt-2">
                {ed.detail}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" className="panel max-w-[var(--maxw)] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <SectionHead
          kicker="03 — Skills"
          title="Engineered across the full software lifecycle."
          copy="Core competencies from geospatial computation and relational databases to modern reactive user interfaces."
        />

        <div className="skill-grid grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {skills.map((s, i) => (
            <motion.article
              key={s.name}
              className="glass skill px-5 py-3.5 flex items-center justify-between gap-4 hover:border-white/20 transition-all duration-200"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.025 }}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400/80" />
                <h3 className="text-sm font-semibold text-slate-200">{s.name}</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.04] text-slate-400 font-mono text-xs">
                {s.level}
              </span>
            </motion.article>
          ))}
        </div>
      </section>

      {/* CONTACT + 3D DESK */}
      <section id="contact" className="panel max-w-[var(--maxw)] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <SectionHead
          kicker="04 — Contact"
          title="Let’s discuss your next software system."
          copy="Available for software development, system architecture analysis, or municipal GIS consulting."
        />

        <div className="contact-grid grid grid-cols-1 lg:grid-cols-[minmax(0,_0.95fr)_minmax(0,_1.05fr)] items-stretch gap-6">
          <motion.div
            className="contact-card flex flex-col justify-between p-6 sm:p-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div>
              <p className="kicker text-xs font-mono text-slate-500 uppercase mb-2">
                Direct Communication
              </p>
              <h3 className="contact-heading mb-6 font-display text-2xl font-bold leading-tight text-white">
                Software Developer &amp; System Analyst Support
              </h3>

              <div className="contact-links grid gap-4 mb-8">
                {/* Email row with copy button */}
                <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <a
                    className="contact-primary-link inline-flex items-center gap-2 text-white font-semibold text-xs sm:text-sm font-mono hover:text-indigo-300 transition-colors"
                    href={`mailto:${profile.email}`}
                  >
                    <Mail size={16} className="text-indigo-400" />
                    <span className="break-all">{profile.email}</span>
                  </a>
                  <button
                    type="button"
                    className="ml-auto copy-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/10 text-white text-xs font-mono hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                    onClick={handleCopyEmail}
                    aria-label="Copy email address"
                  >
                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                {/* Phone row */}
                <a
                  className="contact-sub-link flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-slate-300 font-mono text-xs sm:text-sm hover:text-white hover:bg-white/[0.06] transition-all"
                  href={`tel:${profile.phone}`}
                >
                  <Phone size={16} className="text-emerald-400" />
                  <span>{profile.phone}</span>
                </a>

                {/* Location row */}
                <div className="contact-loc flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-slate-400 font-mono text-xs sm:text-sm">
                  <MapPin size={16} className="text-purple-400" />
                  <span>{profile.location}</span>
                </div>
              </div>
            </div>

            <div className="contact-actions flex flex-wrap gap-3 pt-4 border-t border-white/10">
              <a
                className="btn primary inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-950 bg-[#d7d0ea] hover:bg-white hover:shadow-[0_0_20px_rgba(215,208,234,0.4)] transition-all duration-200 active:scale-95"
                href={`mailto:${profile.email}`}
              >
                <Mail size={15} />
                <span>Send an email</span>
              </a>
              <a
                className="btn ghost inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-white/[0.04] border border-white/15 hover:bg-white/10 transition-all duration-200 active:scale-95"
                href="#home"
              >
                <span>Back to top ↑</span>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="h-full"
          >
            <PhotoSlot />
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="foot max-w-[var(--maxw)] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 border-t border-white/10 text-slate-500 font-mono text-xs text-center flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© {new Date().getFullYear()} {profile.name} · All rights reserved</p>
        <div className="flex items-center gap-4 text-slate-400">
          <a
            href="#home"
            className="hover:text-white transition-colors"
          >
            Signal
          </a>
          <span>·</span>
          <a
            href="#about"
            className="hover:text-white transition-colors"
          >
            Profile
          </a>
          <span>·</span>
          <a
            href="#work"
            className="hover:text-white transition-colors"
          >
            Work
          </a>
          <span>·</span>
          <a
            href="#contact"
            className="hover:text-white transition-colors"
          >
            Contact
          </a>
        </div>
      </footer>
    </div>
  )
}
