"use client";

import FadeIn from "@/components/common/fade-in";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// Star rating component with stagger animation
const AnimatedStars = () => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <div ref={ref} className="flex gap-1" role="img" aria-label="5 out of 5 stars rating">
            {[1, 2, 3, 4, 5].map((idx) => (
                <motion.span
                    key={idx}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                    className="text-[var(--color-gold)]"
                >
                    ★
                </motion.span>
            ))}
        </div>
    );
};

export default function ReviewsEn() {
    const reviews = [
        {
            name: "Hiyokomame",
            text: "I purchased this after seeing a trusted female physician recommend it on social media. It clearly explains the information working women need to know regarding future pregnancy and childbirth. It specifies what conditions you should aim for by when, which I find very helpful for life planning. I also thought it would be a great book for partners to read.",
        },
        {
            name: "Sakura",
            text: "An excellent book that explains medical evidence regarding pregnancy in an easy-to-understand way with illustrations, from the standpoint of a specialist. Beyond just listing medical facts, you can feel the author's sincere wish for the readers' happy life planning throughout, drawn from his own experiences as a father and part of a dual-income couple.",
        },
    ];

    return (
        <section className="bg-[var(--color-gold-pale)] py-[6rem] px-6 font-en">
            <div className="max-w-[800px] mx-auto">
                <FadeIn className="text-center mb-[var(--spacing-lg)]">
                    <h3 className="font-['Zen_Kaku_Gothic_New'] text-[1.5rem] font-bold text-[var(--color-text-dark)] mb-4 tracking-tight">
                        Reader Voices
                    </h3>
                    <div className="inline-flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 text-[0.9rem] font-medium text-[var(--color-text-dark)]">
                            <AnimatedStars /> 5.0 (XX Reviews)
                        </div>
                        <a href="https://www.amazon.com/dp/B0F7XTWJ3X" target="_blank" rel="noreferrer" className="text-[0.8rem] text-[var(--color-sage)] hover:underline ml-1">
                            → View all reviews on Amazon
                        </a>
                    </div>
                </FadeIn>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-12">
            <div className="flex items-center">
              <span className="text-4xl font-bold text-gray-900 mr-4">5.0</span>
              <div className="flex flex-col">
                <div className="flex text-yellow-400 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-medium">48 Reviews</span>
              </div>
            </div>
            <div className="h-12 w-px bg-gray-200 hidden sm:block"></div>
            <p className="text-gray-600 font-medium flex items-center">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
              Verified Amazon Readers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {reviews.map((review, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <ReviewCard {...review} />
              </FadeIn>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" className="h-14 px-8 text-lg font-bold rounded-full bg-[#1c2e4a] hover:bg-[#2a4570] text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 asChild">
              <a href="https://www.amazon.com/dp/B0F7XTWJ3X" target="_blank" rel="noopener noreferrer">
                Read More Reviews on Amazon
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
            </div>
        </section>
    );
}
