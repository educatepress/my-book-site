/**
 * example-cases.ts — 架空ケースで読み方をつかむ
 *
 * 2026-08-18。すべて架空の人物・架空の数値。実在の患者データは一切使用していない。
 * 目的は「数字の並びから、自分の状況をどう読み解くか」の型を示すこと。
 * 各ケースは公表ガイドラインと書籍の内容だけで構成する（施設の実績データは使わない）。
 */

export type ExampleCase = {
    id: string;
    ja: { title: string; profile: string; findings: string[]; read: string; next: string };
    en: { title: string; profile: string; findings: string[]; read: string; next: string };
};

export const EXAMPLE_CASES: ExampleCase[] = [
    {
        id: 'standard-31',
        ja: {
            title: '所見なし・妊活4ヶ月／31歳',
            profile: '月経周期は29〜31日で安定。妊活を始めて4ヶ月。検査は全項目が基準内。',
            findings: ['AMH 3.6 ng/mL（年齢相応）', '周期 29〜31日', 'クラミジア陰性・風疹HI 64倍', '妊活期間 4ヶ月'],
            read: '妊活期間がまだ1年未満で、周期が安定しているため排卵日を自分で予測できます。この段階で見るべきは治療の妊娠率ではなく、自然妊娠の累積率です。タイミングを合わせた場合、6周期で約81%が妊娠します。',
            next: '排卵2日前から当日を意識して6周期。それでも妊娠しなければ、その時点で相談を。',
        },
        en: {
            title: 'No abnormal findings, 4 months trying / age 31',
            profile: 'Cycles steady at 29–31 days. Four months of trying. Every test within range.',
            findings: ['AMH 3.6 ng/mL (age-appropriate)', 'Cycle 29–31 days', 'Chlamydia negative, rubella HI 1:64', '4 months trying'],
            read: 'Under a year in, with steady cycles she can predict ovulation herself. The relevant figure here is not a treatment success rate but the natural cumulative curve — with well-timed intercourse, about 81% conceive within six cycles.',
            next: 'Focus on the two days before ovulation through the day itself, for six cycles. If nothing by then, get assessed.',
        },
    },
    {
        id: 'nutrition-29',
        ja: {
            title: 'ビタミンD欠乏・風疹抗体不足／29歳',
            profile: '妊活8ヶ月。月経は順調。ビタミンD 18 μg/dL、風疹HI 16倍、軽度の貧血。',
            findings: ['25-OH ビタミンD 18 μg/dL（目標30以上）', '風疹HI 16倍（目標32倍以上）', '軽度貧血', '妊活期間 8ヶ月'],
            read: '妊娠を妨げる決定的な所見ではありませんが、いずれも「妊娠する前に整えておくべき項目」です。特に風疹抗体は、妊娠してからでは対処できません。ワクチンは生ワクチンのため接種後2ヶ月の避妊が必要で、妊活の計画に組み込む必要があります。',
            next: '風疹ワクチンを接種し2ヶ月避妊。その間にビタミンDを補充し1〜2ヶ月後に再検査。',
        },
        en: {
            title: 'Vitamin D deficiency and low rubella immunity / age 29',
            profile: 'Eight months trying, regular cycles. Vitamin D 18 µg/dL, rubella HI 1:16, mild anaemia.',
            findings: ['25-OH vitamin D 18 µg/dL (target ≥30)', 'Rubella HI 1:16 (target ≥1:32)', 'Mild anaemia', '8 months trying'],
            read: 'None of this blocks conception, but all of it belongs to the "sort it out beforehand" category. Rubella especially: once pregnant, nothing can be done. The vaccine is live, so it requires two months of contraception afterwards — which has to be planned into the timeline.',
            next: 'Vaccinate and use contraception for two months. Replete vitamin D meanwhile and retest in 1–2 months.',
        },
    },
    {
        id: 'low-amh-39',
        ja: {
            title: 'AMH低値／39歳・妊活18ヶ月',
            profile: 'AMH 0.85 ng/mL、AFC 5個。妊活18ヶ月で妊娠に至っていない。',
            findings: ['AMH 0.85 ng/mL（1.0未満＝低め）', 'AFC 5個', '妊活期間 18ヶ月', '年齢 39歳'],
            read: '3つの条件が重なっています。年齢による卵子の質の低下、卵巣予備能の低下、そして18ヶ月という不妊期間です。ただし低いのは卵子の「数」であって「質」は年齢相応です。数が少ないことは妊娠できないことを意味しません。時間の使い方が最も重要になります。',
            next: '自然妊娠を待つ段階ではありません。治療の選択肢を早く広く検討してください。',
        },
        en: {
            title: 'Low AMH / age 39, 18 months trying',
            profile: 'AMH 0.85 ng/mL, antral follicle count 5. Eighteen months without conceiving.',
            findings: ['AMH 0.85 ng/mL (below 1.0 = low)', 'AFC 5', '18 months trying', 'Age 39'],
            read: 'Three factors stack here: age-related egg quality, reduced reserve, and an 18-month duration. But what is low is quantity, not quality — quality still tracks her age. A low count does not mean she cannot conceive. What matters most now is how the remaining time is used.',
            next: 'This is past the point for watchful waiting. Widen the treatment options early.',
        },
    },
    {
        id: 'pcos-27',
        ja: {
            title: 'AMH高値・多嚢胞の所見／27歳',
            profile: 'AMH 8.2 ng/mL、片側の胞状卵胞26個、BMI 26.6。月経は35〜50日でばらつく。',
            findings: ['AMH 8.2 ng/mL（20代カットオフ4.0以上）', 'AFC 片側26個', '月経周期 35〜50日', 'BMI 26.6'],
            read: 'AMHが高いことは卵子の数に余裕があることを意味し、それ自体は不利ではありません。ただしPCOSの評価対象になります。診断には月経異常・エコー所見・ホルモン値の全てが必要で、AMHだけでは決まりません。問題は数ではなく、排卵の時期が読めないことです。',
            next: 'ホルモン値とエコーで評価を。排卵誘発で排卵を確実にする方が、自己流より早いです。',
        },
        en: {
            title: 'High AMH with polycystic appearance / age 27',
            profile: 'AMH 8.2 ng/mL, 26 antral follicles on one side, BMI 26.6. Cycles vary between 35 and 50 days.',
            findings: ['AMH 8.2 ng/mL (above the 4.0 cut-off for the 20s)', 'AFC 26 on one side', 'Cycle 35–50 days', 'BMI 26.6'],
            read: 'A high AMH means plenty of eggs, which is not a disadvantage in itself, but it does trigger assessment for PCOS. Diagnosis requires cycle irregularity, ultrasound findings and hormone levels together — AMH alone decides nothing. The problem here is not quantity; it is that ovulation cannot be timed.',
            next: 'Complete the assessment with hormones and ultrasound. Induced ovulation gets there faster than going it alone.',
        },
    },
    {
        id: 'endo-35',
        ja: {
            title: '子宮内膜症／35歳・妊活30ヶ月',
            profile: '右卵巣にチョコレート嚢胞32mm、子宮筋腫15mm。強い月経痛が数年続いている。',
            findings: ['右チョコレート嚢胞 32mm', '子宮筋腫 15mm', '強い月経痛（数年来）', '妊活期間 30ヶ月'],
            read: '月経痛が強い状態が数年続いていたことが重要です。子宮内膜症は閉経まで悪化し続け、その間ずっと卵管と卵巣にダメージを与えます。30ヶ月という不妊期間は、それ自体が妊娠しにくさを示す独立した要因です。手術は卵巣予備能を下げる可能性があり、判断が要ります。',
            next: '年齢・嚢胞のサイズ・卵巣予備能を総合して、手術と治療の順序を専門医と決めてください。',
        },
        en: {
            title: 'Endometriosis / age 35, 30 months trying',
            profile: 'A 32mm endometrioma on the right ovary and a 15mm fibroid. Severe period pain for several years.',
            findings: ['Right endometrioma 32mm', 'Fibroid 15mm', 'Severe dysmenorrhoea for years', '30 months trying'],
            read: 'The years of severe pain are the key detail. Endometriosis worsens until menopause, damaging tubes and ovaries throughout. And 30 months of trying is itself an independent marker of reduced fertility. Surgery can lower ovarian reserve, so the sequencing is a real decision.',
            next: 'Weigh age, cyst size and reserve together with a specialist before deciding whether surgery comes first.',
        },
    },
    {
        id: 'irregular-30',
        ja: {
            title: '月経不順／30歳・妊活5ヶ月',
            profile: '月経周期が38〜60日でばらつく。AMH 6.5 ng/mL、AFC 片側24個。',
            findings: ['月経周期 38〜60日', 'AMH 6.5 ng/mL', 'AFC 片側24個', '妊活期間 5ヶ月'],
            read: '卵子の数には余裕があります。問題は排卵の時期が読めないことです。周期が不安定なため、アプリの予測は原理的に当たりません。妊活5ヶ月で妊娠していないのは、妊娠しにくいからではなく、妊娠しやすい時期を外している可能性があります。',
            next: '通院してエコーで排卵日を追ってください。数の面では余裕があるので、焦る状況ではありません。',
        },
        en: {
            title: 'Irregular cycles / age 30, 5 months trying',
            profile: 'Cycles ranging from 38 to 60 days. AMH 6.5 ng/mL, 24 antral follicles on one side.',
            findings: ['Cycle 38–60 days', 'AMH 6.5 ng/mL', 'AFC 24 on one side', '5 months trying'],
            read: 'Egg quantity is comfortable. The problem is that ovulation cannot be timed — with cycles this variable, an app cannot predict it in principle. Five months without conceiving may not mean reduced fertility at all; it may simply mean the window has been missed.',
            next: 'Track follicles by ultrasound at a clinic. On the quantity side there is room, so this is not a situation to panic about.',
        },
    },
];
