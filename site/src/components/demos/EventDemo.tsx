import { LayoutGroup, motion } from 'framer-motion';
import { BookOpen, CalendarClock, Camera, CheckSquare, MessagesSquare, Truck, Wallet } from 'lucide-react';
import { useState } from 'react';

type Lang = 'en' | 'ar' | 'fr';
type Kind = 'wedding' | 'birthday' | 'corporate' | 'engagement';

const MODULES = [
  { id: 'suppliers', icon: Truck, en: 'Suppliers', ar: 'الموردون', fr: 'Fournisseurs' },
  { id: 'finance', icon: Wallet, en: 'Finance', ar: 'المالية', fr: 'Finances' },
  { id: 'media', icon: Camera, en: 'Media', ar: 'الوسائط', fr: 'Médias' },
  { id: 'tasks', icon: CheckSquare, en: 'Tasks', ar: 'المهام', fr: 'Tâches' },
  { id: 'timeline', icon: CalendarClock, en: 'Timeline', ar: 'الجدول', fr: 'Planning' },
  { id: 'discussions', icon: MessagesSquare, en: 'Discussions', ar: 'النقاشات', fr: 'Discussions' },
  { id: 'knowledge', icon: BookOpen, en: 'Knowledge', ar: 'المعرفة', fr: 'Savoir' },
] as const;

const KINDS: Record<Kind, { en: string; ar: string; fr: string; title: Record<Lang, string>; on: string[]; colour: string }> = {
  wedding: {
    en: 'Wedding',
    ar: 'زفاف',
    fr: 'Mariage',
    title: { en: 'Maya & Karim', ar: 'مايا وكريم', fr: 'Maya & Karim' },
    on: ['suppliers', 'finance', 'media', 'tasks', 'timeline', 'discussions'],
    colour: '#E879C9',
  },
  birthday: {
    en: 'Birthday',
    ar: 'عيد ميلاد',
    fr: 'Anniversaire',
    title: { en: 'Rami turns 30', ar: 'رامي يبلغ ٣٠', fr: 'Les 30 ans de Rami' },
    on: ['suppliers', 'media', 'tasks', 'timeline'],
    colour: '#FFB86B',
  },
  corporate: {
    en: 'Corporate',
    ar: 'شركات',
    fr: 'Entreprise',
    title: { en: 'Annual summit', ar: 'القمة السنوية', fr: 'Sommet annuel' },
    on: ['suppliers', 'finance', 'tasks', 'timeline', 'discussions', 'knowledge'],
    colour: '#6BC4FF',
  },
  engagement: {
    en: 'Engagement',
    ar: 'خطوبة',
    fr: 'Fiançailles',
    title: { en: 'Lea & Joe', ar: 'ليا وجو', fr: 'Léa & Joe' },
    on: ['finance', 'media', 'timeline', 'discussions'],
    colour: '#C6A8FF',
  },
};

const UI: Record<Lang, { modules: string; day: string; live: string; label: string }> = {
  en: { modules: 'Modules for this event', day: 'Event day', live: 'Live', label: 'EN' },
  ar: { modules: 'الوحدات لهذا الحدث', day: 'يوم الحدث', live: 'مباشر', label: 'ع' },
  fr: { modules: 'Modules de cet événement', day: 'Jour J', live: 'En direct', label: 'FR' },
};

/** Eventyy in miniature: one event, modules that switch per type, three languages, real RTL. */
export function EventDemo() {
  const [lang, setLang] = useState<Lang>('en');
  const [kind, setKind] = useState<Kind>('wedding');
  const k = KINDS[kind];
  const rtl = lang === 'ar';

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="flex h-full flex-col bg-gradient-to-b from-[#FBF0FA] to-[#EEF6FF] px-3.5 pb-4 pt-10 font-sans text-[#2A0B2A]"
    >
      <LayoutGroup>
        <div className="flex items-center justify-between">
          <p className="font-display text-[19px] font-bold tracking-tight">Eventyy</p>
          <div className="flex rounded-full bg-white p-0.5 shadow-sm" dir="ltr">
            {(['en', 'ar', 'fr'] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className="relative h-7 w-9 rounded-full text-[11px] font-semibold"
                aria-pressed={lang === l}
              >
                {lang === l && (
                  <motion.span layoutId="ev-lang" className="absolute inset-0 rounded-full bg-[#2A0B2A]" />
                )}
                <span className={`relative ${lang === l ? 'text-white' : ''}`}>{UI[l].label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="no-bar -mx-3.5 mt-3 flex gap-1.5 overflow-x-auto px-3.5">
          {(Object.keys(KINDS) as Kind[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setKind(key)}
              className="relative shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-semibold"
            >
              {kind === key && (
                <motion.span
                  layoutId="ev-kind"
                  className="absolute inset-0 rounded-full"
                  style={{ background: KINDS[key].colour }}
                />
              )}
              <span className="relative">{KINDS[key][lang]}</span>
            </button>
          ))}
        </div>

        <motion.div
          layout
          className="mt-3 rounded-2xl p-3 text-white"
          animate={{ backgroundColor: k.colour }}
          transition={{ duration: 0.5 }}
        >
          <motion.p
            key={`${kind}-${lang}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-[20px] font-bold leading-tight text-[#1A0A1A]"
          >
            {k.title[lang]}
          </motion.p>
          <div className="mt-2 flex items-center justify-between text-[10.5px] font-semibold text-[#1A0A1A]/80">
            <span>{UI[lang].day}</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1A0A1A]" />
              {UI[lang].live}
            </span>
          </div>
          <div className="relative mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/15">
            <motion.div
              className="absolute inset-y-0 rounded-full bg-[#1A0A1A]"
              style={rtl ? { right: 0 } : { left: 0 }}
              initial={{ width: '10%' }}
              animate={{ width: ['20%', '72%'] }}
              transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            />
          </div>
        </motion.div>

        <p className="mt-3 text-[11px] font-semibold text-black/50">{UI[lang].modules}</p>
        <div className="mt-1.5 grid flex-1 grid-cols-1 content-start gap-1">
          {MODULES.map((m) => {
            const on = k.on.includes(m.id);
            const Icon = m.icon;
            return (
              <motion.div
                layout
                key={m.id}
                className="flex items-center gap-2 rounded-xl bg-white px-2 py-1.5"
                animate={{ opacity: on ? 1 : 0.35, scale: on ? 1 : 0.94 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: on ? `${k.colour}55` : '#eee' }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1 truncate text-[11px] font-semibold">{m[lang]}</span>
                <span className={`relative h-3.5 w-6 shrink-0 rounded-full ${on ? 'bg-[#2A0B2A]' : 'bg-black/15'}`}>
                  <motion.span
                    className="absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white"
                    animate={{ x: on ? (rtl ? -10 : 10) : 0 }}
                    style={rtl ? { right: 2 } : { left: 2 }}
                  />
                </span>
              </motion.div>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}
