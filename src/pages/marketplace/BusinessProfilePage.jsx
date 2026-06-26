import { useCallback, useEffect, useMemo, useState } from 'react'

import { useNavigate, useParams, Link } from 'react-router-dom'

import { useQuery } from '@tanstack/react-query'

import { FiShare2 } from 'react-icons/fi'

import { toast } from 'react-toastify'

import {

  fetchPublicBusiness,

  normalizePublicBusinessData,

} from '../../services/publicBookingService'

import CommonLoader from '../../components/commonComponent/CommonLoader'

import BusinessProfileGallery from '../../components/marketplace/BusinessProfileGallery'

import BusinessProfileSidebar from '../../components/marketplace/BusinessProfileSidebar'

import BusinessProfileServices from '../../components/marketplace/BusinessProfileServices'

import BusinessProfileTeam from '../../components/marketplace/BusinessProfileTeam'
import BusinessProfileOpeningHours from '../../components/marketplace/BusinessProfileOpeningHours'
import BookingAuthPromptModal from '../../components/marketplace/BookingAuthPromptModal'

import { useAuth } from '../../context/AuthContext'

import { useLanguage } from '../../context/LanguageContext'

import { getMarketplaceTranslations } from '../../utils/translations'

import { primeBookingDraftFromPublic, getBusinessOwnerAppUrl } from '../../utils/publicBookingIntent'

import { collectGalleryImages } from '../../utils/marketplace/businessProfileHelpers'



function scrollToSection(id) {

  const el = document.getElementById(id)

  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })

}



