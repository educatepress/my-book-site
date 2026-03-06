"use client";

import Image from "next/image";
import Script from "next/script";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import FadeIn from "@/components/fade-in";

/* ═══════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════ */

const TOC = [
  { ch: "第1章", title: "将来を選ぶための基本知識", desc: "卵子の質と量、年齢との関係、妊孕性の基礎——将来の選択肢を広げるために最初に知っておきたいこと。" },
  { ch: "第2章", title: "自分の体を守るための知識", desc: "月経の仕組み、子宮内膜症、性感染症、HPV——自分の体を守るために今すぐできること。" },
  { ch: "第3章", title: "妊娠するための知識", desc: "排卵のメカニズム、基礎体温、タイミング、ライフプランとの両立について。" },
  { ch: "第4章", title: "不妊治療の基礎と選択肢", desc: "人工授精・体外受精の違い、かかる期間、費用感——治療を始める前に知っておくべきこと。" },
  { ch: "付録", title: "早発卵巣不全・PCOS・ブライダルチェック", desc: "特に知っておきたい3つのトピックを補足コラムで解説。" },
];

const FAQS = [
  { q: "20代でも不妊になることはありますか？", a: "あります。生理が規則的でも卵管のトラブルやパートナー側の要因などで妊娠しにくい場合があります。早めに基礎検査を受けておくと、将来の選択肢を広く保つことができます。" },
  { q: "妊娠の「ベストな年齢」は何歳ですか？", a: "一般的には20代後半〜30歳前後が妊娠率のピークとされますが、個人差が大きいため、年齢だけでなくAMH値・月経周期・不妊リスクとなる疾患の有無なども総合的に見ることが大切です。" },
  { q: "いつ病院を受診したらいいか、目安はありますか？", a: "35歳未満で1年、35歳以上で半年妊娠しなければ一度相談をおすすめします。生殖医療専門医に早めに相談することで、遠回りの時間を減らせます。" },
];

const FOOTER_ARTICLES = [
  { href: "/note/irregularmenscycle.html", title: "月経不順と妊娠しやすさ", desc: "ホルモンバランス・PCOS・生活習慣と妊娠しやすさの関係" },
  { href: "/note/when-to-start-treatment.html", title: "不妊治療はいつから始めるべき？", desc: "AMH・不妊期間・ライフプランの3軸で整理" },
  { href: "/note/age-and-fertility.html", title: "妊娠率と年齢の関係", desc: "卵子の質・量・流産率と年齢" },
  { href: "https://note.com/famous_cosmos408/n/n6bcf9f9897a3", title: "不妊治療と仕事の両立の現実", desc: "キャリアと治療の両立", badge: "note" },
  { href: "https://note.com/famous_cosmos408/n/nfebab758114f", title: "幸せな人生とは　生殖医療専門医の視点", desc: "「幸福」と「選択」の本質", badge: "note" },
];

/* ═══════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════ */

function HeroBook() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, -20]);
  return (
    <motion.div style={{
      y, position: "relative", flexShrink: 0,
      filter: "drop-shadow(0 30px 60px rgba(100,20,40,0.32))",
    }} className="w-[180px] h-[270px] md:w-[240px] md:h-[360px]">
      <Image src="/mockup-jp.png" alt="書影：20代で考える 将来妊娠で困らないための選択" fill className="object-contain" priority />
    </motion.div>
  );
}

