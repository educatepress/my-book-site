import Head from 'next/head';
import Image from 'next/image';
import Button from "@/components/button";
import Container from "@/components/container";
import Section from "@/components/section";
import Text from "@/components/text";
import Row from "@/components/row";
import Card from "@/components/card";

export default function Home() {
  return (
    <>
      <Head>
        <title>『20代で考える 将来妊娠で困らないための選択』｜公式紹介ページ</title>
        <meta name="description" content="生殖医療専門医が、20代・30代の女性に今から知ってほしい“24の医学的事実”をやさしく解説。" />
      </Head>

      <main className="bg-surface text-on-surface min-h-screen pb-24">

        {/* TOP HEADER (言語切り替え) */}
        <div className="flex justify-end p-xs gap-xs bg-surface-container-low">
          <Button variant="fill" size="sm" label="日本語" />
          <a href="/book-landing-en.html">
            <Button variant="text" size="sm" label="English" />
          </a>
        </div>

        {/* 1. CONTENT TOP (Javascriptで移動されていたH1部分) */}
        <Section className="pt-xl pb-m">
          <Container className="max-w-screen-lg">
            <Card variant="fill" className="p-l md:p-xl shadow-elevation-1">
              <Text fontClass="display1-bold" className="mb-s text-on-surface">将来妊娠で困らないための基礎知識（医師監修）</Text>
              <Text fontClass="title3" className="text-on-surface-variant">正しい医学知識で全ての人が幸せになれる世界を。</Text>
            </Card>
          </Container>
        </Section>

        {/* 2. WHY IMPORTANT (なぜこの知識が重要なのか？) */}
        <Section className="py-m">
          <Container className="max-w-screen-lg">
            <Card variant="fill" className="p-l md:p-xl shadow-elevation-1">
              <Text fontClass="heading-bold" className="mb-m text-on-surface">なぜこの知識が重要なのか？</Text>
              <Text fontClass="title3" className="font-bold mb-m">知っているか・知らないかで変わる「一年分の時間」</Text>
              <Text fontClass="body" className="mb-m text-on-surface-variant">
                妊娠・出産は、夫婦にとって大きなライフイベントです。将来、子どもを望むなら——「知らなかった」で失う一年分の遠回りを、できるだけ減らしたいところです。
              </Text>
              <Text fontClass="body" className="mb-m text-on-surface-variant">
                多くの人が、情報を集めながら手探りで進むうちに、気づけば半年〜一年が過ぎてしまうことがあります。もし先に正しい地図を持てたなら、その時間を大切な人に愛情を注ぐ時間に変えられるかもしれません。
              </Text>
              <Text fontClass="body" className="text-on-surface-variant">
                本書では、現場の産婦人科医が「知っていると差がつく」24の医学的事実を、やさしく、読みやすく整理しました。妊娠は「今の自分」から続くストーリー。体はどう変わる？ タイミングはどう考える？ 自分やパートナーと向き合うための視点を揃えることで、自分にとって良い選択を、具体的な行動に変えていく一歩を後押しします。
              </Text>
            </Card>
          </Container>
        </Section>

        {/* 3. RELATED ARTICLES (関連記事・医師解説 - 内部リンク) */}
        <Section className="bg-surface-container-low py-xl mt-l">
          <Container className="max-w-screen-xl">
            <Text fontClass="heading-bold" className="mb-l text-center">関連記事・医師解説</Text>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-m">

              <a href="/note/irregularmenscycle.html" className="block outline-none hover:opacity-90 transition-opacity">
                <Card variant="outline" className="h-full flex flex-col hover:border-primary transition-colors bg-surface">
                  <div className="relative w-full aspect-video bg-surface-variant">
                    <Image src="/assets/irregular-mens-cycle-thumb.jpg" alt="月経不順と妊娠しやすさ" fill className="object-cover" />
                  </div>
                  <div className="p-m flex-1 flex flex-col justify-between">
                    <Text fontClass="title3" className="font-bold mb-xs line-clamp-2">月経不順と妊娠しやすさ：基礎知識と受診のタイミング</Text>
                    <Text fontClass="body" className="text-on-surface-variant mb-s text-sm line-clamp-3">月経周期の乱れの背景にあるホルモンバランス・PCOS・生活習慣・基礎疾患と、妊娠しやすさへの影響、受診の目安を医師がわかりやすく整理します。</Text>
                    <Text fontClass="label" className="text-primary mt-s">記事を読む →</Text>
                  </div>
                </Card>
              </a>

              <a href="/note/pregnancy_loss_info.html" className="block outline-none hover:opacity-90 transition-opacity">
                <Card variant="outline" className="h-full flex flex-col hover:border-primary transition-colors bg-surface">
                  <div className="relative w-full aspect-video bg-surface-variant">
                    <Image src="/assets/pregnancy-loss-info-thumb.jpg" alt="良好胚なのに流産をくり返すのはなぜ？" fill className="object-cover" />
                  </div>
                  <div className="p-m flex-1 flex flex-col justify-between">
                    <Text fontClass="title3" className="font-bold mb-xs line-clamp-2">良好胚なのに流産をくり返すのはなぜ？年齢と染色体から考える</Text>
                    <Text fontClass="body" className="text-on-surface-variant mb-s text-sm line-clamp-3">良好胚を移植しても流産や陰性が続く背景を、年齢と染色体のデータ・シミュレーションを用いて「自分のせい」にしない視点から医師が解説。</Text>
                    <Text fontClass="label" className="text-primary mt-s">記事を読む →</Text>
                  </div>
                </Card>
              </a>

              <a href="/note/identity-complexity-1.html" className="block outline-none hover:opacity-90 transition-opacity">
                <Card variant="outline" className="h-full flex flex-col hover:border-primary transition-colors bg-surface">
                  <div className="relative w-full aspect-video bg-surface-variant">
                    <Image src="/assets/identity-complexity-1-thumb.jpg" alt="アイデンティティ複雑性" fill className="object-cover" />
                  </div>
                  <div className="p-m flex-1 flex flex-col justify-between">
                    <Text fontClass="title3" className="font-bold mb-xs line-clamp-2">妊活・不妊治療と向き合うための「心の柱」──アイデンティティ複雑性の考え方</Text>
                    <Text fontClass="body" className="text-on-surface-variant mb-s text-sm line-clamp-3">治療に気持ちが吸い込まれすぎないために。心理学の「アイデンティティ複雑性」から心の守り方を整理します。</Text>
                    <Text fontClass="label" className="text-primary mt-s">記事を読む →</Text>
                  </div>
                </Card>
              </a>

              <a href="/note/when-to-start-treatment.html" className="block outline-none hover:opacity-90 transition-opacity">
                <Card variant="outline" className="h-full flex flex-col hover:border-primary transition-colors bg-surface">
                  <div className="relative w-full aspect-video bg-surface-variant">
                    <Image src="/assets/when-to-start-thumb.jpg" alt="不妊治療はいつから始めるべき？" fill className="object-cover" />
                  </div>
                  <div className="p-m flex-1 flex flex-col justify-between">
                    <Text fontClass="title3" className="font-bold mb-xs line-clamp-2">不妊治療はいつから始めるべき？年齢別の目安と受診のタイミング</Text>
                    <Text fontClass="body" className="text-on-surface-variant mb-s text-sm line-clamp-3">AMH・実質不妊期間・ライフプランの3軸で、受診と開始時期を整理。自然妊娠の累積グラフも掲載。</Text>
                    <Text fontClass="label" className="text-primary mt-s">記事を読む →</Text>
                  </div>
                </Card>
              </a>

              <a href="/note/age-and-fertility.html" className="block outline-none hover:opacity-90 transition-opacity">
                <Card variant="outline" className="h-full flex flex-col hover:border-primary transition-colors bg-surface">
                  <div className="relative w-full aspect-video bg-surface-variant">
                    <Image src="/assets/age-fertility-thumb.jpg" alt="妊娠率と年齢の関係" fill className="object-cover" />
                  </div>
                  <div className="p-m flex-1 flex flex-col justify-between">
                    <Text fontClass="title3" className="font-bold mb-xs line-clamp-2">妊娠率と年齢の関係：20代・30代・40代で何が違う？</Text>
                    <Text fontClass="body" className="text-on-surface-variant mb-s text-sm line-clamp-3">年齢×妊娠率を、卵子の質・量・流産率の観点から医師が解説。</Text>
                    <Text fontClass="label" className="text-primary mt-s">記事を読む →</Text>
                  </div>
                </Card>
              </a>

              <a href="/note/amh.html" className="block outline-none hover:opacity-90 transition-opacity">
                <Card variant="outline" className="h-full flex flex-col hover:border-primary transition-colors bg-surface">
                  <div className="relative w-full aspect-video bg-surface-variant">
                    <Image src="/assets/amh-thumb.jpg" alt="AMHとは？" fill className="object-cover" />
                  </div>
                  <div className="p-m flex-1 flex flex-col justify-between">
                    <Text fontClass="title3" className="font-bold mb-xs line-clamp-2">AMHとは？卵巣年齢の基礎知識と検査を受けるタイミング</Text>
                    <Text fontClass="body" className="text-on-surface-variant mb-s text-sm line-clamp-3">AMH（抗ミュラー管ホルモン）とは？卵子の残り数を知る検査の意味と、受ける最適なタイミングを医師が解説。</Text>
                    <Text fontClass="label" className="text-primary mt-s">記事を読む →</Text>
                  </div>
                </Card>
              </a>

            </div>
          </Container>
        </Section>

        {/* 4. NOTES (関連note記事 - 外部リンク) */}
        <Section className="py-xl">
          <Container className="max-w-screen-xl">
            <Text fontClass="heading-bold" className="mb-l text-center">関連note記事</Text>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-m">
              <a href="https://note.com/famous_cosmos408/n/n6bcf9f9897a3" target="_blank" rel="noopener noreferrer" className="block outline-none hover:opacity-90 transition-opacity">
                <Card variant="outline" className="h-full flex flex-col hover:border-primary transition-colors">
                  <div className="relative w-full aspect-video bg-surface-variant">
                    <Image src="https://assets.st-note.com/production/uploads/images/184173771/rectangle_large_type_2_f24907bccd86a833160d1d1f1aa58627.jpeg" alt="不妊治療と仕事の両立の現実" fill className="object-cover" />
                  </div>
                  <div className="p-m flex-1 flex flex-col justify-between">
                    <Text fontClass="title3" className="font-bold mb-xs line-clamp-2">不妊治療と仕事の両立の現実</Text>
                    <Text fontClass="body" className="text-on-surface-variant mb-s text-sm">キャリアと治療を両立させるための現場の課題と希望。</Text>
                    <Text fontClass="label" className="text-primary mt-s">記事を読む →</Text>
                  </div>
                </Card>
              </a>
              <a href="https://note.com/famous_cosmos408/n/nfebab758114f" target="_blank" rel="noopener noreferrer" className="block outline-none hover:opacity-90 transition-opacity">
                <Card variant="outline" className="h-full flex flex-col hover:border-primary transition-colors">
                  <div className="relative w-full aspect-video bg-surface-variant">
                    <Image src="https://assets.st-note.com/production/uploads/images/178146733/rectangle_large_type_2_c5777ee592a1c24e5df3862cc8b5aee1.jpeg" alt="幸せな人生とは" fill className="object-cover" />
                  </div>
                  <div className="p-m flex-1 flex flex-col justify-between">
                    <Text fontClass="title3" className="font-bold mb-xs line-clamp-2">幸せな人生とは　生殖医療専門医の視点</Text>
                    <Text fontClass="body" className="text-on-surface-variant mb-s text-sm">生殖医療の現場から見える「幸福」と「選択」の本質。</Text>
                    <Text fontClass="label" className="text-primary mt-s">記事を読む →</Text>
                  </div>
                </Card>
              </a>
              <a href="https://note.com/famous_cosmos408/n/n87f7814b4ff0" target="_blank" rel="noopener noreferrer" className="block outline-none hover:opacity-90 transition-opacity">
                <Card variant="outline" className="h-full flex flex-col hover:border-primary transition-colors">
                  <div className="relative w-full aspect-video bg-surface-variant">
                    <Image src="https://assets.st-note.com/production/uploads/images/178237946/rectangle_large_type_2_16f6b54bebe07405eadd8dba31a87fd6.jpg" alt="Self-awareness" fill className="object-cover" />
                  </div>
                  <div className="p-m flex-1 flex flex-col justify-between">
                    <Text fontClass="title3" className="font-bold mb-xs line-clamp-2">Self-awarenessを通じて全ての人が思い描いた将来像を実現できる世界を。</Text>
                    <Text fontClass="body" className="text-on-surface-variant mb-s text-sm">自己理解を深め、主体的に人生を選択できる社会をめざして。</Text>
                    <Text fontClass="label" className="text-primary mt-s">記事を読む →</Text>
                  </div>
                </Card>
              </a>
            </div>
          </Container>
        </Section>

        {/* 5. HERO SECTION (Main Book CTA) */}
        <Section className="bg-primary-container py-2xl">
          <Container className="max-w-screen-lg">
            <Row className="flex-col md:flex-row items-center gap-xl">
              <div className="flex-1 flex justify-center w-full md:order-2">
                <div className="relative w-full aspect-[3/4] max-w-sm rounded-[var(--lk-radius-l)] overflow-hidden shadow-elevation-3">
                  <Image
                    src="/mockup-jp.png"
                    alt="20代で考える 将来妊娠で困らないための選択"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
              <div className="flex-1 md:order-1 text-center md:text-left">
                <Text fontClass="title3" className="text-on-primary-container opacity-80 mb-xs">
                  生殖医療専門医がやさしく解説
                </Text>
                <Text fontClass="display2-bold" className="text-on-primary-container mb-m">
                  『20代で考える<br />将来妊娠で困らないための選択』
                </Text>
                <Text fontClass="body" className="text-on-primary-container font-bold mb-m">
                  今の自分を大切にすることが、未来の「選択肢」を増やす。<br />
                  20代・30代の女性が“今から知っておくべき”24の医学的事実を一冊に。
                </Text>
                <Row className="gap-s justify-center md:justify-start">
                  <a href="https://amzn.to/3X0yF3v" target="_blank" rel="noopener noreferrer">
                    <Button variant="fill" size="lg" label="日本語版を読む" />
                  </a>
                  <a href="https://amzn.to/4ofHlPS" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="lg" label="English Edition" className="border-on-primary-container text-on-primary-container hover:bg-on-primary-container hover:text-primary-container" />
                  </a>
                </Row>
              </div>
            </Row>
          </Container>
        </Section>

        {/* 6. REVIEWS (読者レビュー) */}
        <Section className="py-xl">
          <Container className="max-w-screen-md">
            <Text fontClass="heading-bold" className="mb-l text-center">読者レビュー</Text>
            <div className="flex flex-col gap-m">
              <Card variant="outline" className="p-l bg-surface shadow-elevation-1 border-l-4 border-l-[#FFA41C]">
                <Text fontClass="title3" className="font-bold mb-s"><span className="text-[#FFA41C]">★★★★★</span> 5.0 — 「将来設計に役立つ良本です。by ひよこまめ」</Text>
                <Text fontClass="body" className="text-on-surface-variant">信頼できる女医さんがSNSで紹介されていて購入してみました。働き盛りの女性が、妊娠出産といった将来を見据えて知っておくべき情報が分かりやすく書かれています。具体的にいつまでにどうなっておくと良いのかということが書かれており、将来設計を立てるのに役立つと思います。パートナーに読んでもらうのにも良い本だなと思いました。</Text>
              </Card>
              <Card variant="outline" className="p-l bg-surface shadow-elevation-1 border-l-4 border-l-[#FFA41C]">
                <Text fontClass="title3" className="font-bold mb-s"><span className="text-[#FFA41C]">★★★★★</span> 5.0 — 「専門医の情熱と優しさがあふれる一冊。by さくら」</Text>
                <Text fontClass="body" className="text-on-surface-variant">専門医の立場から、妊娠に関する医学的エビデンスをイラストを交えてわかりやすく解説した良書です。単なる医学知識の羅列にとどまらず、著者自身も子を持つ父親であり、共働き夫婦としての経験を踏まえながら、読者の幸せなライフプラン形成を心から願う思いが随所に感じられます。</Text>
              </Card>
            </div>
          </Container>
        </Section>

        {/* 7. BENEFITS + FLYER (この本を読んでこう変わる) */}
        <Section className="bg-surface-container-low py-xl">
          <Container className="max-w-screen-lg">
            <Text fontClass="heading-bold" className="mb-l text-center">この本を読んでこう変わる。</Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-l items-stretch">
              <div className="flex flex-col gap-s">
                <Card variant="fill" className="p-m flex flex-col md:flex-row gap-m items-center text-center md:text-left">
                  <div className="flex-1"><Text fontClass="body" className="text-on-surface-variant">妊娠は「いつか、なんとかなる」と思っていた</Text></div>
                  <div className="text-primary font-bold hidden md:block">➜</div>
                  <div className="text-primary font-bold md:hidden">↓</div>
                  <div className="flex-1"><Text fontClass="body" className="font-bold">妊娠の適した時期には個人差が大きいことを知り、ベストタイミングを考えられるようになった。</Text></div>
                </Card>
                <Card variant="fill" className="p-m flex flex-col md:flex-row gap-m items-center text-center md:text-left">
                  <div className="flex-1"><Text fontClass="body" className="text-on-surface-variant">将来のことをなんとなく不安に感じていた</Text></div>
                  <div className="text-primary font-bold hidden md:block">➜</div>
                  <div className="text-primary font-bold md:hidden">↓</div>
                  <div className="flex-1"><Text fontClass="body" className="font-bold">自分の体の状態と事実を知ることで、半年〜一年先のライフプランを具体的に描けるようになった。</Text></div>
                </Card>
                <Card variant="fill" className="p-m flex flex-col md:flex-row gap-m items-center text-center md:text-left">
                  <div className="flex-1"><Text fontClass="body" className="text-on-surface-variant">ネットの情報が多すぎて、何から信じていいかわからなかった</Text></div>
                  <div className="text-primary font-bold hidden md:block">➜</div>
                  <div className="text-primary font-bold md:hidden">↓</div>
                  <div className="flex-1"><Text fontClass="body" className="font-bold">産婦人科医が厳選した24の「これだけは知っておきたいポイント」に沿って、効率よく学べるようになった。</Text></div>
                </Card>
                <Card variant="fill" className="p-m flex flex-col md:flex-row gap-m items-center text-center md:text-left">
                  <div className="flex-1"><Text fontClass="body" className="text-on-surface-variant">「とりあえず様子を見る」時間が長くなりがちだった</Text></div>
                  <div className="text-primary font-bold hidden md:block">➜</div>
                  <div className="text-primary font-bold md:hidden">↓</div>
                  <div className="flex-1"><Text fontClass="body" className="font-bold">いつ受診するか、パートナーと何を話すかなど、今できる行動に落とし込めるようになった。</Text></div>
                </Card>
              </div>

              {/* Flyer */}
              <Card variant="outline" className="p-m flex flex-col items-center justify-center bg-surface">
                <a href="/flyer-thumb.pdf" target="_blank" rel="noopener noreferrer" className="block relative w-full aspect-[1/1.414] shadow-elevation-2 mb-m hover:opacity-90">
                  <Image src="/flyer-thumb.png" alt="フライヤー画像" fill className="object-cover" />
                </a>
                <a href="/flyer-thumb.pdf" download>
                  <Button variant="outline" label="PDFをダウンロード" />
                </a>
              </Card>
            </div>
          </Container>
        </Section>

        {/* 8. SIMULATION (シミュレーター) */}
        <Section className="py-xl">
          <Container className="max-w-screen-md text-center">
            <Text fontClass="heading-bold" className="mb-m">
              体外受精ではどのくらいの期間で妊娠できるか知っていますか？<br />
              理論値からのシミュレーターを見てみましょう。
            </Text>
            <Text fontClass="body" className="text-on-surface-variant mb-s">
              実際のIVFデータをもとにしたモンテカルロ・シミュレーションを使い、「自分たちの場合、どのくらいの期間・回数で妊娠が期待できるのか」を理論値として可視化するツールです。妊娠率のイメージを感覚ではなく数字でとらえることで、治療計画やライフプランをより現実的に考える一助になります。
            </Text>
            <div className="mt-l mb-m">
              <a href="https://chatgpt.com/canvas/shared/68b783ad34648191bf0ef3ba12ce8a96" target="_blank" rel="noopener noreferrer">
                <Button variant="fill" size="lg" label="IVFモンテカルロ・シミュレーターを開く" />
              </a>
            </div>
            <Text fontClass="caption" className="text-on-surface-variant opacity-80">
              ※本シミュレーターは統計モデルから算出された理論値であり、個々の妊娠を保証するものではありません。詳細な判断は必ず担当医とご相談ください。
            </Text>
          </Container>
        </Section>

        {/* 9. TOC + Figures (内容の全体像) */}
        <Section className="bg-surface-container-low py-xl">
          <Container className="max-w-screen-lg">
            <Text fontClass="heading-bold" className="mb-m text-center">内容の全体像（章立て）</Text>
            <Text fontClass="body" className="mb-l text-center font-bold">4章構成で、“女性の一生”を通して学べる内容です。</Text>

            <Card variant="fill" className="p-l mb-l max-w-fit mx-auto">
              <ul className="list-disc list-inside space-y-2 text-on-surface-variant">
                <li><span className="font-bold">第1章</span> 将来を選ぶための基本知識</li>
                <li><span className="font-bold">第2章</span> 自分の体を守るための知識</li>
                <li><span className="font-bold">第3章</span> 妊娠するための知識</li>
                <li><span className="font-bold">第4章</span> 不妊治療の基礎と選択肢</li>
                <li><span className="font-bold">付録</span> 早発卵巣不全・PCOS・ブライダルチェック</li>
              </ul>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-l">
              <div className="flex flex-col items-center">
                <Image src="/APlus_2.jpg" alt="理想の将来を選択" width={970} height={600} className="w-full h-auto rounded-[var(--lk-radius-m)] shadow-elevation-1 mb-s" />
                <Text fontClass="caption" className="text-on-surface-variant">理想の将来を選択するための知識（事実1〜12）</Text>
              </div>
              <div className="flex flex-col items-center">
                <Image src="/APlus_3.jpg" alt="妊娠と不妊治療" width={970} height={600} className="w-full h-auto rounded-[var(--lk-radius-m)] shadow-elevation-1 mb-s" />
                <Text fontClass="caption" className="text-on-surface-variant">妊娠と不妊治療のための知識（事実13〜24）</Text>
              </div>
            </div>
          </Container>
        </Section>

        {/* 10. AUTHOR + META (著者・書誌情報) */}
        <Section className="py-xl">
          <Container className="max-w-screen-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
              <div className="flex items-center gap-l">
                <div className="relative w-32 h-32 rounded-full overflow-hidden shrink-0 shadow-elevation-1">
                  <Image src="/250403kz_0002.JPG" alt="佐藤 琢磨" fill className="object-cover" />
                </div>
                <div>
                  <Text fontClass="title2" className="font-bold mb-xs">佐藤 琢磨 <br /><span className="text-sm font-normal text-on-surface-variant">(Takuma Sato, MD, PhD)</span></Text>
                  <Text fontClass="body" className="text-on-surface-variant">生殖医療専門医・産婦人科専門医</Text>
                </div>
              </div>
              <div className="bg-surface-container-low p-m rounded-[var(--lk-radius-m)]">
                <Text fontClass="title3" className="font-bold mb-m">書誌情報</Text>
                <ul className="space-y-2 text-sm text-on-surface-variant">
                  <li><strong>タイトル：</strong>『20代で考える 将来妊娠で困らないための選択』</li>
                  <li><strong>著者：</strong>佐藤琢磨（Takuma Sato, MD, PhD）</li>
                  <li><strong>出版：</strong>2025年4月</li>
                  <li><strong>出版社：</strong>Kindle Direct Publishing</li>
                  <li><strong>フォーマット：</strong>ペーパーバック版・Kindle版</li>
                  <li><strong>内容：</strong>医学的な24の事実を厳選し、女性のライフプランを支える一冊。</li>
                </ul>
              </div>
            </div>

            <div className="mt-l">
              <Text fontClass="body" className="text-on-surface-variant text-sm">
                2013年福井大学医学部卒業。淀川キリスト教病院での初期臨床研修を経て、神戸大学医学部附属病院産科婦人科学教室に入局。その後、複数の総合病院や不妊治療専門クリニックで研鑽を積む。<br /><br />
                現在は生殖医療専門医として、日々多くの患者様の妊娠・出産をサポート。確かな医学的知識と、一人ひとりに寄り添う丁寧な診療に定評がある。生殖医療の正しい知識をより多くの人に届けるため、SNSを通じた啓発活動にも注力している。
              </Text>
            </div>
          </Container>
        </Section>

        {/* 11. INSTAGRAM (Instagramレター) */}
        <Section className="bg-surface-container-low py-xl">
          <Container className="max-w-screen-md">
            <Text fontClass="heading-bold" className="text-center mb-xs">Instagram レター</Text>
            <Text fontClass="body" className="text-center text-on-surface-variant mb-l">最新のメッセージをリール動画でも発信しています。</Text>
            <div className="flex justify-center w-full">
              <blockquote
                className="instagram-media"
                data-instgrm-permalink="https://www.instagram.com/reel/DVIHLS9k6B3/?utm_source=ig_embed&amp;utm_campaign=loading"
                data-instgrm-version="14"
                style={{
                  background: "#FFF",
                  border: "0",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(0,0,0,.08)",
                  margin: "0",
                  maxWidth: "400px",
                  minWidth: "326px",
                  padding: "0",
                  width: "100%",
                }}
              ></blockquote>
              <script async src="//www.instagram.com/embed.js"></script>
            </div>
          </Container>
        </Section>

        {/* 12. FAQ */}
        <Section className="py-xl">
          <Container className="max-w-screen-md">
            <Text fontClass="heading-bold" className="mb-m text-center">妊娠・ライフプランのよくある質問</Text>
            <Text fontClass="caption" className="text-center text-on-surface-variant mb-l">※以下の回答は、生殖医療専門医 佐藤 琢磨 による監修のもと作成した一般的な情報です。</Text>

            <div className="flex flex-col gap-m">
              <Card variant="outline" className="p-m flex flex-col gap-s">
                <Text fontClass="title3" className="font-bold text-primary">Q. 20代でも不妊になることはありますか？</Text>
                <Text fontClass="body" className="text-on-surface-variant">A. あります。生理が規則的でも卵管のトラブルやパートナー側の要因などで妊娠しにくい場合があります。早めに基礎検査を受けておくと、将来の選択肢を広く保つことができます。</Text>
              </Card>
              <Card variant="outline" className="p-m flex flex-col gap-s">
                <Text fontClass="title3" className="font-bold text-primary">Q. 妊娠の「ベストな年齢」は何歳ですか？</Text>
                <Text fontClass="body" className="text-on-surface-variant">A. 一般的には20代後半〜30歳前後が妊娠率のピークとされますが、個人差が大きいため、年齢だけでなくAMH値や月経周期、不妊リスクとなる病気の有無などを総合的に見ることが大切です。</Text>
              </Card>
              <Card variant="outline" className="p-m flex flex-col gap-s">
                <Text fontClass="title3" className="font-bold text-primary">Q. いつ病院を受診したらいいか、目安はありますか？</Text>
                <Text fontClass="body" className="text-on-surface-variant">A. 35歳未満で1年、35歳以上で半年妊娠しなければ一度相談をおすすめします。生殖医療専門医に早めに相談することで、遠回りの時間を減らせます。</Text>
              </Card>
            </div>
          </Container>
        </Section>

        {/* 13. CTA */}
        <Section className="bg-primary-container py-2xl text-center">
          <Container className="max-w-screen-md">
            <Text fontClass="display2-bold" className="text-on-primary-container mb-s">“将来の自分”のために、今日の数ページから。</Text>
            <Text fontClass="body" className="text-on-primary-container opacity-80 mb-l">スマホで3分から読めるKindle版。医師が書いた“安心できる医療知識”。</Text>
            <Row className="gap-m justify-center">
              <a href="https://amzn.to/3X0yF3v" target="_blank" rel="noopener noreferrer">
                <Button variant="fill" size="lg" label="日本語版を読む" />
              </a>
              <a href="https://amzn.to/4ofHlPS" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" label="English Edition" className="border-on-primary-container text-on-primary-container hover:bg-on-primary-container hover:text-primary-container" />
              </a>
            </Row>
            <div className="mt-xl pt-l border-t border-on-primary-container/20">
              <Text fontClass="caption" className="text-on-primary-container">このページは生殖医療専門医 佐藤 琢磨 が監修しています。<br />© Educate Press</Text>
            </div>
          </Container>
        </Section>

      </main>

      {/* 14. STICKY CTA */}
      <div className="fixed bottom-4 right-4 z-50">
        <a href="https://amzn.to/3X0yF3v" target="_blank" rel="noopener noreferrer" className="flex items-center gap-xs bg-surface p-xs pr-m rounded-full shadow-elevation-3 hover:scale-105 transition-transform border border-[#FFA41C]/30 text-decoration-none">
          <div className="relative w-8 h-10 rounded shadow-sm overflow-hidden">
            <Image src="/mockup-jp.png" alt="書影" fill className="object-cover" />
          </div>
          <span className="font-bold text-[#b35e76] text-sm">Get it now</span>
        </a>
      </div>

    </>
  );
}
