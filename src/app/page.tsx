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

      <main className="bg-surface text-on-surface min-h-screen">

        {/* HERO SECTION */}
        <Section className="py-xl">
          <Container className="max-w-screen-lg">
            <Row className="flex-col md:flex-row items-center gap-l">
              <div className="flex-1">
                <Text fontClass="label" className="text-on-surface-variant mb-xs">
                  生殖医療専門医がやさしく解説
                </Text>
                <Text fontClass="display2-bold" className="mb-m">
                  『20代で考える<br />将来妊娠で困らないための選択』
                </Text>
                <Text fontClass="title3" className="text-on-surface-variant mb-l max-w-[60ch]">
                  今の自分を大切にすることが、未来の「選択肢」を増やす。<br />
                  20代・30代の女性が“今から知っておくべき”24の医学的事実を一冊に。
                </Text>
                <Row className="gap-s">
                  <a href="https://amzn.to/3X0yF3v" target="_blank" rel="noopener noreferrer">
                    <Button variant="fill" size="lg" label="日本語版を読む" />
                  </a>
                  <a href="https://amzn.to/4ofHlPS" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="lg" label="English Edition" />
                  </a>
                </Row>
              </div>
              <div className="flex-1 flex justify-center w-full">
                {/* We will copy the assets over next */}
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
            </Row>
          </Container>
        </Section>

        {/* WHY IMPORTANT */}
        <Section className="bg-surface-container-low py-xl">
          <Container className="max-w-screen-md text-center">
            <Text fontClass="heading-bold" className="mb-m">
              知っているか・知らないかで変わる「一年分の時間」
            </Text>
            <Text fontClass="title3" className="text-on-surface-variant mb-m">
              妊娠・出産は、夫婦にとって大きなライフイベントです。<br />
              将来、子どもを望むなら――「知らなかった」で失う一年分の遠回りを、できるだけ減らしたいところです。
            </Text>
          </Container>
        </Section>

        {/* BENEFITS TILE */}
        <Section className="py-xl">
          <Container className="max-w-screen-lg">
            <Text fontClass="heading-bold" className="mb-l text-center">
              この本を読んでこう変わる。
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-m">
              <Card variant="fill" className="p-m">
                <Text fontClass="label-bold" className="mb-xs">BEFORE</Text>
                <Text fontClass="body">「いつか、なんとかなる」と思っていた</Text>
              </Card>
              <Card variant="fill" bgColor="primarycontainer" className="p-m text-on-primary-container">
                <Text fontClass="label-bold" className="mb-xs text-on-primary-container">AFTER</Text>
                <Text fontClass="body" className="text-on-primary-container">
                  適した時期の個人差を知り、自分のベストタイミングを考えられるようになった。
                </Text>
              </Card>
            </div>
          </Container>
        </Section>
      </main>

      {/* INSTAGRAM SECTION */}
      <Section className="py-xl">
        <Container className="max-w-screen-md">
          <Text fontClass="heading-bold" className="text-center mb-l">
            Instagram レター
          </Text>
          <div className="flex justify-center w-full">
            <blockquote
              className="instagram-media"
              data-instgrm-permalink="https://www.instagram.com/reel/DVIHLS9k6B3/?utm_source=ig_embed&amp;utm_campaign=loading"
              data-instgrm-version="14"
              style={{
                background: "#FFF",
                border: "0",
                borderRadius: "3px",
                boxShadow: "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)",
                margin: "1px",
                maxWidth: "540px",
                minWidth: "326px",
                padding: "0",
                width: "calc(100% - 2px)",
              }}
            ></blockquote>
            <script async src="//www.instagram.com/embed.js"></script>
          </div>
        </Container>
      </Section>

      {/* NOTES ARTICLES SECTION */}
      <Section className="bg-surface-container-low py-xl">
        <Container className="max-w-screen-lg">
          <Text fontClass="heading-bold" className="mb-l text-center">
            NOTES
          </Text>
          <Text fontClass="body" className="mb-l text-center text-on-surface-variant">
            著者（生殖医療専門医）による、妊娠や不妊治療に関する解説記事です。
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-m">
            {/* Note Link Card 1 */}
            <a href="https://note.com/educatepress/n/n4db0a59be5fb" target="_blank" rel="noopener noreferrer" className="block outline-none hover:opacity-90 transition-opacity">
              <Card variant="outline" className="h-full flex flex-col hover:border-primary transition-colors">
                <div className="relative w-full aspect-video bg-surface-variant">
                  <Image
                    src="/assets/age-fertility-thumb.jpg"
                    alt="20代の妊娠の実情"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-m flex-1 flex flex-col justify-between">
                  <Text fontClass="title3" className="font-bold mb-xs line-clamp-2">生殖医療専門医がやさしく解説『20代で考える！将来、妊娠で困らないための選択』①20代の妊娠の実情</Text>
                  <Text fontClass="body" className="text-primary mt-s">続きを読む →</Text>
                </div>
              </Card>
            </a>

            {/* Note Link Card 2 */}
            <a href="https://note.com/educatepress/n/nf624ac923ca0" target="_blank" rel="noopener noreferrer" className="block outline-none hover:opacity-90 transition-opacity">
              <Card variant="outline" className="h-full flex flex-col hover:border-primary transition-colors">
                <div className="relative w-full aspect-video bg-surface-variant">
                  <Image
                    src="/assets/amh-thumb.jpg"
                    alt="加齢とともに卵子はどうなる？"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-m flex-1 flex flex-col justify-between">
                  <Text fontClass="title3" className="font-bold mb-xs line-clamp-2">生殖医療専門医がやさしく解説『20代で考える！将来、妊娠で困らないための選択』②加齢とともに卵子はどうなる？</Text>
                  <Text fontClass="body" className="text-primary mt-s">続きを読む →</Text>
                </div>
              </Card>
            </a>
          </div>
        </Container>
      </Section>

      {/* AUTHOR SECTION */}
      <Section className="py-xl">
        <Container className="max-w-screen-md">
          <Card variant="fill" className="p-l md:p-xl flex flex-col md:flex-row gap-l items-center md:items-start text-center md:text-left">
            <div className="relative w-32 h-32 rounded-full overflow-hidden shrink-0 border-4 border-surface shadow-elevation-1">
              <Image
                src="/assets/author-takuma.jpg"
                alt="佐藤 琢磨"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <Text fontClass="label" className="text-primary mb-2xs">AUTHOR</Text>
              <Text fontClass="title2" className="font-bold mb-xs">佐藤 琢磨 (Takuma Sato)</Text>
              <Text fontClass="body" className="text-on-surface-variant mb-m">生殖医療専門医・産婦人科専門医</Text>
              <Text fontClass="body" className="text-on-surface-variant text-sm">
                2013年福井大学医学部卒業。淀川キリスト教病院での初期臨床研修を経て、神戸大学医学部附属病院産科婦人科学教室に入局。その後、複数の総合病院や不妊治療専門クリニックで研鑽を積む。<br /><br />
                現在は生殖医療専門医として、日々多くの患者様の妊娠・出産をサポート。確かな医学的知識と、一人ひとりに寄り添う丁寧な診療に定評がある。生殖医療の正しい知識をより多くの人に届けるため、啓発活動にも注力している。
              </Text>
            </div>
          </Card>
        </Container>
      </Section>

    </>
  );
}