function ReviewCard({ name, text }: { name: string; text: string }) {
  return (
    <div className="lp-card lp-card-static p-6 md:p-8 relative">
      <span className="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full"
        style={{ background: "rgba(201,146,46,0.1)", color: "var(--gold)", border: "1px solid rgba(201,146,46,0.25)" }}>
        ✓ Amazonで購入
      </span>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex gap-0.5" role="img" aria-label="5つ星中5つ星の評価">
          {[...Array(5)].map((_, i) => (
            <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill="#F7B731">
              <path d="M10 1l2.39 4.84 5.34.78-3.86 3.76.91 5.31L10 13.27 5.22 15.69l.91-5.31L2.27 6.62l5.34-.78z" />
            </svg>
          ))}
        </div>
        <span className="font-bold text-sm" style={{ color: "var(--text-dark)" }}>5.0</span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>— {name}</span>
      </div>
      <p className="leading-relaxed m-0" style={{ fontSize: "0.92rem", color: "var(--text-mid)" }}>{text}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PAGE — 7-Section Storytelling LP
   ═══════════════════════════════════════════════════════ */
export default function Home() {
  /* Sticky CTA visibility: hide in hero, show after */
  const heroRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <main style={{ background: "var(--ivory)", color: "var(--text-dark)" }}>

      {/* ═══════════════════════════════════════════
          ① HERO — 第1幕: 共感と問題提起
          ═══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative overflow-hidden"
        style={{ minHeight: "100svh", background: "linear-gradient(160deg, var(--ivory) 0%, var(--beige) 50%, var(--rose-pale) 100%)" }}>

        {/* Dot pattern bg */}
        <div className="absolute inset-0 hero-dots" />
        <div className="absolute top-24 right-[10%] rounded-full hidden md:block"
          style={{ width: 400, height: 400, background: "radial-gradient(circle, rgba(196,104,126,0.06) 0%, transparent 70%)" }} />

        <div className="lp-container sec-hero relative" style={{ zIndex: 1 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* LEFT */}
            <div className="flex flex-col items-start">
              <FadeIn delay={0}><span className="lp-eyebrow">生殖医療専門医がやさしく解説</span></FadeIn>
              <FadeIn delay={0.08}>
                <h1 className="lp-h1 mb-5" style={{ maxWidth: "18ch" }}>
                  20代で考える<br />
                  <span style={{ color: "var(--rose)" }}>将来妊娠で困らない</span><br />
                  ための選択
                </h1>
              </FadeIn>
              <FadeIn delay={0.14}>
                <div className="lp-divider" />
                <p className="lp-prose mb-7" style={{ maxWidth: "36ch" }}>
                  今の自分を大切にすることが、未来の「選択肢」を増やす。<br />
                  <strong style={{ color: "var(--text-dark)" }}>20代・30代の女性に、今から知っておくべき24の医学的事実</strong>を一冊に。
                </p>
              </FadeIn>
              <FadeIn delay={0.2}>
                <a href="https://amzn.to/3X0yF3v" target="_blank" rel="noopener noreferrer" className="lp-btn-amazon group mb-3">
                  📖 Amazonで購入する <span className="cta-arrow">→</span>
                </a>
                <p className="text-xs m-0 mb-5" style={{ color: "var(--text-muted)" }}>
                  <a href="/book-landing-en.html" className="underline hover:no-underline" style={{ color: "var(--text-muted)" }}>English Edition</a>
                  ｜Kindle版 ¥1,200
                </p>
              </FadeIn>
              <FadeIn delay={0.26}>
                <p className="text-sm m-0" style={{ color: "var(--text-mid)" }}>
                  <span style={{ color: "var(--gold)" }}>★</span>{" "}
                  <strong>5.0</strong>（Amazon・2件） ·{" "}
                  <a href="https://www.amazon.co.jp/dp/B0F3S8JVWB" target="_blank" rel="noopener noreferrer"
                    className="underline" style={{ color: "var(--rose)" }}>レビューを見る</a>
                </p>
              </FadeIn>
            </div>

            {/* RIGHT: Book only */}
            <FadeIn delay={0.18} direction="left">
              <div className="flex justify-center"><HeroBook /></div>
            </FadeIn>
          </div>
        </div>

        {/* Author bar */}
        <div className="relative" style={{ zIndex: 1, borderTop: "1px solid rgba(196,104,126,0.1)", background: "rgba(253,250,247,0.85)", backdropFilter: "blur(12px)" }}>
          <div className="lp-container">
            <div className="flex items-center gap-4 py-3">
              <div style={{ position: "relative", width: 48, height: 48, borderRadius: "50%", overflow: "hidden", border: "2px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", flexShrink: 0 }}>
                <Image src="/250403kz_0002.JPG" alt="著者 佐藤琢磨" fill className="object-cover" style={{ objectPosition: "center 20%" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm m-0 leading-tight" style={{ color: "var(--text-dark)" }}>佐藤 琢磨｜<span className="font-normal" style={{ color: "var(--rose)" }}>生殖医療専門医</span></p>
              </div>
              <div className="flex gap-3">
                <a href="https://www.instagram.com/takuma_sato_md/" target="_blank" rel="noopener noreferrer" className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>📸 Instagram</a>
                <a href="https://note.com/famous_cosmos408" target="_blank" rel="noopener noreferrer" className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>📝 note</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ② EMPATHY — 「こんな不安、ありませんか？」
          ═══════════════════════════════════════════ */}
      <section className="sec-lg" style={{ background: "var(--white)", paddingBlock: "clamp(4rem,10vw,7rem)" }}>
        <div className="lp-container">
          <FadeIn>
            <div className="text-center mb-12">
              <span className="lp-eyebrow">共感</span>
              <h2 className="lp-h2">こんなこと、感じていませんか？</h2>
              <div className="lp-divider mx-auto" />
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12">
            {[
              { icon: "💭", text: "「妊娠はいつか、なんとかなる」と思っている。" },
              { icon: "📱", text: "ネットの情報が多すぎて、何を信じていいかわからない。" },
              { icon: "⏳", text: "将来のことを考えると、漠然とした不安がある。" },
              { icon: "🤝", text: "パートナーとどう話していいかわからない。" },
            ].map(({ icon, text }, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div className="flex items-start gap-4 rounded-2xl p-5" style={{ background: "var(--beige)", pointerEvents: "none" }}>
                  <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
                  <p className="text-sm font-medium m-0 leading-relaxed" style={{ color: "var(--text-mid)" }}>{text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.3}>
            <p className="text-center lp-h3 m-0" style={{ color: "var(--text-dark)" }}>
              知っているか、知らないかで変わる<span style={{ color: "var(--rose)" }}>「時間」</span>がある。
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ③ BEFORE / AFTER — 第2幕: 解決策の提示
          ═══════════════════════════════════════════ */}
      <section className="sec-lg" style={{ background: "var(--white)" }}>
        <div className="lp-container">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="lp-h2">この本を読んでこう変わる。</h2>
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
                    <p className="text-sm m-0 line-through" style={{ color: "var(--text-muted)" }} aria-label="改善前">{before}</p>
                  </div>
                  <div className="px-5 py-4 flex items-start gap-3" style={{ background: "var(--white)" }}>
                    <span className="text-base flex-shrink-0 mt-0.5">✅</span>
                    <p className="text-sm font-bold m-0" style={{ color: "var(--text-dark)" }} aria-label="改善後">{after}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Mid CTA */}
          <FadeIn delay={0.3}>
            <div className="text-center mt-14 py-10 px-6 rounded-3xl" style={{ background: "var(--rose-pale)" }}>
              <p className="font-bold text-lg mb-3 m-0" style={{ color: "var(--text-dark)" }}>
                あなたの「知らなかった」を、今日ここで変えませんか？
              </p>
              <a href="https://amzn.to/3X0yF3v" target="_blank" rel="noopener noreferrer" className="lp-btn-amazon group">
                📖 Amazonで購入する <span className="cta-arrow">→</span>
              </a>
              <p className="text-xs mt-3 m-0" style={{ color: "var(--text-muted)" }}>
                Kindle版 ¥1,200｜ペーパーバック版 ¥1,980
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ④ BOOK DETAIL — 目次＋試し読み
          ═══════════════════════════════════════════ */}
      <section className="sec-lg" style={{ background: "var(--beige)" }}>
        <div className="lp-container">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="lp-h2">この本の中身</h2>
              <div className="lp-divider mx-auto" />
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Left: TOC accordion */}
            <FadeIn delay={0.1}>
              <div className="lp-card lp-card-static p-6 md:p-8" style={{ background: "var(--white)" }}>
                <h3 className="lp-h3 mb-5">📖 目次（4章＋付録）</h3>
                {TOC.map(({ ch, title, desc }) => (
                  <details key={ch} className="toc-item">
                    <summary>
                      <span className="text-white font-black text-xs py-1 px-2.5 rounded-full flex-shrink-0"
                        style={{ background: "var(--rose)", minWidth: 44, textAlign: "center" }}>{ch}</span>
                      {title}
                    </summary>
                    <p className="toc-desc">{desc}</p>
                  </details>
                ))}
              </div>
            </FadeIn>

            {/* Right: Preview + Bibliographic info */}
            <FadeIn delay={0.2} direction="left">
              <div className="flex flex-col gap-6">
                {/* Preview link */}
                <div className="lp-card lp-card-static p-6 text-center" style={{ background: "var(--rose-pale)" }}>
                  <p className="font-bold text-sm mb-3 m-0" style={{ color: "var(--text-dark)" }}>中身を少し見てみる</p>
                  <a href="https://www.amazon.co.jp/dp/B0F3S8JVWB" target="_blank" rel="noopener noreferrer"
                    className="lp-btn-secondary group text-sm">
                    Amazonの試し読みで確認 <span className="cta-arrow">→</span>
                  </a>
                </div>

                {/* Bibliographic info */}
                <div className="lp-card lp-card-static p-6">
                  <h3 className="lp-h3 mb-4">書誌情報</h3>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm m-0">
                    {[
                      ["タイトル", "20代で考える 将来妊娠で困らないための選択"],
                      ["著者", "佐藤 琢磨（MD, PhD）"],
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
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ⑤ TRUST — 第3幕: 信頼性の証明
          ═══════════════════════════════════════════ */}

      {/* ⑤-A Author */}
      <section className="sec-md" style={{ background: "var(--beige-mid)" }}>
        <div className="lp-container">
          <FadeIn>
            <div className="lp-card lp-card-static p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* Photo */}
              <div className="flex flex-col items-center gap-4 flex-shrink-0">
                <div style={{ position: "relative", width: 120, height: 120, borderRadius: "50%", overflow: "hidden", border: "3px solid var(--white)", boxShadow: "0 8px 32px rgba(196,104,126,0.22)" }}>
                  <Image src="/250403kz_0002.JPG" alt="著者 佐藤琢磨" fill className="object-cover" style={{ objectPosition: "center 20%" }} />
                </div>
                <div className="text-center">
                  <p className="font-black text-lg m-0" style={{ color: "var(--text-dark)" }}>佐藤 琢磨</p>
                  <p className="text-xs m-0 mt-0.5" style={{ color: "var(--text-muted)" }}>Takuma Sato, MD, PhD</p>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {["生殖医療専門医", "産婦人科専門医", "医学博士"].map(b => (
                    <span key={b} className="lp-badge" style={{ fontSize: "0.6rem" }}>{b}</span>
                  ))}
                </div>
              </div>
              {/* Bio (compact) */}
              <div className="flex-1 min-w-0">
                <div className="lp-prose" style={{ fontSize: "0.95rem" }}>
                  <p>日本生殖医学会認定・生殖医療専門医。不妊治療の臨床と研究に従事し、患者教育にも注力。「note」「Instagram」で正確な医療知識をやさしく発信している。</p>
                  <p>東京慈恵会医科大学産婦人科学講座で12年間勤務し、早発卵巣不全（POI）の臨床研究で博士号を取得。2025年4月より表参道ARTクリニックに入職。</p>
                </div>
                <div className="flex gap-4 mt-4">
                  <a href="https://www.instagram.com/takuma_sato_md/" target="_blank" rel="noopener noreferrer"
                    className="text-sm font-bold hover:underline" style={{ color: "var(--rose)" }}>📸 Instagramもフォロー →</a>
                  <a href="https://note.com/famous_cosmos408" target="_blank" rel="noopener noreferrer"
                    className="text-sm font-bold hover:underline" style={{ color: "var(--rose)" }}>📝 noteを読む →</a>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ⑤-B Reviews */}
      <section className="sec-md" style={{ background: "var(--gold-pale)" }}>
        <div className="lp-container-sm">
          <FadeIn>
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--gold)" }}>読者の声</p>
              <h2 className="lp-h2">Amazon レビュー</h2>
              <div className="lp-divider mx-auto" style={{ background: "linear-gradient(90deg, var(--gold), var(--coral))" }} />
              <p className="text-sm mt-3 m-0" style={{ color: "var(--text-muted)" }}>
                <span role="img" aria-label="5つ星中5つ星の評価" style={{ color: "var(--gold)" }}>★</span>{" "}
                5.0（2件のレビュー） ·{" "}
                <a href="https://www.amazon.co.jp/dp/B0F3S8JVWB" target="_blank" rel="noopener noreferrer"
                  className="underline font-bold" style={{ color: "var(--gold)" }}>Amazonで全レビューを見る</a>
              </p>
            </div>
          </FadeIn>
          <div className="flex flex-col gap-5">
            <FadeIn delay={0}><ReviewCard name="ひよこまめ" text="信頼できる女医さんがSNSで紹介されていて購入してみました。働き盛りの女性が、妊娠出産といった将来を見据えて知っておくべき情報が分かりやすく書かれています。具体的にいつまでにどうなっておくと良いのかということが書かれており、将来設計を立てるのに役立つと思います。パートナーに読んでもらうのにも良い本だなと思いました。" /></FadeIn>
            <FadeIn delay={0.1}><ReviewCard name="さくら" text="専門医の立場から、妊娠に関する医学的エビデンスをイラストを交えてわかりやすく解説した良書です。単なる医学知識の羅列にとどまらず、著者自身も子を持つ父親であり、共働き夫婦としての経験を踏まえながら、読者の幸せなライフプラン形成を心から願う思いが随所に感じられます。" /></FadeIn>
          </div>
        </div>
      </section>

      {/* ⑤-C FAQ */}
      <section className="sec-md" style={{ background: "var(--white)" }}>
        <div className="lp-container-sm">
          <FadeIn>
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>FAQ</p>
              <h2 className="lp-h2">よくある質問</h2>
              <div className="lp-divider mx-auto" />
            </div>
          </FadeIn>
          <div className="flex flex-col gap-3">
            {FAQS.map(({ q, a }, i) => (
              <FadeIn key={i} delay={i * 0.06}>
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
          <p className="text-xs mt-6 text-center" style={{ color: "var(--text-muted)" }}>※生殖医療専門医 佐藤 琢磨 監修の一般的な情報です。</p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ⑥ FINAL CTA — 第4幕: 行動喚起
          ═══════════════════════════════════════════ */}
      <section className="sec-lg relative overflow-hidden"
        style={{ background: "linear-gradient(150deg, #7B3049 0%, var(--rose) 45%, var(--coral) 100%)" }}>
        <div className="absolute inset-0" style={{ opacity: 0.06, backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="lp-container-sm text-center relative" style={{ zIndex: 1 }}>
          <FadeIn>
            <div style={{ position: "relative", width: 120, height: 170, margin: "0 auto 2rem", filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.4))" }}>
              <Image src="/mockup-jp.png" alt="書影" fill className="object-contain" />
            </div>
            <p className="font-bold mb-2 text-sm tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.6)" }}>
              Kindle版・ペーパーバック版 好評発売中
            </p>
            <h2 className="font-black text-white mb-4" style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontFamily: "'Zen Kaku Gothic New', sans-serif", lineHeight: 1.3 }}>
              &ldquo;将来の自分&rdquo;のために、<br />今日の数ページから。
            </h2>
            <p className="mb-8" style={{ color: "rgba(255,255,255,0.8)", fontSize: "1rem" }}>
              スマホで3分から読めるKindle版。<br />医師が書いた&ldquo;安心できる医療知識&rdquo;。
            </p>
            <a href="https://amzn.to/3X0yF3v" target="_blank" rel="noopener noreferrer" className="lp-btn-amazon group">
              Amazonで購入する <span className="cta-arrow">→</span>
            </a>
            <p className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.5)" }}>
              <a href="/book-landing-en.html" className="underline" style={{ color: "rgba(255,255,255,0.5)" }}>English Edition</a>
              ｜Kindle版 ¥1,200
            </p>

            {/* Simulator integration */}
            <div className="mt-12 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
              <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.7)" }}>
                🔬 体外受精の期間を確率で考えるシミュレーターもあります
              </p>
              <a href="https://chatgpt.com/canvas/shared/68b783ad34648191bf0ef3ba12ce8a96" target="_blank" rel="noopener noreferrer"
                className="text-sm font-bold underline" style={{ color: "rgba(255,255,255,0.9)" }}>
                IVFシミュレーターを開く →
              </a>
              <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>※統計モデルからの理論値です。個々の妊娠を保証するものではありません。</p>
            </div>

            {/* Partner share */}
            <div className="mt-8 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
              <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.7)" }}>
                パートナーにも読んでほしいと思ったら
              </p>
              <div className="flex gap-3 justify-center">
                <a href="https://line.me/R/share?text=20%E4%BB%A3%E3%81%A7%E8%80%83%E3%81%88%E3%82%8B%20%E5%B0%86%E6%9D%A5%E5%A6%8A%E5%A8%A0%E3%81%A7%E5%9B%B0%E3%82%89%E3%81%AA%E3%81%84%E3%81%9F%E3%82%81%E3%81%AE%E9%81%B8%E6%8A%9E%20https://amzn.to/3X0yF3v"
                  target="_blank" rel="noopener noreferrer"
                  className="text-sm font-bold px-4 py-2 rounded-full"
                  style={{ background: "#06C755", color: "white" }}>
                  LINEで送る
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ⑦ FOOTER — 関連記事 + SNS + copyright
          ═══════════════════════════════════════════ */}
      <footer className="lp-footer sec-lg">
        <div className="lp-container">
          {/* Article links */}
          <FadeIn>
            <div className="mb-12">
              <h3 className="font-bold text-base mb-6" style={{ color: "var(--footer-text)" }}>もっと詳しく知りたい方へ</h3>
              <ul className="space-y-4 m-0 p-0 list-none">
                {FOOTER_ARTICLES.map(({ href, title, desc, badge }) => (
                  <li key={href}>
                    <a href={href} target={badge ? "_blank" : undefined} rel={badge ? "noopener noreferrer" : undefined}
                      className="flex items-baseline gap-3 group">
                      <span className="text-sm font-bold group-hover:underline" style={{ color: "var(--footer-text)" }}>{title}</span>
                      {badge && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)", color: "var(--footer-muted)" }}>{badge}</span>}
                      <span className="text-xs hidden sm:inline" style={{ color: "var(--footer-muted)" }}>— {desc}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          {/* Divider */}
          <div className="mb-8" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }} />

          {/* SNS + copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-6">
              <a href="https://www.instagram.com/takuma_sato_md/" target="_blank" rel="noopener noreferrer" className="text-sm">📸 Instagram</a>
              <a href="https://note.com/famous_cosmos408" target="_blank" rel="noopener noreferrer" className="text-sm">📝 note</a>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs m-0" style={{ color: "var(--footer-muted)" }}>このページは生殖医療専門医 佐藤 琢磨 が監修しています。</p>
              <p className="text-xs m-0 mt-1" style={{ color: "var(--footer-muted)" }}>© Educate Press</p>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════
          STICKY CTA (IntersectionObserver controlled)
          ═══════════════════════════════════════════ */}
      <a href="https://amzn.to/3X0yF3v" target="_blank" rel="noopener noreferrer"
        className={`sticky-cta ${showSticky ? "" : "hidden"}`}>
        <div style={{ position: "relative", width: 32, height: 46, flexShrink: 0 }}>
          <Image src="/mockup-jp.png" alt="書影" fill className="object-contain rounded" />
        </div>
        <span className="font-black text-sm flex-1" style={{ color: "var(--text-dark)", whiteSpace: "nowrap" }}>
          Amazonで購入する
        </span>
        <span className="text-xs font-bold md:hidden" style={{ color: "var(--rose)" }}>¥1,200</span>
      </a>

      {/* Instagram embed script */}
      <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" />
    </main>
  );
}
