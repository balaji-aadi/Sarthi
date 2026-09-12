import React from 'react';
import { normalizeCompanySlug } from '../../../data/companyMetadata';

// High-fidelity vector SVG logos for each company matching authentic brand identities
export const BrandVectors = {
  // Google: Multi-color G mark
  google: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
    </svg>
  ),

  // Meta: Royal Blue Infinity Mark
  meta: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <defs>
        <linearGradient id="metaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0081FB" />
          <stop offset="50%" stopColor="#0064E0" />
          <stop offset="100%" stopColor="#004EC4" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="5" fill="#0A101D" />
      <path
        fill="url(#metaGrad)"
        d="M12 9.4c-1.4-1.9-2.9-2.9-4.7-2.9C4.3 6.5 2 9.1 2 12.2c0 3.3 2.5 5.8 5.4 5.8 2.3 0 4-1.5 5.3-3.6 1.3 2.1 3 3.6 5.3 3.6 2.9 0 5.4-2.5 5.4-5.8 0-3.1-2.3-5.7-5.3-5.7-1.8 0-3.3 1-4.7 2.9zm-4.6 6.3c-1.7 0-3.1-1.6-3.1-3.5s1.4-3.5 3.1-3.5c1.4 0 2.5.9 3.5 2.5-1 1.7-2.1 4.5-3.5 4.5zm9.2 0c-1.4 0-2.5-2.8-3.5-4.5 1-1.6 2.1-2.5 3.5-2.5 1.7 0 3.1 1.6 3.1 3.5s-1.4 3.5-3.1 3.5z"
      />
    </svg>
  ),

  // Microsoft: Four-Color Squares
  microsoft: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" rx="1.5" />
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00" rx="1.5" />
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF" rx="1.5" />
      <rect x="13" y="13" width="10" height="10" fill="#FFB900" rx="1.5" />
    </svg>
  ),

  // Netflix: Bold Red N
  netflix: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="4" fill="#000000" />
      <path fill="#E50914" d="M6 3.5h3.2v17H6zm8.8 0h3.2v17h-3.2z" />
      <path fill="#B81D24" d="M6 3.5h3.5l8.5 17h-3.5z" />
    </svg>
  ),

  // Amazon: Dark container with Orange Smile
  amazon: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="5" fill="#131921" />
      <path
        fill="#FFFFFF"
        d="M13.2 13.8c-.8.7-1.7.9-2.6.9-1.5 0-2.3-.8-2.3-2.1 0-1.6 1.3-2.4 3.7-2.4v-.4c0-.6-.3-1-1.2-1-.7 0-1.4.2-2 .5l-.3-1.1c.8-.4 1.8-.6 2.7-.6 1.9 0 2.8.9 2.8 2.6v3.7c0 .5.1.9.3 1.2h-1.3c-.1-.4-.1-.7-.1-1.4zm-1.2-2.7c-1.4 0-2.1.4-2.1 1.3 0 .7.5 1.1 1.3 1.1.7 0 1.4-.4 1.7-.9v-1.5h-.9z"
      />
      <path
        fill="#FF9900"
        d="M4.5 16.8c3.5 2.2 8.2 2.2 12.3-.2.3-.2.5.1.3.4-3.8 2.6-8.8 2.7-12.8.3-.3-.2-.1-.6.2-.5z"
      />
      <path
        fill="#FF9900"
        d="M17.1 16c.3-.3.9-.3 1.2-.1.2.2.1.6-.2.8-.4.3-.8.2-1-.2 0-.2-.1-.4 0-.5z"
      />
    </svg>
  ),

  // Apple: Clean Apple silhouette
  apple: () => (
    <svg viewBox="0 0 24 24" fill="#FFFFFF" className="w-full h-full">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.88c.64-.78 1.08-1.86.96-2.95-1 .04-2.15.65-2.82 1.43-.59.68-1.11 1.77-.97 2.84 1.12.09 2.19-.54 2.83-1.32z" />
    </svg>
  ),

  // LinkedIn: Royal Blue with 'in'
  linkedin: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="4" fill="#0A66C2" />
      <path fill="#FFFFFF" d="M7.4 9.1H4.6V18h2.8V9.1zM6 7.9c.9 0 1.6-.7 1.6-1.6 0-.9-.7-1.6-1.6-1.6s-1.6.7-1.6 1.6c0 .9.7 1.6 1.6 1.6zm13.4 4.8c0-2.8-1.5-4.1-3.5-4.1-1.6 0-2.3.9-2.7 1.5V9.1h-2.8c.04.8 0 8.9 0 8.9h2.8v-5c0-.3 0-.5.1-.7.2-.6.7-1.2 1.6-1.2 1.1 0 1.6.9 1.6 2.1v4.8h2.8v-5.2z" />
    </svg>
  ),

  // Atlassian: Dual Royal Blue Chevrons
  atlassian: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <path fill="#0052CC" d="M11.66 12.37c-.37-.47-1-.47-1.37 0L4.54 19.7a.89.89 0 0 0 .7 1.44h7.08a.89.89 0 0 0 .71-.35c.19-.24 3.73-4.73 3.73-8.42 0-3.32-2.31-6.19-2.31-6.19a.88.88 0 0 0-1.42 0s-2.07 2.63-2.07 5.7c0 2.22 1.1 4.09 1.7 5.06l-1.05-.57z" />
      <path fill="#2684FF" d="M12.34 12.37c.37-.47 1-.47 1.37 0l5.75 7.33a.89.89 0 0 1-.7 1.44h-7.08a.89.89 0 0 1-.71-.35c-.19-.24-3.73-4.73-3.73-8.42 0-3.32 2.31-6.19 2.31-6.19a.88.88 0 0 1 1.42 0s2.07 2.63 2.07 5.7c0 2.22-1.1 4.09-1.7 5.06l1.05-.57z" />
    </svg>
  ),

  // Uber: Black badge with authentic vector wordmark
  uber: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="5" fill="#000000" />
      <path
        fill="#FFFFFF"
        d="M4 8.5h2.2v4.8c0 1.2.6 1.8 1.7 1.8s1.7-.6 1.7-1.8V8.5h2.2v4.8c0 2.4-1.5 3.7-3.9 3.7S4 15.7 4 13.3V8.5zm8.8 0h2v1.2c.4-.8 1.3-1.4 2.4-1.4 1.8 0 3 1.4 3 3.7s-1.2 3.7-3 3.7c-1.1 0-2-.6-2.4-1.4v1.2h-2V8.5zm2 3.6c0 1.3.7 2.1 1.7 2.1s1.7-.8 1.7-2.1-.7-2.1-1.7-2.1-1.7.8-1.7 2.1z"
      />
    </svg>
  ),

  // D.E. Shaw: Dark corporate slate badge with classic serif typography
  'de-shaw': () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="5" fill="#0A192F" />
      <rect x="3.5" y="4" width="17" height="1" fill="#64FFDA" rx="0.5" />
      <text x="12" y="11.5" fill="#FFFFFF" fontSize="3.6" fontWeight="900" textAnchor="middle" fontFamily="serif" letterSpacing="0.4">D. E. SHAW</text>
      <text x="12" y="16.5" fill="#94A3B8" fontSize="2.8" fontWeight="700" textAnchor="middle" fontFamily="serif" letterSpacing="0.8">&amp; CO.</text>
      <rect x="3.5" y="19" width="17" height="1" fill="#64FFDA" rx="0.5" />
    </svg>
  ),

  // Bloomberg: Vibrant Purple with 'B'
  bloomberg: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="4" fill="#180033" />
      <text x="12" y="17" fill="#A855F7" fontSize="16" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">B</text>
    </svg>
  ),

  // Tower Research Capital: Triple stacked geometry
  'tower-research-capital': () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="4" fill="#0F172A" />
      <path fill="#FFFFFF" d="M12 4l-4 3 4 3 4-3-4-3zm0 6l-4 3 4 3 4-3-4-3zm0 6l-4 3 4 3 4-3-4-3z" />
    </svg>
  ),

  // Stripe: Slate Blue with Slanted S
  stripe: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="5" fill="#635BFF" />
      <path
        fill="#FFFFFF"
        d="M15.4 10.4c0-.9-.7-1.4-1.9-1.4-1.4 0-3 .5-4.1 1.1V7.3c1.3-.5 2.8-.8 4.2-.8 3.3 0 5.2 1.6 5.2 4.4 0 4.1-5.6 3.4-5.6 5.2 0 1 .9 1.4 2.2 1.4 1.7 0 3.5-.7 4.7-1.5v2.9c-1.4.7-3.2 1.1-4.8 1.1-3.5 0-5.6-1.7-5.6-4.5 0-4.3 5.7-3.7 5.7-5.1z"
      />
    </svg>
  ),

  // PayPal: Two interlocking P's
  paypal: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="4" fill="#003087" />
      <path fill="#0079C1" d="M8 5h5.5c2.5 0 4.2 1.5 3.9 3.8-.4 2.7-2.3 4.2-4.9 4.2H10l-1 6H6.5l2.5-14h-1z" />
      <path fill="#00457C" d="M10 8h4.5c1.8 0 3.2 1.1 3 2.8-.3 2.1-1.9 3.2-3.8 3.2h-2l-.9 5H8.5l2-11h-.5z" />
    </svg>
  ),

  // Salesforce: Cyan cloud with 'salesforce'
  salesforce: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="4" fill="#00A1E0" />
      <path fill="#FFFFFF" d="M10.2 6.5c1.1-1 2.7-1.5 4.3-.9 1.4.5 2.4 1.8 2.7 3.3 1.5.3 2.8 1.4 3.1 3 .4 1.8-.6 3.6-2.3 4.1-.3.1-.7.2-1 .2H6.5c-2 0-3.5-1.6-3.5-3.5 0-1.7 1.2-3.2 2.9-3.4.4-1.6 1.9-2.7 3.6-2.8.3 0 .5 0 .7 0z" />
    </svg>
  ),

  // Adobe: Red with sharp geometric 'A'
  adobe: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="4" fill="#FA0F00" />
      <path fill="#FFFFFF" d="M14.7 4H20v16zm-5.4 0H4v16zm2.7 6.4l3.5 9.6h-2.5l-1.2-3.4H9.5l2.6-6.2z" />
    </svg>
  ),

  // Flipkart: Bright yellow badge with official blue shopping bag and italic 'f' with speed lines
  flipkart: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="5" fill="#FFE500" />
      <path
        fill="#2874F0"
        d="M6.5 7h11l-1.2 12.5a1.5 1.5 0 0 1-1.5 1.4H9.2a1.5 1.5 0 0 1-1.5-1.4L6.5 7z"
      />
      <path
        fill="#FFE500"
        d="M9.5 7V5.5A2.5 2.5 0 0 1 12 3a2.5 2.5 0 0 1 2.5 2.5V7h-1.5V5.5a1 1 0 0 0-1-1 1 1 0 0 0-1 1V7h-1.5z"
      />
      <path
        fill="#FFFFFF"
        d="M14.2 9.8c-.4-.3-.9-.4-1.5-.4h-1.6l-.3 1.7h1.4c.4 0 .7.1.8.3.1.2.2.4.1.7l-.3 1.5h-1.2l-.6 3.4H9.6l.6-3.4H9l.3-1.5h1.2l.4-2.1c.3-1.4 1.4-2.1 3-2.1.8 0 1.5.2 2 .5l-.7 1.4z"
      />
      <path fill="#2874F0" d="M8.2 10.5h1.2v.9H8.2zm-.6 1.8h1.2v.9H7.6z" />
    </svg>
  ),

  // PhonePe: Deep purple circle with authentic white Devanagari Pe
  phonepe: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <circle cx="12" cy="12" r="11" fill="#5F259F" />
      <path
        fill="#FFFFFF"
        d="M14.8 5.5c-1.2.8-2.6 1.6-4.2 2.1-.3.1-.5.3-.5.6v1.3c.7-.2 1.4-.5 2.2-.8v8.8h2.3V11c1.8-.7 3.1-2.2 3.1-4.2 0-.6-.4-1.3-.9-1.3zm0 3.8c-.5.3-1.1.5-1.7.7v-2c.6-.3 1.2-.6 1.7-.9.3.4.4.9.4 1.3 0 .3-.1.6-.4.9zM8.5 9h4.8v1.8H8.5z"
      />
    </svg>
  ),

  // Meesho: Magenta background with white 'm'
  meesho: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="5" fill="#84196B" />
      <path fill="#FFFFFF" d="M6 16V8h2.5l2.5 4 2.5-4H16v8h-2v-4.5l-2 3.2h-1L9 11.5V16H6z" />
    </svg>
  ),

  // CRED: Black shield with inner outline
  cred: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="5" fill="#18181B" />
      <path fill="none" stroke="#FFFFFF" strokeWidth="1.8" d="M6 6h12v7c0 4-4 7-6 8-2-1-6-4-6-8V6z" />
      <path fill="#FFFFFF" d="M10 10h4v2h-4z" />
    </svg>
  ),

  // Razorpay: Slanted razor lightning mark
  razorpay: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="4" fill="#0C2340" />
      <path fill="#3395FF" d="M12.5 3L6 14h5l-2 7 8.5-12h-5l2-6z" />
    </svg>
  ),

  // Zomato: Vibrant Red with rounded white 'zomato' wordmark
  zomato: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="5" fill="#E23744" />
      <path
        fill="#FFFFFF"
        d="M5 14.5l3.2-4.2H5.2V9h4.3l-3.2 4.2h3.3v1.3H5zm6.2-4.3c1.3 0 2.2 1 2.2 2.3s-.9 2.3-2.2 2.3-2.2-1-2.2-2.3 1-2.3 2.2-2.3zm0 1.2c-.6 0-1 .5-1 1.1s.4 1.1 1 1.1 1-.5 1-1.1-.4-1.1-1-1.1zm3.8 4.3v-4.1h1.1v.6c.3-.4.8-.7 1.5-.7.6 0 1 .3 1.3.7.4-.5.9-.7 1.5-.7 1 0 1.7.7 1.7 1.9v2.3h-1.2v-2.1c0-.6-.3-.9-.8-.9s-.8.4-.8 1v2h-1.2v-2.1c0-.6-.3-.9-.8-.9s-.8.4-.8 1v2H15z"
      />
    </svg>
  ),

  // Swiggy: Vibrant Orange with delivery location pin
  swiggy: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="5" fill="#FC8019" />
      <path fill="#FFFFFF" d="M12 4c-3.3 0-6 2.7-6 6 0 4.5 6 10 6 10s6-5.5 6-10c0-3.3-2.7-6-6-6zm0 8.5c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z" />
    </svg>
  ),

  // Zepto: Deep purple/magenta container with electric pink 'zepto' wordmark
  zepto: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="5" fill="#3B0066" />
      <path
        fill="#FF2E74"
        d="M4.5 14.5l3-4H4.8V9.2h4.2l-3 4h3.3v1.3H4.5zm5.5-2.7c0-1.5 1-2.6 2.4-2.6 1.4 0 2.3 1.1 2.3 2.6v.3h-3.4c.1.6.6 1 1.3 1 .6 0 1-.2 1.3-.5l.8.8c-.5.6-1.2.9-2.1.9-1.6 0-2.6-1.1-2.6-2.5zm3.4-.6c0-.5-.4-.9-1.1-.9-.6 0-1 .4-1.1.9h2.2zm2.6 4.5V10.4h1.2v.6c.3-.4.8-.7 1.5-.7 1.1 0 2.1 1 2.1 2.5 0 1.6-1 2.6-2.1 2.6-.6 0-1.1-.3-1.4-.7v2.1h-1.3zm2.4-2.3c.7 0 1.1-.5 1.1-1.3 0-.8-.4-1.3-1.1-1.3s-1.1.5-1.1 1.3.4 1.3 1.1 1.3z"
      />
    </svg>
  ),

  // Paytm: Authentic two-tone cyan and white wordmark on deep navy
  paytm: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="5" fill="#002E6E" />
      <path
        fill="#FFFFFF"
        d="M4 15.5V8.5h2.8c1.6 0 2.6.9 2.6 2.3s-1 2.3-2.6 2.3H5.6v2.4H4zm1.6-3.8h1.1c.7 0 1.2-.4 1.2-1s-.5-1-1.2-1H5.6v2zm4.4 3.8l1.6-4.8h1.4l1.6 4.8h-1.4l-.3-1h-1.6l-.3 1H10zm1.7-2.1h1.1l-.5-1.8-.6 1.8z"
      />
      <path
        fill="#00BAF2"
        d="M16 15.5V10.2h-1.3V9h3.8v1.2h-1.3v5.3H16zm3.5 0V9h1.3l1.2 2.8L23.2 9h1.3v6.5h-1.2v-4.1l-1.1 2.6h-.6l-1.1-2.6v4.1h-1.5z"
      />
    </svg>
  ),

  // ServiceNow: Dark teal with digital green house arc
  servicenow: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="4" fill="#032D42" />
      <circle cx="12" cy="12" r="6" fill="none" stroke="#81B5A1" strokeWidth="2.5" />
      <circle cx="12" cy="12" r="2.5" fill="#81B5A1" />
    </svg>
  ),

  // Intuit: Royal blue with 'intuit'
  intuit: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="4" fill="#0077C5" />
      <text x="12" y="15" fill="#FFFFFF" fontSize="6.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">intuit</text>
    </svg>
  ),

  // Walmart: Royal Blue with Yellow 6-Petal Spark
  walmart: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="4" fill="#0071CE" />
      <path fill="#FFC220" d="M12 4v4m0 8v4m-8-8h4m8 0h4m-11.5-5.5l2.8 2.8m5.7 5.7l2.8 2.8m-11.3 0l2.8-2.8m5.7-5.7l2.8-2.8" stroke="#FFC220" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),

  // Goldman Sachs: Sky blue square with serif typography
  'goldman-sachs': () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="4" fill="#7399C6" />
      <text x="12" y="11" fill="#FFFFFF" fontSize="4.2" fontWeight="800" textAnchor="middle" fontFamily="serif">Goldman</text>
      <text x="12" y="16" fill="#FFFFFF" fontSize="4.2" fontWeight="800" textAnchor="middle" fontFamily="serif">Sachs</text>
    </svg>
  ),

  // J.P. Morgan Chase: Brown octagon / serif typography
  'jp-morgan-chase': () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="4" fill="#695240" />
      <text x="12" y="11" fill="#FFFFFF" fontSize="4" fontWeight="800" textAnchor="middle" fontFamily="serif">J.P. Morgan</text>
      <text x="12" y="16" fill="#D4AF37" fontSize="3.5" fontWeight="700" textAnchor="middle" fontFamily="serif">CHASE</text>
    </svg>
  ),

  // Morgan Stanley: Navy Blue with geometric triangular prism symbol and clean typography
  'morgan-stanley': () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="5" fill="#002B49" />
      <polygon points="12,4 6,14 18,14" fill="#0072CE" />
      <polygon points="12,7 8,14 16,14" fill="#00A3E0" />
      <text x="12" y="18.5" fill="#FFFFFF" fontSize="3.2" fontWeight="900" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.4">MORGAN STANLEY</text>
    </svg>
  ),

  // Oracle: Bold Red Oval "O"
  oracle: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="4" fill="#C74634" />
      <path fill="#FFFFFF" d="M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 9.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" />
    </svg>
  ),

  // Cisco: Cyan Bridge bars
  cisco: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="4" fill="#003554" />
      <path fill="#049FD9" d="M5 14v-4m2 6v-8m2 10V6m2 12V4m2 14V4m2 12V6m2 10v-8m2 6v-4" stroke="#049FD9" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),

  // Visa: Classic dark blue badge with gold/yellow wing on 'V'
  visa: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="5" fill="#1A1F71" />
      <path
        fill="#F7B600"
        d="M4.8 9.2h3.4l-.8 4.2H5.8c-.3 0-.6-.1-.8-.4-.4-.5-.8-1.7-.8-1.7l.6-2.1z"
      />
      <path
        fill="#FFFFFF"
        d="M7.4 9.2l2.3 6.3h2.3l3.5-6.3h-2.3l-2.1 4.2-1.3-4.2H7.4zm7.6 6.3l1.8-6.3h2l-1.8 6.3h-2zm4.5-4.2c-.3-.2-.7-.4-1.2-.4-.8 0-1.3.4-1.3.9 0 .5.5.7 1.1.9.9.3 1.5.8 1.5 1.7 0 1.2-1.1 2.2-2.7 2.2-.8 0-1.5-.2-2-.5l.4-1.4c.4.3.9.5 1.5.5.7 0 1.2-.3 1.2-.8 0-.4-.4-.7-1-.9-.9-.3-1.6-.7-1.6-1.7 0-1.1 1-2.1 2.5-2.1.7 0 1.3.2 1.7.4l-.4 1.2z"
      />
    </svg>
  ),

  // Mastercard: Interlocking Red and Yellow solid circles
  mastercard: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="4" fill="#222222" />
      <circle cx="9" cy="12" r="5.5" fill="#EB001B" />
      <circle cx="15" cy="12" r="5.5" fill="#F79E1B" fillOpacity="0.9" />
    </svg>
  ),

  // Barclays: Sky blue eagle silhouette
  barclays: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="4" fill="#002D62" />
      <path fill="#00AEEF" d="M12 5l2 3h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z" />
    </svg>
  ),

  // HSBC: Red & white interlocking hexagon
  hsbc: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="4" fill="#FFFFFF" />
      <path fill="#DB0011" d="M4 12l4-4v8zm16 0l-4-4v8zm-8-4l4 4-4 4-4-4z" />
    </svg>
  ),

  // Accenture: Purple > chevron
  accenture: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="4" fill="#000000" />
      <path fill="#A100FF" d="M9 6l6 6-6 6-2-2 4-4-4-4z" />
    </svg>
  ),

  // TCS: Tata Consultancy Services corporate blue badge with crisp typography
  tcs: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="5" fill="#002D62" />
      <text x="12" y="9.5" fill="#FFFFFF" fontSize="3.8" fontWeight="900" textAnchor="middle" fontFamily="sans-serif" letterSpacing="1.5">TATA</text>
      <rect x="4" y="11.5" width="16" height="0.8" fill="#00A3E0" rx="0.4" />
      <text x="12" y="17.5" fill="#FFFFFF" fontSize="4.8" fontWeight="900" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.8">TCS</text>
    </svg>
  ),

  // Infosys: Official Infosys corporate blue badge with iconic typography
  infosys: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="5" fill="#007CC3" />
      <path
        fill="#FFFFFF"
        d="M4.5 15.5V10.2h1.5v5.3H4.5zm.8-6.6c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm2.4 6.6v-3.7h1.3v.6c.3-.4.8-.7 1.5-.7 1.2 0 1.8.8 1.8 2.1v2.9h-1.5v-2.7c0-.6-.3-.9-.8-.9s-.9.3-.9.9v2.7H7.7zm6.8-5.3h1.2v.9h-1.2v2.7c0 .4.2.6.6.6h.6v1.1h-.9c-1.1 0-1.7-.5-1.7-1.5v-2.9h-.8v-.9h.8v-1.1l1.4-.4v1.5zm2.9 5.4c-1.3 0-2.2-1-2.2-2.3s.9-2.3 2.2-2.3 2.2 1 2.2 2.3-.9 2.3-2.2 2.3zm0-1.1c.6 0 1-.5 1-1.2s-.4-1.2-1-1.2-1 .5-1 1.2.4 1.2 1 1.2zm3.3 1v-.8c.4.5 1 .9 1.7.9 1 0 1.6-.6 1.6-1.4 0-1.4-1.9-1.2-1.9-1.8 0-.3.2-.5.6-.5.4 0 .7.1 1 .3l.4-.9c-.4-.3-.8-.4-1.4-.4-1 0-1.6.6-1.6 1.4 0 1.3 1.9 1.2 1.9 1.8 0 .3-.3.5-.6.5-.5 0-.9-.2-1.2-.5v.9h-.5z"
      />
    </svg>
  ),

  // Cognizant: Cyan/blue circular digital C
  cognizant: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="4" fill="#0033A0" />
      <circle cx="12" cy="12" r="5" fill="none" stroke="#00A3E0" strokeWidth="2.5" strokeDasharray="24 6" />
    </svg>
  ),

  // Wipro: Rainbow dot circle with 'wipro'
  wipro: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="4" fill="#FFFFFF" />
      <circle cx="12" cy="12" r="6" fill="none" stroke="#3F51B5" strokeWidth="1.8" />
      <text x="12" y="14" fill="#212121" fontSize="4.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">wipro</text>
    </svg>
  ),

  // HCLTech: Vibrant violet to cyan-accented modern tech wordmark
  hcltech: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <defs>
        <linearGradient id="hclGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F148B" />
          <stop offset="100%" stopColor="#0B1A4D" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="5" fill="url(#hclGrad)" />
      <text x="12" y="13" fill="#FFFFFF" fontSize="4.2" fontWeight="900" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.8">HCL</text>
      <text x="12" y="17.5" fill="#00D2D3" fontSize="3" fontWeight="800" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.5">Tech</text>
    </svg>
  ),

  // Tech Mahindra: Crimson red geometric blocks
  'tech-mahindra': () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="4" fill="#E11D48" />
      <rect x="6" y="7" width="5" height="5" fill="#FFFFFF" />
      <rect x="13" y="12" width="5" height="5" fill="#FFFFFF" />
    </svg>
  ),

  // Capgemini: Blue spade / seed
  capgemini: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="4" fill="#0070AD" />
      <path fill="#FFFFFF" d="M12 5c-2.5 3-5 5-5 7.5 0 2.5 2 4.5 4.5 4.5h1c2.5 0 4.5-2 4.5-4.5 0-2.5-2.5-4.5-5-7.5z" />
    </svg>
  ),

  // Airbnb: Coral red Bélo icon
  airbnb: () => (
    <svg viewBox="0 0 24 24" fill="#FF5A5F" className="w-full h-full">
      <path d="M12 2C7.5 2 4 5.5 4 10c0 4.5 4 8 8 12 4-4 8-7.5 8-12 0-4.5-3.5-8-8-8zm0 10c-1.5 0-2.5-1-2.5-2.5S10.5 7 12 7s2.5 1 2.5 2.5S13.5 12 12 12z" />
    </svg>
  ),

  // ByteDance: Cyan/Blue bars
  bytedance: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="4" fill="#000000" />
      <path fill="#00F2FE" d="M6 7l4-3v16l-4-3zm8 0l4-3v16l-4-3z" />
    </svg>
  ),

  // Samsung: Iconic deep blue tilted oval with white cutout lettering
  samsung: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect width="24" height="24" rx="5" fill="#0A1128" />
      <g transform="rotate(-12 12 12)">
        <ellipse cx="12" cy="12" rx="10.5" ry="5.8" fill="#1428A0" />
        <text x="12" y="13.7" fill="#FFFFFF" fontSize="3.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.6">SAMSUNG</text>
      </g>
    </svg>
  )
};

