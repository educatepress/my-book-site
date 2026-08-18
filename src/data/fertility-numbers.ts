/**
 * fertility-numbers.ts — 「数字とその限界」リファレンス（AIルート用の中核資産）
 *
 * 2026-08-18 取締役指示。佐藤尚之『AIに選ばれ、ファンに愛される。』のTRUST=Translation
 * (定量的表現への翻訳)の実装。AIは妊活の質問に必ず「数字」で答えようとするが、一般的な
 * 健康情報サイトは数字を出しても「その数字が言わないこと(limit)」を書かない。
 * 数字 × 限界 × 出典 × 陳腐化しないかどうか、をセットで機械可読にすることで、
 * AIが引用する価値のある一次情報にする。
 *
 * 出典は書籍『20代で考える 将来妊娠で困らないための選択』最新版本文(2026-06)に準拠。
 * ★数値を変更するときは必ず最新版本文と突き合わせること(原案には古い数値が残っている。
 *   例: 体外受精30歳までの妊娠率は原案40-50%→最新版20-30%、クラミジア感染率50-70%→30-50%)。
 */

export type Stability = 'timeless' | 'changing';

export type NumberItem = {
    id: string;
    value: string;
    ja: { label: string; means: string; limit: string };
    en: { label: string; means: string; limit: string };
    source: string;
    stability: Stability;
};

export type NumberGroup = {
    id: string;
    ja: string;
    en: string;
    items: NumberItem[];
};

