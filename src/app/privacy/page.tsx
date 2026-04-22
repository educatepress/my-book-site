import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "プライバシーポリシー | ttcguide.co",
    description: "ttcguide.co のプライバシーポリシー",
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-[var(--color-cream)] py-20 px-6">
            <article className="max-w-[720px] mx-auto prose prose-sm">
                <Link href="/" className="text-[0.8rem] text-[var(--color-sage)] hover:underline mb-8 inline-block">
                    ← トップページに戻る
                </Link>

                <h1 className="text-[1.6rem] font-bold text-[var(--color-text-dark)] mb-8">プライバシーポリシー</h1>

                <p className="text-[0.85rem] text-[var(--color-text-mid)] mb-2">最終更新日: 2026年4月22日</p>

                <section className="space-y-6 text-[0.9rem] text-[var(--color-text-dark)] leading-relaxed">
                    <div>
                        <h2 className="text-[1.1rem] font-bold mb-2">1. 運営者</h2>
                        <p>本サイト（ttcguide.co）は、Educate Press（代表: 佐藤琢磨）が運営しています。</p>
                    </div>

                    <div>
                        <h2 className="text-[1.1rem] font-bold mb-2">2. 収集する情報</h2>
                        <p>本サイトでは、以下の情報を自動的に収集する場合があります。</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>アクセスログ（IPアドレス、ブラウザ情報、アクセス日時、参照元URL）</li>
                            <li>Cookieに基づくアクセス解析データ</li>
                        </ul>
                        <p className="mt-2">個人を特定できる情報（氏名・メールアドレス等）は、本サイトでは収集していません。</p>
                    </div>

                    <div>
                        <h2 className="text-[1.1rem] font-bold mb-2">3. アクセス解析</h2>
                        <p>本サイトでは以下のアクセス解析ツールを使用しています。</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Google Analytics 4（GA4）</strong> — Google LLC が提供するアクセス解析ツールです。Cookieを使用してアクセス情報を収集します。データは匿名で収集され、個人を特定するものではありません。詳しくは <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-[var(--color-sage)] underline">Googleのプライバシーポリシー</a> をご参照ください。</li>
                            <li><strong>Plausible Analytics</strong> — プライバシーに配慮した軽量のアクセス解析ツールです。Cookieを使用せず、個人を追跡しません。</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-[1.1rem] font-bold mb-2">4. Amazonアソシエイト</h2>
                        <p>本サイトは、Amazon.co.jpおよびAmazon.comを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。</p>
                    </div>

                    <div>
                        <h2 className="text-[1.1rem] font-bold mb-2">5. 免責事項</h2>
                        <p>本サイトに掲載されている情報は、生殖医療専門医の監修のもと作成していますが、個別の医療判断を提供するものではありません。具体的な治療・診断については、必ず医療機関にご相談ください。</p>
                    </div>

                    <div>
                        <h2 className="text-[1.1rem] font-bold mb-2">6. お問い合わせ</h2>
                        <p>プライバシーポリシーに関するお問い合わせは、<a href="/about" className="text-[var(--color-sage)] underline">運営者情報</a>ページの連絡先までご連絡ください。</p>
                    </div>
                </section>
            </article>
        </main>
    );
}
