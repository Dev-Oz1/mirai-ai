import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Is this really ATS compatible?',
      answer:
        'Yes. We test our templates against the top 5 ATS systems (Greenhouse, Lever, Workday, Taleo, and iCIMS) to ensure 100% parseability. We avoid columns, graphics, and hidden characters that confuse bots.',
    },
    {
      question: 'Is my data private?',
      answer:
        'Absolutely. Unlike free tools that sell your data to recruiters, we are a paid product that protects your privacy. Your resumes are encrypted and you retain full ownership of your data.',
    },
    {
      question: 'How is this different from ChatGPT?',
      answer:
        'ChatGPT is a general text generator. Mirai AI is specialized for careers. We have trained our models specifically on successful resumes, job descriptions, and hiring patterns. Plus, we handle the formatting, version control, and ATS optimization that ChatGPT cannot do.',
    },
    {
      question: 'Can I cancel anytime?',
      answer:
        "Yes, you can cancel your subscription at any time with one click from your dashboard. You'll keep access until the end of your billing period.",
    },
    {
      question: "What if I don't have a resume yet?",
      answer:
        'No problem! Use our Resume Builder to create one from scratch. Our wizard will guide you through each section, suggesting professional bullet points based on your job title.',
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600">
            Everything you need to know about the product and billing.
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:border-blue-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900">
                  {faq.question}
                </span>
                {openIndex === i ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-5 pt-0 text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}