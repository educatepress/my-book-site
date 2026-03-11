import HeroEn from '@/components/lp-en/hero-en';
import EmpathyEn from '@/components/lp-en/empathy-en';
import BeforeAfterEn from '@/components/lp-en/before-after-en';
import BookDetailEn from '@/components/lp-en/book-detail-en';
import AuthorProfileEn from '@/components/lp-en/author-profile-en';
import ReviewsEn from '@/components/lp-en/reviews-en';
import FaqSectionEn from '@/components/lp-en/faq-section-en';
import FinalCtaEn from '@/components/lp-en/final-cta-en';

export const metadata = {
    title: "Thinking in your 20s: Choices for a Future Pregnancy Without Trouble",
    description: "24 medical facts for women in their 20s and 30s and their partners.",
};

export default function HomeEn() {
    return (
        <main>
            <div className="fixed top-0 left-0 right-0 h-[3px] bg-[var(--color-sage)] opacity-70 z-50 origin-left" />
            <HeroEn />
            <EmpathyEn />
            <BeforeAfterEn />
            <BookDetailEn />
            <AuthorProfileEn />
            <ReviewsEn />
            <FaqSectionEn />
            <FinalCtaEn />
        </main>
    );
}
