'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import CookieConsent from 'react-cookie-consent'
import Cookies from 'js-cookie'
import { v4 as uuidv4 } from 'uuid'

const COOKIE_NAME = 'mmi_cookie_consent'
const VISITOR_COOKIE_NAME = 'mmi_visitor_id'

const CookieIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-10 w-10 text-blue-600"
  >
    <path
      fillRule="evenodd"
      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-2.625 6c-.54 0-.975.435-.975.975s.435.975.975.975.975-.435.975-.975S9.915 8.25 9.375 8.25Zm3.024 4.234a.75.75 0 0 0-1.06 1.06 1.5 1.5 0 0 1-1.996 0 .75.75 0 0 0-1.06-1.06 3 3 0 0 0 4.115 0Zm.996-2.484c.54 0 .975-.435.975-.975s-.435-.975-.975-.975-.975.435-.975.975.435.975.975.975Zm2.25 1.5c-.54 0-.975.435-.975.975s.435.975.975.975.975-.435.975-.975-.435-.975-.975-.975Z"
      clipRule="evenodd"
    />
  </svg>
)

export function CookieWrapper() {
  const [consentGiven, setConsentGiven] = useState(
    Cookies.get(COOKIE_NAME) === 'true',
  )
  const pathname = usePathname()

  const handleAcceptCookies = () => {
    setConsentGiven(true)
    if (!Cookies.get(VISITOR_COOKIE_NAME)) {
      Cookies.set(VISITOR_COOKIE_NAME, uuidv4(), { expires: 365 })
    }
  }

  useEffect(() => {
    if (consentGiven) {
      const visitorId = Cookies.get(VISITOR_COOKIE_NAME)
      if (!visitorId || pathname.startsWith('/admin')) return

      let propertyId = null
      if (pathname.startsWith('/imovel/')) {
        try {
          propertyId = parseInt(pathname.split('/')[2])
        } catch (e) {}
      }

      const eventData = {
        visitorId,
        eventType: propertyId ? 'PROPERTY_VIEW' : 'PAGE_VIEW',
        url: pathname,
        propertyId: propertyId || null,
      }

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/track/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
        keepalive: true,
      })
    }
  }, [pathname, consentGiven])

  return (
    <CookieConsent
      location="bottom"
      onAccept={handleAcceptCookies}
      cookieName={COOKIE_NAME}
      expires={150}
      enableDeclineButton
      buttonText="Aceitar e fechar"
      declineButtonText="Recusar"
      containerClasses="
        w-full md:max-w-[1100px] mx-auto mb-3
        bg-white shadow-lg border border-gray-100
        flex flex-col md:flex-row md:items-center md:justify-between
        rounded-none md:rounded-xl p-5 gap-4
      "
      style={{
        alignItems: 'center',
        background: '#FFFFFF',
        color: '#1f2937',
        fontSize: '14px',
      }}
      buttonStyle={{
        background: '#2563eb',
        color: 'white',
        fontWeight: '600',
        borderRadius: '0.375rem',
        padding: '0.75rem 1.25rem',
        fontSize: '14px',
        width: '100%',
        maxWidth: '280px',
      }}
      declineButtonStyle={{
        background: 'transparent',
        color: '#4b5563',
        fontWeight: '600',
        borderRadius: '0.375rem',
        padding: '0.75rem 1.25rem',
        fontSize: '14px',
        border: '1px solid #d1d5db',
        width: '100%',
        maxWidth: '280px',
      }}
      buttonWrapperClasses="
        flex-col md:flex-row gap-2 w-full md:w-auto
        justify-center md:justify-end
      "

      debug={false}
    >
      <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto text-center md:text-left">
        <div className="flex-shrink-0">
          <CookieIcon />
        </div>
        <div className="flex-1 max-w-full md:max-w-[700px]">
          <h3 className="font-bold text-base text-gray-900 mb-1">
            Sua privacidade é importante para nós
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            Usamos cookies e analisamos sua localização para personalizar sua
            experiência, rastrear o desempenho do site e{' '}
            <strong className="font-semibold text-gray-800">
              sugerir os melhores imóveis perto de você
            </strong>
            . Ao aceitar, você concorda com o uso dessas tecnologias. Saiba mais
            em nossa{' '}
            <a
              href="/politica-de-privacidade"
              className="text-blue-600 underline hover:text-blue-700"
            >
              Política de Privacidade
            </a>
            .
          </p>
        </div>
      </div>
    </CookieConsent>
  )
}
