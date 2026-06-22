import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FloatingInput } from '../../components'
import { useLanguage } from '../../context/LanguageContext'
import { getAuthTranslations, getValidationTranslations } from '../../utils/translations'
import { getErrorMessage, sendCustomerOtp } from '../../services/customerAuthService'
import darkLogo from '../../assets/DarkLogo.png'
import loginGradientBg from '../../assets/new login bk.png'

function AuthShell({ children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white">
      <div className="flex h-screen w-full">
        <div
          className="relative flex w-full flex-col bg-[#000000] p-8 lg:w-[35%] lg:p-12"
          style={{ colorScheme: 'dark' }}
        >
          <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '5.5rem' }}>
            <Link to="/">
              <img src={darkLogo} alt="Logo" className="h-8 w-auto" />
            </Link>
          </div>
          <div
            className="mx-auto flex w-full max-w-md flex-1 items-center justify-center"
            style={{ marginTop: '2.5rem' }}
          >
            <div className="w-full">{children}</div>
          </div>
        </div>
        <div
          className="relative hidden overflow-hidden lg:flex lg:w-[65%]"
          style={{
            backgroundImage: `url(${loginGradientBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'top center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </div>
    </div>
  )
}

export default function LoginPage() {
  const { language } = useLanguage()
  const isRTL = language === 'he'
  const t = getAuthTranslations(language)
  const v = getValidationTranslations(language)
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = location.state?.returnTo || null

  const [email, setEmail] = useState('')
  const [error, setError] = useState({})
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [keepLoggedIn, setKeepLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [savedEmails, setSavedEmails] = useState([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('savedClientEmails')
      if (saved) setSavedEmails(JSON.parse(saved))
    } catch {
      // ignore
    }
    toast.dismiss()
  }, [])

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/
    if (!value) return v.emailRequired
    if (!emailRegex.test(value)) return v.validEmailAddress
    if (value.length > 50) return v.emailTooLong
    return ''
  }

  const handleChange = (e) => {
    const { value } = e.target
    setEmail(value)
    if (hasAttemptedSubmit) {
      setError((prev) => ({ ...prev, email: validateEmail(value), general: '' }))
    } else {
      setError((prev) => ({ ...prev, email: '', general: '' }))
    }
  }

  const handleBlur = () => {
    if (!hasAttemptedSubmit) return
    setError((prev) => ({ ...prev, email: validateEmail(email) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setHasAttemptedSubmit(true)

    const emailError = validateEmail(email)
    if (emailError) {
      setError({ email: emailError })
      return
    }

    setIsLoading(true)
    setError((prev) => ({ ...prev, general: '' }))

    try {
      const res = await sendCustomerOtp(email.trim().toLowerCase())

      try {
        const emails = [...savedEmails]
        const normalized = email.trim().toLowerCase()
        if (!emails.includes(normalized)) {
          emails.unshift(normalized)
          localStorage.setItem('savedClientEmails', JSON.stringify(emails.slice(0, 5)))
        }
        if (keepLoggedIn) localStorage.setItem('keepLoggedIn', 'true')
        else localStorage.removeItem('keepLoggedIn')
      } catch {
        // ignore
      }

      navigate('/login/verify', {
        state: {
          email: email.trim().toLowerCase(),
          returnTo,
        },
      })

      toast.success(t.toastCodeSent)

      if (import.meta.env.DEV && res?.data?.devCode) {
        console.info('[dev] OTP code:', res.data.devCode)
      }
    } catch (err) {
      const message = getErrorMessage(err, t.loginFailed)
      setError({ general: message })
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell>
      <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off" noValidate>
        <p className="text-center text-sm text-gray-400">{t.loginSubtitle}</p>

        <div>
          <FloatingInput
            label={t.email}
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={t.enterEmail}
            error={hasAttemptedSubmit ? error.email : ''}
            suggestions={savedEmails.map((savedEmail) => ({
              email: savedEmail,
              name: savedEmail.split('@')[0],
              avatar: savedEmail.charAt(0).toUpperCase(),
            }))}
            onSuggestionSelect={(suggestion) => {
              const selected = suggestion.email || suggestion
              setEmail(String(selected))
              setError((prev) => ({ ...prev, email: '' }))
            }}
            autoComplete="email"
            whiteText
          />
        </div>

        {error.general ? (
          <div
            className={`rounded-lg border border-red-800 bg-red-900/20 p-3 text-sm text-red-400 font-ttcommons ${
              isRTL ? 'text-right' : 'text-left'
            }`}
            role="alert"
          >
            {error.general}
          </div>
        ) : null}

        <label className="flex cursor-pointer items-center">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              setKeepLoggedIn(!keepLoggedIn)
            }}
            className="flex-shrink-0 focus:outline-none"
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all ${
                keepLoggedIn ? 'border-[rgba(255,37,124,1)]' : 'border-gray-500'
              }`}
            >
              {keepLoggedIn ? (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: 'rgba(255,37,124,1)' }}
                />
              ) : null}
            </span>
          </button>
          <span className={`${isRTL ? 'mr-2' : 'ml-2'} text-sm text-gray-400`}>
            {t.keepLoggedIn}
          </span>
        </label>

        <button
          type="submit"
          className="text-md flex h-[48px] w-full items-center justify-center rounded-full bg-white font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? t.sendingCode : t.sendCode.toUpperCase()}
        </button>
      </form>
    </AuthShell>
  )
}

export { AuthShell }
