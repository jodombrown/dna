import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { TYPOGRAPHY } from '@/lib/typography.config';

const WhoIsDNAForSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is DNA?",
      answer: "DNA is the mobilization infrastructure for the Global African Diaspora's return. We're not a media platform, a networking app, or a nonprofit asking for donations. We're the coordination layer that turns 200 million-plus scattered people into a body that moves together, toward Africa's progress."
    },
    {
      question: "Who is DNA for?",
      answer: "Three groups, one threshold. The Diaspora: people of African descent living off the continent, ready to return in whatever form that takes. Continental Partners: people of African descent on the ground in Africa, building alongside. Allies: people not of African descent who want to contribute their time, capital, expertise, or advocacy. Everyone crosses the same threshold: an affirmed commitment to The Return."
    },
    {
      question: "Do I have to move to Africa to be part of this?",
      answer: "No. Return isn't relocation, it's contribution. You can show up through capital, expertise, presence, advocacy, or story, from wherever you live. There's no single Return Pathway and DNA doesn't rank them. Some Members move. Most don't, and that's by design."
    },
    {
      question: "What does Membership actually mean?",
      answer: "Membership is free and opens with a single act called The Affirmation: a declaration that you're committed to The Return. That's it. No application, no vetting. Once you've Affirmed, every part of DNA is open to you."
    },
    {
      question: "Is there a cost to join?",
      answer: "Affirmed Membership is free, always. Premium is an optional paid tier for members who want deeper access (things like advanced collaboration tools and full editorial archive access), but it's a layer on top of Membership, never a replacement for it. You can never buy your way past the Affirmation."
    },
    {
      question: "How is DNA different from a professional network or an NGO?",
      answer: "We're not LinkedIn for the diaspora and we're not a charity. LinkedIn optimizes for individual career capital. Charity models position Africa as a deficit to be filled. DNA is neither: it's infrastructure for a body that already has what it needs, coordinating to deploy it. We measure mobilization, not donations."
    },
    {
      question: "What can I actually do on DNA?",
      answer: "Five things, and you can start with any of them. Connect with other Members by geography, industry, or interest. Convene at events, from local meetups to our flagship annual gathering, ROADMAP. Collaborate on real projects with other Members, start to finish. Contribute your capital, time, or expertise. Convey your story and read the diaspora's, through Diaspora Daily."
    },
    {
      question: "Does DNA touch my money?",
      answer: "No. DNA never forms investment funds, never runs a remittance product, and never takes a cut of what moves between Members. Where money changes hands, like event tickets or project contributions, we arrange the transaction. We never hold your money or take custody of it. That's a permanent boundary, not a phase we'll grow out of."
    },
    {
      question: "I'm not of African descent. Can I still be part of this?",
      answer: "Yes, as an Ally. Allies contribute capital, expertise, networks, time, or advocacy and stand fully inside the work. You walk alongside the Diaspora rather than as kin to the continent, and that distinction is intentional, not a demotion."
    },
    {
      question: "What if I'm not sure where to start?",
      answer: "Start with Connect. Affirm your Membership, build a profile, and see who's already building near you, in your industry, or on your Return Pathway. Everything else opens from there."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-br from-neutral-50 to-white">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
          <h2 className={`${TYPOGRAPHY.h2} text-dna-copper mb-3 lg:mb-4 text-center sm:text-left`}>
            Who is DNA for?
          </h2>
          <p className="text-base sm:text-lg text-neutral-700 mb-6 lg:mb-8 text-center sm:text-left">
            Diaspora, Continental Partners, and Allies building Africa's progress together, wherever they live.
          </p>

          {/* FAQ Toggles */}
          <div className="space-y-2 sm:space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-neutral-50 transition-all duration-200 text-left"
                >
                  <span className="text-sm sm:text-base text-neutral-900 font-medium pr-4">{faq.question}</span>
                  <ChevronDown 
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 flex-shrink-0 transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180 text-dna-copper' : ''
                    }`} 
                  />
                </button>
                {openIndex === index && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                    <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm sm:text-base text-neutral-600">
            Still have questions?{' '}
            <a
              href="mailto:support@diasporanetwork.africa"
              className="text-dna-emerald font-medium underline underline-offset-4 hover:text-dna-forest"
            >
              Reach out
            </a>{' '}
            or{' '}
            <Link
              to="/auth?mode=signup"
              className="text-dna-emerald font-medium underline underline-offset-4 hover:text-dna-forest"
            >
              Affirm your Membership
            </Link>{' '}
            and ask from inside.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhoIsDNAForSection;
