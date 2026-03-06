import Head from 'next/head';
import Image from 'next/image';
import { Button } from "@/components/button";
import { Container } from "@/components/container";
import { Section } from "@/components/section";
import { Text } from "@/components/text";
import { Row } from "@/components/row";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/card";

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
                <Text variant="label-large" className="text-on-surface-variant mb-xs">
                  生殖医療専門医がやさしく解説
                </Text>
                <Text variant="display-medium" className="font-bold mb-m">
                  『20代で考える<br />将来妊娠で困らないための選択』
                </Text>
                <Text variant="body-large" className="text-on-surface-variant mb-l max-w-[60ch]">
                  今の自分を大切にすることが、未来の「選択肢」を増やす。<br />
                  20代・30代の女性が“今から知っておくべき”24の医学的事実を一冊に。
                </Text>
                <Row className="gap-s">
                  <Button variant="filled" href="https://amzn.to/3X0yF3v" target="_blank" size="large">
                    日本語版を読む
                  </Button>
                  <Button variant="outlined" href="https://amzn.to/4ofHlPS" target="_blank" size="large">
                    English Edition
                  </Button>
                </Row>
              </div>
              <div className="flex-1 flex justify-center w-full">
                {/* We will copy the assets over next */}
                <div className="relative w-full aspect-[3/4] max-w-sm rounded-[var(--lk-radius-l)] overflow-hidden shadow-elevation-3">
                   <div className="absolute inset-0 bg-secondary-container flex items-center justify-center">
                     <Text variant="body-medium" className="text-on-secondary-container">Book Cover Image</Text>
                   </div>
                </div>
              </div>
            </Row>
          </Container>
        </Section>

        {/* WHY IMPORTANT */}
        <Section className="bg-surface-container-low py-xl">
          <Container className="max-w-screen-md text-center">
            <Text variant="headline-medium" className="font-bold mb-m">
              知っているか・知らないかで変わる「一年分の時間」
            </Text>
            <Text variant="body-large" className="text-on-surface-variant mb-m">
              妊娠・出産は、夫婦にとって大きなライフイベントです。<br />
              将来、子どもを望むなら――「知らなかった」で失う一年分の遠回りを、できるだけ減らしたいところです。
            </Text>
          </Container>
        </Section>

        {/* BENEFITS TILE */}
        <Section className="py-xl">
          <Container className="max-w-screen-lg">
            <Text variant="headline-medium" className="font-bold mb-l text-center">
              この本を読んでこう変わる。
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-m">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>BEFORE</CardTitle>
                </CardHeader>
                <CardContent>
                  <Text variant="body-medium">「いつか、なんとかなる」と思っていた</Text>
                </CardContent>
              </Card>
              <Card variant="elevated" className="bg-primary-container text-on-primary-container">
                <CardHeader>
                  <CardTitle className="text-on-primary-container">AFTER</CardTitle>
                </CardHeader>
                <CardContent>
                  <Text variant="body-medium" className="text-on-primary-container">
                    適した時期の個人差を知り、自分のベストタイミングを考えられるようになった。
                  </Text>
                </CardContent>
              </Card>
            </div>
          </Container>
        </Section>

      </main>
    </>
  );
}
