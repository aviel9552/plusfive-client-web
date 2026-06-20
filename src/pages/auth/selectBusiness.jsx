import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { getAuthTranslations } from '../../utils/translations'
import { getErrorMessage, selectCustomerBusiness } from '../../services/customerAuthService'
import { AuthShell } from './login'

export default function SelectBusinessPage() {
  const { language } = useLanguage()
  const isRTL = language === 'he'
  const t = getAuthTranslations(language)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const email = location.state?.email || ''
  const businesses = location.state?.businesses || []
  const sessionToken =
    location.state?.sessionToken || sessionStorage.getItem('customer_session_token') || ''

  const [selectedId, setSelectedId] = useState(businesses[0]?.businessId || '')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!email || !businesses.length || !sessionToken) {
      navigate('/login', { replace: true })
    }
  }, [email, businesses.length, sessionToken, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedId) return

    setIsLoading(true)
    setError('')
    try {
      const res = await selectCustomerBusiness(sessionToken, selectedId)
      sessionStorage.removeItem('customer_session_token')
      login(res.data.token, res.data.user)
      toast.success(t.toastLoginSuccess)
      navigate('/client/home', { replace: true })
    } catch (err) {
      const message = getErrorMessage(err, t.loginFailed)
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="text-center">
          <p className="text-base text-gray-300">{t.selectBusinessTitle}</p>
          <p className="mt-2 text-sm text-gray-400">{t.selectBusinessSubtitle}</p>
        </div>

        <div className="space-y-3">
          {businesses.map((business) => {
            const active = selectedId === business.businessId
            return (
              <button
                key={business.businessId}
                type="button"
                onClick={() => setSelectedId(business.businessId)}
                className={`w-full rounded-xl border px-4 py-4 text-start transition ${
                  active
                    ? 'border-customPink bg-white/10 text-white'
                    : 'border-gray-700 text-gray-300 hover:border-gray-500'
                }`}
              >
                <p className="text-16 font-semibold">{business.businessName}</p>
              </button>
            )
          })}
        </div>

        {error ? (
          <div className="rounded-lg border border-red-800 bg-red-900/20 p-3 text-sm text-red-400">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isLoading || !selectedId}
          className="text-md flex h-[48px] w-full items-center justify-center rounded-full bg-white font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? t.loggingIn : t.continueLabel.toUpperCase()}
        </button>

        <div className="text-center">
          <Link to="/login" className="text-sm text-gray-400 hover:text-white hover:underline">
            {t.backToLogin}
          </Link>
        </div>
      </form>
    </AuthShell>
  )
}
