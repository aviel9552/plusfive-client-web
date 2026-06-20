import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

/** Default toast behavior for the whole app (react-toastify). */
export const DEFAULT_TOAST_AUTOCLOSE_MS = 5000;

function CommonToastify({
  position = 'top-center',
  autoClose = DEFAULT_TOAST_AUTOCLOSE_MS,
  hideProgressBar = false,
  newestOnTop = false,
  closeOnClick = true,
  rtl = false,
  /** Focus moves often with drawers/modals — keep timer running */
  pauseOnFocusLoss = false,
  draggable = true,
  pauseOnHover = true,
  ...rest
}) {
  const { isDarkMode } = useTheme();
  const { language } = useLanguage();
  const isRTL = language === 'he';

  // Toast theme must follow the DOM `.dark` class, not only context — public business
  // pages strip `dark` from <html> while isDarkMode stays true (otherwise text is white on white).
  const [toastTheme, setToastTheme] = React.useState('light');
  React.useEffect(() => {
    const syncToastTheme = () => {
      const darkOnDom = document.documentElement.classList.contains('dark');
      setToastTheme(isDarkMode && darkOnDom ? 'dark' : 'light');
    };
    syncToastTheme();
    const observer = new MutationObserver(syncToastTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, [isDarkMode]);

  const containerClass = `plusfive-toast-container plusfive-toast-container--${toastTheme}`;

  return (
    <>
      <style>{`
        /* react-toastify v11: no Toastify__toast-body — message lives on .Toastify__toast directly */

        .plusfive-toast-container {
          --toastify-toast-width: min(420px, calc(100vw - 32px));
          --toastify-toast-min-height: 72px;
          --toastify-toast-bd-radius: 16px;
          --toastify-toast-padding: 16px 48px 16px 16px;
          --toastify-font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
          --toastify-z-index: 100000;
        }

        .plusfive-toast-container .Toastify__toast-container {
          z-index: 100000;
          padding: 0 16px;
        }

        .plusfive-toast-container .Toastify__toast-container--top-center {
          top: max(12px, env(safe-area-inset-top, 0px)) !important;
          left: 50% !important;
          right: auto !important;
          transform: translateX(-50%);
          width: min(420px, calc(100vw - 32px));
          align-items: center;
        }

        .plusfive-toast-container .Toastify__toast-container--top-center.Toastify__toast-container--rtl {
          left: 50% !important;
          right: auto !important;
          transform: translateX(-50%);
        }

        /* ── Light theme ── */
        .plusfive-toast-container--light .Toastify__toast {
          background-color: #ffffff !important;
          background-image: none !important;
          color: #181818 !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12) !important;
        }

        .plusfive-toast-container--light .Toastify__toast--success { color: #15803d !important; }
        .plusfive-toast-container--light .Toastify__toast--error   { color: #b91c1c !important; }
        .plusfive-toast-container--light .Toastify__toast--warning { color: #b45309 !important; }
        .plusfive-toast-container--light .Toastify__toast--info    { color: #1d4ed8 !important; }

        .plusfive-toast-container--light .Toastify__close-button,
        .plusfive-toast-container--light .Toastify__close-button--light {
          color: #6b7280 !important;
          opacity: 1 !important;
        }

        .plusfive-toast-container--light .Toastify__close-button:hover {
          color: #374151 !important;
          background: rgba(0, 0, 0, 0.06);
          border-radius: 8px;
        }

        /* ── Dark theme ── */
        .plusfive-toast-container--dark .Toastify__toast {
          background-color: #000000 !important;
          background-image: none !important;
          color: #f3f4f6 !important;
          border: 1px solid #374151 !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4) !important;
        }

        .plusfive-toast-container--dark .Toastify__toast--success { color: #86efac !important; }
        .plusfive-toast-container--dark .Toastify__toast--error   { color: #fca5a5 !important; }
        .plusfive-toast-container--dark .Toastify__toast--warning { color: #fcd34d !important; }
        .plusfive-toast-container--dark .Toastify__toast--info    { color: #93c5fd !important; }

        .plusfive-toast-container--dark .Toastify__close-button {
          color: #9ca3af !important;
          opacity: 1 !important;
        }

        .plusfive-toast-container--dark .Toastify__close-button:hover {
          color: #d1d5db !important;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 8px;
        }

        /* Shared toast layout (v11: icon + text + close + progress) */
        .plusfive-toast-container .Toastify__toast {
          margin-bottom: 12px;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.5;
          word-break: break-word;
          align-items: center;
          gap: 12px;
          overflow: visible !important;
        }

        .plusfive-toast-container .Toastify__toast-icon {
          flex-shrink: 0;
          width: 24px;
          margin-inline-end: 0;
        }

        .plusfive-toast-container .Toastify__close-button {
          position: absolute !important;
          top: 50% !important;
          right: 10px !important;
          left: auto !important;
          transform: translateY(-50%) !important;
          width: 32px !important;
          height: 32px !important;
          display: flex !important;
          align-items: center;
          justify-content: center;
          padding: 0 !important;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .plusfive-toast-container .Toastify__toast--rtl {
          padding: 16px 16px 16px 48px !important;
        }

        .plusfive-toast-container .Toastify__toast--rtl .Toastify__close-button {
          right: auto !important;
          left: 10px !important;
        }

        .plusfive-toast-container .Toastify__toast--rtl .Toastify__toast-icon {
          order: 2;
        }

        /* Progress bar */
        .plusfive-toast-container .Toastify__progress-bar--success {
          background: #22c55e !important;
        }

        .plusfive-toast-container .Toastify__progress-bar--error {
          background: #ef4444 !important;
        }

        .plusfive-toast-container .Toastify__progress-bar--warning {
          background: #f59e0b !important;
        }

        .plusfive-toast-container .Toastify__progress-bar--info {
          background: #3b82f6 !important;
        }

        /* Subscription / API error toasts — same readable text rules */
        .plusfive-toast-container .plusfive-subscription-toast,
        .plusfive-toast-container .plusfive-api-error-toast {
          color: inherit !important;
        }
      `}</style>
      <ToastContainer
        className={containerClass}
        position={position}
        autoClose={autoClose}
        hideProgressBar={hideProgressBar}
        newestOnTop={newestOnTop}
        closeButton
        closeOnClick={closeOnClick}
        rtl={isRTL || rtl}
        pauseOnFocusLoss={pauseOnFocusLoss}
        draggable={draggable}
        pauseOnHover={pauseOnHover}
        theme={toastTheme}
        {...rest}
      />
    </>
  );
}

export default CommonToastify;