export const NUMBER_GROUPS: NumberGroup[] = [
    {
        id: 'timing',
        ja: '妊娠のタイミング（生理学）',
        en: 'The fertile window (physiology)',
        items: [
            {
                id: 'egg-24h',
                value: '24h',
                ja: { label: '排卵後、卵子が受精能を失うまで', means: '卵子の寿命は排卵から約24時間。', limit: '「排卵日に合わせる」では遅い場合がある。待っているのは精子側。' },
                en: { label: 'How long an egg stays fertilisable', means: 'The egg is viable for about 24 hours after ovulation.', limit: "Timing sex *on* ovulation day can already be late — it's the sperm that waits." },
                source: '生理学 / Physiology',
                stability: 'timeless',
            },
            {
                id: 'sperm-7d',
                value: '約7日',
                ja: { label: '精子が女性の体内で生存できる期間', means: '精子は卵管内で約1週間生存しうる。', limit: '生存＝受精能の維持ではない。最も妊娠しやすいのは排卵直前。' },
                en: { label: 'How long sperm survive in the female tract', means: 'Sperm can survive around a week in the tubes.', limit: 'Surviving is not the same as staying fully fertile — the days just before ovulation matter most.' },
                source: '生理学 / Physiology',
                stability: 'timeless',
            },
            {
                id: 'window',
                value: '排卵2日前〜当日',
                ja: { label: '最も妊娠しやすい時期', means: '妊娠可能な期間は排卵5日前〜排卵後1日、そのうち最も高いのが排卵2日前〜当日。', limit: '排卵日は前後にずれる。「安全日」は正確に推定できない。' },
                en: { label: 'The most fertile days', means: 'The fertile window runs from 5 days before ovulation to 1 day after; the peak is the 2 days before ovulation through the day itself.', limit: 'Ovulation shifts between cycles — there is no reliably "safe" day.' },
                source: '生理学 / Physiology',
                stability: 'timeless',
            },
            {
                id: 'luteal-14',
                value: '約14日',
                ja: { label: '黄体期（排卵から次の月経まで）', means: '排卵の約2週間後に月経が来る＝次の月経予定日の2週間前が排卵日。', limit: '月経周期が不安定な人はこの逆算が成立しない。' },
                en: { label: 'The luteal phase (ovulation to next period)', means: 'Your period arrives about two weeks after ovulation — so ovulation is ~2 weeks before your next expected period.', limit: 'This backward calculation fails if your cycles are irregular.' },
                source: '生理学 / Physiology',
                stability: 'timeless',
            },
            {
                id: 'bbt',
                value: '約0.3℃',
                ja: { label: '排卵後の基礎体温の上昇幅', means: '体温が上がったこと＝排卵が起きたことの事後確認になる。', limit: '上昇を確認した時点で妊娠しやすい時期は過ぎている＝予測には使えない。' },
                en: { label: 'The basal body temperature rise after ovulation', means: 'The rise confirms that ovulation happened.', limit: 'By the time you see it, the fertile window has closed — BBT cannot predict.' },
                source: '生理学 / Physiology',
                stability: 'timeless',
            },
        ],
    },
    {
        id: 'cumulative',
        ja: '妊活の累積妊娠率',
        en: 'Cumulative chance of conceiving',
        items: [
            {
                id: 'ttc-curve',
                value: '15% → 50% → 80% → 90%',
                ja: { label: '妊活1・3・6・12ヶ月の累積妊娠率（35歳未満）', means: '3→6ヶ月で30ポイント増えるのに、6→12ヶ月では10ポイントしか増えない。', limit: '「待てばいつか」ではない。6ヶ月が方針を見直す分岐点。' },
                en: { label: 'Cumulative pregnancy rate at 1, 3, 6 and 12 months (under 35)', means: 'It climbs 30 points between months 3 and 6, but only 10 points between months 6 and 12.', limit: 'Waiting longer buys much less than people assume — month 6 is the decision point.' },
                source: 'Gnoth C, et al. Hum Reprod. 2003;18(9):1959-66.',
                stability: 'timeless',
            },
            {
                id: 'unprotected',
                value: '21% → 52% → 73% → 95%',
                ja: { label: '避妊しない性交での妊娠率（1・3・6・12ヶ月／若年層）', means: '20代は人生で最も妊娠率が高い時期。望まない妊娠のリスクも最も高い。', limit: '同じ数字が「妊娠したい人には朗報、望まない人には警告」になる。' },
                en: { label: 'Pregnancy rate without contraception at 1, 3, 6, 12 months (younger women)', means: 'The twenties are the most fertile years — and therefore the highest-risk years for unintended pregnancy.', limit: 'The same number reads as good news or as a warning depending on what you want.' },
                source: '書籍本文 / Book, Fact 11',
                stability: 'timeless',
            },
            {
                id: 'infertile-rate',
                value: '1〜4% / 月',
                ja: { label: '不妊症（1年以上妊娠しない状態）の自然妊娠率', means: '6ヶ月続けても約20%。', limit: '「自然に任せる」を続けても回復しない。時間だけが減る。' },
                en: { label: 'Monthly natural conception rate once infertility is established (1+ year)', means: 'About 20% even after six more months of trying.', limit: 'Continuing to "let nature take its course" does not restore the odds — it only spends time.' },
                source: '書籍本文 / Book, Fact 1',
                stability: 'timeless',
            },
        ],
    },
    {
        id: 'reserve',
        ja: '卵巣予備能（卵子の数）',
        en: 'Ovarian reserve (egg quantity)',
        items: [
            {
                id: 'amh-normal',
                value: '3〜5 ng/mL',
                ja: { label: '20〜30代前半のAMHの目安', means: '卵子の残り数の指標。閉経（52歳前後）で0に近づく。', limit: '卵子の「質」は反映しない。同年齢でも個人差が極めて大きく、年齢とは相関しない。' },
                en: { label: 'Typical AMH in the 20s to early 30s', means: 'A marker of how many eggs remain; it approaches zero around menopause (~52).', limit: 'It says nothing about egg quality, and varies enormously between women of the same age.' },
                source: '書籍本文 / Book, Fact 4',
                stability: 'timeless',
            },
            {
                id: 'amh-low',
                value: '1〜2 ng/mL',
                ja: { label: '20〜30代前半でこの値なら「少ない」', means: '将来授かりたい人数によっては治療を急ぐ判断材料になる。', limit: '低い＝妊娠できないではない。今月の妊娠率を示す値でもない。' },
                en: { label: 'AMH at this level in your 20s or early 30s counts as low', means: 'Depending on how many children you hope for, it can justify moving faster.', limit: 'Low does not mean you cannot conceive, and it does not predict this cycle.' },
                source: '書籍本文 / Book, 付録3',
                stability: 'timeless',
            },
            {
                id: 'poi',
                value: '100人に1人 / 1000人に1人',
                ja: { label: '早発卵巣不全の頻度（40歳未満 / 30歳未満）', means: '若いうちに卵子が尽きる状態。平均初婚年齢の直後に該当しうる。', limit: '限りなく0に近づくまで自覚症状がない。月経周期の変化が最初のサイン。' },
                en: { label: 'Frequency of premature ovarian insufficiency (under 40 / under 30)', means: 'Eggs run out early — potentially right around the average age of marriage.', limit: 'There are no symptoms until reserve is nearly gone; a shifting cycle length is the first clue.',
                },
                source: 'Luborsky JL, et al. Hum Reprod. 2003;18(1):199-206.',
                stability: 'timeless',
            },
            {
                id: 'cycle-normal',
                value: '25〜38日',
                ja: { label: '教科書的な正常月経周期', means: '順調に妊娠する人は28〜32日が多い印象。', limit: '25〜26日と短いのは卵子の残り数が少ない可能性、35〜40日は排卵日の変動が大きい可能性。' },
                en: { label: 'Textbook range for a normal cycle', means: 'Women who conceive smoothly often sit in the 28–32 day range.', limit: 'A short 25–26 day cycle can signal falling reserve; 35–40 days means ovulation timing varies widely.' },
                source: '書籍本文 / Book, Fact 6',
                stability: 'timeless',
            },
        ],
    },
    {
        id: 'treatment',
        ja: '不妊治療の妊娠率',
        en: 'Success rates in fertility treatment',
        items: [
            {
                id: 'timed',
                value: '1〜4% / 周期',
                ja: { label: 'タイミング療法の妊娠率（35歳未満）', means: '3〜5周期の累積で約20%。', limit: '1回あたりの失敗率は90%以上。1回に期待しすぎない設計が要る。' },
                en: { label: 'Timed intercourse, per cycle (under 35)', means: 'Around 20% cumulatively over 3–5 cycles.', limit: 'Each single cycle fails more than 90% of the time — plan in blocks, not in months.' },
                source: '書籍本文 / Book, Fact 19',
                stability: 'timeless',
            },
            {
                id: 'iui',
                value: '4〜8% / 周期',
                ja: { label: '人工授精の妊娠率（35歳未満）', means: '3〜5周期の累積で約30%。', limit: '精子を届けているだけで、受精以降の過程は自然妊娠と同じ。' },
                en: { label: 'IUI, per cycle (under 35)', means: 'Around 30% cumulatively over 3–5 cycles.', limit: 'It only delivers sperm closer — everything after fertilisation is the same as natural conception.' },
                source: '書籍本文 / Book, Fact 19',
                stability: 'timeless',
            },
            {
                id: 'ivf',
                value: '20〜30%',
                ja: { label: '体外受精の妊娠率（30歳まで・1回あたり）', means: '最も妊娠率が高い治療。1回の採卵で複数の卵子を扱うため効率が良い。', limit: '卵子の数を増やす治療でも、質を改善する治療でもない。40歳以上では20%未満。' },
                en: { label: 'IVF pregnancy rate per transfer (up to age 30)', means: 'The most effective treatment, and efficient because one retrieval yields several eggs.', limit: 'It cannot increase how many eggs you have or improve their quality. Over 40, it falls below 20%.' },
                source: '日本産科婦人科学会ARTデータ / JSOG ART registry',
                stability: 'changing',
            },
            {
                id: 'follicle',
                value: '22〜24mm',
                ja: { label: '排卵直前の卵胞径', means: '排卵日付近で1日あたり約2mm大きくなるため、エコーで排卵日を正確に予測できる。', limit: '月経不順やストレスで排卵が遅れる場合も、この方法なら追える。' },
                en: { label: 'Follicle diameter just before ovulation', means: 'It grows about 2mm a day near ovulation, so ultrasound can pinpoint the day.', limit: 'This works even when cycles are irregular or stress delays ovulation.' },
                source: '書籍本文 / Book, Fact 19',
                stability: 'timeless',
            },
        ],
    },
    {
        id: 'prevention',
        ja: '感染症・がん予防',
        en: 'Infection and cancer prevention',
        items: [
            {
                id: 'chlamydia',
                value: '10〜20人に1人',
                ja: { label: '20代前半のクラミジア感染率（日本）', means: '感染者との性行為で30〜50%が感染する。', limit: '無症状のことが多く、放置すると卵管が閉塞し不妊の原因になる。' },
                en: { label: 'Chlamydia prevalence in Japanese women in their early 20s', means: 'A single exposure to an infected partner transmits it 30–50% of the time.', limit: 'It is usually silent — untreated, it can block the tubes and cause infertility.' },
                source: '書籍本文 / Book, Fact 9',
                stability: 'changing',
            },
            {
                id: 'hpv',
                value: '生涯50〜80%',
                ja: { label: '性行為でHPVに感染する女性の割合', means: '感染しても2年以内に90%は自然に治癒する。', limit: '一部が持続感染し、5〜10年で子宮頸がんに進展する。感染は自覚できない。' },
                en: { label: 'Lifetime chance a woman acquires HPV through sex', means: '90% clear it naturally within two years.', limit: 'A minority persists and can progress to cervical cancer over 5–10 years — with no symptoms along the way.' },
                source: '書籍本文 / Book, Fact 10',
                stability: 'timeless',
            },
            {
                id: 'cervical',
                value: '年間約1万人 / 約3000人',
                ja: { label: '日本の子宮頸がん罹患数 / 死亡数', means: '25〜40歳女性のがん死亡原因の第2位。', limit: '1〜2年ごとの検診とHPVワクチンでほぼ予防できる＝防げている死ではない。' },
                en: { label: 'Cervical cancer cases / deaths per year in Japan', means: 'The second leading cause of cancer death in women aged 25–40 there.', limit: 'Screening every 1–2 years plus HPV vaccination prevents most of it — these are largely preventable deaths.' },
                source: '書籍本文 / Book, Fact 10',
                stability: 'changing',
            },
        ],
    },
    {
        id: 'contraception',
        ja: '避妊',
        en: 'Contraception',
        items: [
            {
                id: 'pill',
                value: '92〜99%',
                ja: { label: '低用量ピルの避妊成功率', means: '女性が主体的に選べる方法。月4000円程度。', limit: '性感染症は防げない。コンドームとの併用が必要。' },
                en: { label: 'Effectiveness of the combined pill', means: 'A method a woman controls herself; about ¥4,000/month in Japan.', limit: 'It does not prevent STIs — condoms are still needed alongside it.' },
                source: '書籍本文 / Book, Fact 11',
                stability: 'timeless',
            },
            {
                id: 'iud',
                value: '99%以上',
                ja: { label: 'IUD（子宮内避妊具）の避妊成功率', means: '一度挿入すると約5年有効。抜去後はすぐに妊娠可能な状態に戻る。', limit: '産婦人科での処置が必要。' },
                en: { label: 'Effectiveness of an IUD', means: 'Around five years of protection from one insertion, with fertility returning immediately after removal.', limit: 'It requires a clinic procedure.' },
                source: '書籍本文 / Book, Fact 11',
                stability: 'timeless',
            },
            {
                id: 'ec',
                value: '80〜90%',
                ja: { label: 'アフターピルの避妊成功率', means: '性交後72時間以内の内服が必要。1回2〜3万円。', limit: '常用する方法ではない。事前に低用量ピルを始めておく方が確実で安価。' },
                en: { label: 'Effectiveness of emergency contraception', means: 'Must be taken within 72 hours; ¥20,000–30,000 per use in Japan.', limit: 'Not a routine method — starting the pill in advance is both more reliable and cheaper.' },
                source: '書籍本文 / Book, Fact 11',
                stability: 'timeless',
            },
        ],
    },
    {
        id: 'labs',
        ja: '検査の基準値',
        en: 'Test thresholds',
        items: [
            {
                id: 'tsh',
                value: '2.5 μIU/mL未満',
                ja: { label: '妊活中に目標とするTSH', means: '正常範囲にコントロールすることで流産・早産のリスクを下げられる。', limit: '甲状腺だけで月経不順を説明することはできない。' },
                en: { label: 'Target TSH when trying to conceive', means: 'Keeping it in range lowers miscarriage and preterm birth risk.', limit: 'Thyroid function alone does not explain irregular cycles.' },
                source: '書籍本文 / Book, 付録3',
                stability: 'changing',
            },
            {
                id: 'vitd',
                value: '30 μg/dL以上',
                ja: { label: '25-OHビタミンDの目標値', means: '欠乏時は1日25〜50μg（1000〜2000単位）で補充。月経周期と着床環境の改善が報告されている。', limit: '脂溶性で体内に蓄積するため過剰摂取に注意。補充後1〜2ヶ月で再検査。' },
                en: { label: 'Target 25-OH vitamin D', means: 'If deficient, 25–50 µg (1,000–2,000 IU) daily; reported to help cycle regularity and the implantation environment.', limit: 'Fat-soluble and accumulates — do not overdose, and retest after 1–2 months.' },
                source: '書籍本文 / Book, 付録3',
                stability: 'changing',
            },
            {
                id: 'rubella',
                value: '32倍以上',
                ja: { label: '風疹HI抗体（抗体ありと判定）', means: '32倍未満ならワクチン接種が推奨される。', limit: '生ワクチンのため接種後2ヶ月の避妊が必要。パートナーの抗体も確認する。' },
                en: { label: 'Rubella HI antibody titre considered protective', means: 'Below 1:32, vaccination is recommended before trying.', limit: 'It is a live vaccine — avoid pregnancy for 2 months after, and check your partner too.' },
                source: '書籍本文 / Book, 付録3',
                stability: 'timeless',
            },
        ],
    },
];

