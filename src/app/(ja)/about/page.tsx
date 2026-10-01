import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "運営者情報 | ttcguide.co",
    description: "ttcguide.co の運営者情報",
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[var(--color-cream)] py-20 px-6">
            <article className="max-w-[720px] mx-auto">
                <Link href="/" className="text-[0.8rem] text-[var(--color-sage)] hover:underline mb-8 inline-block">
                    ← トップページに戻る
                </Link>

                <h1 className="text-[1.6rem] font-bold text-[var(--color-text-dark)] mb-8">運営者情報</h1>

                <section className="space-y-6 text-[0.9rem] text-[var(--color-text-dark)] leading-relaxed">
                    <table className="w-full text-left border-collapse">
                        <tbody className="divide-y divide-black/10">
                            <tr>
                                <th className="py-3 pr-4 font-bold text-[var(--color-text-mid)] w-[120px] align-top">サイト名</th>
                                <td className="py-3">ttcguide.co</td>
                            </tr>
                            <tr>
                                <th className="py-3 pr-4 font-bold text-[var(--color-text-mid)] align-top">運営</th>
                                <td className="py-3">Educate Press</td>
                            </tr>
                            <tr>
                                <th className="py-3 pr-4 font-bold text-[var(--color-text-mid)] align-top">代表者</th>
                                <td className="py-3">佐藤 琢磨（生殖医療専門医）</td>
                            </tr>
                            <tr>
                                <th className="py-3 pr-4 font-bold text-[var(--color-text-mid)] align-top">監修</th>
                                <td className="py-3">佐藤 琢磨（生殖医療専門医・産婦人科専門医）</td>
                            </tr>
                            <tr>
                                <th className="py-3 pr-4 font-bold text-[var(--color-text-mid)] align-top">連絡先</th>
                                <td className="py-3">gana.pati1201@gmail.com</td>
                            </tr>
                            <tr>
                                <th className="py-3 pr-4 font-bold text-[var(--color-text-mid)] align-top">URL</th>
                                <td className="py-3"><a href="https://ttcguide.co" className="text-[var(--color-sage)] underline">https://ttcguide.co</a></td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="bg-white rounded-[16px] p-6 border border-black/5 mt-8">
                        <h2 className="text-[1rem] font-bold mb-3">本サイトについて</h2>
                        <p className="leading-relaxed">
                            ttcguide.co は、生殖医療専門医が監修する妊活・プレコンセプションケアの情報サイトです。
                            著書『20代で考える 将来妊娠で困らないための選択』の内容を補完するブログ記事やシミュレーターを提供しています。
                        </p>
                        <p className="mt-3 leading-relaxed">
                            掲載情報は医学的根拠（PubMed等の査読済み論文）に基づいていますが、個別の医療判断に代わるものではありません。
                            治療に関するご相談は、担当の医療機関にお問い合わせください。
                        </p>
                    </div>

                    <div className="text-[0.8rem] text-[var(--color-text-muted)] mt-6">
                        <Link href="/privacy" className="text-[var(--color-sage)] underline">プライバシーポリシー</Link>
                    </div>
                </section>
            </article>
        </main>
    );
}