// Aliases for brand vectors
BrandVectors['filpkart'] = BrandVectors.flipkart;
BrandVectors['phonepay'] = BrandVectors.phonepe;
BrandVectors['infosis'] = BrandVectors.infosys;
BrandVectors['deshaw'] = BrandVectors['de-shaw'];
BrandVectors['hcl'] = BrandVectors.hcltech;
BrandVectors['hcl-tech'] = BrandVectors.hcltech;

export const CompanyBrandLogo = ({
  companyName = '',
  logoUrl = '',
  size = 'md',
  showContainer = false,
  className = ''
}) => {
  const slug = normalizeCompanySlug(companyName);

  const sizeClasses = {
    xs: 'w-5 h-5 min-w-[20px] min-h-[20px] text-[10px]',
    sm: 'w-7 h-7 min-w-[28px] min-h-[28px] text-xs',
    md: 'w-10 h-10 min-w-[40px] min-h-[40px] text-sm',
    lg: 'w-12 h-12 min-w-[48px] min-h-[48px] text-base',
    xl: 'w-14 h-14 min-w-[56px] min-h-[56px] text-lg'
  }[size] || 'w-10 h-10 text-sm';

  const containerSizes = {
    xs: 'p-1 rounded-lg',
    sm: 'p-1.5 rounded-xl',
    md: 'p-2 rounded-2xl',
    lg: 'p-2.5 rounded-2xl',
    xl: 'p-3 rounded-2xl'
  }[size] || 'p-2 rounded-2xl';

  const LogoComponent = BrandVectors[slug];

  const content = LogoComponent ? (
    <LogoComponent />
  ) : logoUrl ? (
    <img
      src={logoUrl}
      alt={`${companyName} logo`}
      className="w-full h-full object-contain rounded-md"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  ) : (
    <div className="w-full h-full rounded-md bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-black flex items-center justify-center text-[11px] tracking-tight uppercase shadow-xs">
      {companyName.slice(0, 2)}
    </div>
  );

  if (showContainer) {
    return (
      <div
        className={`${sizeClasses} ${containerSizes} bg-slate-900/80 dark:bg-slate-800 border border-slate-700/60 shadow-md flex items-center justify-center shrink-0 select-none overflow-hidden transition-all duration-200 ${className}`}
        title={companyName}
      >
        <div className="w-full h-full flex items-center justify-center">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses} flex items-center justify-center shrink-0 select-none overflow-hidden ${className}`}
      title={companyName}
    >
      {content}
    </div>
  );
};

export default CompanyBrandLogo;
