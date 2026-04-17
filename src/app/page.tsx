import Hero from '@/components/lp/hero';
import EvidenceBlock from '@/components/lp/evidence-block';
import Empathy from '@/components/lp/empathy';
import BeforeAfter from '@/components/lp/before-after';
import BookDetail from '@/components/lp/book-detail';
import AuthorProfile from '@/components/lp/author-profile';
import SimulatorCta from '@/components/lp/simulator-cta';
import Reviews from '@/components/lp/reviews';
import FaqSection from '@/components/lp/faq-section';
import FinalCta from '@/components/lp/final-cta';
import StickyCta from '@/components/common/sticky-cta';

const bookJsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": "20代で考える 将来妊娠で困らないための選択",
    "author": {
        "@type": "Person",
        "name": "佐藤琢磨",
        "jobTitle": "生殖医療専門医"
    },
    "bookFormat": "https://schema.org/EBook",
    "isbn": "B0F7XTWJ3X",
    "numberOfPages": 180,
    "inLanguage": "ja",
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5.0",
        "reviewCount": "12"
    },
    "offers": {
        "@type": "Offer",
        "price": "1250",
        "priceCurrency": "JPY",
        "availability": "https://schema.org/InStock",
        "url": "https://amazon.co.jp/dp/B0F7XTWJ3X?tag=ttcguide-lp-22"
    }
};

const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "20代でも不妊になることはありますか？",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "あります。生理が規則的でも卵管のトラブルやパートナー側の要因などで妊娠しにくい場合があります。早めに基礎検査を受けておくと、将来の選択肢を広く保つことができます。"
            }
        },
        {
            "@type": "Question",
            "name": "妊娠の「ベストな年齢」は何歳ですか？",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "一般的には20代後半〜30歳前後が妊娠率のピークとされますが、個人差が大きいため、年齢だけでなくAMH値・月経周期・不妊リスクとなる疾患の有無なども総合的に見ることが大切です。"
            }
        },
        {
            "@type": "Question",
            "name": "いつ病院を受診したらいいか、目安はありますか？",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "35歳未満で1年、35歳以上で半年妊娠しなければ一度相談をおすすめします。生殖医療専門医に早めに相談することで、遠回りの時間を減らせます。"
            }
        }
    ]
};

export default function Home() {
    return (
        <main>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <div className="fixed top-0 left-0 right-0 h-[3px] bg-[var(--color-sage)] opacity-70 z-50 origin-left" />
            <Hero />
            <EvidenceBlock />
            <Empathy />
            <BeforeAfter />
            <BookDetail />
            <AuthorProfile />
            <SimulatorCta />
            <Reviews />
            <FaqSection />
            <FinalCta />
            <StickyCta />
        </main>
    );
}

