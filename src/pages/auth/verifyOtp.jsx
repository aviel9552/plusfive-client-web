import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { getAuthTranslations } from '../../utils/translations'
import {
  getErrorMessage,
  sendCustomerOtp,
  verifyCustomerOtp,
} from '../../services/customerAuthService'
import { AuthShell } from './login'

const OTP_LENGTH = 6

export default function VerifyOtpPage() {
  const { language } = useLanguage()
  const isRTL = language === 'he'
  const t = getAuthTranslations(language)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const email = location.state?.email || ''

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''))
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const inputRefs = useRef([])

  useEffect(() => {
    if (!email) navigate('/login', { replace: true })
  }, [email, navigate])

  const applyOtpValue = useCallback((raw, startIndex = 0) => {
    const numeric = String(raw).replace(/\D/g, '')
    if (!numeric) return

    setDigits((prev) => {
      const next = [...prev]
      numeric.split('').forEach((ch, i) => {
        const pos = startIndex + i
        if (pos < OTP_LENGTH) next[pos] = ch
      })
      return next
    })
    setError('')

    const focusIndex = Math.min(startIndex + numeric.length - 1, OTP_LENGTH - 1)
    requestAnimationFrame(() => {
      inputRefs.current[focusIndex]?.focus()
    })
  }, [])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const code = digits.join('')

  const handleDigitChange = (index, value) => {
    const numeric = value.replace(/\D/g, '')
    if (numeric.length > 1) {
      applyOtpValue(numeric, 0)
      return
    }

    const digit = numeric.slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    setError('')

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData?.getData('text') || ''
    applyOtpValue(pasted, 0)
  }

  const completeLogin = (payload) => {
    if (payload.token && payload.user) {
      login(payload.token, payload.user, payload.businesses || [])
      toast.success(t.toastLoginSuccess)
      navigate('/client/home', { replace: true })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (code.length !== OTP_LENGTH) {
      setError(t.invalidOtp)
      toast.error(t.invalidOtp)
      return
    }

    setIsLoading(true)
    setError('')
    try {
      const res = await verifyCustomerOtp(email, code)
      completeLogin(res.data || {})
    } catch (err) {
      const message = getErrorMessage(err, t.invalidOtp)
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    setError('')
    try {
      await sendCustomerOtp(email)
      toast.success(t.toastCodeResent)
    } catch (err) {
      const message = getErrorMessage(err, t.resendFailed)
      setError(message)
      toast.error(message)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthShell>
      <form
        onSubmit={handleSubmit}
        className="space-y-8"
        autoComplete="off"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="text-center">
          <p className="text-base text-gray-300">{t.otpTitle}</p>
          <p className="mt-2 text-sm text-gray-400">{t.otpSubtitle}</p>
          <p className="mt-1 text-sm font-medium text-white" dir="ltr">
            {email}
          </p>
        </div>

        {/* dir=ltr isolates box order from document RTL; flex-row-reverse mirrors boxes for Hebrew */}
        <div
          dir="ltr"
          className={`flex justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              autoComplete="off"
              name={`otp-digit-${index}`}
              dir="ltr"
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="h-12 w-10 rounded-lg border border-gray-600 bg-transparent text-center text-lg font-semibold text-white focus:border-customPink focus:outline-none"
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        {error ? (
          <div className="rounded-lg border border-red-800 bg-red-900/20 p-3 text-sm text-red-400">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          className="text-md flex h-[48px] w-full items-center justify-center rounded-full bg-white font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? t.verifying : t.verifyCode.toUpperCase()}
        </button>

        <div className="text-center text-sm text-gray-400">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="font-semibold text-white hover:underline disabled:opacity-50"
          >
            {isResending ? t.sendingCode : t.resendCode}
          </button>
          <span className="mx-2">·</span>
          <Link to="/login" className="text-gray-400 hover:text-white hover:underline">
            {t.changeEmail}
          </Link>
        </div>
      </form>
    </AuthShell>
  )
}
