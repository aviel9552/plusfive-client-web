import { useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import { useLanguage } from '../../context/LanguageContext'
import customerNavLinks from './CustomerNavLinks'
import SidebarNavItem from './SidebarNavItem'
import loginGradientBg from '../../assets/new login bk.png'

export default function Sidebar({
  isCollapsed,
  isMobile,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isRTL = false,
}) {
  const { language } = useLanguage()
  const links = customerNavLinks(language)

  useEffect(() => {
    if (!isMobile) setIsMobileMenuOpen(false)
  }, [isMobile, setIsMobileMenuOpen])

  const desktopNav = (
    <nav className="flex-1 overflow-y-auto">
      <ul className="space-y-3 px-2">
        {links.map((link) => (
          <SidebarNavItem
            key={link.to}
            to={link.to}
            icon={link.icon}
            label={link.label}
            isCollapsed={isCollapsed}
            isRTL={isRTL}
          />
        ))}
      </ul>
    </nav>
  )

  if (isMobile) {
    return (
      <>
        {isMobileMenuOpen ? (
          <div className="fixed inset-0 z-[50] flex justify-end" dir="ltr">
            <style>{`
              .calendar-slide-in {
                animation: calendarSlideIn 200ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
              }
              @keyframes calendarSlideIn {
                0% { transform: translateX(100%); opacity: 0; }
                100% { transform: translateX(0); opacity: 1; }
              }
            `}</style>

            <div className="flex-1 bg-black/0" onClick={() => setIsMobileMenuOpen(false)} />

            <div
              dir="rtl"
              className={`relative h-screen w-[380px] border-l border-gray-200 shadow-2xl dark:border-l-0 sm:w-[480px] calendar-slide-in flex flex-col overflow-hidden bg-white text-right dark:bg-[#000000] ${
                isRTL ? '' : ''
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '45%',
                  backgroundImage: `url(${loginGradientBg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  zIndex: 0,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '180px',
                    background:
                      'linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.3) 40%, rgba(255, 255, 255, 0.7) 70%, white 100%)',
                    pointerEvents: 'none',
                  }}
                />
              </div>

              <div
                style={{
                  position: 'absolute',
                  top: '45%',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'white',
                  zIndex: 0,
                }}
                className="dark:bg-[#000000]"
              />

              <div className="relative z-10 min-h-[150px] overflow-visible px-5 py-7">
                <button
                  type="button"
                  className="absolute left-4 top-4 z-[60] flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-black/5 text-gray-500 shadow-md hover:bg-gray-50 dark:border-commonBorder dark:hover:bg-[#2a2a2a]"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <FiX className="text-[16px]" />
                </button>
              </div>

              <div className="relative z-20 -mt-1 flex-1 overflow-y-auto rounded-t-2xl bg-white px-6 pb-4 pt-6 text-sm text-gray-800 dark:bg-[#000000] dark:text-gray-100">
                <nav className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                  <ul className="space-y-3">
                    {links.map((link) => (
                      <SidebarNavItem
                        key={link.to}
                        {...link}
                        isCollapsed={false}
                        isRTL={isRTL}
                        isMobile
                      />
                    ))}
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        ) : null}
      </>
    )
  }

  return (
    <aside
      dir="ltr"
      className={`fixed top-0 z-[30] hidden h-screen w-[72px] flex-col border-gray-200 bg-white pt-[72px] font-ttcommons dark:border-commonBorder dark:bg-black lg:flex ${
        isRTL ? 'right-0 border-l' : 'left-0 border-r'
      }`}
    >
      {desktopNav}
    </aside>
  )
}
