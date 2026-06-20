import React, { useState, useEffect } from 'react'
import { MdWarning, MdClose } from 'react-icons/md'
import { FiX, FiAlertTriangle } from 'react-icons/fi'
import { useLanguage } from '../../context/LanguageContext';
import gradientBg from '../../assets/new new.png';
const CommonConfirmModel = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  confirmButtonColor = "bg-[#ff257c] focus:ring-2 focus:ring-[#ff257c]",
  cancelButtonColor = "bg-customGray2 dark:bg-customIconBgColor hover:bg-gray-400 dark:hover:bg-customBorderColor focus:ring-2 focus:ring-gray-400",
  confirmButtonTextColor = "text-white",
  cancelButtonTextColor = "text-gray-700 dark:text-white",
  insideCard = false,
  closeOnConfirm = true,
  confirmLoading = false,
  confirmLoadingText = "Loading...",
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'he';
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isOpen) return null

  const handleConfirm = async () => {
    if (confirmLoading) return;
    try {
      const result = onConfirm?.();
      if (result?.then) {
        await result;
      }
      if (closeOnConfirm) {
        onClose();
      }
    } catch (error) {
      // Caller handles errors/toasts; keep modal open when closeOnConfirm is false
    }
  };

  const handleCancel = () => {
    if (confirmLoading) return;
    onClose();
  };

  const renderConfirmButtonLabel = () => (
    confirmLoading ? (
      <span className="inline-flex items-center gap-2">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        {confirmLoadingText}
      </span>
    ) : (
      confirmText
    )
  );

  // If insideCard is true, render inside the card (relative positioning)
  // On mobile, render as full bottom sheet instead
  if (insideCard) {
    // Mobile: Full bottom sheet card
    if (isMobile) {
      return (
        <div className="fixed inset-0 z-[9999] flex items-end" dir="ltr">
          <style>{`
            .content-slide-up {
              animation: contentSlideUp 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
            @keyframes contentSlideUp {
              0% {
                transform: translateY(100%);
                opacity: 0;
              }
              100% {
                transform: translateY(0);
                opacity: 1;
              }
            }
          `}</style>
          
          {/* Click on background - closes the modal */}
          <div className="absolute inset-0 bg-black/50" onClick={handleCancel} />
          
          <div
            dir="rtl"
            className="relative w-full
                 shadow-2xl
                 flex flex-col text-right overflow-hidden rounded-t-2xl content-slide-up z-10 bg-white dark:bg-black"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {/* BODY - Only content, no header */}
            <div className="w-full box-border px-6 pt-6 pb-4 relative text-sm text-gray-800 dark:text-gray-100 rounded-t-2xl bg-white dark:bg-[#000000]">
              <div className="flex flex-col items-center justify-center py-7">
                {/* Warning Icon */}
                <div className="mb-4">
                  <FiAlertTriangle className="text-4xl text-black dark:text-white" />
                </div>

                <div className="mb-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                  </h3>
                </div>

                {/* Message */}
                {message && (
                  <div className="mb-6 text-center">
                    <p className="text-sm text-gray-700 dark:text-white leading-relaxed">
                      {message}
                    </p>
                  </div>
                )}
                
                {/* Buttons */}
                <div className={`flex justify-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button
                    onClick={handleCancel}
                    disabled={confirmLoading}
                    className="px-6 py-2.5 text-sm font-medium bg-transparent rounded-full transition-all duration-200 text-gray-700 dark:text-white border border-gray-700 dark:border-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelText}
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={confirmLoading}
                    className="px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-200 bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {renderConfirmButtonLabel()}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Desktop: Original inside card behavior
    return (
      <div className="absolute left-0 right-0 top-0 bottom-0 z-50 flex items-end justify-end" dir="ltr" style={{ marginLeft: '-1.5rem', marginRight: '-1.5rem' }}>
        <style>{`
          .content-slide-up {
            animation: contentSlideUp 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          @keyframes contentSlideUp {
            0% {
              transform: translateY(100%);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}</style>
        
        <div
          dir="rtl"
          className="relative w-full self-end max-h-[50vh] lg:max-h-none
               border-l border-r border-t border-gray-200 dark:border-commonBorder shadow-2xl
               flex flex-col text-right overflow-hidden rounded-t-2xl content-slide-up z-10 bg-white dark:bg-black backdrop-blur-none"
          style={{ filter: 'none' }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {/* HEADER - Contains title, message, and buttons */}
          <div className="px-5 py-7 relative overflow-visible z-10 flex-shrink-0 flex flex-col items-center justify-center backdrop-blur-none" style={{ filter: 'none' }}>
            {/* Warning Icon */}
            <div className="mb-4">
              <FiAlertTriangle className="text-4xl text-black dark:text-white" />
            </div>

            <div className="mb-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            </div>

            {/* Message */}
            {message && (
              <div className="mb-6 text-center">
                <p className="text-sm text-gray-700 dark:text-white leading-relaxed">
                  {message}
                </p>
              </div>
            )}
            
            {/* Buttons */}
            <div className={`flex justify-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={handleCancel}
                disabled={confirmLoading}
                className="px-6 py-2.5 text-sm font-medium bg-transparent rounded-full transition-all duration-200 text-gray-700 dark:text-white border border-gray-700 dark:border-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={confirmLoading}
                className="px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-200 bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {renderConfirmButtonLabel()}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default behavior - modal overlay
  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center" dir="ltr">
      <style>{`
        .content-slide-up {
          animation: contentSlideUp 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes contentSlideUp {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      
      {/* Click on background - closes the modal */}
      <div className="absolute inset-0 bg-black/50" onClick={handleCancel} />
      
      <div
        dir="rtl"
        className="relative w-[380px] sm:w-[480px] max-h-[90vh]
             border-l border-r border-t border-gray-200 dark:border-commonBorder shadow-2xl
             flex flex-col text-right overflow-hidden rounded-t-2xl"
        style={{
          backgroundImage: `url(${gradientBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* HEADER - Fixed */}
        <div className="px-5 py-7 min-h-[150px] relative overflow-visible z-10 flex-shrink-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            
            {/* Close Button */}
            <button
              onClick={handleCancel}
              disabled={confirmLoading}
              className="w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close"
            >
              <FiX className="text-[20px]" />
            </button>
          </div>
        </div>

        {/* BODY - Slides up from bottom */}
        <div className="flex-1 w-full box-border px-6 pt-6 pb-4 overflow-y-auto relative text-sm text-gray-800 dark:text-gray-100 rounded-t-2xl bg-white dark:bg-[#000000] -mt-1 z-20 content-slide-up">
          <div className="space-y-6">
            {/* Message */}
            <div className="px-0 py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {message}
              </p>
            </div>
            
            {/* Footer Buttons */}
            <div className={`flex justify-end gap-3 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={handleCancel}
                disabled={confirmLoading}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-white bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-full hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                disabled={confirmLoading}
                className="px-6 py-2.5 text-sm font-semibold text-white rounded-full shadow-lg transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#ff257c'
                }}
              >
                {renderConfirmButtonLabel()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommonConfirmModel