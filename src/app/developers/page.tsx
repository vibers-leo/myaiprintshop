'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Code, Zap, Shield, BarChart3, Blocks, Book, ExternalLink, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DevelopersPage() {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Fast & Reliable',
      description: '99.9% uptime SLA with low-latency responses',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure',
      description: 'API key authentication with rate limiting',
    },
    {
      icon: <Blocks className="w-6 h-6" />,
      title: 'Easy Integration',
      description: 'Simple REST API with comprehensive documentation',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Usage Analytics',
      description: 'Real-time dashboards for API usage tracking',
    },
  ];

  const tiers = [
    {
      name: 'Free',
      price: '₩0',
      period: 'forever',
      limits: {
        requestsPerHour: '100',
        requestsPerDay: '1,000',
      },
      features: ['All API endpoints', 'Basic support', 'Community access'],
    },
    {
      name: 'Basic',
      price: '₩29,000',
      period: '/ month',
      limits: {
        requestsPerHour: '1,000',
        requestsPerDay: '10,000',
      },
      features: ['All API endpoints', 'Priority support', 'Custom rate limits', 'Advanced analytics'],
      popular: true,
    },
    {
      name: 'Pro',
      price: '₩99,000',
      period: '/ month',
      limits: {
        requestsPerHour: '5,000',
        requestsPerDay: '50,000',
      },
      features: ['All Basic features', 'Dedicated support', 'Webhooks', 'SLA guarantee'],
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      limits: {
        requestsPerHour: 'Custom',
        requestsPerDay: 'Custom',
      },
      features: [
        'All Pro features',
        'Custom integrations',
        'On-premise deployment',
        'Contract & SLA',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            GOODZZ Public API
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Integrate AI-powered print-on-demand products into your application with our powerful REST
            API
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/developers/signup"
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              Get API Key
              <ExternalLink className="w-4 h-4" />
            </Link>
            <Link
              href="/developers/docs"
              className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-bold hover:border-indigo-600 transition-all flex items-center gap-2"
            >
              <Book className="w-4 h-4" />
              View Documentation
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-black text-center mb-12">Why Choose Our API?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:border-indigo-200 transition-all"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Code Example */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-black text-center mb-12">Quick Start</h2>
        <div className="bg-gray-900 text-gray-100 rounded-2xl p-8 max-w-3xl mx-auto shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-bold">JavaScript</span>
          </div>
          <pre className="text-sm overflow-x-auto">
            <code>{`// Fetch products from GOODZZ API
fetch('https://goodzz.co.kr/api/public/v1/products', {
  headers: {
    'x-api-key': 'sk_live_your_api_key_here'
  }
})
  .then(res => res.json())
  .then(data => {
    console.log('Products:', data.data);
  });`}</code>
          </pre>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-black text-center mb-12">Pricing Tiers</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`bg-white p-6 rounded-2xl shadow-lg border-2 ${
                tier.popular ? 'border-indigo-600' : 'border-gray-100'
              } relative`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                  POPULAR
                </div>
              )}
              <h3 className="text-xl font-black mb-2">{tier.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-black">{tier.price}</span>
                <span className="text-gray-600 text-sm">{tier.period}</span>
              </div>
              <div className="mb-4 pb-4 border-b border-gray-100">
                <div className="text-sm text-gray-600 mb-1">
                  {tier.limits.requestsPerHour} requests/hour
                </div>
                <div className="text-sm text-gray-600">{tier.limits.requestsPerDay} requests/day</div>
              </div>
              <ul className="space-y-2 mb-6">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/developers/signup"
                className={`block w-full text-center py-3 rounded-xl font-bold transition-all ${
                  tier.popular
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tier.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-white"
        >
          <h2 className="text-4xl font-black mb-4">Ready to Start Building?</h2>
          <p className="text-xl opacity-90 mb-8">
            Get your API key in seconds and start integrating
          </p>
          <Link
            href="/developers/signup"
            className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            Get API Key Now
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
