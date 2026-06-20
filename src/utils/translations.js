import enTranslations from '../i18/en.json'
import heTranslations from '../i18/he.json'

export const getTranslations = (language) => {
  return language === 'he' ? heTranslations : enTranslations
}

export const getTranslationSection = (language, section) => {
  const translations = getTranslations(language)
  return translations[section] || {}
}

export const getLayoutTranslations = (language) => {
  return getTranslationSection(language, 'layout')
}

export const getAuthTranslations = (language) => {
  return getTranslationSection(language, 'auth')
}

export const getValidationTranslations = (language) => {
  return getTranslationSection(language, 'validation')
}

export const getCustomerHomeTranslations = (language) => {
  return getTranslationSection(language, 'customerHome')
}

export const getCustomerAppointmentsTranslations = (language) => {
  return getTranslationSection(language, 'customerAppointments')
}

export const getCustomerProfileTranslations = (language) => {
  return getTranslationSection(language, 'customerProfile')
}

export const getCustomerBookingTranslations = (language) => {
  return getTranslationSection(language, 'customerBooking')
}

export const getSettingsPanelTranslations = (language) => {
  return getTranslationSection(language, 'settingsPanel')
}

export const getNotFoundTranslations = (language) => {
  return getTranslationSection(language, 'notFound')
}

export const getCommonPaginationTranslations = (language) => {
  return getTranslationSection(language, 'commonTable')
}

export const getCommonTableTranslations = (language) => {
  return getTranslationSection(language, 'commonTable')
}

export const getCommonConfirmTranslations = (language) => {
  return getTranslationSection(language, 'commonConfirm')
}
