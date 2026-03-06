"use client";

import Image from "next/image";
import FadeIn from "@/components/fade-in";

/* ─── Article card reusable component ───────────────────── */
function ArtCard({ href, img, title, desc, external = false }: {
  href: string; img: string; title: string; desc: string; external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="lp-card flex flex-col h-full group"
      style={{ textDecoration: "none" }}
    >
      {/* Thumbnail – aspect-video keeps all images the same height */}
      <div className="relative w-full aspect-video overflow-hidden" style={{ flexShrink: 0 }}>
        <Image
          src={img}
          alt={title}
          fill
          className="object-cover w-full group-hover:scale-105"
          style={{ transition: "transform 0.5s ease" }}
        />
        {external && (
          <span
            className="absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", letterSpacing: "0.08em" }}
          >
            note
          </span>
        )}
      </div>

      {/* Body – flex-col so link stays at bottom regardless of text length */}
      <div className="flex flex-col flex-1 p-6 gap-3">
        <h3
          className="font-bold leading-snug text-gray-800"
          style={{ fontSize: "0.925rem", lineHeight: 1.55 }}
        >
          {title}
        </h3>
        {/* flex-grow pushes the link to the bottom of the card */}
        <p
          className="flex-grow text-gray-600 leading-relaxed"
          style={{ fontSize: "0.82rem" }}
        >
          {desc}
        </p>
        <span
          className="font-bold mt-1"
          style={{ fontSize: "0.78rem", color: "var(--rose)" }}
        >
          {external ? "noteで読む ↗" : "記事を読む →"}
        </span>
      </div>
    </a>
  );
}


/* ─── Review card ──────────────────────────────────────── */
function ReviewCard({ name, text }: { name: string; text: string }) {
  return (
    <div className="lp-card p-7 md:p-8" style={{ pointerEvents: "none" }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill="#F7B731" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 1l2.39 4.84 5.34.78-3.86 3.76.91 5.31L10 13.27 5.22 15.69l.91-5.31L2.27 6.62l5.34-.78z" />
            </svg>
          ))}
        </div>
        <span className="font-bold text-sm" style={{ color: "var(--text-dark)" }}>5.0</span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>— {name}（Amazon）</span>
      </div>
      <p className="leading-loose" style={{ fontSize: "0.95rem", color: "var(--text-mid)" }}>{text}</p>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────── */
