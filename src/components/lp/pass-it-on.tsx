import Link from 'next/link';

/**
 * pass-it-on — 「この本は、あなた以外の誰かのためにもなる」ブロック（SENSE=Social）
 * 2026-08-18 取締役指示「読むことで他の人にも良い影響が出ることを伝えたい」。
 * 根拠は書籍本文の想定読者（親・教育/医療従事者・健康経営）と、事実23・24が扱うのが
 * 当事者ではなく周囲の理解の問題であること。作り話ではなく本の設計そのものを示す。
 */
const CASES = [
    {
        who: '親から、子へ',
        body: '本書の想定読者には「中高生・大学生のお子さんがいるご両親」が入っています。月経痛の強さや周期の乱れは、本人には比べる相手がいません。親が知っていれば、受診の一言が早くなります。',
    },
    {
        who: '上司から、部下へ',
        body: '職場には「話しても伝わらないから話さない → 会社は困っている人がいないと認識する」というループがあります（事実23）。管理職の側が知っていることが、当事者が言い出せる条件になります。',
    },
    {
        who: 'パートナーと、ふたりで',
        body: '妊娠・出産・授乳は女性にしかできませんが、それ以外の家事と育児はどちらでもできます（事実24）。この線引きを共有できるかどうかが、負担の偏りを決めます。',
    },
    {
        who: '教育・医療の現場で',
        body: '排卵と月経の仕組みは、学校の性教育で十分に扱われていない領域です。伝える側が正確に知っていることが、そのまま次の世代の選択肢になります。',
    },
];

export default function PassItOn() {
    return (
        <section className="py-20 px-6 bg-[var(--color-cream)]">
            <div className="max-w-[900px] mx-auto">
                <p className="text-[var(--color-sage)] font-bold tracking-[0.16em] text-xs mb-3 text-center">READ IT, THEN PASS IT ON</p>
                <h2 className="text-[1.5rem] md:text-[2rem] font-black text-center leading-tight mb-4 text-[var(--color-text-dark)]">
                    この知識は、読んだ人ひとりでは終わりません
                </h2>
                <p className="text-center text-[0.92rem] text-[var(--color-text-muted)] leading-relaxed mb-10 max-w-[640px] mx-auto">
                    本書は、妊娠を考えている本人だけに向けて書かれた本ではありません。周りにいる誰かが正しく知っていることで、救われる人がいます。
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                    {CASES.map((c) => (
                        <div key={c.who} className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
                            <p className="font-black text-[var(--color-sage)] mb-2 text-[0.95rem]">{c.who}</p>
                            <p className="text-[0.88rem] leading-relaxed">{c.body}</p>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-8">
                    <Link href="/24-facts" className="text-[var(--color-sage)] font-bold hover:underline text-[0.9rem]">
                        24の事実をすべて見る →
                    </Link>
                </div>
            </div>
        </section>
    );
}
