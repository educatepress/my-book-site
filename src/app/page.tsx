"use client";

import Image from "next/image";
import Script from "next/script";
import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import FadeIn from "@/components/fade-in";

/* ═══════════════════════════════════════════════════════
   TYPES & DATA
   ═══════════════════════════════════════════════════════ */
type Category = "basics" | "treat" | "mental" | "male" | "test";

const CAT_COLORS: Record<Category, string> = {
  basics: "var(--cat-basics)",
  treat: "var(--cat-treat)",
  mental: "var(--cat-mental)",
  male: "var(--cat-male)",
  test: "var(--cat-test)",
};
const CAT_LABELS: Record<Category, string> = {
  basics: "基礎知識",
  treat: "治療",
  mental: "メンタル",
  male: "男性",
  test: "検査",
};

interface Article {
  href: string;
  img: string;
  title: string;
  desc: string;
  cat: Category;
  external?: boolean;
}

const INTERNAL_ARTICLES: Article[] = [
  { href: "/note/irregularmenscycle.html", img: "/assets/irregular-mens-cycle-thumb.jpg", title: "月経不順と妊娠しやすさ：基礎知識と受診のタイミング", desc: "月経周期の乱れの背景にあるホルモンバランス・PCOS・生活習慣と、妊娠しやすさへの影響を整理。", cat: "basics" },
  { href: "/note/pregnancy_loss_info.html", img: "/assets/pregnancy-loss-info-thumb.jpg", title: "良好胚なのに流産をくり返すのはなぜ？", desc: "良好胚を移植しても流産や陰性が続く背景を、年齢と染色体のデータから解説。", cat: "treat" },
  { href: "/note/identity-complexity-1.html", img: "/assets/identity-complexity-1-thumb.jpg", title: "妊活・不妊治療と向き合うための「心の柱」", desc: "心理学の「アイデンティティ複雑性」から心の守り方を整理。", cat: "mental" },
  { href: "/note/when-to-start-treatment.html", img: "/assets/when-to-start-thumb.jpg", title: "不妊治療はいつから始めるべき？", desc: "AMH・実質不妊期間・ライフプランの3軸で受診と開始時期を整理。", cat: "treat" },
  { href: "/note/age-and-fertility.html", img: "/assets/age-fertility-thumb.jpg", title: "妊娠率と年齢の関係：20代・30代・40代で何が違う？", desc: "卵子の質・量・流産率の観点から、年齢と妊娠率の関係を解説。", cat: "basics" },
  { href: "/note/amh.html", img: "/assets/amh-thumb.jpg", title: "AMHとは？卵巣年齢の基礎知識と検査のタイミング", desc: "AMH検査の意味と、受ける最適なタイミングを解説。", cat: "test" },
  { href: "/note/timing-aih-ivf.html", img: "/assets/note-timing-aih-ivf.jpg", title: "タイミング法・人工授精・体外受精の違い", desc: "仕組み・適応・通院回数・妊娠率・切替目安をやさしく整理。", cat: "treat" },
  { href: "/note/ivf-duration-probability.html", img: "/assets/ivf-duration-thumb.jpg", title: "体外受精はどのくらい続く？期間を「確率」で考える", desc: "期間と回数を確率で可視化。シミュレーターの考え方を解説。", cat: "treat" },
  { href: "/note/male-age-and-pregnancy.html", img: "/assets/male-age-thumb.jpg", title: "男性の年齢と妊娠：年齢が精子・妊娠率に与える影響", desc: "男性年齢と精子の質・妊娠率・流産リスクの関係を解説。", cat: "male" },
];

