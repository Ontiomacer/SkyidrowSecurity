import React, { useState } from 'react';
import { Info, Lock, ChevronDown, ChevronUp } from 'lucide-react';

const securityHeaders = [
  { key: 'Content-Security-Policy', value: `object-src 'none';base-uri 'self';script-src 'nonce-PKiHrbG8BKyohAJnIO2FaQ' 'strict-dynamic' 'report-sample' 'unsafe-eval' 'unsafe-inline' https://report-uri https://csp.withgoogle.com/csp/honest_dns/1.0;frame-ancestors 'none'` },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'Server', value: 'scaffolding on HTTPServer2' },
  { key: 'X-XSS-Protection', value: '0' },
  { key: 'Date', value: 'Sat, 05 Jul 2025 18:48:17 GMT' },
  { key: 'Expires', value: 'Sat, 05 Jul 2025 10:53:17 GMT' },
  { key: 'Cache-Control', value: 'public, max-age=300' },
  { key: 'Content-Type', value: 'text/html; charset=UTF-8' },
  { key: 'Alt-Svc', value: 'h3=":443"; ma=2592000,h3-29=":443"; ma=2592000' },
  { key: 'Transfer-Encoding', value: 'chunked' },
];

const certificate = {
  cn: 'dns.google',
  san: ['dns.google', '8.8.8.8'],
  issuer: 'GTS CA 1O1',
  validFrom: '2025-06-01 00:00:00 GMT',
  validTo: '2026-06-01 23:59:59 GMT',
  serial: '04:AB:CD:12:34:56:78:90',
  sigAlg: 'SHA256withRSA',
  publicKey: 'RSA 2048-bit',
};

export default function HttpsPanel() {
  const [showHeaders, setShowHeaders] = useState(true);
  const [showCert, setShowCert] = useState(true);
  const lastChecked = '2025-07-05T10:52:41.367900Z';
  return (
    <div className="bg-[#181c23] rounded-xl border-l-8 border-blue-500/90 shadow-lg mt-6 p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <img src="https://www.gstatic.com/images/branding/product/1x/googleg_32dp.png" alt="Google" className="h-7 w-7 rounded-full bg-white" />
          <span className="text-2xl font-bold text-white tracking-wide">Google Public DNS</span>
          <span className="ml-3 px-2 py-1 rounded bg-blue-900 text-blue-300 text-xs font-mono">443 / TCP</span>
        </div>
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-300" />
          <span className="text-xs text-gray-400 font-mono">Last checked: {new Date(lastChecked).toLocaleString()}</span>
        </div>
      </div>
      <div className="text-blue-400 font-mono text-sm mb-2 ml-1">HTTP/1.1 200 OK</div>

      {/* Collapsible Security Headers */}
      <div className="mb-4">
        <button
          className="flex items-center gap-2 text-blue-300 hover:text-blue-200 text-base font-semibold focus:outline-none"
          onClick={() => setShowHeaders(v => !v)}
        >
          <Lock className="h-5 w-5" />
          Security Headers
          {showHeaders ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showHeaders && (
          <div className="mt-2 bg-[#10141a] rounded-lg border border-blue-900 p-4 overflow-x-auto">
            <pre className="text-xs text-blue-200 font-mono whitespace-pre-wrap">
{securityHeaders.map(h => `${h.key}: ${h.value}`).join('\n')}
            </pre>
          </div>
        )}
      </div>

      {/* Collapsible SSL Certificate */}
      <div className="mb-2">
        <button
          className="flex items-center gap-2 text-green-300 hover:text-green-200 text-base font-semibold focus:outline-none"
          onClick={() => setShowCert(v => !v)}
        >
          <span className="text-lg">🔐</span>
          SSL Certificate
          {showCert ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showCert && (
          <div className="mt-2 bg-[#10141a] rounded-lg border border-green-900 p-4 overflow-x-auto">
            <pre className="text-xs text-green-200 font-mono whitespace-pre-wrap">
Common Name (CN): {certificate.cn}
Subject Alt Names: {certificate.san.join(', ')}
Issuer: {certificate.issuer}
Valid From: {certificate.validFrom}
Valid To: {certificate.validTo}
Serial Number: {certificate.serial}
Signature Algorithm: {certificate.sigAlg}
Public Key: {certificate.publicKey}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
