import { useCallback, useEffect, useRef, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi'
import { useLanguage } from '../../context/LanguageContext'
import { getMarketplaceTranslations } from '../../utils/translations'

const REVIEWS_EN = [
  {
    id: 1,
    title: 'The best booking system',
    body: 'So easy to book and confirm my appointments. No calls, no waiting — just a few taps and I\'m done.',
    name: 'Noa',
    city: 'Tel Aviv',
  },
  {
    id: 2,
    title: 'Found my go-to salon',
    body: 'I discovered three incredible salons I had no idea existed near me. Now I have a regular spot I love.',
    name: 'Tamar',
    city: 'Jerusalem',
  },
  {
    id: 3,
    title: 'Super convenient',
    body: 'I can book at midnight for a same-day appointment. The reminders are a lifesaver too.',
    name: 'Lior',
    city: 'Haifa',
  },
  {
    id: 4,
    title: 'Hassle-free hair appointments',
    body: 'Finally an app that doesn\'t make you fill in your whole life story just to book a haircut.',
    name: 'Maya',
    city: 'Herzliya',
  },
  {
    id: 5,
    title: 'Great for finding barbers',
    body: 'Used PlusFive to find a great barber in my neighborhood. Booked, confirmed, done — all in 2 minutes.',
    name: 'Oren',
    city: 'Beer Sheva',
  },
  {
    id: 6,
    title: 'Sleek look and feel',
    body: 'Cleanest booking experience I\'ve used. Everything is exactly where you expect it to be.',
    name: 'Dana',
    city: 'Ramat Gan',
  },
  {
    id: 7,
    title: 'On-the-move appointments',
    body: 'I travel for work and this lets me find and book salons wherever I am, instantly.',
    name: 'Avi',
    city: 'Netanya',
  },
  {
    id: 8,
    title: 'Easy to use and explore',
    body: 'Browsing the businesses is actually fun. Great photos and clear service listings make it easy to decide.',
    name: 'Shira',
    city: 'Rehovot',
  },
]

const REVIEWS_HE = [
  {
    id: 1,
    title: 'מערכת ההזמנות הטובה ביותר',
    body: 'כל כך קל להזמין ולאשר תורים. בלי שיחות, בלי המתנה — כמה לחיצות וסיימתי.',
    name: 'נועה',
    city: 'תל אביב',
  },
  {
    id: 2,
    title: 'מצאתי את הסלון שלי',
    body: 'גיליתי שלושה סלונים מדהימים שלא ידעתי שקיימים בקרבתי. עכשיו יש לי מקום קבוע.',
    name: 'תמר',
    city: 'ירושלים',
  },
  {
    id: 3,
    title: 'נוח להפליא',
    body: 'אני יכולה להזמין בחצות לתור ביום המחרת. התזכורות גם הן מצילות חיים.',
    name: 'ליאור',
    city: 'חיפה',
  },
  {
    id: 4,
    title: 'תורי שיער ללא כאב',
    body: 'סוף סוף אפליקציה שלא מחייבת אותך למלא פרטים אינסופיים פשוט כדי להזמין תספורת.',
    name: 'מאיה',
    city: 'הרצליה',
  },
  {
    id: 5,
    title: 'מצוין למציאת ספרים',
    body: 'השתמשתי ב-PlusFive למצוא ספר נהדר בשכונה שלי. הזמנתי ואישרתי — הכל בשתי דקות.',
    name: 'אורן',
    city: 'באר שבע',
  },
  {
    id: 6,
    title: 'עיצוב יפה ונוח',
    body: 'חוויית ההזמנה הנקייה ביותר שהשתמשתי בה. הכל בדיוק במקום שציפית.',
    name: 'דנה',
    city: 'רמת גן',
  },
]

function StarRating({ count = 5 }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <FiStar
          key={i}
          className="h-4 w-4 fill-customPink text-customPink"
          aria-hidden
        />
      ))}
    </div>
  )
}

function ReviewCard({ review }) {
  const initial = review.name.charAt(0).toUpperCase()
  return (
    <article className="flex h-full min-w-0 flex-col rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#111111] sm:p-6">
      <StarRating />
      <h3 className="mt-3 text-sm font-bold text-gray-900 dark:text-white sm:text-base">
        &ldquo;{review.title}&rdquo;
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {review.body}
      </p>
      <div className="mt-5 flex items-center gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-customPink text-sm font-bold text-white">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {review.name}
          </p>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">{review.city}</p>
        </div>
      </div>
    </article>
  )
}

export default function MarketplaceTestimonials() {
  const { language } = useLanguage()
  const t = getMarketplaceTranslations(language)
  const reviews = language === 'he' ? REVIEWS_HE : REVIEWS_EN

  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const maxScroll = scrollWidth - clientWidth
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft < maxScroll - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [updateScrollState])

  const scrollByStep = (direction) => {
    const el = scrollRef.current
    if (!el) return
    const firstCard = el.firstElementChild
    const step = firstCard?.clientWidth ? firstCard.clientWidth + 16 : el.clientWidth * 0.8
    el.scrollBy({ left: direction === 'left' ? -step : step, behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-hidden bg-gray-50/70 py-14 dark:bg-[#080808] sm:py-16 lg:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-customPink/[0.06] via-transparent to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* header row */}
        <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-customPink sm:text-sm">
              {t.testimonialsEyebrow}
            </p>
            <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              {t.testimonialsTitle}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t.testimonialsSubtitle}</p>
          </div>

          {/* prev / next */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByStep('left')}
              disabled={!canScrollLeft}
              aria-label={t.scrollPrev}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-customPink/40 hover:text-customPink disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-[#141414] dark:text-gray-200 sm:h-10 sm:w-10"
            >
              <FiChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByStep('right')}
              disabled={!canScrollRight}
              aria-label={t.scrollNext}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-customPink/40 hover:text-customPink disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-[#141414] dark:text-gray-200 sm:h-10 sm:w-10"
            >
              <FiChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* carousel */}
        <div
          ref={scrollRef}
          className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 pt-0.5 snap-x snap-mandatory scroll-smooth [-webkit-overflow-scrolling:touch] [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
        >
          {reviews.map((review) => (
            <div
              key={review.id}
              className="w-[min(82vw,320px)] shrink-0 snap-start sm:w-[300px] lg:w-[320px]"
            >
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
