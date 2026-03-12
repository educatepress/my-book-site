import Hero from '@/components/lp/hero';
import Empathy from '@/components/lp/empathy';
import BeforeAfter from '@/components/lp/before-after';
import BookDetail from '@/components/lp/book-detail';
import AuthorProfile from '@/components/lp/author-profile';
import Reviews from '@/components/lp/reviews';
import FaqSection from '@/components/lp/faq-section';
import FinalCta from '@/components/lp/final-cta';
import StickyCta from '@/components/common/sticky-cta';

export default function Home() {
    return (
        <main>
            <div className="fixed top-0 left-0 right-0 h-[3px] bg-[var(--color-sage)] opacity-70 z-50 origin-left" />
            <Hero />
            <Empathy />
            <BeforeAfter />
            <BookDetail />
            <AuthorProfile />
            <Reviews />
            <FaqSection />
            <FinalCta />
            <StickyCta />
        </main>
    );
}
