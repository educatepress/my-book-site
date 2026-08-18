import type { Metadata } from 'next';
import CasesPage from '@/components/cases/cases-page';

export const metadata: Metadata = {
    title: 'Worked Examples: The Same Number Means Different Things | TTC Guide',
    description: 'Six fictional cases showing how age, duration and cycle pattern change what a fertility test result actually means.',
    alternates: { canonical: 'https://ttcguide.co/en/cases' },
};

export default function Page() {
    return <CasesPage lang="en" />;
}
