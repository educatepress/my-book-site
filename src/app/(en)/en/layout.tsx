import type { Metadata } from 'next';
import HeaderEn from '@/components/common/header-en';
import FooterEn from '@/components/common/footer-en';

export const metadata: Metadata = {
    metadataBase: new URL('https://ttcguide.co'),
    alternates: {
        canonical: 'https://ttcguide.co/en',
        languages: {
            'ja': 'https://ttcguide.co',
            'en-US': 'https://ttcguide.co/en',
            'x-default': 'https://ttcguide.co/en',
        },
    },
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <HeaderEn />
            {children}
            <FooterEn />
        </>
    );
}
