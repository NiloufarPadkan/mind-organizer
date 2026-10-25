import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Locale = 'en' | 'fa'

const LOCALE_KEY = 'clearmind-locale'

const messages = {
  en: {
    tagline: 'Personal clarity',
    subtitle: 'Capture the clutter. Sort by what matters. Move work forward.',
    navInbox: 'Inbox',
    navList: 'List',
    navBoard: 'Board',
    categories: 'Categories',
    manageCategories: 'Manage categories',
    remove: 'Remove',
    newCategory: 'New category',
    addCategory: 'Add category',
    pickColor: 'Pick color',
    inboxTitle: 'Inbox',
    inboxHint: 'Dump everything here first. Organize when you’re ready.',
    inboxEmpty: 'Inbox is clear. Capture whatever’s swirling around.',
    capturePlaceholder: 'What’s on your mind?',
    captureAria: 'Capture a thought',
    capture: 'Capture',
    moveToTodo: 'Move to Todo',
    listTitle: 'List',
    listHint: 'Filter by category, priority, or status.',
    filterAll: 'All',
    filterAllCategories: 'All categories',
    filterAnyPriority: 'Any priority',
    noTasksMatch: 'No tasks match these filters.',
    boardTitle: 'Board',
    boardHint: 'Drag cards between columns — or use Move on each card.',
    dropHere: 'Drop tasks here',
    moveTo: '→',
    notes: 'Notes…',
    noCategory: 'No category',
    delete: 'Delete',
    markDone: 'Mark done',
    markIncomplete: 'Mark incomplete',
    statusInbox: 'Inbox',
    statusTodo: 'Todo',
    statusDoing: 'Doing',
    statusDone: 'Done',
    priorityHigh: 'High',
    priorityMedium: 'Medium',
    priorityLow: 'Low',
    catWork: 'Work',
    catPersonal: 'Personal',
    catIdeas: 'Ideas',
    langEn: 'EN',
    langFa: 'FA',
    switchLanguage: 'Language',
  },
  fa: {
    tagline: 'شفافیت ذهنی',
    subtitle: 'شلوغی ذهنت را بنویس. بر اساس اهمیت مرتب کن. جلو برو.',
    navInbox: 'صندوق',
    navList: 'فهرست',
    navBoard: 'بورد',
    categories: 'دسته‌ها',
    manageCategories: 'مدیریت دسته‌ها',
    remove: 'حذف',
    newCategory: 'دسته جدید',
    addCategory: 'افزودن دسته',
    pickColor: 'انتخاب رنگ',
    inboxTitle: 'صندوق ورودی',
    inboxHint: 'اول همه‌چیز را اینجا بریز. بعداً مرتب کن.',
    inboxEmpty: 'صندوق خالی است. هر چیزی که در ذهن می‌چرخد را بنویس.',
    capturePlaceholder: 'چه چیزی در ذهن داری؟',
    captureAria: 'ثبت یک فکر',
    capture: 'ثبت',
    moveToTodo: 'انتقال به انجام',
    listTitle: 'فهرست',
    listHint: 'بر اساس دسته، اولویت یا وضعیت فیلتر کن.',
    filterAll: 'همه',
    filterAllCategories: 'همه دسته‌ها',
    filterAnyPriority: 'هر اولویتی',
    noTasksMatch: 'هیچ کاری با این فیلترها پیدا نشد.',
    boardTitle: 'بورد',
    boardHint: 'کارت‌ها را بین ستون‌ها بکش — یا از دکمه انتقال استفاده کن.',
    dropHere: 'کارها را اینجا رها کن',
    moveTo: '←',
    notes: 'یادداشت…',
    noCategory: 'بدون دسته',
    delete: 'حذف',
    markDone: 'علامت انجام‌شده',
    markIncomplete: 'علامت ناتمام',
    statusInbox: 'صندوق',
    statusTodo: 'انجام',
    statusDoing: 'در حال انجام',
    statusDone: 'تمام',
    priorityHigh: 'بالا',
    priorityMedium: 'متوسط',
    priorityLow: 'پایین',
    catWork: 'کار',
    catPersonal: 'شخصی',
    catIdeas: 'ایده‌ها',
    langEn: 'EN',
    langFa: 'فا',
    switchLanguage: 'زبان',
  },
} as const

export type MessageKey = keyof typeof messages.en

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: MessageKey) => string
  dir: 'ltr' | 'rtl'
}

const I18nContext = createContext<I18nContextValue | null>(null)

function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_KEY)
    if (saved === 'en' || saved === 'fa') return saved
  } catch {
    /* ignore */
  }
  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('fa')) {
    return 'fa'
  }
  return 'fa'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectLocale())

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    localStorage.setItem(LOCALE_KEY, next)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr'
    document.body.dataset.locale = locale
  }, [locale])

  const t = useCallback(
    (key: MessageKey) => messages[locale][key] ?? messages.en[key] ?? key,
    [locale],
  )

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t,
      dir: locale === 'fa' ? 'rtl' : 'ltr',
    }),
    [locale, setLocale, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

const DEFAULT_CATEGORY_KEYS: Record<string, MessageKey> = {
  'cat-work': 'catWork',
  'cat-personal': 'catPersonal',
  'cat-ideas': 'catIdeas',
}

export function categoryLabel(
  category: { id: string; name: string },
  t: (key: MessageKey) => string,
): string {
  const key = DEFAULT_CATEGORY_KEYS[category.id]
  return key ? t(key) : category.name
}
