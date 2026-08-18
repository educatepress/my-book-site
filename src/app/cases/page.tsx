import type { Metadata } from 'next';
import CasesPage from '@/components/cases/cases-page';

export const metadata: Metadata = {
    title: '架空ケースで読み方をつかむ | TTC Guide',
    description: '同じ数字でも意味は人によって変わります。6つの架空ケースで、検査結果の読み解き方を生殖医療専門医が示します。',
    alternates: { canonical: 'https://ttcguide.co/cases' },
};

export default function Page() {
    return <CasesPage lang="ja" />;
}
