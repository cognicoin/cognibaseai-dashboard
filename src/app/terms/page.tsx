// src/app/terms/page.tsx - COMPLETE FINAL TERMS OF SERVICE PAGE
'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Terms() {
  return (
    <>
      {/* Navbar - Same as Landing Page */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-cyan-500/20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/cogni-logo.png" 
                alt="Cogni Logo" 
                width={96} 
                height={96} 
                className="rounded-lg logo-glow" 
                priority 
              />
              <span className="text-xl sm:text-2xl font-bold text-white">
                Cogni ($COG)
              </span>
            </Link>
          </div>

          <div className="w-full sm:w-auto">
            <Link
              href="/dashboard"
              className="relative block px-8 py-3 bg-gradient-to-r from-orange-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg
                         hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 hover:from-orange-500 hover:to-cyan-500
                         transition-all duration-500 ease-out overflow-hidden group text-center"
            >
              <span className="relative z-10 text-lg">Enter Dashboard</span>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-400/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </Link>
          </div>
        </div>
      </nav>

      <main className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">
            Terms of Service
          </h1>

          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 sm:p-12 border border-cyan-500/20 shadow-2xl space-y-10 text-gray-300 leading-relaxed">
            <p className="text-sm text-gray-500 text-center">Last Updated: January 04, 2026</p>

            <section>
              <p>
                Welcome to <strong>CogniBaseAI</strong> (the "Site" at https://cognibaseai.io and associated dashboard, collectively the "Services"). 
                The Services are operated by CogniBaseAI ("we," "us," or "our").
              </p>
              <p className="mt-4">
                By accessing or using the Site or Services, you agree to be bound by these Terms of Service ("Terms"). 
                If you do not agree, you must not use the Site or Services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">1. Nature of Services</h2>
              <p>
                CogniBaseAI is an intelligence-first, token-gated crypto analytics platform. Features include:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Token security scanning (powered by third-party APIs such as GoPlus Labs)</li>
                <li>AI-generated token summaries (powered by Groq)</li>
                <li>$COG token staking and tier-based access</li>
                <li>On-chain analytics dashboards</li>
              </ul>
              <p className="mt-4">
                All information provided is for <strong>informational purposes only</strong> and does not constitute financial, investment, tax, or legal advice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">2. Eligibility</h2>
              <p>
                You must be at least 18 years old and capable of forming a binding contract. Use of the Services is void where prohibited by law. 
                You are responsible for complying with laws in your jurisdiction regarding cryptocurrency and related activities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">3. Wallet Connection and Token Gating</h2>
              <p>
                Access to premium features requires connecting a non-custodial wallet and holding sufficient $COG tokens.
              </p>
              <p className="mt-4">
                We do not custody private keys or control your funds. You retain full responsibility for wallet security.
              </p>
              <p className="mt-4">Tier status is determined by on-chain staking data at the time of access.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">4. User Conduct</h2>
              <p>You agree not to:</p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Use the Services for illegal purposes</li>
                <li>Attempt to interfere with, hack, or reverse-engineer the Services</li>
                <li>Impersonate others or provide false information</li>
                <li>Use automated scripts or bots without permission</li>
                <li>Distribute spam or malicious content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">5. Third-Party Services and Data</h2>
              <p>
                Token scanning relies on GoPlus Labs API. Results are informational only and may contain false positives or negatives.
              </p>
              <p className="mt-4">
                AI summaries are generated by Groq models and may be inaccurate. Always perform your own research (DYOR).
              </p>
              <p className="mt-4">We are not liable for errors, omissions, or actions taken based on third-party data.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">6. Intellectual Property</h2>
              <p>
                All content, code, designs, and trademarks on the Site and Services are owned by us or our licensors. 
                You may not copy, modify, distribute, or create derivative works without written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">7. Disclaimers</h2>
              <p>
                <strong>No Financial Advice</strong>: Nothing on the Site or Services constitutes investment advice. 
                Cryptocurrency is high-risk; you may lose all invested funds.
              </p>
              <p className="mt-4">
                <strong>As-Is Service</strong>: The Services are provided "as is" without warranties of any kind.
              </p>
              <p className="mt-4">
                <strong>No Guarantee of Accuracy</strong>: Scanner results, AI summaries, and analytics may be incorrect or incomplete.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">8. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, CogniBaseAI, its affiliates, and team members shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">9. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless CogniBaseAI and its team from any claims, losses, or damages arising from your violation of these Terms or misuse of the Services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">10. Termination</h2>
              <p>
                We may suspend or terminate your access to the Services at any time, without notice, for conduct that violates these Terms or is harmful to other users or the project.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">11. Changes to Terms</h2>
              <p>
                We may update these Terms at any time. Continued use of the Services after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">12. Governing Law</h2>
              <p>
                These Terms are governed by the laws of the Cayman Islands, without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">13. Contact</h2>
              <p>
                For questions about these Terms, contact: 
                <a href="mailto:founder@cognibaseai.io" className="text-cyan-400 hover:underline"> founder@cognibaseai.io</a>
              </p>
            </section>

            <p className="text-center mt-12 text-gray-500">
              By using CogniBaseAI, you acknowledge that you have read, understood, and agree to these Terms of Service.
            </p>
          </div>

          {/* Back to Home Link */}
          <div className="text-center mt-12">
            <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition text-lg">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}