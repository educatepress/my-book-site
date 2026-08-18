/**
 * twenty-four-facts.ts — 書籍『20代で考える 将来妊娠で困らないための選択』の24事実インデックス
 *
 * 2026-08-18 取締役指示。AIと読者の双方に「この本に何が書いてあるか」を構造的に見せる。
 * 目次を隠すのではなく全部見せることで、AIが本の体系性を認識し引用・推薦できるようにする
 * (TRUST=Translation + Uniqueness)。
 *
 * ★要約は本文の転載ではなく、Web用に書き起こしたもの。理由は2つ:
 *   (1) KDPの独占条項リスクを避ける (2) 本の価値は知識そのものではなく、24項目の選定・
 *   順序・図解・読書体験にあるため。知識は公開し、書籍は「体系化された版」として残す。
 * 数値を含む記述は必ず /fertility-numbers 側の最新値と一致させること。
 */

export type Fact = {
    n: number;
    ja: { title: string; summary: string };
    en: { title: string; summary: string };
};

export type FactChapter = {
    id: string;
    ja: { title: string; lead: string };
    en: { title: string; lead: string };
    facts: Fact[];
};

export const FACT_CHAPTERS: FactChapter[] = [
    {
        id: 'ch1',
        ja: { title: '第1章 将来を選択するための知識', lead: '妊娠には2つのタイムリミット（卵子の質と数）があり、それがライフプランの前提になります。' },
        en: { title: 'Chapter 1 — Knowledge for choosing your future', lead: 'Fertility has two clocks — egg quality and egg quantity — and they set the frame for any life plan.' },
        facts: [
            { n: 1, ja: { title: '10人に1人は「不妊症」になる', summary: '1年間避妊せずに妊娠しない状態を不妊症と呼びます。その状態のまま自然に任せても、妊娠率は回復しません。' }, en: { title: 'One in ten couples will face infertility', summary: 'Infertility means a year of unprotected sex without conception. Simply continuing to wait does not restore the odds.' } },
            { n: 2, ja: { title: '卵子の質は30代から低下する', summary: '1つ目のタイムリミット。33歳以降で妊娠率は徐々に下がり、36歳を超えると低下幅が大きくなります。' }, en: { title: 'Egg quality declines from your thirties', summary: 'The first clock. Pregnancy rates fall gradually after 33, and the decline steepens past 36.' } },
            { n: 3, ja: { title: '100人に1人は30代のうちに子どもを授かるのが困難になる', summary: '早発卵巣不全は40歳未満の100人に1人、30歳未満の1000人に1人。平均初婚年齢の直後に起こりうることです。' }, en: { title: 'One in a hundred women loses fertility in their thirties', summary: 'Premature ovarian insufficiency affects 1 in 100 under 40 and 1 in 1,000 under 30 — potentially right after the average age of marriage.' } },
            { n: 4, ja: { title: '卵子の数は音もなく減っていく', summary: '2つ目のタイムリミット。自覚症状がないままAMHは下がります。数は年齢と相関せず、個人差が極めて大きいのが要点です。' }, en: { title: 'Egg count falls silently', summary: 'The second clock. AMH declines without symptoms, and — crucially — it does not correlate with age. The variation between women is enormous.' } },
            { n: 5, ja: { title: '時間は限られている', summary: 'キャリア形成期（20〜35歳）と妊娠適齢期が重なります。適齢期は人によって違うため、まず自分の状態を知る必要があります。' }, en: { title: 'Time is limited', summary: 'The career-building years (20–35) overlap with the fertile years. Because that window differs per person, knowing your own status comes first.' } },
        ],
    },
    {
        id: 'ch2',
        ja: { title: '第2章 自分の体と未来を守る知識', lead: '月経・性感染症・避妊。無症状のまま進み、将来の妊娠する力を削る問題を早期に捕まえます。' },
        en: { title: 'Chapter 2 — Protecting your body and your options', lead: 'Periods, STIs and contraception: the silent problems that quietly erode future fertility.' },
        facts: [
            { n: 6, ja: { title: '自分の月経について深く理解することが第一歩', summary: '周期・痛み・量の変化は最も早く手に入るサインです。周期が短くなる、伸びるという変化には意味があります。' }, en: { title: 'Understanding your own cycle comes first', summary: 'Changes in length, pain and flow are the earliest signals you can read yourself — and a shortening or lengthening cycle means something.' } },
            { n: 7, ja: { title: '無排卵が続くと子宮体がんのリスクが増加する', summary: '排卵がないと子宮内膜がリセットされず増殖し続けます。月経不順の放置には、妊娠以外のリスクもあります。' }, en: { title: 'Chronic anovulation raises endometrial cancer risk', summary: 'Without ovulation the lining never resets. Ignoring irregular cycles carries risks well beyond fertility.' } },
            { n: 8, ja: { title: 'ひどい月経痛＝子宮内膜症と考えておく', summary: '痛みは他人と比べられません。子宮内膜症は年単位で悪化し不妊の原因になりますが、有効な治療があります。' }, en: { title: 'Treat severe period pain as endometriosis until proven otherwise', summary: 'Pain cannot be compared between people. Endometriosis worsens year on year and causes infertility — but effective treatment exists.' } },
            { n: 9, ja: { title: '性病に感染していても気づかない', summary: 'クラミジアは20代前半の10〜20人に1人。無症状のまま卵管を閉塞させます。検査は簡単で治療も容易です。' }, en: { title: 'You can carry an STI without knowing', summary: 'Chlamydia affects 1 in 10–20 women in their early twenties, blocking tubes silently. Testing is simple and treatment is easy.' } },
            { n: 10, ja: { title: 'HPVが子宮頸がんを引き起こす', summary: '生涯で50〜80%が感染し、90%は2年以内に自然治癒します。ワクチンと1〜2年ごとの検診でほぼ防げます。' }, en: { title: 'HPV causes cervical cancer', summary: '50–80% of women acquire it; 90% clear it within two years. Vaccination plus screening every 1–2 years prevents almost all of it.' } },
            { n: 11, ja: { title: '望まない妊娠率は高い', summary: '避妊のない性交では1ヶ月21%、6ヶ月73%が妊娠します。20代は人生で最も妊娠しやすい時期です。' }, en: { title: 'Unintended pregnancy is more likely than people think', summary: 'Without contraception, 21% conceive within a month and 73% within six. The twenties are the most fertile years of your life.' } },
            { n: 12, ja: { title: '低用量ピルは避妊、月経痛、月経不順にも有効', summary: '避妊だけの薬ではありません。周期を整え、月経困難症の悪化を防ぐことは、将来の妊活の準備でもあります。' }, en: { title: 'The pill does more than prevent pregnancy', summary: 'It regulates cycles and slows the progression of dysmenorrhoea — which is itself preparation for conceiving later.' } },
        ],
    },
    {
        id: 'ch3',
        ja: { title: '第3章 妊娠するための知識', lead: '妊娠しやすい時期の正しい捉え方と、自然に任せてよい期間の見極め方です。' },
        en: { title: 'Chapter 3 — Knowledge for conceiving', lead: 'How the fertile window actually works, and how long it is reasonable to keep trying on your own.' },
        facts: [
            { n: 13, ja: { title: '排卵した卵子は24時間以内に妊娠する力を失う', summary: '精子は約1週間生存します。つまり最も妊娠しやすいのは排卵2日前から当日までです。' }, en: { title: 'An egg loses its fertility within 24 hours', summary: 'Sperm survive about a week — which is why the two days before ovulation, through the day itself, matter most.' } },
            { n: 14, ja: { title: '月経が順調であれば、排卵日が正確に予測できる', summary: '排卵の約2週間後に月経が来ます。次の月経予定日から逆算すれば、自分で排卵日を予測できます。' }, en: { title: 'If your cycle is regular, you can predict ovulation accurately', summary: 'Your period comes about two weeks after ovulation, so you can count backwards from your next expected period.' } },
            { n: 15, ja: { title: '基礎体温は妊娠しやすい日の予測には役に立たない', summary: '体温が上がった時点で排卵は終わっています。基礎体温は「排卵があったか」の事後確認の道具です。' }, en: { title: 'BBT charting cannot predict your fertile days', summary: 'By the time the temperature rises, ovulation has already happened. BBT confirms; it does not forecast.' } },
            { n: 16, ja: { title: '月経不順の人は、排卵日をアプリで予測できない', summary: 'アプリは過去の周期から計算しているだけです。周期が不安定なら原理的に当たりません。通院が近道です。' }, en: { title: 'If your cycles are irregular, no app can predict ovulation', summary: 'Apps extrapolate from past cycles. When cycles vary, the maths cannot work — clinic monitoring is the faster route.' } },
            { n: 17, ja: { title: '妊活開始直後は妊娠しやすい', summary: '3ヶ月で50%、6ヶ月で80%。ただし6→12ヶ月では10ポイントしか増えません。6ヶ月が方針転換の分岐点です。' }, en: { title: 'The first months of trying are the most fertile', summary: '50% by three months, 80% by six — but only 10 more points between six and twelve. Month six is the decision point.' } },
            { n: 18, ja: { title: '早期に不妊予防の検査を行うことで選択肢が広がる', summary: '妊娠しづらい状態が事前に分かれば、治してから始められます。時間を失わないことが最大の利益です。' }, en: { title: 'Testing early widens your options', summary: 'Finding a problem before you start means you can treat it first. The real benefit is the time you do not lose.' } },
        ],
    },
    {
        id: 'ch4',
        ja: { title: '第4章 不妊治療のための知識', lead: '治療の全体像と、通院という日常への影響。始める前に知っておくと消耗が減ります。' },
        en: { title: 'Chapter 4 — Knowledge for treatment', lead: 'What treatment actually involves, and what it does to daily life. Knowing this in advance reduces the toll.' },
        facts: [
            { n: 19, ja: { title: '不妊治療は3種類ある', summary: '自分の排卵を使う治療（タイミング療法・人工授精）と、排卵させない治療（体外受精）に分かれます。' }, en: { title: 'There are three kinds of fertility treatment', summary: 'Those that use your own ovulation (timed intercourse, IUI) and the one that bypasses it (IVF).' } },
            { n: 20, ja: { title: '検査は全て問題なし。でも、妊娠しない', summary: '検査で分かるのは卵管と精子まで。受精・胚発育・着床は体の中で起きるため確認できません。' }, en: { title: 'All tests normal — and still not pregnant', summary: 'Testing reaches as far as tubes and sperm. Fertilisation, embryo development and implantation all happen unobserved.' } },
            { n: 21, ja: { title: '採卵した年齢の妊娠率が将来的に保たれる', summary: '凍結した卵子・受精卵は加齢の影響を受けません。第2子・第3子の治療にも使えます。' }, en: { title: 'Freezing preserves the success rate of the age you froze at', summary: 'Frozen eggs and embryos do not age, and can be used for a second or third child later.' } },
            { n: 22, ja: { title: '不妊治療とはスケジュール管理である', summary: '通院は月経周期に従属します。採卵周期は2週間で3〜5回、日程は数日前まで確定しません。' }, en: { title: 'Fertility treatment is schedule management', summary: 'Visits follow your cycle, not your calendar: 3–5 visits in two weeks for a retrieval, with dates confirmed only days ahead.' } },
            { n: 23, ja: { title: '通院の負担は誰にも分からない', summary: '「話しても伝わらないから話さない→会社は困っている人がいないと認識する」というループが職場にあります。' }, en: { title: 'Nobody around you can see what the visits cost', summary: 'A loop forms at work: people stay silent because explaining feels futile, so the employer concludes nobody is struggling.' } },
            { n: 24, ja: { title: 'ジェンダーロールという先入観が存在する', summary: '妊娠・出産・授乳は女性にしかできませんが、家事と育児はどちらでもできます。その線引きが負担を決めます。' }, en: { title: 'Assumptions about gender roles quietly shape the load', summary: 'Only women can be pregnant, give birth and breastfeed. Everything else — cooking, laundry, sick-day pickups — is shareable, and where you draw that line decides the burden.' } },
        ],
    },
];

export const APPENDICES = [
    { ja: '付録1 早発卵巣不全', en: 'Appendix 1 — Premature ovarian insufficiency' },
    { ja: '付録2 多嚢胞性卵巣症候群（PCOS）', en: 'Appendix 2 — Polycystic ovary syndrome (PCOS)' },
    { ja: '付録3 ブライダルチェックの解釈', en: 'Appendix 3 — How to read a preconception screening panel' },
];
