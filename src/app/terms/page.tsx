// src/app/terms/page.tsx - UPDATED TERMS OF SERVICE (WITH BACK TO HOME LINK)
'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Terms() {
  return (
    <main className="min-h-screen bg-black text-white py-20 px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back to Home Link */}
        <div className="mb-12 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-3 text-cyan-400 hover:text-cyan-300 transition-all duration-300 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        <h1 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-orange-500 to-cyan-500 bg-clip-text text-transparent">
          Terms of Service
        </h1>

        <div className="space-y-8 text-lg leading-relaxed text-gray-300">
          <section>
            <h2 className="text-3xl font-bold mb-4 text-cyan-400">1. Acceptance of Terms</h2>
            <p>By accessing or using the Cogni platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, you may not use the Service.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-cyan-400">2. Description of Service</h2>
            <p>Cogni is an intelligence-first token-gated crypto analytics platform built on Base Chain. The Service provides token scanning, AI analysis, and tiered access features to verified $COG holders and paid subscribers.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-cyan-400">3. Eligibility</h2>
            <p>You must be at least 18 years old to use the Service. By using Cogni, you represent and warrant that you meet this age requirement and have full legal capacity to enter into these Terms.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-cyan-400">4. User Conduct</h2>
            <p>You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, or impair the Service. Prohibited activities include attempting to reverse engineer, scrape data, or interfere with other users' experience.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-cyan-400">5. Intellectual Property</h2>
            <p>All content, features, and functionality of the Service are owned by Cogni and protected by international copyright, trademark, and other intellectual property laws.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-cyan-400">6. Disclaimer of Warranties</h2>
            <p>The Service is provided "as is" without warranties of any kind. Cogni does not guarantee the accuracy of token scans, AI responses, or market data. Cryptocurrency investments carry risk – use at your own discretion.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-cyan-400">7. Limitation of Liability</h2>
            <p>Cogni shall not be liable for any indirect, incidental, or consequential damages arising from use of the Service. Total liability shall not exceed the amount paid by you in the past 12 months.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-cyan-400">8. Governing Law</h2>
            <p>These Terms shall be governed by the laws of the Cayman Islands without regard to conflict of law principles.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-cyan-400">9. Changes to Terms</h2>
            <p>Cogni reserves the right to modify these Terms at any time. Continued use of the Service constitutes acceptance of updated Terms.</p>
          </section>

          <p className="text-center text-gray-500 mt-16">Last updated: January 6, 2026</p>
        </div>
      </div>
    </main>
  );
}