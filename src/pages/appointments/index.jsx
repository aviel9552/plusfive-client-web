import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { FileText, Loader2, X } from 'lucide-react'
import { CommonTable, CommonNormalDropDown } from '../../components'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { getCustomerAppointmentsTranslations } from '../../utils/translations'
import {
  getCustomerAppointments,
  fetchAppointmentInvoiceBlobUrl,
  getErrorMessage,
} from '../../services/customerAppointmentsService'
import { getStatusLabel, getStatusStyle } from '../../utils/appointmentStatus'

const TABS = [
  { id: 'upcoming', labelKey: 'upcoming' },
  { id: 'past', labelKey: 'past' },
]

const STATUS_OPTIONS = [
  'all',
  'booked',
  'scheduled',
  'confirmed',
  'paid',
  'cancelled',
  'no_show',
]

export default function AppointmentsPage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const t = getCustomerAppointmentsTranslations(language)
  const isRtl = language === 'he'

  const [activeTab, setActiveTab] = useState('upcoming')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [tabCounts, setTabCounts] = useState({ upcoming: 0, past: 0 })
  const [loading, setLoading] = useState(true)
  const [invoiceLoadingId, setInvoiceLoadingId] = useState(null)
  const [invoiceUrl, setInvoiceUrl] = useState(null)

  const locale = language === 'he' ? 'he-IL' : 'en-US'

  const statusOptions = useMemo(
    () =>
      STATUS_OPTIONS.map((value) => ({
        value,
        label: value === 'all' ? t.filterAll : t[`status_${value}`] || value,
      })),
    [t],
  )

  const formatDate = useCallback(
    (value) => {
      if (!value) return t.datePending
      return new Date(value).toLocaleDateString(locale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    },
    [locale, t.datePending],
  )

  const formatTime = useCallback(
    (value) => {
      if (!value) return '—'
      return new Date(value).toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
      })
    },
    [locale],
  )

  const getEndDate = useCallback((row) => {
    if (row.endDate) return new Date(row.endDate)
    if (!row.startDate) return null
    const minutes = parseInt(row.duration, 10)
    if (!minutes || Number.isNaN(minutes)) return null
    return new Date(new Date(row.startDate).getTime() + minutes * 60 * 1000)
  }, [])

  const formatCurrency = useCallback(
    (amount) => {
      if (amount == null) return '—'
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'ILS',
        maximumFractionDigits: 0,
      }).format(amount)
    },
    [locale],
  )

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const data = await getCustomerAppointments({
          tab: activeTab,
          status: statusFilter,
          page: currentPage,
          limit: pageSize,
        })

        if (!cancelled) {
          setItems(data?.items || [])
          setTotal(data?.pagination?.total || 0)
          setTabCounts({
            upcoming: data?.counts?.upcoming ?? 0,
            past: data?.counts?.past ?? 0,
          })
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(getErrorMessage(err, t.loadError))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [activeTab, statusFilter, currentPage, pageSize, t.loadError, user?.businessId])

  const activeEmpty = activeTab === 'upcoming' ? t.noUpcoming : t.noPast

  useEffect(
    () => () => {
      if (invoiceUrl) URL.revokeObjectURL(invoiceUrl)
    },
    [invoiceUrl],
  )

  const closeInvoice = useCallback(() => {
    setInvoiceUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }, [])

  const handleViewInvoice = useCallback(
    async (row) => {
      if (!row?.id || invoiceLoadingId) return
      setInvoiceLoadingId(row.id)
      try {
        const url = await fetchAppointmentInvoiceBlobUrl(row.id, { language })
        setInvoiceUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev)
          return url
        })
      } catch (err) {
        toast.error(getErrorMessage(err, t.invoiceError))
      } finally {
        setInvoiceLoadingId(null)
      }
    },
    [invoiceLoadingId, language, t.invoiceError],
  )

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setCurrentPage(1)
  }

  const handleStatusChange = (value) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const columns = useMemo(
    () => [
      {
        key: 'serviceName',
        label: t.colService,
        render: (row) => (
          <span className="font-medium">{row.serviceName || t.appointmentFallback}</span>
        ),
      },
      {
        key: 'businessName',
        label: t.colBusiness,
        render: (row) => row.businessName || '—',
      },
      {
        key: 'staffName',
        label: t.colStaff,
        render: (row) => row.staffName || '—',
      },
      {
        key: 'startDate',
        label: t.colDate,
        render: (row) => (
          <span className="font-medium text-customPink">{formatDate(row.startDate)}</span>
        ),
      },
      {
        key: 'startTime',
        label: t.colStartTime,
        render: (row) => formatTime(row.startDate),
      },
      {
        key: 'endTime',
        label: t.colEndTime,
        render: (row) => formatTime(getEndDate(row)),
      },
      {
        key: 'duration',
        label: t.colDuration,
        render: (row) => row.duration || '—',
      },
      {
        key: 'price',
        label: t.colPrice,
        render: (row) => formatCurrency(row.price),
      },
      {
        key: 'status',
        label: t.colStatus,
        render: (row) => {
          const status = row.status || 'booked'
          return (
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-11 font-semibold uppercase tracking-wide ${getStatusStyle(status)}`}
            >
              {getStatusLabel(status, t)}
            </span>
          )
        },
      },
      {
        key: 'invoice',
        label: t.colInvoice,
        render: (row) => {
          if (!row.hasInvoice) return <span className="text-gray-400">—</span>
          const isLoading = invoiceLoadingId === row.id
          return (
            <button
              type="button"
              onClick={() => handleViewInvoice(row)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 disabled:opacity-60 dark:border-commonBorder dark:bg-[#232323] dark:text-gray-300 dark:hover:bg-[#2a2a2a] dark:hover:text-white"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
              ) : (
                <FileText className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
              )}
              <span className="whitespace-nowrap">{t.viewInvoice}</span>
            </button>
          )
        },
      },
    ],
    [t, formatDate, formatTime, getEndDate, formatCurrency, invoiceLoadingId, handleViewInvoice],
  )

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
        {t.title}
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-white">{t.subtitle}</p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <nav className="flex flex-wrap items-center gap-2" aria-label={t.title} role="tablist">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabChange(tab.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                  isActive
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-black'
                    : 'border border-gray-200 bg-transparent text-gray-700 hover:bg-gray-100 dark:border-commonBorder dark:text-gray-300 dark:hover:bg-[#1a1a1a]'
                }`}
              >
                <span>{t[tab.labelKey]}</span>
                {!loading ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-11 font-bold ${
                      isActive
                        ? 'bg-white/20 text-white dark:bg-black/10 dark:text-black'
                        : 'bg-gray-100 text-gray-600 dark:bg-[#2a2a2a] dark:text-gray-300'
                    }`}
                  >
                    {tabCounts[tab.id]}
                  </span>
                ) : null}
              </button>
            )
          })}
        </nav>

        <CommonNormalDropDown
          label={t.filterStatus}
          value={statusFilter}
          options={statusOptions}
          onChange={handleStatusChange}
          className="w-full sm:w-auto sm:min-w-[220px]"
          fontSize="text-sm"
        />
      </div>

      <div className="mt-6" role="tabpanel">
        <CommonTable
          columns={columns}
          data={items}
          total={total}
          loading={loading}
          noDataComponent={
            <p className="text-14 text-customBoldTextColor dark:text-customGray2">{activeEmpty}</p>
          }
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setCurrentPage(1)
          }}
          showPagination={!loading && total > 0}
        />
      </div>

      {invoiceUrl ? (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 p-4 dark:bg-black/70"
          onClick={closeInvoice}
          role="presentation"
        >
          <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-commonBorder dark:bg-[#1a1a1a]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-3 dark:border-commonBorder">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {t.invoiceTitle}
              </h2>
              <button
                type="button"
                onClick={closeInvoice}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label={t.close}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <iframe title={t.invoiceTitle} src={invoiceUrl} className="h-full w-full flex-1 border-0" />
          </div>
        </div>
      ) : null}
    </div>
  )
}