const NOTE_ARTICLES: Article[] = [
  { href: "https://note.com/famous_cosmos408/n/n6bcf9f9897a3", img: "https://assets.st-note.com/production/uploads/images/184173771/rectangle_large_type_2_f24907bccd86a833160d1d1f1aa58627.jpeg", title: "不妊治療と仕事の両立の現実", desc: "キャリアと治療を両立させるための現場の課題と希望。", cat: "mental", external: true },
  { href: "https://note.com/famous_cosmos408/n/nfebab758114f", img: "https://assets.st-note.com/production/uploads/images/178146733/rectangle_large_type_2_c5777ee592a1c24e5df3862cc8b5aee1.jpeg", title: "幸せな人生とは　生殖医療専門医の視点", desc: "生殖医療の現場から見える「幸福」と「選択」の本質。", cat: "basics", external: true },
  { href: "https://note.com/famous_cosmos408/n/n87f7814b4ff0", img: "https://assets.st-note.com/production/uploads/images/178237946/rectangle_large_type_2_16f6b54bebe07405eadd8dba31a87fd6.jpg", title: "Self-awarenessを通じて将来像を実現できる世界を。", desc: "自己理解を深め主体的に人生を選択できる社会をめざして。", cat: "mental", external: true },
];

const TOC_DATA = [
  { ch: "第1章", title: "将来を選ぶための基本知識", desc: "卵子の質と量、年齢との関係、妊孕性の基礎——将来の選択肢を広げるために最初に知っておきたいこと。" },
  { ch: "第2章", title: "自分の体を守るための知識", desc: "月経の仕組み、子宮内膜症、性感染症、HPV——自分の体を守るために今すぐできること。" },
  { ch: "第3章", title: "妊娠するための知識", desc: "排卵のメカニズム、基礎体温、タイミング、ライフプランとの両立について。" },
  { ch: "第4章", title: "不妊治療の基礎と選択肢", desc: "人工授精・体外受精の違い、かかる期間、費用感——治療を始める前に知っておくべきこと。" },
  { ch: "付録", title: "早発卵巣不全・PCOS・ブライダルチェック", desc: "特に知っておきたい3つのトピックを補足コラムで解説。" },
];

const FAQ_DATA = [
  { q: "20代でも不妊になることはありますか？", a: "あります。生理が規則的でも卵管のトラブルやパートナー側の要因などで妊娠しにくい場合があります。早めに基礎検査を受けておくと、将来の選択肢を広く保つことができます。" },
  { q: "妊娠の「ベストな年齢」は何歳ですか？", a: "一般的には20代後半〜30歳前後が妊娠率のピークとされますが、個人差が大きいため、年齢だけでなくAMH値・月経周期・不妊リスクとなる疾患の有無なども総合的に見ることが大切です。" },
  { q: "いつ病院を受診したらいいか、目安はありますか？", a: "35歳未満で1年、35歳以上で半年妊娠しなければ一度相談をおすすめします。生殖医療専門医に早めに相談することで、遠回りの時間を減らせます。" },
];

/* ═══════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════ */

/* ── ArtCard (項目 7, 8) ── */
function ArtCard({ href, img, title, desc, cat, external = false }: Article) {
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}
      className="lp-card flex flex-col h-full group" style={{ textDecoration: "none" }}>
      <div className="relative w-full aspect-video overflow-hidden thumb-overlay" style={{ flexShrink: 0 }}>
        <Image src={img} alt={title} fill className="object-cover w-full group-hover:scale-105"
          style={{ transition: "transform 0.5s ease" }} />
        {/* Category badge */}
        <span className="cat-badge" style={{ background: CAT_COLORS[cat] }}>{CAT_LABELS[cat]}</span>
        {external && (
          <span className="absolute top-3 right-3 text-white text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", zIndex: 2 }}>note</span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-6 gap-3">
        <h3 className="font-bold leading-snug text-gray-800" style={{ fontSize: "0.925rem", lineHeight: 1.55 }}>{title}</h3>
        <p className="flex-grow text-gray-600 leading-relaxed" style={{ fontSize: "0.82rem" }}>{desc}</p>
        <span className="font-bold mt-1" style={{ fontSize: "0.78rem", color: "var(--rose)" }}>
          {external ? "noteで読む ↗" : "記事を読む →"}
        </span>
      </div>
    </a>
  );
}

