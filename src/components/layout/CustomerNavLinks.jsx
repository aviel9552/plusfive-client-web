import { FiCalendar, FiHome, FiPlus, FiUser } from 'react-icons/fi'
import { getLayoutTranslations } from '../../utils/translations'

const customerNavLinks = (language = 'he') => {
  const t = getLayoutTranslations(language)

  return [
    { to: '/client/home', icon: FiHome, label: t.navHome },
    { to: '/client/book/business', icon: FiPlus, label: t.navBook },
    { to: '/client/appointments', icon: FiCalendar, label: t.navAppointments },
    { to: '/client/profile', icon: FiUser, label: t.navProfile },
  ]
}

export default customerNavLinks
