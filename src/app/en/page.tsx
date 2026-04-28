import HeroEn from '@/components/lp-en/hero-en';
import EvidenceBlockEn from '@/components/lp-en/evidence-block-en';
import EmpathyEn from '@/components/lp-en/empathy-en';
import BeforeAfterEn from '@/components/lp-en/before-after-en';
import BookDetailEn from '@/components/lp-en/book-detail-en';
import AuthorProfileEn from '@/components/lp-en/author-profile-en';
import SimulatorCtaEn from '@/components/lp-en/simulator-cta-en';
import ReviewsEn from '@/components/lp-en/reviews-en';
import FaqSectionEn from '@/components/lp-en/faq-section-en';
import FinalCtaEn from '@/components/lp-en/final-cta-en';
import StickyCtaEn from '@/components/common/sticky-cta-en';

export const metadata = {
    title: "A Doctor's Guide to Women's Health & Preconception",
    description: "24 evidence-based medical facts for women in their 20s and 30s and their partners, by a board-certified reproductive medicine specialist.",
    alternates: {
        canonical: 'https://ttcguide.co/en',
        languages: {
            'ja': 'https://ttcguide.co',
            'en-US': 'https://ttcguide.co/en',
            'x-default': 'https://ttcguide.co/en',
        },
    },
    openGraph: {
        title: "A Doctor's Guide to Women's Health & Preconception",
        description: "24 evidence-based medical facts for women in their 20s and 30s and their partners.",
        url: 'https://ttcguide.co/en',
        type: 'website',
        images: [{ url: '/mock-en.png', width: 800, height: 1100 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: "A Doctor's Guide to Women's Health & Preconception",
        description: "24 evidence-based medical facts by a reproductive medicine specialist.",
        images: ['/mock-en.png'],
    },
};

const bookJsonLdEn = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": "A Doctor's Guide to Women's Health & Preconception",
    "author": {
        "@type": "Person",
        "name": "Takuma Sato, MD",
        "jobTitle": "Board-Certified Reproductive Medicine Specialist"
    },
    "bookFormat": "https://schema.org/EBook",
    "identifier": {
        "@type": "PropertyValue",
        "propertyID": "ASIN",
        "value": "B0F7XTWJ3X"
    },
    "numberOfPages": 180,
    "inLanguage": "en",
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5.0",
        "reviewCount": "12"
    },
    "offers": [
        {
            "@type": "Offer",
            "price": "9.99",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "url": "https://amzn.to/4tRV6qk",
            "description": "Kindle Edition"
        },
        {
            "@type": "Offer",
            "price": "14.99",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "url": "https://amzn.to/4tRV6qk",
            "description": "Paperback"
        }
    ]
};

const faqJsonLdEn = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Can I become infertile even in my 20s?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. Even with regular periods, you may struggle to conceive due to issues like fallopian tube problems or male factors. Having an early baseline checkup will help keep your future options open."
            }
        },
        {
            "@type": "Question",
            "name": "What is the 'best age' for pregnancy?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Generally, pregnancy rates peak in the late 20s to around 30. However, individual differences are huge. It's important to look comprehensively not just at age, but also at AMH levels, menstrual cycles, and any diseases that pose an infertility risk."
            }
        },
        {
            "@type": "Question",
            "name": "When should I see a doctor?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "We recommend consulting a doctor if you haven't conceived after 1 year if under 35, or after 6 months if 35 or older. Consulting a fertility specialist early can save you time and detours."
            }
        }
    ]
};

export default function HomeEn() {
    return (
        <main>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJsonLdEn) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLdEn) }}
            />
            <div className="fixed top-0 left-0 right-0 h-[3px] bg-[var(--color-sage)] opacity-70 z-50 origin-left" />
            <HeroEn />
            <EvidenceBlockEn />
            <EmpathyEn />
            <BeforeAfterEn />
            <BookDetailEn />
            <AuthorProfileEn />
            <SimulatorCtaEn />
            <ReviewsEn />
            <FaqSectionEn />
            <FinalCtaEn />
            <StickyCtaEn />
        </main>
    );
}