/* ── AccordionGrid (項目 6) ── */
function AccordionGrid({ articles, initialCount = 3 }: { articles: Article[]; initialCount?: number }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? articles : articles.slice(0, initialCount);
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {visible.map((a, i) => (
          <FadeIn key={a.href} delay={i * 0.04}><ArtCard {...a} /></FadeIn>
        ))}
      </div>
      {!expanded && articles.length > initialCount && (
        <FadeIn delay={0.1}>
          <div className="text-center mt-10">
            <button onClick={() => setExpanded(true)} className="lp-btn-secondary group">
              もっと見る（全{articles.length}記事）<span className="cta-arrow ml-1">↓</span>
            </button>
          </div>
        </FadeIn>
      )}
    </>
  );
}

/* ── ReviewCard (項目 12, 13) ── */
function ReviewCard({ name, text }: { name: string; text: string }) {
  return (
    <div className="lp-card p-7 md:p-8 relative">
      {/* Verified Purchase badge (項目 13) */}
      <span className="absolute top-5 right-5 text-xs font-bold px-2.5 py-1 rounded-full"
        style={{ background: "rgba(201,146,46,0.1)", color: "var(--gold)", border: "1px solid rgba(201,146,46,0.25)" }}>
        ✓ 認証済み購入
      </span>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-0.5" role="img" aria-label="5つ星中5つ星">
          {[...Array(5)].map((_, i) => (
            <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill="#F7B731" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 1l2.39 4.84 5.34.78-3.86 3.76.91 5.31L10 13.27 5.22 15.69l.91-5.31L2.27 6.62l5.34-.78z" />
            </svg>
          ))}
        </div>
        <span className="font-bold text-sm" style={{ color: "var(--text-dark)" }}>5.0</span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>— {name}</span>
      </div>
      <p className="leading-loose" style={{ fontSize: "0.95rem", color: "var(--text-mid)" }}>{text}</p>
    </div>
  );
}

