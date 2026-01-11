// src/app/page.tsx - FINAL COMPLETE LANDING PAGE
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import Navbar from '@/components/Navbar';

export const dynamic = 'force-dynamic';

export default function Landing() {
  const [expandedTier, setExpandedTier] = useState<string | null>(null);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isDark, setIsDark] = useState(true);

  // Dark/Light Mode Toggle
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved ? saved === 'dark' : prefersDark;
    setIsDark(initial);
    document.documentElement.classList.toggle('dark', initial);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDark);
  };

  const flowSteps = [
    {
      title: 'Stake $COG',
      short: 'Lock tokens to unlock base tier',
      details: 'Stake at least 10,000 $COG in the dashboard to automatically earn the Observer tier and badge NFT. Higher stakes unlock better base access before subscription.',
      icon: (
        <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-orange-600 to-orange-400',
    },
    {
      title: 'Token-Gated Access',
      short: 'Gain entry to core tools',
      details: 'Your staked $COG acts as a key — immediately granting access to the token scanner, AI chat, Dune dashboards, and community features based on your tier.',
      icon: (
        <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-cyan-600 to-blue-500',
    },
    {
      title: 'Pay Subscription',
      short: 'Upgrade for higher tiers',
      details: 'Subscribe monthly (paid in stablecoin) while maintaining your stake to upgrade to Observer+, Analyst, or Architect for more scans and advanced tools.',
      icon: (
        <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      gradient: 'from-purple-600 to-pink-500',
    },
    {
      title: 'Access Tools',
      short: 'Unlimited analytics & AI',
      details: 'Enjoy full platform power: unlimited scans, priority AI, custom alerts, API access, founder support, and first dibs on new features (Architect tier).',
      icon: (
        <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      gradient: 'from-green-600 to-teal-500',
    },
  ];

  const tiers = [
    {
      name: 'Observer',
      badge: '/observer.png',
      stake: '10,000 $COG staked',
      price: 'Free',
      scans: '5 daily',
      color: 'from-gray-700 to-gray-500',
      border: 'hover:border-gray-400',
      shortDetails: ['Token scanner', 'AI chat', 'Dune metrics', 'Badge NFT'],
      fullDetails: [
        'Full access to multi-chain token scanner',
        'Real-time Degen AI chat & summaries',
        'Live Dune analytics dashboard integration',
        'Basic community support',
        'Exclusive Observer badge NFT',
        'Earned automatically via staking',
      ],
    },
    {
      name: 'Observer+',
      badge: '/observer-plus.png',
      stake: '10,000 $COG staked + subscription',
      price: '$5/month',
      scans: '20 daily',
      color: 'from-blue-700 to-blue-500',
      border: 'hover:border-blue-400',
      shortDetails: ['Higher scans', 'Priority AI', 'Beta access', 'Enhanced role'],
      fullDetails: [
        'Everything in Observer',
        '4x higher daily scan limit (20/day)',
        'Priority AI response speed',
        'Early access to beta features',
        'Exclusive Observer+ badge NFT',
        'Enhanced community role & channels',
      ],
    },
    {
      name: 'Analyst',
      badge: '/analyst.png',
      stake: '100,000 $COG staked + subscription',
      price: '$19/month',
      scans: '100 daily',
      color: 'from-green-700 to-green-500',
      border: 'hover:border-green-400',
      shortDetails: ['Advanced analytics', 'API access', 'Priority support', 'Voting rights'],
      fullDetails: [
        'Everything in Observer+',
        '20x scan limit (100/day)',
        'Advanced analytics & custom alerts',
        'API access for personal tools',
        'Priority support (faster responses)',
        'Exclusive Analyst badge NFT',
        'Voting rights on new features',
      ],
    },
    {
      name: 'Architect',
      badge: '/architect.png',
      stake: '1,000,000 $COG staked + subscription',
      price: '$59/month',
      scans: 'Unlimited',
      color: 'from-purple-700 to-purple-500',
      border: 'hover:border-purple-400',
      shortDetails: ['Unlimited access', 'First dibs on tools', 'Founder access', 'Revenue share'],
      fullDetails: [
        'Everything in Analyst',
        'Unlimited scans & API calls',
        'First dibs on all new tools & features',
        'Direct founder access & feedback channel',
        'Custom tool development requests',
        'Exclusive Architect badge NFT',
        'Revenue share consideration',
        'VIP community status & events',
      ],
    },
  ];

  const tokenomics = [
    { allocation: 'Total Supply', percent: '100%', amount: '1,000,000,000 $COG', details: 'Fixed supply' },
    { allocation: 'Initial Liquidity', percent: '10%', amount: '100,000,000 $COG', details: 'Launch liquidity' },
    { allocation: 'Post-MVP Liquidity Reserve', percent: '30%', amount: '300,000,000 $COG', details: 'Future LP injections' },
    { allocation: 'Ecosystem Treasury', percent: '20%', amount: '200,000,000 $COG', details: 'Development & operations' },
    { allocation: 'Community Incentives', percent: '15%', amount: '150,000,000 $COG', details: 'Airdrops & rewards' },
    { allocation: 'Future Hires/Expenses', percent: '10%', amount: '100,000,000 $COG', details: 'Team expansion' },
    { allocation: 'Founders Allocation', percent: '7%', amount: '70,000,000 $COG', details: 'Vested 12 months' },
    { allocation: 'Team & Dev', percent: '5%', amount: '50,000,000 $COG', details: 'Vested 12 months' },
    { allocation: 'Marketing Reserve', percent: '3%', amount: '30,000,000 $COG', details: 'Growth campaigns' },
  ];

  const roadmap = [
    { phase: 'Phase 1 — Token Mint & Bootstrap', milestone: 'Fresh mint (renounced), 300-wallet airdrop (TX proof publicly posted), Community/docs' },
    { phase: 'Phase 2 — MVP Build (Current)', milestone: 'Staking + badges, Beta tools/dashboard, Subscriptions' },
    { phase: 'Phase 3 — MVP Live + Trading Launch', milestone: 'Core utility release, Major post-MVP LP injection, Revenue start' },
    { phase: 'Phase 4 — Profitable Scale', milestone: 'Advanced features, Marketing/partnerships, API/governance' },
  ];

  const stats = [
    { end: 320, suffix: '+', label: 'Beta Users' },
    { end: 2100, suffix: '+', label: 'Scans Performed' },
    { end: 4, label: 'Membership Tiers' },
    { end: 1, label: 'Layer 2 Powered', suffix: ' (Base)' },
  ];

  const [statsRef, statsInView] = useInView({ threshold: 0.3, triggerOnce: true });

  return (
    <>
      <Navbar />

      {/* Dark/Light Toggle Button */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle dark/light mode"
        className="fixed top-20 right-4 z-50 p-3 rounded-full bg-gray-800 dark:bg-gray-200 text-white dark:text-black shadow-lg hover:scale-110 transition-all duration-300"
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black dark:from-gray-100 dark:via-gray-50 dark:to-white text-white dark:text-black pt-16 sm:pt-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto space-y-16 sm:space-y-24 py-8 sm:py-12">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8 sm:space-y-12"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Image
                src="/cogni-logo.png"
                alt="Cogni Logo"
                width={180}
                height={180}
                className="mx-auto rounded-2xl shadow-2xl hover:scale-105 transition-all duration-500 sm:w-[240px] sm:h-[240px]"
                priority
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-orange-500 to-cyan-500 bg-clip-text text-transparent"
            >
              Cogni Analytics
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-base sm:text-xl md:text-2xl lg:text-3xl text-gray-300 dark:text-gray-700 max-w-4xl mx-auto"
            >
              Intelligence-First Token-Gated Crypto SaaS Platform
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="text-base sm:text-lg md:text-xl text-cyan-400"
            >
              Built on Base Chain
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-8 mt-8 sm:mt-12"
            >
              <a
                href="/whitepaper.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-12 sm:px-16 py-4 sm:py-6 text-lg sm:text-xl md:text-2xl font-bold bg-orange-600 rounded-2xl shadow-2xl hover:bg-orange-500 hover:shadow-orange-500/50 hover:scale-110 active:scale-95 transition-all duration-300 touch-manipulation"
              >
                DOWNLOAD WHITEPAPER
              </a>
              <a
                href="/handbook.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-12 sm:px-16 py-4 sm:py-6 text-lg sm:text-xl md:text-2xl font-bold bg-teal-600 rounded-2xl shadow-2xl hover:bg-teal-500 hover:shadow-teal-500/50 hover:scale-110 active:scale-95 transition-all duration-300 touch-manipulation"
              >
                DOWNLOAD HANDBOOK
              </a>
            </motion.div>
          </motion.section>

          {/* Real-Time Stats Counter */}
          <motion.section
            ref={statsRef}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="py-16 sm:py-24 bg-gray-900/50 dark:bg-gray-200/20 rounded-3xl"
          >
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2, duration: 0.6 }}
                  >
                    <h3 className="text-3xl sm:text-5xl font-bold text-cyan-400 dark:text-cyan-600">
                      {statsInView ? <CountUp end={stat.end} duration={3} suffix={stat.suffix || ''} /> : '0'}
                    </h3>
                    <p className="text-gray-400 dark:text-gray-600 mt-2 text-sm sm:text-base">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Trust Badges */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="py-12 text-center"
          >
            <p className="text-gray-400 dark:text-gray-600 mb-8 text-lg">Powered by leading technologies</p>
            <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-16 opacity-70">
              <div className="text-4xl font-bold text-white">Base</div>
              <div className="text-4xl font-bold text-white">Dune</div>
              <div className="text-4xl font-bold text-white">GoPlus</div>
              <div className="text-4xl font-bold text-white">Reown</div>
            </div>
          </motion.section>

          {/* How It Works */}
          <motion.section
            id="how-it-works"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-12 sm:space-y-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent">
              How Cogni Works
            </h2>
            <div className="bg-gray-900/60 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 md:p-12 border border-cyan-500/20 shadow-2xl relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-start justify-items-center">
                {flowSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2, duration: 0.6 }}
                    className="text-center group relative cursor-pointer"
                    onClick={() => setSelectedStep(selectedStep === i ? null : i)}
                    onMouseEnter={() => setHoveredStep(i)}
                    onMouseLeave={() => setHoveredStep(null)}
                  >
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br ${step.gradient} rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:shadow-cyan-500/70 transition-all duration-500`}>
                      {step.icon}
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 group-hover:text-cyan-300 transition-colors">{step.title}</h3>
                    <p className="text-sm sm:text-base text-gray-300 mb-4 px-2 sm:px-4">{step.short}</p>

                    {/* Tooltip */}
                    {(hoveredStep === i || selectedStep === i) && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 px-6 py-4 bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-cyan-500/40 w-72 z-50 pointer-events-none md:pointer-events-auto">
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-800/95"></div>
                        <p className="text-gray-100 text-base leading-relaxed">{step.details}</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedStep(null); }}
                          className="absolute top-2 right-2 text-gray-400 hover:text-white md:hidden"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Arrows */}
              <div className="hidden md:grid grid-cols-4 gap-8 mt-8">
                <div />
                <div className="flex justify-center items-center">
                  <svg className="w-16 h-16 text-cyan-500 animate-pulse opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
                <div className="flex justify-center items-center">
                  <svg className="w-16 h-16 text-cyan-500 animate-pulse opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
                <div className="flex justify-center items-center">
                  <svg className="w-16 h-16 text-cyan-500 animate-pulse opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Tiers */}
          <motion.section
            id="tiers"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-12 sm:space-y-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent">
              Membership Tiers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
              {tiers.map((tier, i) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  className={`relative bg-gray-900/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 md:p-10 border-2 border-transparent ${tier.border} shadow-2xl hover:shadow-cyan-500/50 transition-all duration-500 cursor-pointer group overflow-hidden flex flex-col`}
                  onClick={() => setExpandedTier(expandedTier === tier.name ? null : tier.name)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
                  <div className="relative z-10 flex flex-col flex-grow">
                    <Image
                      src={tier.badge}
                      alt={`${tier.name} Badge`}
                      width={140}
                      height={140}
                      className="mx-auto mb-6 group-hover:scale-110 transition-transform duration-500"
                    />
                    <h3 className="text-2xl sm:text-3xl font-bold text-center mb-4">{tier.name}</h3>
                    <p className="text-center text-gray-300 mb-2 text-sm sm:text-base">{tier.stake}</p>
                    <p className="text-3xl font-bold text-center mb-8 text-cyan-400">{tier.price}</p>
                    <p className="text-center text-lg mb-8 text-gray-300">{tier.scans} scans</p>
                    <ul className="space-y-3 text-center flex-grow">
                      {(expandedTier === tier.name ? tier.fullDetails : tier.shortDetails).map((detail, j) => (
                        <li key={j} className="text-gray-300 text-base leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity">
                          {detail}
                        </li>
                      ))}
                    </ul>
                    <div className="text-center mt-auto pt-8">
                      <span className="inline-block px-8 py-4 bg-gradient-to-r from-orange-600 to-cyan-600 rounded-2xl font-bold shadow-xl group-hover:scale-105 transition-all duration-300">
                        {expandedTier === tier.name ? 'Show Less' : 'Click for Details'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Tokenomics */}
          <motion.section
            id="tokenomics"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-12 sm:space-y-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent">
              Tokenomics
            </h2>
            <div className="bg-gray-900/70 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-cyan-500/20 shadow-2xl overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead className="border-b-2 border-cyan-500/30">
                  <tr>
                    <th className="py-6 px-8 text-cyan-400 font-bold text-lg">Allocation</th>
                    <th className="py-6 px-8 text-cyan-400 font-bold text-center text-lg">%</th>
                    <th className="py-6 px-8 text-cyan-400 font-bold text-center text-lg">Amount</th>
                    <th className="py-6 px-8 text-cyan-400 font-bold text-lg">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {tokenomics.map((row, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="border-b border-gray-800/50 hover:bg-gradient-to-r hover:from-cyan-900/20 hover:to-purple-900/20 transition-all duration-300 group"
                    >
                      <td className="py-6 px-8 font-medium text-lg group-hover:text-cyan-300 transition-colors">{row.allocation}</td>
                      <td className="py-6 px-8 text-center text-cyan-300 text-lg group-hover:text-white transition-colors">{row.percent}</td>
                      <td className="py-6 px-8 text-center text-cyan-300 text-lg group-hover:text-white transition-colors">{row.amount}</td>
                      <td className="py-6 px-8 text-gray-300 group-hover:text-gray-100 transition-colors">{row.details}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>

          {/* Roadmap */}
          <motion.section
            id="roadmap"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-12 sm:space-y-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent">
              Roadmap
            </h2>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-orange-500 to-cyan-500 opacity-30 hidden md:block"></div>
              <div className="space-y-16">
                {roadmap.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2, duration: 0.8 }}
                    className={`flex flex-col md:flex-row items-center gap-10 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                  >
                    <div className="flex-1 text-center md:text-right">
                      <div className="bg-gray-900/70 backdrop-blur-2xl rounded-3xl p-10 border border-transparent hover:border-cyan-500/50 shadow-2xl hover:shadow-cyan-500/50 transition-all duration-500 group">
                        <h3 className="text-3xl font-bold mb-4 text-cyan-400 group-hover:text-white transition-colors">{item.phase}</h3>
                        <p className="text-xl text-gray-300 group-hover:text-gray-100 transition-colors">{item.milestone}</p>
                      </div>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-cyan-600 rounded-full flex items-center justify-center shadow-2xl flex-shrink-0 hover:scale-125 hover:shadow-cyan-500/70 transition-all duration-300">
                      <span className="text-2xl font-bold">{i + 1}</span>
                    </div>
                    <div className="flex-1"></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Footer with Icons */}
          <footer className="py-16 text-center border-t border-gray-800">
            <div className="flex justify-center items-center gap-10 mb-8">
              <a href="mailto:founder@cognibaseai.io" aria-label="Email" className="hover:scale-110 transition">
                <svg className="w-8 h-8 text-gray-400 hover:text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </a>
              <a href="https://x.com/CogniBase" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="hover:scale-110 transition">
                <svg className="w-8 h-8 text-gray-400 hover:text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://t.me/CogniBaseCommunity" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="hover:scale-110 transition">
                <svg className="w-8 h-8 text-gray-400 hover:text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.58 17.393a10.32 10.32 0 0 1-2.977.917 9.81 9.81 0 0 1-3.42-.509 10.21 10.21 0 0 1-2.96-1.566 9.63 9.63 0 0 1-2.088-2.59 9.45 9.45 0 0 1-1.07-3.073 9.71 9.71 0 0 1 .3-3.522 9.83 9.83 0 0 1 2.114-3.15 9.94 9.94 0 0 1 3.395-2.073 10.13 10.13 0 0 1 3.858-.784 10.3 10.3 0 0 1 3.65.424 10.23 10.23 0 0 1 3.12 1.527 10.15 10.15 0 0 1 2.317 2.594 10.09 10.09 0 0 1 1.327 3.126 10.13 10.13 0 0 1 .15 3.598 10.24 10.24 0 0 1-1.348 3.443 10.38 10.38 0 0 1-2.594 2.917 10.45 10.45 0 0 1-3.126 1.327 10.51 10.51 0 0 1-3.598.15z"/>
                </svg>
              </a>
            </div>
            <p className="mt-8">
              <Link href="/terms" className="text-gray-400 hover:text-cyan-400 transition">Terms of Service</Link>
            </p>
            <p className="mt-8 text-gray-500">© 2026 Cogni. All rights reserved.</p>
          </footer>
        </div>
      </motion.main>
    </>
  );
}