/** 著者の臨床判断（ガイドラインではない＝必ずラベルを付けて分離して掲示する） */
export const CLINICAL_RULES = [
    {
        id: 'when-to-test',
        ja: {
            rule: '30歳未満なら6ヶ月、30歳以上なら3〜6ヶ月で妊娠しなければ検査・治療を始めた方がよい',
            why: '不妊症の一般的な定義（1年）より意図的に早い。6→12ヶ月で累積妊娠率が10ポイントしか伸びない一方、その間も卵子の質と数は落ち続けるため。',
        },
        en: {
            rule: 'If you are under 30, start testing after 6 months; if you are 30 or older, after 3–6 months',
            why: 'Deliberately earlier than the standard 12-month definition of infertility: months 6–12 add only ~10 points of cumulative pregnancy rate, while egg quality and quantity keep falling throughout.',
        },
    },
    {
        id: 'cycle-amh',
        ja: {
            rule: '月経周期が25〜26日と短くなってきた人はAMH 0.4〜0.5前後、40〜60日または3ヶ月以上の無月経ではAMH 0.1未満のことが多い',
            why: '卵子の残り数が減る過程では、まず周期が短くなり、次に伸びていく。周期の変化は自覚できる最初のサインになる。',
        },
        en: {
            rule: 'When cycles shorten to 25–26 days, AMH is often around 0.4–0.5; once cycles stretch to 40–60 days or periods stop for 3+ months, AMH is often below 0.1',
            why: 'As reserve declines, cycles first shorten and then lengthen. The change in cycle length is the first sign you can notice yourself.',
        },
    },
    {
        id: 'family-plan',
        ja: {
            rule: '子ども1人なら2年計画、2人なら4年計画、3人なら6年計画で逆算する',
            why: '妊娠・出産・次の妊娠までの回復を含めると、1人あたり約2年かかる。35歳までに希望する人数を産み終える計画が理想的。',
        },
        en: {
            rule: 'Plan backwards: about 2 years per child — 2 years for one, 4 for two, 6 for three',
            why: 'Conception, pregnancy and recovery before the next attempt take roughly two years each. Ideally the family is complete by around 35.',
        },
    },
];

/** 検査で分かること・分からないこと（事実20） */
export const KNOWN_UNKNOWN = {
    known: {
        ja: ['卵管が通っているか（卵管造影・通水検査）', '運動精子がいるか（精液検査）', '排卵が起きたか（黄体期のプロゲステロン）', '卵子の残り数の目安（AMH）'],
        en: ['Whether the tubes are open (HSG / saline scan)', 'Whether motile sperm are present (semen analysis)', 'Whether ovulation happened (mid-luteal progesterone)', 'Roughly how many eggs remain (AMH)'],
    },
    unknown: {
        ja: ['排卵後、卵子が卵管に入れているか', '卵子と精子が受精しているか', '受精卵が胚盤胞まで育っているか', '胚盤胞が着床しているか'],
        en: ['Whether the egg actually entered the tube', 'Whether egg and sperm fertilised', 'Whether the embryo reached blastocyst stage', 'Whether the blastocyst implanted'],
    },
};