export default function Home() {
  return (
    <main style={{ background: "var(--ivory)", color: "var(--text-dark)" }}>

      {/* ═══════════════════════════════════════
          HERO
          ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: "100svh", background: "linear-gradient(160deg, var(--ivory) 0%, var(--beige) 40%, var(--rose-pale) 100%)" }}>

        {/* Background woman — right half only on desktop */}
        <div className="absolute inset-y-0 right-0 hidden md:block" style={{ width: "55%", zIndex: 0 }}>
          <Image src="/assets/hero.jpg" alt="" fill className="object-cover object-center" priority
            style={{ opacity: 0.18 }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, var(--ivory) 0%, rgba(253,250,247,0) 40%)" }} />
        </div>

        {/* Decorative circles */}
        <div className="absolute top-24 right-[10%] rounded-full hidden md:block" style={{ width: 320, height: 320, background: "radial-gradient(circle, rgba(196,104,126,0.07) 0%, transparent 70%)", zIndex: 0 }} />
        <div className="absolute bottom-16 left-[5%] rounded-full" style={{ width: 200, height: 200, background: "radial-gradient(circle, rgba(212,133,106,0.08) 0%, transparent 70%)", zIndex: 0 }} />

        <div className="lp-container relative" style={{ paddingTop: "clamp(7rem, 15vw, 10rem)", paddingBottom: "clamp(5rem, 10vw, 8rem)", zIndex: 1 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* ── LEFT: Text ── */}
            <div className="flex flex-col items-start">
              <FadeIn delay={0}>
                <span className="lp-eyebrow">生殖医療専門医がやさしく解説</span>
              </FadeIn>

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

              <FadeIn delay={0.2}>
                <div className="flex flex-wrap gap-3 mb-8">
                  <a href="https://amzn.to/3X0yF3v" target="_blank" rel="noopener noreferrer" className="lp-btn-primary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                    日本語版を読む
                  </a>
                  <a href="/book-landing-en.html" className="lp-btn-secondary">English Edition</a>
                </div>
              </FadeIn>

              <FadeIn delay={0.26}>
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl" style={{ background: "var(--gold-pale)", border: "1px solid rgba(201,146,46,0.25)" }}>
                  <div className="flex">{[...Array(5)].map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill="#C9922E" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 1l2.39 4.84 5.34.78-3.86 3.76.91 5.31L10 13.27 5.22 15.69l.91-5.31L2.27 6.62l5.34-.78z" />
                    </svg>
                  ))}</div>
                  <p className="font-bold text-sm m-0" style={{ color: "var(--text-dark)" }}>Amazonレビュー <span style={{ color: "var(--gold)" }}>5.0</span></p>
                  <p className="text-xs m-0" style={{ color: "var(--text-muted)" }}>（2025年）</p>
                </div>
              </FadeIn>
            </div>

            {/* ── RIGHT: Book + Author ── */}
            <FadeIn delay={0.18} direction="left">
              <div className="flex items-end justify-center gap-6 lg:gap-10">
                {/* Book */}
                <div style={{
                  position: "relative", width: 188, height: 268, flexShrink: 0,
                  filter: "drop-shadow(0 24px 48px rgba(100,20,40,0.28))"
                }}>
                  <Image src="/mockup-jp.png" alt="書影：20代で考える 将来妊娠で困らないための選択" fill className="object-contain" priority />
                </div>
                {/* Author bubble */}
                <div className="flex flex-col items-center gap-3 pb-4">
                  <div style={{
                    position: "relative", width: 80, height: 80, borderRadius: "50%", overflow: "hidden",
                    border: "3px solid white", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", flexShrink: 0
                  }}>
                    <Image src="/250403kz_0002.JPG" alt="著者 佐藤琢磨" fill className="object-cover" />
                  </div>
                  <div className="text-center px-4 py-2.5 rounded-2xl" style={{ background: "rgba(253,250,247,0.9)", backdropFilter: "blur(12px)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                    <p className="font-black text-sm leading-tight m-0" style={{ color: "var(--text-dark)" }}>佐藤 琢磨</p>
                    <p className="text-xs m-0 mt-0.5" style={{ color: "var(--rose)" }}>生殖医療専門医</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          WHY
          ═══════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════
          RELATED ARTICLES (内部記事)
          ═══════════════════════════════════════ */}
      <section className="lp-section" style={{ background: "var(--beige)" }}>
        <div className="lp-container">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="lp-eyebrow">医師解説コラム</span>
              <h2 className="lp-heading">医師が書いた、信頼できる情報</h2>
              <div className="lp-divider mx-auto" />
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {[
              { href: "/note/irregularmenscycle.html", img: "/assets/irregular-mens-cycle-thumb.jpg", title: "月経不順と妊娠しやすさ：基礎知識と受診のタイミング", desc: "月経周期の乱れの背景にあるホルモンバランス・PCOS・生活習慣と、妊娠しやすさへの影響を医師が整理します。" },
              { href: "/note/pregnancy_loss_info.html", img: "/assets/pregnancy-loss-info-thumb.jpg", title: "良好胚なのに流産をくり返すのはなぜ？", desc: "良好胚を移植しても流産や陰性が続く背景を、年齢と染色体のデータから解説。" },
              { href: "/note/identity-complexity-1.html", img: "/assets/identity-complexity-1-thumb.jpg", title: "妊活・不妊治療と向き合うための「心の柱」", desc: "心理学の「アイデンティティ複雑性」から心の守り方を整理します。" },
              { href: "/note/when-to-start-treatment.html", img: "/assets/when-to-start-thumb.jpg", title: "不妊治療はいつから始めるべき？", desc: "AMH・実質不妊期間・ライフプランの3軸で受診と開始時期を整理します。" },
              { href: "/note/age-and-fertility.html", img: "/assets/age-fertility-thumb.jpg", title: "妊娠率と年齢の関係：20代・30代・40代で何が違う？", desc: "卵子の質・量・流産率の観点から、年齢と妊娠率の関係を医師が解説。" },
              { href: "/note/amh.html", img: "/assets/amh-thumb.jpg", title: "AMHとは？卵巣年齢の基礎知識と検査のタイミング", desc: "AMH検査の意味と、受ける最適なタイミングを医師が解説します。" },
              { href: "/note/timing-aih-ivf.html", img: "/assets/note-timing-aih-ivf.jpg", title: "タイミング法・人工授精・体外受精の違い", desc: "仕組み・適応・通院回数・妊娠率・切替目安をやさしく整理。" },
              { href: "/note/ivf-duration-probability.html", img: "/assets/ivf-duration-thumb.jpg", title: "体外受精はどのくらい続く？期間を「確率」で考える", desc: "期間と回数を確率で可視化。モンテカルロ・シミュレーターの考え方を医師が解説。" },
              { href: "/note/male-age-and-pregnancy.html", img: "/assets/male-age-thumb.jpg", title: "男性の年齢と妊娠：年齢が精子・妊娠率に与える影響", desc: "男性年齢と精子の質・妊娠率・流産リスクの関係をやさしく解説。" },
            ].map(({ href, img, title, desc }, i) => (
              <FadeIn key={href} delay={i * 0.04}>
                <ArtCard href={href} img={img} title={title} desc={desc} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          NOTE LINKS (外部 note 記事)
          ═══════════════════════════════════════ */}
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
            {[
              { href: "https://note.com/famous_cosmos408/n/n6bcf9f9897a3", img: "https://assets.st-note.com/production/uploads/images/184173771/rectangle_large_type_2_f24907bccd86a833160d1d1f1aa58627.jpeg", title: "不妊治療と仕事の両立の現実", desc: "キャリアと治療を両立させるための現場の課題と希望を伝えます。" },
              { href: "https://note.com/famous_cosmos408/n/nfebab758114f", img: "https://assets.st-note.com/production/uploads/images/178146733/rectangle_large_type_2_c5777ee592a1c24e5df3862cc8b5aee1.jpeg", title: "幸せな人生とは　生殖医療専門医の視点", desc: "生殖医療の現場から見える「幸福」と「選択」の本質を考えます。" },
              { href: "https://note.com/famous_cosmos408/n/n87f7814b4ff0", img: "https://assets.st-note.com/production/uploads/images/178237946/rectangle_large_type_2_16f6b54bebe07405eadd8dba31a87fd6.jpg", title: "Self-awarenessを通じて将来像を実現できる世界を。", desc: "自己理解を深め、主体的に人生を選択できる社会をめざして。" },
            ].map(({ href, img, title, desc }, i) => (
              <FadeIn key={href} delay={i * 0.08}>
                <ArtCard href={href} img={img} title={title} desc={desc} external />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          REVIEWS
          ═══════════════════════════════════════ */}
      <section className="lp-section" style={{ background: "var(--gold-pale)" }}>
        <div className="lp-container-sm">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="lp-eyebrow" style={{ color: "var(--gold)", background: "rgba(201,146,46,0.1)", borderColor: "rgba(201,146,46,0.2)" }}>読者の声</span>
              <h2 className="lp-heading">Amazon レビュー</h2>
              <div className="lp-divider mx-auto" style={{ background: "linear-gradient(90deg, var(--gold), var(--coral))" }} />
            </div>
          </FadeIn>
          <div className="flex flex-col gap-6">
            <FadeIn delay={0}><ReviewCard name="ひよこまめ" text="信頼できる女医さんがSNSで紹介されていて購入してみました。働き盛りの女性が、妊娠出産といった将来を見据えて知っておくべき情報が分かりやすく書かれています。具体的にいつまでにどうなっておくと良いのかということが書かれており、将来設計を立てるのに役立つと思います。パートナーに読んでもらうのにも良い本だなと思いました。" /></FadeIn>
            <FadeIn delay={0.1}><ReviewCard name="さくら" text="専門医の立場から、妊娠に関する医学的エビデンスをイラストを交えてわかりやすく解説した良書です。単なる医学知識の羅列にとどまらず、著者自身も子を持つ父親であり、共働き夫婦としての経験を踏まえながら、読者の幸せなライフプラン形成を心から願う思いが随所に感じられます。" /></FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          BENEFITS (Before / After)
          ═══════════════════════════════════════ */}
      <section className="lp-section" style={{ background: "var(--white)" }}>
        <div className="lp-container">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="lp-eyebrow">Before / After</span>
              <h2 className="lp-heading">この本を読んでこう変わる。</h2>
              <div className="lp-divider mx-auto" />
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="flex flex-col gap-4">
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
                      <p className="text-sm m-0 line-through" style={{ color: "var(--text-muted)" }}>{before}</p>
                    </div>
                    <div className="px-5 py-4 flex items-start gap-3" style={{ background: "var(--white)" }}>
                      <span className="text-base flex-shrink-0 mt-0.5">✅</span>
                      <p className="text-sm font-bold m-0" style={{ color: "var(--text-dark)" }}>{after}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
            <FadeIn delay={0.12} direction="left">
              <div className="lp-card p-8 md:p-10" style={{ pointerEvents: "none", background: "var(--beige)" }}>
                <h3 className="font-black text-xl mb-6" style={{ color: "var(--text-dark)", fontFamily: "'Zen Kaku Gothic New', sans-serif" }}>
                  📖 内容の全体像（4章構成）
                </h3>
                <ul className="space-y-4">
                  {[
                    ["第1章", "将来を選ぶための基本知識"],
                    ["第2章", "自分の体を守るための知識"],
                    ["第3章", "妊娠するための知識"],
                    ["第4章", "不妊治療の基礎と選択肢"],
                    ["付録", "早発卵巣不全・PCOS・ブライダルチェック"],
                  ].map(([ch, title]) => (
                    <li key={ch} className="flex gap-4 items-center">
                      <span className="text-white font-black text-xs py-1.5 px-3 rounded-full flex-shrink-0"
                        style={{ background: "var(--rose)", minWidth: 48, textAlign: "center" }}>{ch}</span>
                      <span className="text-sm" style={{ color: "var(--text-mid)" }}>{title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SIMULATION
          ═══════════════════════════════════════ */}
      <section className="lp-section" style={{ background: "var(--rose-pale)" }}>
        <div className="lp-container-sm text-center">
          <FadeIn>
            <span className="lp-eyebrow">🔬 シミュレーター</span>
            <h2 className="lp-heading mb-4">体外受精の期間、<br />「確率」で考えてみる</h2>
            <div className="lp-divider mx-auto" />
            <p className="lp-prose mb-10">実際のIVFデータをもとにしたモンテカルロ・シミュレーションを使い、理論値として可視化するツールです。妊娠率のイメージを数字でとらえることで、治療計画やライフプランをより現実的に考える助けになります。</p>
            <a href="https://chatgpt.com/canvas/shared/68b783ad34648191bf0ef3ba12ce8a96" target="_blank" rel="noopener noreferrer" className="lp-btn-secondary">
              IVFシミュレーターを開く →
            </a>
            <p className="mt-6 text-xs" style={{ color: "var(--text-muted)" }}>※統計モデルからの理論値です。個々の妊娠を保証するものではありません。</p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          AUTHOR
          ═══════════════════════════════════════ */}
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
            <div className="lp-card p-8 md:p-12 flex flex-col md:flex-row gap-10 md:gap-14 items-center md:items-start" style={{ pointerEvents: "none" }}>
              {/* Photo */}
              <div className="flex flex-col items-center gap-5 flex-shrink-0">
                <div style={{
                  position: "relative", width: 148, height: 148, borderRadius: "50%", overflow: "hidden",
                  border: "4px solid var(--white)", boxShadow: "0 8px 32px rgba(196,104,126,0.22)"
                }}>
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
              {/* Bio */}
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
                      <>
                        <dt key={dt} className="font-bold" style={{ color: "var(--text-muted)" }}>{dt}</dt>
                        <dd key={dd} className="m-0" style={{ color: "var(--text-dark)" }}>{dd}</dd>
                      </>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          INSTAGRAM
          ═══════════════════════════════════════ */}
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
              <script async src="//www.instagram.com/embed.js" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FAQ
          ═══════════════════════════════════════ */}
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
            {[
              { q: "20代でも不妊になることはありますか？", a: "あります。生理が規則的でも卵管のトラブルやパートナー側の要因などで妊娠しにくい場合があります。早めに基礎検査を受けておくと、将来の選択肢を広く保つことができます。" },
              { q: "妊娠の「ベストな年齢」は何歳ですか？", a: "一般的には20代後半〜30歳前後が妊娠率のピークとされますが、個人差が大きいため、年齢だけでなくAMH値・月経周期・不妊リスクとなる疾患の有無なども総合的に見ることが大切です。" },
              { q: "いつ病院を受診したらいいか、目安はありますか？", a: "35歳未満で1年、35歳以上で半年妊娠しなければ一度相談をおすすめします。生殖医療専門医に早めに相談することで、遠回りの時間を減らせます。" },
            ].map(({ q, a }, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="lp-card p-7" style={{ pointerEvents: "none" }}>
                  <p className="font-bold mb-3 flex gap-3 items-baseline" style={{ color: "var(--rose)", fontSize: "0.95rem" }}>
                    <span className="flex-shrink-0 bg-rose-pale text-xs font-black w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: "var(--rose-pale)", color: "var(--rose)", minWidth: 24 }}>Q</span>
                    {q}
                  </p>
                  <p className="flex gap-3 m-0 items-baseline leading-loose" style={{ color: "var(--text-mid)", fontSize: "0.9rem" }}>
                    <span className="flex-shrink-0 font-black text-xs w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: "var(--beige-mid)", color: "var(--text-muted)", minWidth: 24, display: "inline-flex" }}>A</span>
                    {a}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════ */}
      <section className="lp-section relative overflow-hidden" style={{ background: "linear-gradient(150deg, #7B3049 0%, var(--rose) 45%, var(--coral) 100%)" }}>
        {/* dot pattern */}
        <div className="absolute inset-0" style={{
          opacity: 0.06,
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "28px 28px"
        }} />
        <div className="lp-container-sm text-center relative" style={{ zIndex: 1 }}>
          <FadeIn>
            <div style={{
              position: "relative", width: 132, height: 188, margin: "0 auto 2.5rem",
              filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.4))"
            }}>
              <Image src="/mockup-jp.png" alt="書影" fill className="object-contain" />
            </div>
            <p className="font-bold mb-3 text-sm tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.7)" }}>
              Kindle版・ペーパーバック版 好評発売中
            </p>
            <h2 className="font-black text-white mb-5" style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontFamily: "'Zen Kaku Gothic New', sans-serif", lineHeight: 1.3 }}>
              "将来の自分"のために、<br />今日の数ページから。
            </h2>
            <p className="mb-10" style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.05rem" }}>
              スマホで3分から読めるKindle版。<br />医師が書いた"安心できる医療知識"。
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="https://amzn.to/3X0yF3v" target="_blank" rel="noopener noreferrer" className="lp-btn-amazon">
                📖 日本語版を購入（Amazon）
              </a>
              <a href="https://amzn.to/4ofHlPS" target="_blank" rel="noopener noreferrer" className="lp-btn-secondary" style={{ background: "transparent", color: "white", borderColor: "rgba(255,255,255,0.5)" }}>
                English Edition
              </a>
            </div>
            <p className="mt-14 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
              このページは生殖医療専門医 佐藤 琢磨 が監修しています。© Educate Press
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          STICKY CTA
          ═══════════════════════════════════════ */}
      <a href="https://amzn.to/3X0yF3v" target="_blank" rel="noopener noreferrer" className="sticky-cta">
        <div style={{ position: "relative", width: 38, height: 54, flexShrink: 0 }}>
          <Image src="/mockup-jp.png" alt="書影" fill className="object-contain rounded" />
        </div>
        <span className="font-black text-sm" style={{ color: "var(--rose)", whiteSpace: "nowrap" }}>Get it now</span>
      </a>

    </main>
  );
}