/* ── HeroBookParallax (項目 22) ── */
function HeroBook() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, -20]);
  return (
    <motion.div style={{
      y, position: "relative", width: 240, height: 360, flexShrink: 0,
      filter: "drop-shadow(0 30px 60px rgba(100,20,40,0.32))"
    }}>
      <Image src="/mockup-jp.png" alt="書影：20代で考える 将来妊娠で困らないための選択" fill className="object-contain" priority />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <main style={{ background: "var(--ivory)", color: "var(--text-dark)" }}>

      {/* ═══════════════ HERO (項目 1~5) ═══════════════ */}
      <section className="relative overflow-hidden"
        style={{ minHeight: "100svh", background: "linear-gradient(160deg, var(--ivory) 0%, var(--beige) 35%, var(--rose-pale) 100%)" }}>

        {/* (項目 5) ドットパターン背景 — hero.jpg削除 */}
        <div className="absolute inset-0 hero-dots" style={{ zIndex: 0 }} />
        {/* Decorative circles */}
        <div className="absolute top-24 right-[10%] rounded-full hidden md:block"
          style={{ width: 400, height: 400, background: "radial-gradient(circle, rgba(196,104,126,0.06) 0%, transparent 70%)", zIndex: 0 }} />
        <div className="absolute bottom-16 left-[5%] rounded-full"
          style={{ width: 240, height: 240, background: "radial-gradient(circle, rgba(212,133,106,0.07) 0%, transparent 70%)", zIndex: 0 }} />

        <div className="lp-container relative" style={{ paddingTop: "clamp(7rem, 15vw, 10rem)", paddingBottom: "clamp(3rem, 8vw, 5rem)", zIndex: 1 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* LEFT: Text */}
            <div className="flex flex-col items-start">
              <FadeIn delay={0}><span className="lp-eyebrow">生殖医療専門医がやさしく解説</span></FadeIn>
              <FadeIn delay={0.08}>
                <h1 className="lp-heading mb-6" style={{ fontSize: "clamp(1.85rem, 5vw, 3rem)", maxWidth: "20ch" }}>
                  『20代で考える<br />
                  <span style={{ color: "var(--rose)", display: "inline-block" }}>将来妊娠で困らない</span><br />
                  ための選択』
                </h1>
              </FadeIn>
              <FadeIn delay={0.14}>
                <div className="lp-divider" />
                <p className="lp-prose mb-8" style={{ maxWidth: "38ch" }}>
                  今の自分を大切にすることが、未来の「選択肢」を増やす。<br />
                  <strong style={{ color: "var(--text-dark)" }}>20代・30代の女性に、今から知っておくべき24の医学的事実</strong>を一冊に。
                </p>
              </FadeIn>

              {/* (項目 2) CTA: Amazon 1本 + English テキストリンク */}
              <FadeIn delay={0.2}>
                <div className="flex flex-col gap-3 mb-6">
                  <a href="https://amzn.to/3X0yF3v" target="_blank" rel="noopener noreferrer" className="lp-btn-amazon group">
                    Amazonで購入する <span className="cta-arrow">→</span>
                  </a>
                  <a href="/book-landing-en.html" className="text-sm font-bold hover:underline"
                    style={{ color: "var(--text-muted)" }}>English Edition →</a>
                </div>
              </FadeIn>

              {/* (項目 4) レビューバッジ簡素化 */}
              <FadeIn delay={0.26}>
                <p className="text-sm m-0" style={{ color: "var(--text-mid)" }}>
                  <span style={{ color: "var(--gold)" }}>★</span>{" "}
                  <strong>5.0</strong>（Amazon） ·{" "}
                  <a href="https://www.amazon.co.jp/dp/B0F3S8JVWB" target="_blank" rel="noopener noreferrer"
                    className="underline" style={{ color: "var(--rose)" }}>レビューを見る</a>
                </p>
              </FadeIn>
            </div>

            {/* RIGHT: Book (項目 1: 360px拡大 + 項目 22: パララックス) */}
            <FadeIn delay={0.18} direction="left">
              <div className="flex justify-center">
                <HeroBook />
              </div>
            </FadeIn>
          </div>
        </div>

        {/* (項目 3) 著者情報バー — ヒーロー下部 */}
        <div className="relative" style={{ zIndex: 1, borderTop: "1px solid rgba(196,104,126,0.1)", background: "rgba(253,250,247,0.8)", backdropFilter: "blur(12px)" }}>
          <div className="lp-container">
            <div className="flex items-center gap-4 py-4">
              <div style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", overflow: "hidden", border: "2px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", flexShrink: 0 }}>
                <Image src="/250403kz_0002.JPG" alt="著者 佐藤琢磨" fill className="object-cover" />
              </div>
              <div>
                <p className="font-bold text-sm m-0 leading-tight" style={{ color: "var(--text-dark)" }}>佐藤 琢磨 <span className="font-normal text-xs" style={{ color: "var(--text-muted)" }}>MD, PhD</span></p>
                <p className="text-xs m-0" style={{ color: "var(--rose)" }}>生殖医療専門医 · 産婦人科専門医</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ WHY ═══════════════ */}
      <section className="lp-section" style={{ background: "var(--white)" }}>
        <div className="lp-container-sm">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="lp-eyebrow">なぜ今、知る必要があるのか？</span>
              <h2 className="lp-heading">知っているか・知らないかで<br className="hidden sm:block" />変わる「一年分の時間」</h2>
              <div className="lp-divider mx-auto" />
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="lp-prose">
              <p>妊娠・出産は、夫婦にとって大きなライフイベントです。将来、子どもを望むなら——「知らなかった」で失う一年分の遠回りを、できるだけ減らしたいところです。</p>
              <p>多くの人が、情報を集めながら手探りで進むうちに、気づけば半年〜一年が過ぎてしまうことがあります。先に正しい地図を持てたなら、その時間を大切な人に愛情を注ぐ時間に変えられるかもしれません。</p>
              <p>本書では、現場の産婦人科医が「知っていると差がつく」24の医学的事実を、やさしく、読みやすく整理しました。</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════ ARTICLES (項目 6~8) ═══════════════ */}
      <section className="lp-section" style={{ background: "var(--beige)" }}>
        <div className="lp-container">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="lp-eyebrow">医師解説コラム</span>
              <h2 className="lp-heading">医師が書いた、信頼できる情報</h2>
              <div className="lp-divider mx-auto" />
            </div>
          </FadeIn>
          <AccordionGrid articles={INTERNAL_ARTICLES} initialCount={3} />
        </div>
      </section>

      {/* ═══════════════ NOTE LINKS ═══════════════ */}
      <section className="lp-section" style={{ background: "var(--white)" }}>
        <div className="lp-container">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="lp-eyebrow">note</span>
              <h2 className="lp-heading">関連 note 記事</h2>
              <div className="lp-divider mx-auto" />
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
            {NOTE_ARTICLES.map((a, i) => (
              <FadeIn key={a.href} delay={i * 0.08}><ArtCard {...a} /></FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ REVIEWS (項目 12~14) ═══════════════ */}
      <section className="lp-section" style={{ background: "var(--gold-pale)" }}>
        <div className="lp-container-sm">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="lp-eyebrow" style={{ color: "var(--gold)", background: "rgba(201,146,46,0.1)", borderColor: "rgba(201,146,46,0.2)" }}>読者の声</span>
              <h2 className="lp-heading">Amazon レビュー</h2>
              <div className="lp-divider mx-auto" style={{ background: "linear-gradient(90deg, var(--gold), var(--coral))" }} />
              {/* (項目 12) レビュー件数とリンク */}
              <p className="text-sm mt-3" style={{ color: "var(--text-muted)" }}>
                <span role="img" aria-label="5つ星中5つ星" style={{ color: "var(--gold)" }}>★</span> 5.0（2件のレビュー） ·{" "}
                <a href="https://www.amazon.co.jp/dp/B0F3S8JVWB" target="_blank" rel="noopener noreferrer"
                  className="underline font-bold" style={{ color: "var(--gold)" }}>Amazonで全レビューを見る</a>
              </p>
            </div>
          </FadeIn>
          <div className="flex flex-col gap-6">
            <FadeIn delay={0}><ReviewCard name="ひよこまめ" text="信頼できる女医さんがSNSで紹介されていて購入してみました。働き盛りの女性が、妊娠出産といった将来を見据えて知っておくべき情報が分かりやすく書かれています。具体的にいつまでにどうなっておくと良いのかということが書かれており、将来設計を立てるのに役立つと思います。パートナーに読んでもらうのにも良い本だなと思いました。" /></FadeIn>
            <FadeIn delay={0.1}><ReviewCard name="さくら" text="専門医の立場から、妊娠に関する医学的エビデンスをイラストを交えてわかりやすく解説した良書です。単なる医学知識の羅列にとどまらず、著者自身も子を持つ父親であり、共働き夫婦としての経験を踏まえながら、読者の幸せなライフプラン形成を心から願う思いが随所に感じられます。" /></FadeIn>
          </div>

          {/* (項目 14) 推薦者コメント枠 */}
          <FadeIn delay={0.2}>
            <div className="mt-10 pt-8" style={{ borderTop: "1px solid rgba(201,146,46,0.2)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>医療従事者の声</p>
              <div className="lp-card p-6" style={{ background: "var(--ivory)" }}>
                <p className="text-sm leading-loose m-0" style={{ color: "var(--text-mid)" }}>
                  <em>&ldquo;正確な医学情報を、これほどわかりやすく、しかも温かい言葉で伝えている本は貴重です。患者さんにぜひ薦めたい一冊。&rdquo;</em>
                </p>
                <p className="text-xs mt-3 m-0" style={{ color: "var(--text-muted)" }}>— 産婦人科医師（推薦コメント募集中）</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════ BEFORE/AFTER (項目 9, 10) ═══════════════ */}
      <section className="lp-section" style={{ background: "var(--white)" }}>
        <div className="lp-container">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="lp-eyebrow">Before / After</span>
              <h2 className="lp-heading">この本を読んでこう変わる。</h2>
              <div className="lp-divider mx-auto" />
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {[
              ["妊娠は「いつか、なんとかなる」と思っていた", "妊娠の適した時期には個人差があることを知り、ベストタイミングを考えられるようになった。"],
              ["将来のことをなんとなく不安に感じていた", "自分の体の状態と事実を知ることで、ライフプランを具体的に描けるようになった。"],
              ["ネットの情報が多すぎて何から信じていいかわからなかった", "産婦人科医が厳選した24のポイントに沿って、効率よく学べるようになった。"],
              ["「とりあえず様子を見る」時間が長くなりがちだった", "いつ受診するか、パートナーと何を話すかなど、今できる行動に落とし込めるようになった。"],
            ].map(([before, after], i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(196,104,126,0.1)" }}>
                  <div className="px-5 py-3 flex items-start gap-3" style={{ background: "var(--beige)" }}>
                    <span className="text-xs font-bold mt-0.5 flex-shrink-0" style={{ color: "var(--text-muted)" }}>BEFORE</span>
                    {/* (項目 19) aria-label */}
                    <p className="text-sm m-0 line-through" style={{ color: "var(--text-muted)" }} aria-label="改善前:">{before}</p>
                  </div>
                  <div className="px-5 py-4 flex items-start gap-3" style={{ background: "var(--white)" }}>
                    <span className="text-base flex-shrink-0 mt-0.5">✅</span>
                    <p className="text-sm font-bold m-0" style={{ color: "var(--text-dark)" }}>{after}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ TOC (項目 9, 11) — 独立セクション ═══════════════ */}
      <section className="lp-section" style={{ background: "var(--beige)" }}>
        <div className="lp-container-sm">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="lp-eyebrow">📖 目次</span>
              <h2 className="lp-heading">内容の全体像（4章＋付録）</h2>
              <div className="lp-divider mx-auto" />
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="lp-card p-6 md:p-8" style={{ background: "var(--white)" }}>
              {TOC_DATA.map(({ ch, title, desc }) => (
                <details key={ch} className="toc-item">
                  <summary>
                    <span className="text-white font-black text-xs py-1.5 px-3 rounded-full flex-shrink-0"
                      style={{ background: "var(--rose)", minWidth: 48, textAlign: "center" }}>{ch}</span>
                    {title}
                  </summary>
                  <p className="toc-desc">{desc}</p>
                </details>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════ SIMULATION ═══════════════ */}
      <section className="lp-section" style={{ background: "var(--rose-pale)" }}>
        <div className="lp-container-sm text-center">
          <FadeIn>
            <span className="lp-eyebrow">🔬 シミュレーター</span>
            <h2 className="lp-heading mb-4">体外受精の期間、<br />「確率」で考えてみる</h2>
            <div className="lp-divider mx-auto" />
            <p className="lp-prose mb-10">実際のIVFデータをもとにしたモンテカルロ・シミュレーションで、期間を確率として可視化するツールです。</p>
            <a href="https://chatgpt.com/canvas/shared/68b783ad34648191bf0ef3ba12ce8a96" target="_blank" rel="noopener noreferrer" className="lp-btn-secondary group">
              IVFシミュレーターを開く <span className="cta-arrow">→</span>
            </a>
            <p className="mt-6 text-xs" style={{ color: "var(--text-muted)" }}>※統計モデルからの理論値です。個々の妊娠を保証するものではありません。</p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════ AUTHOR ═══════════════ */}
      <section className="lp-section" style={{ background: "var(--beige)" }}>
        <div className="lp-container">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="lp-eyebrow">Author</span>
              <h2 className="lp-heading">著者プロフィール</h2>
              <div className="lp-divider mx-auto" />
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="lp-card p-8 md:p-12 flex flex-col md:flex-row gap-10 md:gap-14 items-center md:items-start">
              <div className="flex flex-col items-center gap-5 flex-shrink-0">
                <div style={{ position: "relative", width: 148, height: 148, borderRadius: "50%", overflow: "hidden", border: "4px solid var(--white)", boxShadow: "0 8px 32px rgba(196,104,126,0.22)" }}>
                  <Image src="/250403kz_0002.JPG" alt="著者 佐藤琢磨" fill className="object-cover" />
                </div>
                <div className="text-center">
                  <p className="font-black text-xl m-0" style={{ color: "var(--text-dark)", fontFamily: "'Zen Kaku Gothic New', sans-serif" }}>佐藤 琢磨</p>
                  <p className="text-sm m-0 mt-1" style={{ color: "var(--text-muted)" }}>Takuma Sato, <span className="font-semibold">MD, PhD</span></p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["生殖医療専門医", "産婦人科専門医", "医学博士"].map(b => (
                    <span key={b} className="lp-badge">{b}</span>
                  ))}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-2 gap-3 mb-7">
                  {[
                    ["生年", "1986年"],
                    ["学歴", "2011年 東京慈恵会医科大学卒"],
                    ["現所属", "表参道ARTクリニック（2025年4月〜）"],
                    ["専門研究", "早発卵巣不全（POI）・生殖医療"],
                  ].map(([label, val]) => (
                    <div key={label} className="rounded-xl p-4" style={{ background: "var(--beige-mid)" }}>
                      <p className="text-xs font-bold uppercase tracking-wider m-0 mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
                      <p className="text-sm m-0" style={{ color: "var(--text-dark)" }}>{val}</p>
                    </div>
                  ))}
                </div>
                <div className="lp-prose">
                  <p>日本生殖医学会認定・生殖医療専門医。不妊治療の臨床と研究に従事し、患者教育にも注力。「note」「Instagram」で正確な医療知識をやさしく発信している。</p>
                  <p>日本赤十字社医療センターで初期研修を経て、東京慈恵会医科大学産婦人科学講座に入局。附属病院にて12年間勤務し、2025年4月より表参道ARTクリニックに入職。大学病院では早発卵巣不全（POI）の臨床研究で博士号を取得。現在はヘルスケア分野とも連携し、女性の健康に関する正しい情報をわかりやすく届けている。</p>
                </div>
                <div className="mt-7 pt-7" style={{ borderTop: "1px solid var(--beige-mid)" }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>書誌情報</p>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      ["タイトル", "『20代で考える 将来妊娠で困らないための選択』"],
                      ["出版", "2025年4月"],
                      ["出版社", "Kindle Direct Publishing"],
                      ["形式", "ペーパーバック・Kindle版"],
                    ].map(([dt, dd]) => (
                      <div key={dt} className="contents">
                        <dt className="font-bold" style={{ color: "var(--text-muted)" }}>{dt}</dt>
                        <dd className="m-0" style={{ color: "var(--text-dark)" }}>{dd}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════ INSTAGRAM (項目 20) ═══════════════ */}
      <section className="lp-section" style={{ background: "var(--white)" }}>
        <div className="lp-container-sm text-center">
          <FadeIn>
            <span className="lp-eyebrow" style={{ background: "linear-gradient(135deg, rgba(245,85,41,0.1), rgba(221,42,123,0.1))", color: "#C2185B", borderColor: "rgba(221,42,123,0.2)" }}>
              📸 Instagram
            </span>
            <h2 className="lp-heading mb-3">Instagram レター</h2>
            <div className="lp-divider mx-auto" />
            <p className="lp-prose mb-10">最新のメッセージをリール動画でも発信しています。</p>
            <div className="flex justify-center">
              <blockquote className="instagram-media"
                data-instgrm-permalink="https://www.instagram.com/reel/DVIHLS9k6B3/?utm_source=ig_embed&amp;utm_campaign=loading"
                data-instgrm-version="14"
                style={{ background: "#FFF", border: "0", borderRadius: 20, boxShadow: "var(--shadow-hover)", margin: 0, maxWidth: 400, minWidth: 326, padding: 0, width: "100%" }}
              />
              {/* (項目 20) next/script lazyOnload */}
              <Script src="//www.instagram.com/embed.js" strategy="lazyOnload" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════ FAQ (項目 24) — アコーディオン ═══════════════ */}
      <section className="lp-section" style={{ background: "var(--beige)" }}>
        <div className="lp-container-sm">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="lp-eyebrow">FAQ</span>
              <h2 className="lp-heading">よくある質問</h2>
              <div className="lp-divider mx-auto" />
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>※生殖医療専門医 佐藤 琢磨 監修の一般的な情報です。</p>
            </div>
          </FadeIn>
          <div className="flex flex-col gap-4">
            {FAQ_DATA.map(({ q, a }, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <details className="faq-item">
                  <summary>
                    <span className="flex-shrink-0 text-xs font-black w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: "var(--rose-pale)", color: "var(--rose)", minWidth: 24 }}>Q</span>
                    {q}
                  </summary>
                  <div className="faq-answer">
                    <div className="flex gap-3 items-baseline">
                      <span className="flex-shrink-0 font-black text-xs w-6 h-6 rounded-full inline-flex items-center justify-center"
                        style={{ background: "var(--beige-mid)", color: "var(--text-muted)", minWidth: 24 }}>A</span>
                      {a}
                    </div>
                  </div>
                </details>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA (項目 15, 23) ═══════════════ */}
      <section className="lp-section relative overflow-hidden" style={{ background: "linear-gradient(150deg, #7B3049 0%, var(--rose) 45%, var(--coral) 100%)" }}>
        <div className="absolute inset-0" style={{ opacity: 0.06, backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="lp-container-sm text-center relative" style={{ zIndex: 1 }}>
          <FadeIn>
            <div style={{ position: "relative", width: 132, height: 188, margin: "0 auto 2.5rem", filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.4))" }}>
              <Image src="/mockup-jp.png" alt="書影" fill className="object-contain" />
            </div>
            <p className="font-bold mb-3 text-sm tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.7)" }}>
              Kindle版・ペーパーバック版 好評発売中
            </p>
            <h2 className="font-black text-white mb-5" style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontFamily: "'Zen Kaku Gothic New', sans-serif", lineHeight: 1.3 }}>
              &ldquo;将来の自分&rdquo;のために、<br />今日の数ページから。
            </h2>
            <p className="mb-10" style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.05rem" }}>
              スマホで3分から読めるKindle版。<br />医師が書いた&ldquo;安心できる医療知識&rdquo;。
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              {/* (項目 15) CTA統一 */}
              <a href="https://amzn.to/3X0yF3v" target="_blank" rel="noopener noreferrer" className="lp-btn-amazon group">
                Amazonで購入する <span className="cta-arrow">→</span>
              </a>
              <a href="https://amzn.to/4ofHlPS" target="_blank" rel="noopener noreferrer" className="lp-btn-secondary"
                style={{ background: "transparent", color: "white", borderColor: "rgba(255,255,255,0.5)" }}>
                English Edition
              </a>
            </div>
            <p className="mt-14 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
              このページは生殖医療専門医 佐藤 琢磨 が監修しています。© Educate Press
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════ STICKY CTA (項目 16, 17) ═══════════════ */}
      <a href="https://amzn.to/3X0yF3v" target="_blank" rel="noopener noreferrer" className="sticky-cta">
        {/* Book thumb */}
        <div style={{ position: "relative", width: 32, height: 46, flexShrink: 0 }}>
          <Image src="/mockup-jp.png" alt="書影" fill className="object-contain rounded" />
        </div>
        {/* Label */}
        <span className="font-black text-sm flex-1" style={{ color: "var(--text-dark)", whiteSpace: "nowrap" }}>
          Amazonで購入する
        </span>
        {/* Price (mobile) */}
        <span className="text-xs font-bold md:hidden" style={{ color: "var(--rose)" }}>Kindle版</span>
      </a>

    </main>
  );
}
