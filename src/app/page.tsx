"use client";

import Image from 'next/image';
import FadeIn from "@/components/fade-in";

/* ════════════════════════════════════════════════
   Wrapper helpers – replaces LiftKit primitives
   so we can control padding ourselves.
   ════════════════════════════════════════════════ */
const Wrap = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`w-full max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16 ${className}`}>{children}</div>
);

const WrapMd = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`w-full max-w-screen-md mx-auto px-6 sm:px-10 ${className}`}>{children}</div>
);

const Sec = ({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <section className={`py-16 md:py-24 ${className}`} style={style}>{children}</section>
);

const Eyebrow = ({ label }: { label: string }) => (
  <span className="inline-block bg-[#B35E76]/10 text-[#B35E76] font-bold px-4 py-1 rounded-full text-xs tracking-widest uppercase mb-5">
    {label}
  </span>
);

/* Article card */
const ArtCard = ({ href, img, title, desc, external = false }: { href: string; img: string; title: string; desc: string; external?: boolean }) => (
  <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="group block outline-none h-full">
    <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(179,94,118,0.08)] hover:shadow-[0_12px_40px_rgba(179,94,118,0.18)] hover:-translate-y-1 transition-all duration-300 h-full flex flex-col border border-[#B35E76]/8">
      <div className="relative w-full aspect-video overflow-hidden bg-[#FFF7F5]">
        <Image src={img} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-6 flex flex-col flex-1 gap-4">
        <h3 className="font-bold text-[#574540] text-base leading-snug line-clamp-2">{title}</h3>
        <p className="text-[#8C7A75] text-sm leading-relaxed line-clamp-3 flex-1">{desc}</p>
        <span className="text-[#B35E76] font-bold text-sm group-hover:underline">{external ? "noteで読む ↗" : "記事を読む →"}</span>
      </div>
    </div>
  </a>
);

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: "#FFFBF7", color: "#574540" }}>

      {/* ── 1. HERO ─────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: "linear-gradient(135deg, #FFFBF7 0%, #FFF0F3 50%, #FFF7F5 100%)" }}>
        {/* Background woman image – subtle */}
        <div className="absolute inset-0 z-0 hidden md:block">
          <Image src="/assets/hero.jpg" alt="" fill className="object-cover object-top" style={{ opacity: 0.12 }} priority />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(255,251,247,0.97) 40%, rgba(255,251,247,0.6) 70%, rgba(255,251,247,0.3) 100%)" }} />
        </div>

        <Wrap className="relative z-10 py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left col */}
            <div>
              <FadeIn delay={0}>
                <Eyebrow label="生殖医療専門医がやさしく解説" />
              </FadeIn>
              <FadeIn delay={0.1}>
                <h1 className="font-black leading-tight mb-6" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "#574540", letterSpacing: "-0.01em" }}>
                  『20代で考える<br />
                  <span style={{ color: "#B35E76" }}>将来妊娠で困らない</span><br />
                  ための選択』
                </h1>
              </FadeIn>
              <FadeIn delay={0.15}>
                <p className="mb-8 leading-loose" style={{ fontSize: "1.05rem", color: "#8C7A75", maxWidth: "38ch" }}>
                  今の自分を大切にすることが、未来の「選択肢」を増やす。<br />
                  <strong style={{ color: "#574540" }}>20代・30代の女性が"今から知っておくべき"</strong><br />
                  24の医学的事実を一冊に。
                </p>
              </FadeIn>
              <FadeIn delay={0.2}>
                <div className="flex flex-wrap gap-3">
                  <a href="https://amzn.to/3X0yF3v" target="_blank" rel="noopener noreferrer">
                    <button className="px-7 py-3.5 rounded-full font-black text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" style={{ background: "#B35E76", fontSize: "1rem", border: "none", cursor: "pointer" }}>
                      📖 日本語版を読む
                    </button>
                  </a>
                  <a href="/book-landing-en.html">
                    <button className="px-7 py-3.5 rounded-full font-bold transition-all hover:bg-[#B35E76]/5" style={{ background: "white", color: "#B35E76", fontSize: "1rem", border: "2px solid #B35E76", cursor: "pointer" }}>
                      English Edition
                    </button>
                  </a>
                </div>
              </FadeIn>

              {/* Rating badge */}
              <FadeIn delay={0.3}>
                <div className="inline-flex items-center gap-3 mt-8 px-5 py-3 rounded-full" style={{ background: "rgba(255,164,28,0.08)", border: "1px solid rgba(255,164,28,0.3)" }}>
                  <span className="text-lg" style={{ color: "#FFA41C" }}>★★★★★</span>
                  <span className="font-bold text-sm" style={{ color: "#574540" }}>Amazonレビュー 5.0</span>
                  <span className="text-sm" style={{ color: "#8C7A75" }}>（2025年）</span>
                </div>
              </FadeIn>
            </div>

            {/* Right col – book + author */}
            <FadeIn delay={0.25} direction="left">
              <div className="flex items-end justify-center gap-8">
                {/* Book cover */}
                <div className="relative flex-shrink-0" style={{ filter: "drop-shadow(0 30px 50px rgba(179,94,118,0.28))" }}>
                  <Image
                    src="/mockup-jp.png"
                    alt="書影"
                    width={220}
                    height={315}
                    className="rounded-xl object-contain"
                    style={{ border: "1px solid rgba(179,94,118,0.12)" }}
                    priority
                  />
                </div>
                {/* Author avatar card */}
                <div className="flex flex-col items-center gap-3 pb-6">
                  <div className="relative rounded-full overflow-hidden border-4 border-white" style={{ width: 88, height: 88, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
                    <Image src="/250403kz_0002.JPG" alt="著者 佐藤琢磨" fill className="object-cover" />
                  </div>
                  <div className="px-4 py-2 rounded-2xl text-center" style={{ background: "rgba(255,251,247,0.9)", backdropFilter: "blur(8px)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
                    <p className="font-black text-sm m-0" style={{ color: "#574540" }}>佐藤 琢磨</p>
                    <p className="text-xs m-0" style={{ color: "#B35E76" }}>生殖医療専門医</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </Wrap>
      </section>

      {/* ── 2. WHY ──────────────────────────────────── */}
      <Sec className="bg-white">
        <WrapMd>
          <FadeIn>
            <div className="text-center mb-12">
              <Eyebrow label="なぜこの知識が重要なのか？" />
              <h2 className="text-3xl md:text-4xl font-black" style={{ color: "#574540" }}>
                知っているか・知らないかで<br className="hidden sm:block" />変わる「一年分の時間」
              </h2>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="space-y-5 text-lg leading-loose" style={{ color: "#574540" }}>
              <p>妊娠・出産は、夫婦にとって大きなライフイベントです。将来、子どもを望むなら——「知らなかった」で失う一年分の遠回りを、できるだけ減らしたいところです。</p>
              <p>多くの人が、情報を集めながら手探りで進むうちに、気づけば半年〜一年が過ぎてしまうことがあります。もし先に正しい地図を持てたなら、その時間を大切な人に愛情を注ぐ時間に変えられるかもしれません。</p>
              <p>本書では、現場の産婦人科医が「知っていると差がつく」24の医学的事実を、やさしく、読みやすく整理しました。</p>
            </div>
          </FadeIn>
        </WrapMd>
      </Sec>

      {/* ── 3. RELATED ARTICLES ─────────────────────── */}
      <Sec style={{ background: "#FFF7F5" }}>
        <Wrap>
          <FadeIn>
            <div className="text-center mb-12">
              <Eyebrow label="関連記事・医師解説" />
              <h2 className="text-3xl md:text-4xl font-black" style={{ color: "#574540" }}>医師が書いた、信頼できる情報</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {[
              { href: "/note/irregularmenscycle.html", img: "/assets/irregular-mens-cycle-thumb.jpg", title: "月経不順と妊娠しやすさ：基礎知識と受診のタイミング", desc: "月経周期の乱れの背景にあるホルモンバランス・PCOS・生活習慣・基礎疾患と、妊娠しやすさへの影響、受診の目安を医師が整理します。" },
              { href: "/note/pregnancy_loss_info.html", img: "/assets/pregnancy-loss-info-thumb.jpg", title: "良好胚なのに流産をくり返すのはなぜ？", desc: "良好胚を移植しても流産や陰性が続く背景を、年齢と染色体のデータから「自分のせい」にしない視点で解説。" },
              { href: "/note/identity-complexity-1.html", img: "/assets/identity-complexity-1-thumb.jpg", title: "妊活・不妊治療と向き合うための「心の柱」", desc: "心理学の「アイデンティティ複雑性」から心の守り方を整理します。" },
              { href: "/note/when-to-start-treatment.html", img: "/assets/when-to-start-thumb.jpg", title: "不妊治療はいつから始めるべき？", desc: "AMH・実質不妊期間・ライフプランの3軸で、受診と開始時期を整理。自然妊娠の累積グラフも掲載。" },
              { href: "/note/age-and-fertility.html", img: "/assets/age-fertility-thumb.jpg", title: "妊娠率と年齢の関係：20代・30代・40代で何が違う？", desc: "年齢×妊娠率を、卵子の質・量・流産率の観点から医師が解説。" },
              { href: "/note/amh.html", img: "/assets/amh-thumb.jpg", title: "AMHとは？卵巣年齢の基礎知識と検査を受けるタイミング", desc: "AMH検査の意味と、受ける最適なタイミングを医師が解説。" },
              { href: "/note/timing-aih-ivf.html", img: "/assets/note-timing-aih-ivf.jpg", title: "タイミング法・人工授精・体外受精の違い", desc: "仕組み・適応・通院回数・妊娠率・切替目安をやさしく整理。" },
              { href: "/note/ivf-duration-probability.html", img: "/assets/ivf-duration-thumb.jpg", title: "体外受精はどのくらい続く？期間を「確率」で考える", desc: "期間と回数を確率で可視化。モンテカルロ・シミュレーターの考え方を医師が解説。" },
              { href: "/note/male-age-and-pregnancy.html", img: "/assets/male-age-thumb.jpg", title: "男性の年齢と妊娠：年齢が精子・妊娠率に与える影響", desc: "男性の年齢と精子の質・妊娠率・流産リスクの関係をやさしく解説。" },
            ].map(({ href, img, title, desc }, i) => (
              <FadeIn key={href} delay={i * 0.05}>
                <ArtCard href={href} img={img} title={title} desc={desc} />
              </FadeIn>
            ))}
          </div>
        </Wrap>
      </Sec>

      {/* ── 4. NOTE LINKS ───────────────────────────── */}
      <Sec className="bg-white">
        <Wrap>
          <FadeIn>
            <div className="text-center mb-12">
              <Eyebrow label="note" />
              <h2 className="text-3xl md:text-4xl font-black" style={{ color: "#574540" }}>関連note記事</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {[
              { href: "https://note.com/famous_cosmos408/n/n6bcf9f9897a3", img: "https://assets.st-note.com/production/uploads/images/184173771/rectangle_large_type_2_f24907bccd86a833160d1d1f1aa58627.jpeg", title: "不妊治療と仕事の両立の現実", desc: "キャリアと治療を両立させるための現場の課題と希望。" },
              { href: "https://note.com/famous_cosmos408/n/nfebab758114f", img: "https://assets.st-note.com/production/uploads/images/178146733/rectangle_large_type_2_c5777ee592a1c24e5df3862cc8b5aee1.jpeg", title: "幸せな人生とは　生殖医療専門医の視点", desc: "生殖医療の現場から見える「幸福」と「選択」の本質。" },
              { href: "https://note.com/famous_cosmos408/n/n87f7814b4ff0", img: "https://assets.st-note.com/production/uploads/images/178237946/rectangle_large_type_2_16f6b54bebe07405eadd8dba31a87fd6.jpg", title: "Self-awarenessを通じて将来像を実現できる世界を。", desc: "自己理解を深め、主体的に人生を選択できる社会をめざして。" },
            ].map(({ href, img, title, desc }, i) => (
              <FadeIn key={href} delay={i * 0.1}>
                <ArtCard href={href} img={img} title={title} desc={desc} external />
              </FadeIn>
            ))}
          </div>
        </Wrap>
      </Sec>

      {/* ── 5. REVIEWS ──────────────────────────────── */}
      <Sec style={{ background: "#FFF7F5" }}>
        <WrapMd>
          <FadeIn>
            <div className="text-center mb-12">
              <Eyebrow label="読者の声" />
              <h2 className="text-3xl md:text-4xl font-black" style={{ color: "#574540" }}>Amazonレビュー</h2>
            </div>
          </FadeIn>
          <div className="flex flex-col gap-6">
            {[
              { name: "ひよこまめ", text: "信頼できる女医さんがSNSで紹介されていて購入してみました。働き盛りの女性が、妊娠出産といった将来を見据えて知っておくべき情報が分かりやすく書かれています。具体的にいつまでにどうなっておくと良いのかということが書かれており、将来設計を立てるのに役立つと思います。パートナーに読んでもらうのにも良い本だなと思いました。" },
              { name: "さくら", text: "専門医の立場から、妊娠に関する医学的エビデンスをイラストを交えてわかりやすく解説した良書です。単なる医学知識の羅列にとどまらず、著者自身も子を持つ父親であり、共働き夫婦としての経験を踏まえながら、読者の幸せなライフプラン形成を心から願う思いが随所に感じられます。" },
            ].map(({ name, text }, i) => (
              <FadeIn key={name} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-8 border-l-4" style={{ borderLeftColor: "#FFA41C", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xl" style={{ color: "#FFA41C" }}>★★★★★</span>
                    <span className="font-bold" style={{ color: "#574540" }}>5.0</span>
                    <span className="text-sm" style={{ color: "#8C7A75" }}>by {name}（2025年・Amazonレビュー）</span>
                  </div>
                  <p className="leading-loose" style={{ color: "#574540" }}>{text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </WrapMd>
      </Sec>

      {/* ── 6. BENEFITS + TOC ───────────────────────── */}
      <Sec className="bg-white">
        <Wrap>
          <FadeIn>
            <div className="text-center mb-12">
              <Eyebrow label="ビフォー → アフター" />
              <h2 className="text-3xl md:text-4xl font-black" style={{ color: "#574540" }}>この本を読んでこう変わる。</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="flex flex-col gap-5">
              {[
                ["妊娠は「いつか、なんとかなる」と思っていた", "妊娠の適した時期には個人差が大きいことを知り、ベストタイミングを考えられるようになった。"],
                ["将来のことをなんとなく不安に感じていた", "自分の体の状態と事実を知ることで、ライフプランを具体的に描けるようになった。"],
                ["ネットの情報が多すぎて何から信じていいかわからなかった", "産婦人科医が厳選した24のポイントに沿って、効率よく学べるようになった。"],
                ["「とりあえず様子を見る」時間が長くなりがちだった", "いつ受診するか、パートナーと何を話すかなど、今できる行動に落とし込めるようになった。"],
              ].map(([before, after], i) => (
                <FadeIn key={i} delay={i * 0.06}>
                  <div className="rounded-2xl p-6 flex flex-col gap-3" style={{ background: "#FFF7F5", border: "1px solid rgba(179,94,118,0.1)" }}>
                    <p className="text-sm line-through" style={{ color: "#8C7A75" }}>{before}</p>
                    <p className="font-bold" style={{ color: "#574540" }}>✅ {after}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
            <FadeIn delay={0.12} direction="left">
              <div className="rounded-2xl p-8" style={{ background: "#FFF7F5", border: "1px solid rgba(179,94,118,0.1)" }}>
                <h3 className="font-black text-xl mb-6" style={{ color: "#574540" }}>📖 内容の全体像（4章構成）</h3>
                <ul className="space-y-4 mb-8">
                  {[["第1章", "将来を選ぶための基本知識"], ["第2章", "自分の体を守るための知識"], ["第3章", "妊娠するための知識"], ["第4章", "不妊治療の基礎と選択肢"], ["付録", "早発卵巣不全・PCOS・ブライダルチェック"]].map(([ch, title]) => (
                    <li key={ch} className="flex gap-3 items-baseline">
                      <span className="text-white font-bold text-xs py-1 px-3 rounded-full flex-shrink-0" style={{ background: "#B35E76" }}>{ch}</span>
                      <span style={{ color: "#574540" }}>{title}</span>
                    </li>
                  ))}
                </ul>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "16/9", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
                    <Image src="/APlus_2.jpg" alt="事実1〜12" fill className="object-cover" />
                  </div>
                  <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "16/9", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
                    <Image src="/APlus_3.jpg" alt="事実13〜24" fill className="object-cover" />
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </Wrap>
      </Sec>

      {/* ── 7. AUTHOR ───────────────────────────────── */}
      <Sec style={{ background: "#FFF7F5" }}>
        <Wrap>
          <FadeIn>
            <div className="text-center mb-12">
              <Eyebrow label="AUTHOR" />
              <h2 className="text-3xl md:text-4xl font-black" style={{ color: "#574540" }}>著者プロフィール</h2>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="bg-white rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center md:items-start" style={{ boxShadow: "0 8px 40px rgba(179,94,118,0.08)", border: "1px solid rgba(179,94,118,0.1)" }}>
              {/* Photo */}
              <div className="flex flex-col items-center gap-4 flex-shrink-0">
                <div className="relative rounded-full overflow-hidden border-4 border-white" style={{ width: 160, height: 160, boxShadow: "0 8px 32px rgba(179,94,118,0.2)" }}>
                  <Image src="/250403kz_0002.JPG" alt="著者 佐藤琢磨" fill className="object-cover" />
                </div>
                <div className="text-center">
                  <p className="font-black text-xl m-0" style={{ color: "#574540" }}>佐藤 琢磨</p>
                  <p className="text-sm m-0" style={{ color: "#8C7A75" }}>Takuma Sato, MD, PhD</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "rgba(179,94,118,0.1)", color: "#B35E76" }}>生殖医療専門医</span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "rgba(179,94,118,0.1)", color: "#B35E76" }}>産婦人科専門医</span>
                </div>
              </div>
              {/* Bio */}
              <div className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="rounded-xl p-4" style={{ background: "#FFF7F5" }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#8C7A75" }}>学歴</p>
                    <p style={{ color: "#574540" }}>2013年 福井大学医学部卒</p>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: "#FFF7F5" }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#8C7A75" }}>所属</p>
                    <p style={{ color: "#574540" }}>表参道ARTクリニック</p>
                  </div>
                </div>
                <p className="leading-loose mb-4" style={{ color: "#574540" }}>淀川キリスト教病院での初期臨床研修を経て、神戸大学医学部附属病院産科婦人科学教室に入局。複数の総合病院や不妊治療専門クリニックで研鑽を積む。</p>
                <p className="leading-loose mb-6" style={{ color: "#574540" }}>現在は生殖医療専門医として、日々多くの患者様の妊娠・出産をサポート。確かな医学的知識と、一人ひとりに寄り添う丁寧な診療に定評がある。生殖医療の正しい知識をより多くの人に届けるため、啓発活動にも注力している。</p>
                <div className="pt-6" style={{ borderTop: "1px solid rgba(179,94,118,0.1)" }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#8C7A75" }}>書誌情報</p>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <dt className="font-bold" style={{ color: "#8C7A75" }}>タイトル</dt><dd style={{ color: "#574540" }}>『20代で考える 将来妊娠で困らないための選択』</dd>
                    <dt className="font-bold" style={{ color: "#8C7A75" }}>出版</dt><dd style={{ color: "#574540" }}>2025年4月</dd>
                    <dt className="font-bold" style={{ color: "#8C7A75" }}>出版社</dt><dd style={{ color: "#574540" }}>Kindle Direct Publishing</dd>
                    <dt className="font-bold" style={{ color: "#8C7A75" }}>形式</dt><dd style={{ color: "#574540" }}>ペーパーバック・Kindle版</dd>
                  </dl>
                </div>
              </div>
            </div>
          </FadeIn>
        </Wrap>
      </Sec>

      {/* ── 8. INSTAGRAM ────────────────────────────── */}
      <Sec className="bg-white">
        <WrapMd>
          <FadeIn>
            <div className="text-center mb-12">
              <Eyebrow label="📸 Instagram" />
              <h2 className="text-3xl font-black" style={{ color: "#574540" }}>Instagram レター</h2>
              <p className="mt-3" style={{ color: "#8C7A75" }}>最新のメッセージをリール動画でも発信しています。</p>
            </div>
            <div className="flex justify-center">
              <blockquote
                className="instagram-media"
                data-instgrm-permalink="https://www.instagram.com/reel/DVIHLS9k6B3/?utm_source=ig_embed&amp;utm_campaign=loading"
                data-instgrm-version="14"
                style={{ background: "#FFF", border: "0", borderRadius: "16px", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", margin: "0", maxWidth: "400px", minWidth: "326px", padding: "0", width: "100%" }}
              ></blockquote>
              <script async src="//www.instagram.com/embed.js"></script>
            </div>
          </FadeIn>
        </WrapMd>
      </Sec>

      {/* ── 9. FAQ ──────────────────────────────────── */}
      <Sec style={{ background: "#FFF7F5" }}>
        <WrapMd>
          <FadeIn>
            <div className="text-center mb-12">
              <Eyebrow label="FAQ" />
              <h2 className="text-3xl md:text-4xl font-black" style={{ color: "#574540" }}>よくある質問</h2>
              <p className="mt-3 text-sm" style={{ color: "#8C7A75" }}>※生殖医療専門医 佐藤 琢磨 監修の一般的な情報です。</p>
            </div>
          </FadeIn>
          <div className="flex flex-col gap-5">
            {[
              { q: "20代でも不妊になることはありますか？", a: "あります。生理が規則的でも卵管のトラブルやパートナー側の要因などで妊娠しにくい場合があります。早めに基礎検査を受けておくと、将来の選択肢を広く保つことができます。" },
              { q: "妊娠の「ベストな年齢」は何歳ですか？", a: "一般的には20代後半〜30歳前後が妊娠率のピークとされますが、個人差が大きいため、年齢だけでなくAMH値や月経周期、不妊リスクとなる病気の有無などを総合的に見ることが大切です。" },
              { q: "いつ病院を受診したらいいか、目安はありますか？", a: "35歳未満で1年、35歳以上で半年妊娠しなければ一度相談をおすすめします。生殖医療専門医に早めに相談することで、遠回りの時間を減らせます。" },
            ].map(({ q, a }, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="bg-white rounded-2xl p-7" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid rgba(179,94,118,0.1)" }}>
                  <p className="font-bold mb-3 text-base" style={{ color: "#B35E76" }}>Q. {q}</p>
                  <p className="leading-loose" style={{ color: "#574540" }}>A. {a}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </WrapMd>
      </Sec>

      {/* ── 10. CTA ─────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #B35E76 0%, #9a4e62 60%, #7b3049 100%)" }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <WrapMd className="text-center relative z-10">
          <FadeIn>
            <div className="relative mx-auto mb-10" style={{ width: 120, height: 172 }}>
              <Image src="/mockup-jp.png" alt="書影" fill className="object-contain" style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.35))" }} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">"将来の自分"のために、<br />今日の数ページから。</h2>
            <p className="text-white/80 text-lg mb-10">スマホで3分から読めるKindle版。<br />医師が書いた"安心できる医療知識"。</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="https://amzn.to/3X0yF3v" target="_blank" rel="noopener noreferrer">
                <button className="px-8 py-4 rounded-full font-black text-[#B35E76] hover:-translate-y-0.5 hover:shadow-lg transition-all" style={{ background: "white", fontSize: "1rem", border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
                  📖 日本語版を読む
                </button>
              </a>
              <a href="https://amzn.to/4ofHlPS" target="_blank" rel="noopener noreferrer">
                <button className="px-8 py-4 rounded-full font-bold text-white hover:bg-white/10 transition-all" style={{ background: "transparent", fontSize: "1rem", border: "2px solid rgba(255,255,255,0.7)", cursor: "pointer" }}>
                  English Edition
                </button>
              </a>
            </div>
            <p className="text-white/50 text-xs mt-12">このページは生殖医療専門医 佐藤 琢磨 が監修しています。<br />© Educate Press</p>
          </FadeIn>
        </WrapMd>
      </section>

      {/* ── STICKY CTA ──────────────────────────────── */}
      <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 50 }}>
        <a href="https://amzn.to/3X0yF3v" target="_blank" rel="noopener noreferrer">
          <div className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform" style={{ background: "white", paddingLeft: 6, paddingRight: 16, paddingTop: 6, paddingBottom: 6, borderRadius: 40, boxShadow: "0 8px 30px rgba(0,0,0,0.18)", border: "1px solid rgba(255,164,28,0.25)" }}>
            <div className="relative rounded overflow-hidden flex-shrink-0" style={{ width: 36, height: 50 }}>
              <Image src="/mockup-jp.png" alt="書影" fill className="object-cover" />
            </div>
            <span className="font-black text-sm" style={{ color: "#B35E76", whiteSpace: "nowrap" }}>Get it now</span>
          </div>
        </a>
      </div>

    </main>
  );
}
