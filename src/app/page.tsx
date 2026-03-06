"use client";

import Image from 'next/image';
import Button from "@/components/button";
import Container from "@/components/container";
import Section from "@/components/section";
import Text from "@/components/text";
import Row from "@/components/row";
import Card from "@/components/card";
import FadeIn from "@/components/fade-in";

export default function Home() {
  return (
    <main className="bg-surface text-on-surface min-h-screen">

      {/* ─────────────────────────────────────── */}
      {/* 1. HERO SECTION                        */}
      {/* ─────────────────────────────────────── */}
      <Section className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#FFF9F0] py-0">
        {/* Background: subtle woman image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/hero.jpg"
            alt="背景"
            fill
            className="object-cover object-center opacity-20"
            priority
          />
          {/* Soft gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFF9F0]/95 via-[#FFF9F0]/80 to-[#FFF9F0]/50" />
        </div>

        <Container className="max-w-screen-xl relative z-10 py-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2xl items-center min-h-[70vh]">
            {/* Left: Text */}
            <div className="flex flex-col justify-center">
              <FadeIn delay={0}>
                <div className="inline-block bg-[#B35E76]/10 text-[#B35E76] font-bold px-m py-2xs rounded-full text-sm mb-m tracking-wide">
                  生殖医療専門医がやさしく解説
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h1 className="text-4xl md:text-5xl font-black text-[#574540] leading-tight mb-l" style={{ letterSpacing: "-0.01em" }}>
                  『20代で考える<br />
                  <span className="text-[#B35E76]">将来妊娠で困らない</span><br />
                  ための選択』
                </h1>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-[#8C7A75] text-lg leading-relaxed mb-xl max-w-md">
                  今の自分を大切にすることが、未来の「選択肢」を増やす。<br />
                  20代・30代の女性が<em className="not-italic font-bold text-[#574540]">"今から知っておくべき"24の医学的事実</em>を一冊に。
                </p>
              </FadeIn>
              <FadeIn delay={0.3}>
                <div className="flex flex-wrap gap-s">
                  <a href="https://amzn.to/3X0yF3v" target="_blank" rel="noopener noreferrer">
                    <Button variant="fill" size="lg" label="📖 日本語版を読む" className="bg-[#B35E76] hover:bg-[#9a4e62] border-none text-white shadow-elevation-2 hover:shadow-elevation-3 transition-all" />
                  </a>
                  <a href="/book-landing-en.html" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="lg" label="English Edition" className="border-[#B35E76] text-[#B35E76] bg-white/80 hover:bg-[#B35E76]/10 transition-all" />
                  </a>
                </div>
              </FadeIn>
            </div>

            {/* Right: Book cover + Author photo */}
            <FadeIn delay={0.2} direction="left" className="flex justify-center gap-l items-end">
              {/* Book mockup */}
              <div className="relative drop-shadow-2xl" style={{ filter: "drop-shadow(0 30px 40px rgba(179,94,118,0.25))" }}>
                <Image
                  src="/mockup-jp.png"
                  alt="書影：20代で考える 将来妊娠で困らないための選択"
                  width={240}
                  height={340}
                  className="rounded-lg object-contain"
                  priority
                />
              </div>
              {/* Author avatar */}
              <div className="flex flex-col items-center gap-xs mb-m">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-elevation-2">
                  <Image src="/250403kz_0002.JPG" alt="著者 佐藤琢磨" fill className="object-cover" />
                </div>
                <div className="bg-white/80 backdrop-blur-sm px-s py-2xs rounded-full shadow-elevation-1 text-center">
                  <Text fontClass="caption" className="text-[#B35E76] font-bold m-0">佐藤 琢磨</Text>
                  <Text fontClass="caption" className="text-[#8C7A75] m-0 text-xs">生殖医療専門医</Text>
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>

        {/* Amazon Star rating floating badge */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <FadeIn delay={0.5}>
            <div className="bg-white/90 backdrop-blur-md px-l py-s rounded-full shadow-elevation-2 flex items-center gap-s border border-[#FFA41C]/30">
              <span className="text-[#FFA41C] text-lg">★★★★★</span>
              <Text fontClass="body" className="text-[#574540] font-bold m-0">Amazonレビュー 5.0</Text>
              <span className="text-[#8C7A75] text-sm">（2025年）</span>
            </div>
          </FadeIn>
        </div>
      </Section>

      {/* ─────────────────────────────────────── */}
      {/* 2. WHY IMPORTANT                       */}
      {/* ─────────────────────────────────────── */}
      <Section className="py-3xl bg-white">
        <Container className="max-w-screen-md">
          <FadeIn>
            <div className="text-center mb-2xl">
              <div className="inline-block bg-[#B35E76]/10 text-[#B35E76] font-bold px-m py-2xs rounded-full text-sm mb-m tracking-wide">
                なぜこの知識が重要なのか？
              </div>
              <h2 className="text-3xl font-black text-[#574540] mb-l">知っているか・知らないかで<br className="hidden md:block" />変わる「一年分の時間」</h2>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="prose prose-lg max-w-none text-[#574540] leading-loose space-y-m">
              <p>妊娠・出産は、夫婦にとって大きなライフイベントです。将来、子どもを望むなら——「知らなかった」で失う一年分の遠回りを、できるだけ減らしたいところです。</p>
              <p>多くの人が、情報を集めながら手探りで進むうちに、気づけば半年〜一年が過ぎてしまうことがあります。もし先に正しい地図を持てたなら、その時間を大切な人に愛情を注ぐ時間に変えられるかもしれません。</p>
              <p>本書では、現場の産婦人科医が「知っていると差がつく」24の医学的事実を、やさしく、読みやすく整理しました。</p>
            </div>
          </FadeIn>
        </Container>
      </Section>

      {/* ─────────────────────────────────────── */}
      {/* 3. RELATED ARTICLES (内部ブログ)       */}
      {/* ─────────────────────────────────────── */}
      <Section className="py-3xl bg-[#FFF7F5]">
        <Container className="max-w-screen-xl">
          <FadeIn>
            <div className="text-center mb-2xl">
              <div className="inline-block bg-[#B35E76]/10 text-[#B35E76] font-bold px-m py-2xs rounded-full text-sm mb-m">関連記事・医師解説</div>
              <h2 className="text-3xl font-black text-[#574540]">医師が書いた、信頼できる情報</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-l">
            {[
              { href: "/note/irregularmenscycle.html", img: "/assets/irregular-mens-cycle-thumb.jpg", title: "月経不順と妊娠しやすさ：基礎知識と受診のタイミング", desc: "月経周期の乱れの背景にあるホルモンバランス・PCOS・生活習慣・基礎疾患と、妊娠しやすさへの影響を解説。" },
              { href: "/note/pregnancy_loss_info.html", img: "/assets/pregnancy-loss-info-thumb.jpg", title: "良好胚なのに流産をくり返すのはなぜ？", desc: "良好胚を移植しても流産や陰性が続く背景を、年齢と染色体のデータから解説。" },
              { href: "/note/identity-complexity-1.html", img: "/assets/identity-complexity-1-thumb.jpg", title: "妊活・不妊治療と向き合うための「心の柱」", desc: "心理学の「アイデンティティ複雑性」から心の守り方を整理します。" },
              { href: "/note/when-to-start-treatment.html", img: "/assets/when-to-start-thumb.jpg", title: "不妊治療はいつから始めるべき？", desc: "AMH・実質不妊期間・ライフプランの3軸で、受診と開始時期を整理。" },
              { href: "/note/age-and-fertility.html", img: "/assets/age-fertility-thumb.jpg", title: "妊娠率と年齢の関係：20代・30代・40代で何が違う？", desc: "年齢×妊娠率を、卵子の質・量・流産率の観点から医師が解説。" },
              { href: "/note/amh.html", img: "/assets/amh-thumb.jpg", title: "AMHとは？卵巣年齢の基礎知識と検査を受けるタイミング", desc: "AMH検査の意味と、受ける最適なタイミングを医師が解説。" },
              { href: "/note/timing-aih-ivf.html", img: "/assets/note-timing-aih-ivf.jpg", title: "タイミング法・人工授精・体外受精の違い", desc: "仕組み・適応・通院回数・妊娠率・切替目安をやさしく整理。" },
              { href: "/note/ivf-duration-probability.html", img: "/assets/ivf-duration-thumb.jpg", title: "体外受精はどのくらい続く？期間を「確率」で考える", desc: "期間と回数を「確率」で可視化。モンテカルロ・シミュレーターの考え方を医師が解説。" },
              { href: "/note/male-age-and-pregnancy.html", img: "/assets/male-age-thumb.jpg", title: "男性の年齢と妊娠：年齢が精子・妊娠率に与える影響", desc: "男性の年齢と精子の質・妊娠率・流産リスクの関係をやさしく解説。" },
            ].map(({ href, img, title, desc }, i) => (
              <FadeIn key={href} delay={i * 0.06}>
                <a href={href} className="group block outline-none h-full">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-[#B35E76]/8 hover:-translate-y-1">
                    <div className="relative w-full aspect-video bg-[#FFF7F5] overflow-hidden">
                      <Image src={img} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-l flex flex-col flex-1 justify-between gap-s">
                      <div>
                        <h3 className="font-bold text-[#574540] text-base leading-snug mb-xs line-clamp-2">{title}</h3>
                        <p className="text-[#8C7A75] text-sm leading-relaxed line-clamp-3">{desc}</p>
                      </div>
                      <span className="text-[#B35E76] font-bold text-sm group-hover:underline">記事を読む →</span>
                    </div>
                  </div>
                </a>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>

      {/* ─────────────────────────────────────── */}
      {/* 4. NOTE ARTICLES (外部)                */}
      {/* ─────────────────────────────────────── */}
      <Section className="py-3xl bg-white">
        <Container className="max-w-screen-lg">
          <FadeIn>
            <div className="text-center mb-2xl">
              <div className="inline-block bg-[#B35E76]/10 text-[#B35E76] font-bold px-m py-2xs rounded-full text-sm mb-m">note</div>
              <h2 className="text-3xl font-black text-[#574540]">関連note記事</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-l">
            {[
              { href: "https://note.com/famous_cosmos408/n/n6bcf9f9897a3", img: "https://assets.st-note.com/production/uploads/images/184173771/rectangle_large_type_2_f24907bccd86a833160d1d1f1aa58627.jpeg", title: "不妊治療と仕事の両立の現実", desc: "キャリアと治療を両立させるための現場の課題と希望。" },
              { href: "https://note.com/famous_cosmos408/n/nfebab758114f", img: "https://assets.st-note.com/production/uploads/images/178146733/rectangle_large_type_2_c5777ee592a1c24e5df3862cc8b5aee1.jpeg", title: "幸せな人生とは　生殖医療専門医の視点", desc: "生殖医療の現場から見える「幸福」と「選択」の本質。" },
              { href: "https://note.com/famous_cosmos408/n/n87f7814b4ff0", img: "https://assets.st-note.com/production/uploads/images/178237946/rectangle_large_type_2_16f6b54bebe07405eadd8dba31a87fd6.jpg", title: "Self-awarenessを通じて将来像を実現できる世界を。", desc: "自己理解を深め、主体的に人生を選択できる社会をめざして。" },
            ].map(({ href, img, title, desc }, i) => (
              <FadeIn key={href} delay={i * 0.1}>
                <a href={href} target="_blank" rel="noopener noreferrer" className="group block outline-none h-full">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-[#B35E76]/8 hover:-translate-y-1">
                    <div className="relative w-full aspect-video bg-[#FFF7F5] overflow-hidden">
                      <Image src={img} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-l flex flex-col flex-1 justify-between gap-s">
                      <div>
                        <h3 className="font-bold text-[#574540] text-base leading-snug mb-xs line-clamp-2">{title}</h3>
                        <p className="text-[#8C7A75] text-sm leading-relaxed">{desc}</p>
                      </div>
                      <span className="text-[#B35E76] font-bold text-sm group-hover:underline">noteで読む ↗</span>
                    </div>
                  </div>
                </a>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>

      {/* ─────────────────────────────────────── */}
      {/* 5. REVIEWS                             */}
      {/* ─────────────────────────────────────── */}
      <Section className="py-3xl bg-[#FFF7F5]">
        <Container className="max-w-screen-md">
          <FadeIn>
            <div className="text-center mb-2xl">
              <div className="inline-block bg-[#FFA41C]/15 text-[#b07800] font-bold px-m py-2xs rounded-full text-sm mb-m">★ Amazonレビュー</div>
              <h2 className="text-3xl font-black text-[#574540]">読者の声</h2>
            </div>
          </FadeIn>
          <div className="flex flex-col gap-l">
            {[
              { stars: "★★★★★", name: "ひよこまめ", text: "信頼できる女医さんがSNSで紹介されていて購入してみました。働き盛りの女性が、妊娠出産といった将来を見据えて知っておくべき情報が分かりやすく書かれています。具体的にいつまでにどうなっておくと良いのかということが書かれており、将来設計を立てるのに役立つと思います。パートナーに読んでもらうのにも良い本だなと思いました。" },
              { stars: "★★★★★", name: "さくら", text: "専門医の立場から、妊娠に関する医学的エビデンスをイラストを交えてわかりやすく解説した良書です。単なる医学知識の羅列にとどまらず、著者自身も子を持つ父親であり、共働き夫婦としての経験を踏まえながら、読者の幸せなライフプラン形成を心から願う思いが随所に感じられます。" },
            ].map(({ stars, name, text }, i) => (
              <FadeIn key={name} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-xl shadow-sm border border-[#FFA41C]/20">
                  <div className="flex items-center gap-s mb-m">
                    <span className="text-[#FFA41C] text-xl">{stars}</span>
                    <span className="font-bold text-[#574540]">5.0</span>
                    <span className="text-[#8C7A75] text-sm">— by {name}（2025年・Amazonレビュー）</span>
                  </div>
                  <p className="text-[#574540] leading-loose">{text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>

      {/* ─────────────────────────────────────── */}
      {/* 6. BENEFITS + TOC                      */}
      {/* ─────────────────────────────────────── */}
      <Section className="py-3xl bg-white">
        <Container className="max-w-screen-lg">
          <FadeIn>
            <div className="text-center mb-2xl">
              <div className="inline-block bg-[#B35E76]/10 text-[#B35E76] font-bold px-m py-2xs rounded-full text-sm mb-m">ビフォー／アフター</div>
              <h2 className="text-3xl font-black text-[#574540]">この本を読んでこう変わる。</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
            <div className="flex flex-col gap-m">
              {[
                ["妊娠は「いつか、なんとかなる」と思っていた", "妊娠の適した時期には個人差が大きいことを知り、自分のベストタイミングを考えられるようになった。"],
                ["将来のことをなんとなく不安に感じていた", "自分の体の状態と医学的な事実を知ることで、ライフプランを具体的に描けるようになった。"],
                ["ネットの情報が多すぎて何から信じていいかわからなかった", "産婦人科医が厳選した24のポイントに沿って、効率よく学べるようになった。"],
                ["「とりあえず様子を見る」時間が長くなりがちだった", "いつ受診するか、パートナーと何を話すかなど、今できる行動に落とし込めるようになった。"],
              ].map(([before, after], i) => (
                <FadeIn key={i} delay={i * 0.06}>
                  <div className="bg-[#FFF7F5] rounded-2xl p-m flex gap-m items-start border border-[#B35E76]/10">
                    <div className="flex-1">
                      <p className="text-[#8C7A75] text-sm mb-s line-through">{before}</p>
                      <p className="font-bold text-[#574540]">✅ {after}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
            <FadeIn delay={0.15} direction="left">
              <div className="bg-[#FFF7F5] rounded-2xl p-xl border border-[#B35E76]/10 h-full flex flex-col justify-center">
                <h3 className="font-black text-[#574540] text-xl mb-l">📖 内容の全体像（4章構成）</h3>
                <ul className="space-y-m">
                  {[
                    ["第1章", "将来を選ぶための基本知識"],
                    ["第2章", "自分の体を守るための知識"],
                    ["第3章", "妊娠するための知識"],
                    ["第4章", "不妊治療の基礎と選択肢"],
                    ["付録", "早発卵巣不全・PCOS・ブライダルチェック"],
                  ].map(([ch, title]) => (
                    <li key={ch} className="flex gap-s items-baseline">
                      <span className="shrink-0 bg-[#B35E76] text-white text-xs font-bold py-1 px-2 rounded-full">{ch}</span>
                      <span className="text-[#574540]">{title}</span>
                    </li>
                  ))}
                </ul>
                <div className="grid grid-cols-2 gap-s mt-xl">
                  <div className="relative aspect-video rounded-xl overflow-hidden shadow-md">
                    <Image src="/APlus_2.jpg" alt="事実1〜12" fill className="object-cover" />
                  </div>
                  <div className="relative aspect-video rounded-xl overflow-hidden shadow-md">
                    <Image src="/APlus_3.jpg" alt="事実13〜24" fill className="object-cover" />
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </Section>

      {/* ─────────────────────────────────────── */}
      {/* 7. SIMULATION                          */}
      {/* ─────────────────────────────────────── */}
      <Section className="py-3xl bg-gradient-to-b from-[#FFF9F0] to-white">
        <Container className="max-w-screen-sm text-center">
          <FadeIn>
            <div className="inline-block bg-[#B35E76]/10 text-[#B35E76] font-bold px-m py-2xs rounded-full text-sm mb-m">🔬 シミュレーター</div>
            <h2 className="text-2xl md:text-3xl font-black text-[#574540] mb-l">
              体外受精ではどのくらいの期間で妊娠できるか知っていますか？
            </h2>
            <p className="text-[#8C7A75] leading-loose mb-xl">
              実際のIVFデータをもとにしたモンテカルロ・シミュレーションを使い、理論値として可視化するツールです。妊娠率のイメージを感覚ではなく数字でとらえることで、治療計画やライフプランをより現実的に考える一助になります。
            </p>
            <a href="https://chatgpt.com/canvas/shared/68b783ad34648191bf0ef3ba12ce8a96" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" label="IVFシミュレーターを開く →" className="border-[#B35E76] text-[#B35E76] hover:bg-[#B35E76]/5 transition-all" />
            </a>
            <p className="text-xs text-[#8C7A75] mt-m opacity-70">※統計モデルからの理論値で、個々の妊娠を保証するものではありません。詳細は担当医とご相談ください。</p>
          </FadeIn>
        </Container>
      </Section>

      {/* ─────────────────────────────────────── */}
      {/* 8. AUTHOR                              */}
      {/* ─────────────────────────────────────── */}
      <Section className="py-3xl bg-[#FFF7F5]">
        <Container className="max-w-screen-lg">
          <FadeIn>
            <div className="text-center mb-2xl">
              <div className="inline-block bg-[#B35E76]/10 text-[#B35E76] font-bold px-m py-2xs rounded-full text-sm mb-m">AUTHOR</div>
              <h2 className="text-3xl font-black text-[#574540]">著者プロフィール</h2>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="bg-white rounded-3xl p-xl md:p-2xl shadow-sm border border-[#B35E76]/10 flex flex-col md:flex-row gap-2xl items-center md:items-start">
              <div className="flex flex-col items-center gap-m shrink-0">
                <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-elevation-2 border-4 border-[#FFF7F5]">
                  <Image src="/250403kz_0002.JPG" alt="著者 佐藤琢磨" fill className="object-cover" />
                </div>
                <div className="text-center">
                  <p className="font-black text-[#574540] text-xl mb-2xs">佐藤 琢磨</p>
                  <p className="text-[#8C7A75] text-sm">Takuma Sato, MD, PhD</p>
                </div>
                <div className="flex flex-wrap gap-xs justify-center">
                  <span className="bg-[#B35E76]/10 text-[#B35E76] text-xs font-bold py-1 px-s rounded-full">生殖医療専門医</span>
                  <span className="bg-[#B35E76]/10 text-[#B35E76] text-xs font-bold py-1 px-s rounded-full">産婦人科専門医</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-m mb-l">
                  <div className="bg-[#FFF7F5] rounded-xl p-m">
                    <p className="text-xs text-[#8C7A75] font-bold mb-xs uppercase tracking-wider">出身・学歴</p>
                    <p className="text-[#574540]">2013年 福井大学医学部卒</p>
                  </div>
                  <div className="bg-[#FFF7F5] rounded-xl p-m">
                    <p className="text-xs text-[#8C7A75] font-bold mb-xs uppercase tracking-wider">所属</p>
                    <p className="text-[#574540]">表参道ARTクリニック</p>
                  </div>
                </div>
                <p className="text-[#574540] leading-loose">
                  淀川キリスト教病院での初期臨床研修を経て、神戸大学医学部附属病院産科婦人科学教室に入局。複数の総合病院や不妊治療専門クリニックで研鑽を積む。
                </p>
                <p className="text-[#574540] leading-loose mt-m">
                  現在は生殖医療専門医として、日々多くの患者様の妊娠・出産をサポート。確かな医学的知識と、一人ひとりに寄り添う丁寧な診療に定評がある。生殖医療の正しい知識をより多くの人に届けるため、啓発活動にも注力している。
                </p>
                <div className="mt-l pt-l border-t border-[#B35E76]/10">
                  <p className="text-xs text-[#8C7A75] font-bold mb-s uppercase tracking-wider">書誌情報</p>
                  <dl className="grid grid-cols-2 gap-xs text-sm">
                    <dt className="text-[#8C7A75] font-bold">タイトル</dt><dd className="text-[#574540]">『20代で考える 将来妊娠で困らないための選択』</dd>
                    <dt className="text-[#8C7A75] font-bold">出版</dt><dd className="text-[#574540]">2025年4月</dd>
                    <dt className="text-[#8C7A75] font-bold">出版社</dt><dd className="text-[#574540]">Kindle Direct Publishing</dd>
                    <dt className="text-[#8C7A75] font-bold">形式</dt><dd className="text-[#574540]">ペーパーバック・Kindle</dd>
                  </dl>
                </div>
              </div>
            </div>
          </FadeIn>
        </Container>
      </Section>

      {/* ─────────────────────────────────────── */}
      {/* 9. INSTAGRAM                           */}
      {/* ─────────────────────────────────────── */}
      <Section className="py-3xl bg-white">
        <Container className="max-w-screen-sm">
          <FadeIn>
            <div className="text-center mb-2xl">
              <div className="inline-block bg-gradient-to-r from-[#F58529] to-[#DD2A7B] text-white font-bold px-m py-2xs rounded-full text-sm mb-m">📸 Instagram</div>
              <h2 className="text-3xl font-black text-[#574540]">Instagram レター</h2>
              <p className="text-[#8C7A75] mt-s">最新のメッセージをリール動画でも発信しています。</p>
            </div>
            <div className="flex justify-center">
              <blockquote
                className="instagram-media"
                data-instgrm-permalink="https://www.instagram.com/reel/DVIHLS9k6B3/?utm_source=ig_embed&amp;utm_campaign=loading"
                data-instgrm-version="14"
                style={{ background: "#FFF", border: "0", borderRadius: "16px", boxShadow: "0 10px 40px rgba(0,0,0,.10)", margin: "0", maxWidth: "400px", minWidth: "326px", padding: "0", width: "100%" }}
              ></blockquote>
              <script async src="//www.instagram.com/embed.js"></script>
            </div>
          </FadeIn>
        </Container>
      </Section>

      {/* ─────────────────────────────────────── */}
      {/* 10. FAQ                                */}
      {/* ─────────────────────────────────────── */}
      <Section className="py-3xl bg-[#FFF7F5]">
        <Container className="max-w-screen-md">
          <FadeIn>
            <div className="text-center mb-2xl">
              <div className="inline-block bg-[#B35E76]/10 text-[#B35E76] font-bold px-m py-2xs rounded-full text-sm mb-m">FAQ</div>
              <h2 className="text-3xl font-black text-[#574540]">よくある質問</h2>
              <p className="text-[#8C7A75] mt-s text-sm">※生殖医療専門医 佐藤 琢磨 監修の一般的な情報です。</p>
            </div>
          </FadeIn>
          <div className="flex flex-col gap-m">
            {[
              { q: "20代でも不妊になることはありますか？", a: "あります。生理が規則的でも卵管のトラブルやパートナー側の要因などで妊娠しにくい場合があります。早めに基礎検査を受けておくと、将来の選択肢を広く保つことができます。" },
              { q: "妊娠の「ベストな年齢」は何歳ですか？", a: "一般的には20代後半〜30歳前後が妊娠率のピークとされますが、個人差が大きいため、年齢だけでなくAMH値や月経周期、不妊リスクとなる病気の有無などを総合的に見ることが大切です。" },
              { q: "いつ病院を受診したらいいか、目安はありますか？", a: "35歳未満で1年、35歳以上で半年妊娠しなければ一度相談をおすすめします。生殖医療専門医に早めに相談することで、遠回りの時間を減らせます。" },
            ].map(({ q, a }, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="bg-white rounded-2xl p-l shadow-sm border border-[#B35E76]/10">
                  <p className="font-bold text-[#B35E76] mb-s text-base">Q. {q}</p>
                  <p className="text-[#574540] leading-loose">A. {a}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>

      {/* ─────────────────────────────────────── */}
      {/* 11. CTA                                */}
      {/* ─────────────────────────────────────── */}
      <Section className="py-3xl bg-gradient-to-br from-[#B35E76] to-[#9a4e62] relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <Container className="max-w-screen-md text-center relative z-10">
          <FadeIn>
            <div className="relative w-28 h-40 mx-auto mb-xl drop-shadow-2xl">
              <Image src="/mockup-jp.png" alt="書影" fill className="object-contain" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-m">"将来の自分"のために、<br />今日の数ページから。</h2>
            <p className="text-white/80 text-lg mb-2xl">スマホで3分から読めるKindle版。<br />医師が書いた"安心できる医療知識"。</p>
            <div className="flex flex-wrap gap-m justify-center">
              <a href="https://amzn.to/3X0yF3v" target="_blank" rel="noopener noreferrer">
                <Button variant="fill" size="lg" label="📖 日本語版を読む" className="bg-white text-[#B35E76] hover:bg-[#FFF7F5] border-none shadow-elevation-2 hover:shadow-elevation-3 transition-all font-black" />
              </a>
              <a href="https://amzn.to/4ofHlPS" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" label="English Edition" className="border-white text-white hover:bg-white/10 transition-all" />
              </a>
            </div>
            <p className="text-white/60 text-xs mt-2xl">このページは生殖医療専門医 佐藤 琢磨 が監修しています。<br />© Educate Press</p>
          </FadeIn>
        </Container>
      </Section>

      {/* ─────────────────────────────────────── */}
      {/* 12. STICKY CTA BUTTON                  */}
      {/* ─────────────────────────────────────── */}
      <div className="fixed bottom-4 right-4 z-50">
        <a href="https://amzn.to/3X0yF3v" target="_blank" rel="noopener noreferrer">
          <div className="flex items-center gap-xs bg-white pl-xs pr-m py-xs rounded-full shadow-elevation-3 hover:scale-105 transition-transform border border-[#FFA41C]/30 cursor-pointer">
            <div className="relative w-9 h-12 rounded shadow-sm overflow-hidden">
              <Image src="/mockup-jp.png" alt="書影" fill className="object-cover" />
            </div>
            <span className="font-bold text-[#b35e76] text-sm whitespace-nowrap">Get it now</span>
          </div>
        </a>
      </div>

    </main>
  );
}
