// src/app/page.tsx - COMPLETE FINAL LANDING PAGE CODE
// - Tokenomics under Tiers, above Roadmap
// - Footer with Terms of Service link
// - All previous fixes included

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Landing() {
  const [openTier, setOpenTier] = useState<number | null>(null);

  const tiers = [
    {
      name: 'Observer',
      staking: '10,000 $COG',
      price: 'Free',
      image: '/observer.png',
      benefits: [
        'Basic analytics tools',
        'Community access',
        'Limited API calls',
        'Dashboard access',
      ],
    },
    {
      name: 'Observer+',
      staking: '10,000 $COG',
      price: '$5/mo (USDC)',
      image: '/observer-plus.png',
      benefits: [
        'Everything in Observer',
        'Higher rate limits',
        'Priority support',
        'Early feature access',
      ],
    },
    {
      name: 'Analyst',
      staking: '100,000 $COG',
      price: '$19/mo (USDC)',
      image: '/analyst.png',
      benefits: [
        'Advanced analytics suite',
        'Custom dashboards',
        'Real-time alerts & notifications',
        'Full API access',
        'Exclusive research reports',
      ],
    },
    {
      name: 'Architect',
      staking: '1,000,000 $COG',
      price: '$59/mo (USDC)',
      image: '/architect.png',
      benefits: [
        'Unlimited usage across all tools, scans, alerts, and dashboards',
        'Priority processing',
        'Priority access to new features (includes future advanced analytics, bots, mobile apps, and upgrades)',
        'Full dedicated AI responses (toggleable)',
      ],
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-cyan-500/20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3">
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
            </div>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <div className="text-center py-12 scroll-reveal">
            <Image
              src="/cogni-logo.png"
              alt="Cogni Logo"
              width={320}
              height={320}
              className="mx-auto mb-8"
              priority
            />
            <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">
              Cogni ($COG)
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300">
              Intelligence-First Token-Gated Crypto SaaS Platform
            </p>
          </div>

          {/* Downloads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 scroll-reveal">
            <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-cyan-500/20 shadow-xl flex flex-col">
              <h2 className="text-2xl font-bold mb-4 text-center">Whitepaper</h2>
              <p className="text-gray-400 text-center flex-grow">
                Full vision, tiers, staking, roadmap, and tokenomics.
              </p>
              <a
                href="/whitepaper.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto block px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/50 hover:scale-105 transition-all text-center text-lg"
              >
                Download Whitepaper
              </a>
            </div>
            <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-cyan-500/20 shadow-xl flex flex-col">
              <h2 className="text-2xl font-bold mb-4 text-center">Master Handbook</h2>
              <p className="text-gray-400 text-center flex-grow">
                Guide to using Cogni tools, scanner tips, tier benefits, and degen strategies.
              </p>
              <a
                href="/handbook.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto block px-6 py-4 bg-gradient-to-r from-cyan-600 to-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/50 hover:scale-105 transition-all text-center text-lg"
              >
                Download Handbook
              </a>
            </div>
          </div>

          {/* Tiers */}
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 sm:p-12 mb-20 border border-cyan-500/20 shadow-xl scroll-reveal">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">Tiers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {tiers.map((tier, index) => (
                <div
                  key={index}
                  className="bg-gray-800/80 rounded-xl shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-500 group"
                  onClick={() => setOpenTier(openTier === index ? null : index)}
                >
                  <div className="relative">
                    <Image
                      src={tier.image}
                      alt={`${tier.name} Tier Badge`}
                      width={300}
                      height={400}
                      className="w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4">
                      <span className="text-white text-lg font-bold">Click for details</span>
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">{tier.name}</h3>
                    <p className="text-base mb-2">{tier.staking}</p>
                    <p className="text-sm text-gray-400 mb-4">{tier.price}</p>
                  </div>
                  <div className={`overflow-hidden transition-all duration-700 ease-in-out ${openTier === index ? 'max-h-96' : 'max-h-0'}`}>
                    <div className="px-6 pb-6 text-left text-sm space-y-2 text-gray-300">
                      {tier.benefits.map((benefit, i) => (
                        <p key={i} className="flex items-center gap-2">
                          <span className="text-cyan-400">✓</span> {benefit}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tokenomics - Under Tiers, Above Roadmap */}
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 sm:p-12 mb-20 border border-cyan-500/20 shadow-xl scroll-reveal">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">Tokenomics</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm sm:text-base">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-4 px-6">Allocation</th>
                    <th className="py-4 px-6">Percentage</th>
                    <th className="py-4 px-6">Amount</th>
                    <th className="py-4 px-6">Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors duration-200">
                    <td className="py-4 px-6">Initial Liquidity</td>
                    <td className="py-4 px-6">10%</td>
                    <td className="py-4 px-6">100,000,000 $COG</td>
                    <td className="py-4 px-6">Minimal pairing; burned LP for trust</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors duration-200">
                    <td className="py-4 px-6">Post-MVP Liquidity Reserve</td>
                    <td className="py-4 px-6">30%</td>
                    <td className="py-4 px-6">300,000,000 $COG</td>
                    <td className="py-4 px-6">Major Injection when MVP live (Utility boost)</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors duration-200">
                    <td className="py-4 px-6">Ecosystem Treasury</td>
                    <td className="py-4 px-6">20%</td>
                    <td className="py-4 px-6">200,000,000 $COG</td>
                    <td className="py-4 px-6">Runway → revenue reinvestment</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors duration-200">
                    <td className="py-4 px-6">Community Incentives</td>
                    <td className="py-4 px-6">15%</td>
                    <td className="py-4 px-6">150,000,000 $COG</td>
                    <td className="py-4 px-6">Airdrops (inc. 300 wallets) rewards</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors duration-200">
                    <td className="py-4 px-6">Future Hires/Expenses Reserve</td>
                    <td className="py-4 px-6">10%</td>
                    <td className="py-4 px-6">100,000,000 $COG</td>
                    <td className="py-4 px-6">Flexible for devs/scaling</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors duration-200">
                    <td className="py-4 px-6">Founders Allocation</td>
                    <td className="py-4 px-6">7%</td>
                    <td className="py-4 px-6">70,000,000 $COG</td>
                    <td className="py-4 px-6">12 month linear vest</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors duration-200">
                    <td className="py-4 px-6">Team & Dev Allocation</td>
                    <td className="py-4 px-6">5%</td>
                    <td className="py-4 px-6">50,000,000 $COG</td>
                    <td className="py-4 px-6">12 month linear vest</td>
                  </tr>
                  <tr className="hover:bg-gray-800/50 transition-colors duration-200">
                    <td className="py-4 px-6">Marketing Reserve</td>
                    <td className="py-4 px-6">3%</td>
                    <td className="py-4 px-6">30,000,000 $COG</td>
                    <td className="py-4 px-6">Profitable growth post-revenue</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Living Roadmap */}
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 sm:p-12 mb-20 border border-cyan-500/20 shadow-xl scroll-reveal">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">Living Roadmap</h2>
            <ul className="text-left text-base sm:text-lg space-y-4 sm:space-y-6 max-w-3xl mx-auto">
              <li>✓ Fresh ERC-20 token mint</li>
              <li>✓ NFT Designs</li>
              <li>✓ Smart contracts (Staking and NFT tiers mint/burn)</li>
              <li>→ MVP Beta (Q1 2026) — Full tool suite</li>
              <li>→ Initial / Major LP Injection (Q1 2026)</li>
              <li>→ Mobile App (Q3 2026)</li>
              <li>→ Governance & Profit Sharing (Q4 2026)</li>
            </ul>
          </div>

          {/* Footer - WITH TERMS LINK */}
          <footer className="text-center py-12">
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mb-6">
              <a href="https://x.com/cognibase" target="_blank" rel="noopener noreferrer" className="text-xl sm:text-2xl font-bold hover:text-cyan-600 transition group relative inline-block">
                X: @cognibase
                <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-400/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </a>
              <a href="https://t.me/cognibasecommunity" target="_blank" rel="noopener noreferrer" className="text-xl sm:text-2xl font-bold hover:text-cyan-600 transition group relative inline-block">
                Telegram: t.me/cognibasecommunity
                <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-400/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </a>
            </div>
            <div className="text-base sm:text-lg space-y-4">
              <div>
                Contact: <a href="mailto:Founder@CogniBaseAI.io" className="text-cyan-600 hover:underline group relative inline-block">
                  Founder@CogniBaseAI.io
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-400/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </a>
              </div>
              <div>
                <Link href="/terms" className="text-gray-400 hover:text-cyan-400 transition">
                  Terms of Service
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}