export default function BusinessProfilePage() {

  const { slug } = useParams()

  const navigate = useNavigate()

  const { isAuthenticated } = useAuth()

  const { language } = useLanguage()

  const t = getMarketplaceTranslations(language)

  const isRtl = language === 'he'



  const { data, isPending, isError } = useQuery({

    queryKey: ['public-business-profile', slug],

    queryFn: async () => {

      const raw = await fetchPublicBusiness(slug)

      return normalizePublicBusinessData(raw)

    },

    enabled: Boolean(slug),

    staleTime: 60 * 1000,

  })



  const business = data?.business

  const services = data?.services ?? []

  const staff = data?.staff ?? []

  const gallery = data?.gallery ?? []

  const businessOperatingHours = data?.businessOperatingHours

  const allowBooking = data?.clientPermissions?.allowOnlineBooking !== false
  const hasServices = services.length > 0
  const canBook = allowBooking && hasServices
  const hasSidebarInfo =
    Boolean(business?.address) ||
    Boolean(
      businessOperatingHours && Object.keys(businessOperatingHours).length > 0,
    )
  const showSidebar = canBook || hasSidebarInfo
  const showPrices = data?.clientPermissions?.showServicePrices !== false

  const images = useMemo(
    () => (business ? collectGalleryImages(business, gallery) : []),
    [business, gallery],
  )



  const name = business?.businessName || business?.name || ''

  const aboutText = business?.directChatMessage || ''



  const tabs = useMemo(() => {

    const items = []

    if (images.length > 0) items.push({ id: 'photos', label: t.tabPhotos })

    if (services.length > 0) items.push({ id: 'services', label: t.tabServices })

    if (staff.length > 0) items.push({ id: 'team', label: t.tabTeam })

    items.push({ id: 'about', label: t.tabAbout })

    return items

  }, [images.length, services.length, staff.length, t])

  const defaultTab = tabs.find((tab) => tab.id === 'services')?.id || tabs[0]?.id || 'about'
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(tabs[0]?.id || 'about')
    }
  }, [tabs, activeTab])

  const startBooking = useCallback(
    (serviceId = null) => {
      if (!slug || !business) return
      primeBookingDraftFromPublic({
        slug,
        businessName: name,
        profileImage: business.image || business.profileImage || null,
        businessId: business.id,
        serviceId,
      })
      const returnTo = '/client/book/services'
      if (isAuthenticated) {
        navigate(returnTo)
      } else {
        setShowAuthPrompt(true)
      }
    },
    [slug, business, name, isAuthenticated, navigate],
  )

  const handleAuthLogin = () => {
    setShowAuthPrompt(false)
    navigate('/login', { state: { returnTo: '/client/book/services' } })
  }

  const handleContinueWithoutLogin = () => {
    setShowAuthPrompt(false)
    if (slug) {
      window.location.href = `${getBusinessOwnerAppUrl()}/${encodeURIComponent(slug)}`
    }
  }



  const handleShare = async () => {

    const url = window.location.href

    try {

      if (navigator.share) {

        await navigator.share({ title: name, url })

        return

      }

      await navigator.clipboard.writeText(url)

      toast.success(t.linkCopied)

    } catch {

      // user cancelled share

    }

  }



  if (isPending) {

    return (

      <div className="flex min-h-[50vh] items-center justify-center">

        <CommonLoader />

      </div>

    )

  }



  if (isError || !business) {

    return (

      <div className="mx-auto max-w-lg px-4 py-20 text-center">

        <p className="text-gray-600 dark:text-gray-400">{t.businessNotFound}</p>

        <Link to="/browse" className="mt-4 inline-block font-semibold text-customPink">

          {t.backToBrowse}

        </Link>

      </div>

    )

  }



  const sidebarProps = {
    name,
    allowBooking: canBook,
    showBookingUnavailable: !allowBooking && hasServices,
    bookNowLabel: t.bookNow,

    bookLabel: t.book,

    bookingUnavailableLabel: t.bookingUnavailable,

    businessOperatingHours,

    address: business.address,

    locationLink: business.locationLink,

    language,

    t,

    onBook: () => startBooking(),

    onBookService: (id) => startBooking(id),

  }



  return (

    <div className="pb-24 lg:pb-16" dir={isRtl ? 'rtl' : 'ltr'}>

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">

        <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-gray-500 dark:text-gray-400">

          <Link to="/" className="hover:text-gray-900 dark:hover:text-white">

            {t.home}

          </Link>

          <span>/</span>

          <Link to="/browse" className="hover:text-gray-900 dark:hover:text-white">

            {t.browse}

          </Link>

          <span>/</span>

          <span className="truncate text-gray-800 dark:text-gray-200">{name}</span>

        </nav>



        <div className="flex flex-wrap items-start justify-between gap-4">

          <div className="min-w-0 flex-1">

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">

              {name}

            </h1>

            {business.address ? (

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{business.address}</p>

            ) : null}

          </div>

          <button

            type="button"

            onClick={handleShare}

            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"

            aria-label={t.share}

          >

            <FiShare2 />

          </button>

        </div>



        <div id="photos" className="mt-6 scroll-mt-28">

          <BusinessProfileGallery
            images={images}
            businessName={name}
            seeAllLabel={t.seeAllImages}
            chooseServicesLabel={t.chooseServices}
            onChooseServices={() => scrollToSection('services')}
          />

        </div>



        {showSidebar ? (
          <div className="mt-8 lg:hidden">
            <BusinessProfileSidebar {...sidebarProps} />
          </div>
        ) : null}

        <div
          className={`mt-8 grid gap-10 lg:mt-10 lg:gap-12 ${
            showSidebar ? 'lg:grid-cols-[minmax(0,1fr)_340px]' : ''
          }`}
        >

          <div className="min-w-0">

            <div className="sticky top-16 z-20 -mx-4 border-b border-gray-200 bg-[#fafafa]/95 px-4 backdrop-blur-md dark:border-gray-800 dark:bg-[#050505]/95 sm:-mx-6 sm:px-6 lg:top-16 lg:mx-0 lg:px-0">

              <div className="flex gap-6 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

                {tabs.map((tab) => (

                  <button

                    key={tab.id}

                    type="button"

                    onClick={() => {

                      setActiveTab(tab.id)

                      scrollToSection(tab.id)

                    }}

                    className={`shrink-0 border-b-2 py-4 text-sm font-semibold transition ${

                      activeTab === tab.id

                        ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white'

                        : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'

                    }`}

                  >

                    {tab.label}

                  </button>

                ))}

              </div>

            </div>



            {services.length > 0 ? (

              <section id="services" className="mt-10 scroll-mt-36">

                <BusinessProfileServices
                  services={services}
                  showPrices={showPrices}
                  featuredLabel={t.featured}
                  servicesTitle={t.servicesTitle}
                  bookLabel={t.book}
                  noServicesLabel={t.noServices}
                  durationLabel={t.durationMin}

                  seeAllLabel={t.seeAll}

                  allowBooking={canBook}

                  onBookService={(id) => startBooking(id)}

                />

              </section>

            ) : null}



            {staff.length > 0 ? (

              <section id="team" className="mt-14 scroll-mt-36">

                <BusinessProfileTeam

                  staff={staff}

                  teamTitle={t.tabTeam}

                  seeAllLabel={t.seeAll}

                  noTeamLabel={t.noTeam}

                  teamMemberLabel={t.teamMember}

                />

              </section>

            ) : null}



            <section id="about" className="mt-14 scroll-mt-36">

              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">{t.about}</h2>

              {aboutText ? (

                <p className="max-w-3xl whitespace-pre-line text-gray-600 dark:text-gray-300">

                  {aboutText}

                </p>

              ) : null}



              {business.locationLink ? (

                <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">

                  <iframe

                    title={name}

                    src={business.locationLink.includes('embed')

                      ? business.locationLink

                      : `https://maps.google.com/maps?q=${encodeURIComponent(business.address || name)}&output=embed`}

                    className="h-64 w-full border-0 sm:h-80"

                    loading="lazy"

                    referrerPolicy="no-referrer-when-downgrade"

                  />

                  <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-800">

                    {business.address ? (

                      <p className="text-sm text-gray-700 dark:text-gray-300">{business.address}</p>

                    ) : null}

                    <a

                      href={business.locationLink}

                      target="_blank"

                      rel="noopener noreferrer"

                      className="mt-1 inline-block text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"

                    >

                      {t.getDirections}

                    </a>

                  </div>

                </div>

              ) : business.address ? (

                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{business.address}</p>

              ) : null}



              {businessOperatingHours ? (
                <div className="mt-10">
                  <BusinessProfileOpeningHours
                    businessOperatingHours={businessOperatingHours}
                    language={language}
                    title={t.openingTimes}
                  />
                </div>
              ) : null}

              {canBook ? (

                <div className="mt-10">

                  <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">

                    {t.additionalInfo}

                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400">{t.instantConfirmation}</p>

                </div>

              ) : null}

            </section>

          </div>



          {showSidebar ? (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <BusinessProfileSidebar {...sidebarProps} />
              </div>
            </aside>
          ) : null}

        </div>

      </div>



      {canBook ? (

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#0a0a0a] lg:hidden">

          <button

            type="button"

            onClick={() => startBooking()}

            className="w-full rounded-full bg-gray-900 py-3.5 text-sm font-semibold text-white dark:bg-white dark:text-gray-900"

          >

            {t.bookNow}

          </button>

        </div>

      ) : null}

      <BookingAuthPromptModal
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        onLogin={handleAuthLogin}
        onContinueWithoutLogin={handleContinueWithoutLogin}
      />
    </div>

  )

}


