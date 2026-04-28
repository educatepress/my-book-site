import Link from "next/link";

export default function FooterEn() {
    return (
        <footer className="bg-[var(--color-text-dark)] text-white/80 py-12 px-6 font-en mt-16">
            <div className="max-w-[1100px] mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                    <div>
                        <h4 className="text-white text-[0.85rem] font-bold mb-3 tracking-wider uppercase">About</h4>
                        <ul className="space-y-2 text-[0.85rem]">
                            <li><Link href="/en" className="hover:text-white">Home</Link></li>
                            <li><Link href="/about" className="hover:text-white">Author</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white text-[0.85rem] font-bold mb-3 tracking-wider uppercase">Resources</h4>
                        <ul className="space-y-2 text-[0.85rem]">
                            <li><Link href="/en/blog" className="hover:text-white">Blog</Link></li>
                            <li><Link href="/en/simulator" className="hover:text-white">IVF Simulator</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white text-[0.85rem] font-bold mb-3 tracking-wider uppercase">Legal</h4>
                        <ul className="space-y-2 text-[0.85rem]">
                            <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white text-[0.85rem] font-bold mb-3 tracking-wider uppercase">Language</h4>
                        <ul className="space-y-2 text-[0.85rem]">
                            <li><Link href="/" hrefLang="ja" className="hover:text-white">日本語</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-[0.75rem] text-white/60">
                        &copy; 2026 Takuma Sato, MD. All rights reserved.
                    </p>
                    <p className="text-[0.7rem] text-white/40 max-w-[500px]">
                        Medical disclaimer: The content on this site is for educational purposes only and does not constitute medical advice. Always consult a qualified healthcare provider.
                    </p>
                </div>
            </div>
        </footer>
    );
}
