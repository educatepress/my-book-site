/**
 * screening-panel.ts — ブライダルチェック／不妊症スクリーニング検査の読み方
 *
 * 2026-08-18。書籍付録3 と公表されたガイドライン（ESHRE ボローニャ基準2011、
 * 日本産科婦人科学会 PCOS診断基準2024 等）にのみ準拠する。
 * ★本プロジェクトは著者個人のものであり、特定医療機関の実績データ・院内資産は
 *   一切使用しない（2026-08-18 取締役決定）。値の変更は必ず公表出典と突き合わせること。
 * 「結果の紙は渡されるが、その数字が何を意味するか説明されない」層の需要が非常に高い領域。
 */

export type PanelItem = {
    id: string;
    ja: { name: string; target: string; means: string; note: string };
    en: { name: string; target: string; means: string; note: string };
};

export type PanelGroup = { id: string; ja: string; en: string; items: PanelItem[] };

export const PANEL_GROUPS: PanelGroup[] = [
    {
        id: 'reserve',
        ja: '卵巣予備能',
        en: 'Ovarian reserve',
        items: [
            {
                id: 'amh',
                ja: { name: 'AMH（抗ミュラー管ホルモン）', target: '20〜30代前半で3〜5 ng/mL', means: '残っている卵子の数の指標。1.0未満は低め、1.0〜2.0はやや低めとして扱われます。', note: '卵子の「質」は分かりません。数が少なくても質は年齢相応です。低用量ピル内服中は正確に測れません（3ヶ月中断してから測定）。' },
                en: { name: 'AMH (anti-Müllerian hormone)', target: '3–5 ng/mL in the 20s to early 30s', means: 'A marker of how many eggs remain. Below 1.0 is treated as low; 1.0–2.0 as mildly low.', note: 'It says nothing about egg quality, which tracks your age. It cannot be measured accurately while on the combined pill (stop for 3 months first).' },
            },
            {
                id: 'amh-high',
                ja: { name: 'AMHが高い場合', target: '20代4.0 / 30代2.8 ng/mL以上', means: '多嚢胞性卵巣症候群（PCOS）の可能性を評価する目安（日産婦2024基準）。', note: 'AMHが高いだけでは診断できません。月経異常・エコー所見・ホルモン値の全てを満たす必要があります。40歳以上では高値判定を行いません。' },
                en: { name: 'When AMH is high', target: 'Above 4.0 in the 20s / 2.8 in the 30s', means: 'A trigger to assess for PCOS (JSOG 2024 criteria).', note: 'High AMH alone is not a diagnosis — cycle irregularity, ultrasound findings and hormone levels must all be present. No high-side assessment is applied from age 40.' },
            },
        ],
    },
    {
        id: 'hormone',
        ja: '基礎ホルモン（月経中に測る）',
        en: 'Baseline hormones (measured during menstruation)',
        items: [
            {
                id: 'fsh',
                ja: { name: 'FSH / LH / E2', target: 'FSH 10 mIU/mL未満・FSH＞LH・E2 30〜50 pg/mL', means: 'FSHが高いと卵子の残り数が少ない可能性。LHがFSHより高い場合、月経不順があれば排卵が不定期になっている可能性。', note: '月経中でも前周期の卵胞が残っている（遺残卵胞）とE2が高く出ます。その場合は再検査を。' },
                en: { name: 'FSH / LH / E2', target: 'FSH under 10 mIU/mL, FSH > LH, E2 around 30–50 pg/mL', means: 'A high FSH can indicate falling reserve. LH above FSH, alongside irregular cycles, suggests erratic ovulation.', note: 'A leftover follicle from the previous cycle can push E2 up even during menstruation — retest if so.' },
            },
            {
                id: 'prl',
                ja: { name: 'プロラクチン（PRL）', target: '30 ng/mL未満', means: '高いと月経不順・不妊・流産の原因になります。内服薬で正常化できます。', note: '日内変動が大きく、30を少し超える程度なら再検査。50〜100 ng/mLと高値なら頭部MRIが必要なことがあります。' },
                en: { name: 'Prolactin', target: 'Under 30 ng/mL', means: 'High levels cause irregular cycles, infertility and miscarriage; medication normalises it.', note: 'It swings through the day — a marginally high value is retested. At 50–100 ng/mL a brain MRI may be needed.' },
            },
            {
                id: 'tsh',
                ja: { name: '甲状腺（TSH）', target: '2.5 μIU/mL未満', means: '正常範囲にコントロールすることで、流産・早産のリスクを下げられます。', note: '上昇していれば追加採血のうえチラーヂンで調整。極端な高値・低値は甲状腺専門施設へ。' },
                en: { name: 'Thyroid (TSH)', target: 'Under 2.5 μIU/mL', means: 'Keeping it in range lowers the risk of miscarriage and preterm birth.', note: 'If elevated, further bloods and levothyroxine follow. Extreme values are referred to a thyroid specialist.' },
            },
        ],
    },
    {
        id: 'infection',
        ja: '感染症',
        en: 'Infections',
        items: [
            {
                id: 'chlamydia',
                ja: { name: 'クラミジア', target: 'PCR陰性・IgG/IgA陰性', means: 'IgG陽性＝過去に感染、IgA陽性＝現在感染。治療歴がなければ現在も感染している可能性があり抗生剤で治療します。', note: 'PCRが陰性でも、卵管やお腹の中に広がっている可能性は否定できません。パートナーの同時治療で再感染を防ぎます。' },
                en: { name: 'Chlamydia', target: 'PCR negative, IgG and IgA negative', means: 'IgG positive means past infection; IgA positive means current. Without a treatment history, antibiotics are given.', note: 'A negative PCR does not exclude spread to the tubes or abdomen. Treating the partner at the same time prevents reinfection.' },
            },
            {
                id: 'rubella',
                ja: { name: '風疹HI抗体', target: '32倍以上', means: '32倍未満ならワクチン接種が推奨されます。', note: '生ワクチンのため接種後2ヶ月の避妊が必要。パートナーの抗体も確認を（男性は接種後の避妊期間は不要）。' },
                en: { name: 'Rubella HI antibody', target: '1:32 or above', means: 'Below 1:32, vaccination is recommended before trying.', note: 'It is a live vaccine — avoid pregnancy for two months after. Check your partner too (men need no waiting period).' },
            },
            {
                id: 'others',
                ja: { name: '梅毒・B型/C型肝炎・HIV', target: '陰性', means: '母子感染と性行為による感染を確認します。', note: '陽性の場合は専門の施設で精査が必要です。' },
                en: { name: 'Syphilis, hepatitis B and C, HIV', target: 'Negative', means: 'Screening for mother-to-child and sexually transmitted infection.', note: 'A positive result is referred for specialist assessment.' },
            },
        ],
    },
    {
        id: 'other',
        ja: 'その他',
        en: 'Other tests',
        items: [
            {
                id: 'vitd',
                ja: { name: '25-OH ビタミンD', target: '30 μg/dL以上', means: '欠乏していると診断されたら1日25〜50μg（1000〜2000単位）で補充。月経周期が整うこと、着床環境が改善することが報告されています。', note: '脂溶性で体内に蓄積するため過剰摂取に注意。補充開始から1〜2ヶ月で再検査を。' },
                en: { name: '25-OH vitamin D', target: '30 µg/dL or above', means: 'If deficient, 25–50 µg (1,000–2,000 IU) daily. Reported to help cycle regularity and the implantation environment.', note: 'Fat-soluble and cumulative — avoid overdosing and retest after 1–2 months.' },
            },
            {
                id: 'asa',
                ja: { name: '抗精子不動化抗体', target: '陰性', means: '陽性だと精子の動きを止めてしまい、自然妊娠の可能性が極めて低くなります。', note: 'ほとんどの人は陰性です。程度によっては体外受精が必要になります。' },
                en: { name: 'Anti-sperm antibodies', target: 'Negative', means: 'A positive result immobilises sperm, making natural conception very unlikely.', note: 'Most people test negative. Depending on severity, IVF may be required.' },
            },
            {
                id: 'cyto',
                ja: { name: '子宮頸がん検査（細胞診）', target: 'NILM（正常）', means: 'ASC-US/LSIL等は異形成の疑い、HSIL/SCC等はがんの疑い。正常以外は専門施設で精査します。', note: '正常な細胞からがんになるまで5〜10年。1〜2年ごとの検診でがんになる前に見つかります。' },
                en: { name: 'Cervical cytology', target: 'NILM (normal)', means: 'ASC-US/LSIL suggest dysplasia; HSIL/SCC suggest cancer. Anything but normal is referred on.', note: 'Progression from normal cells takes 5–10 years, so screening every 1–2 years catches it beforehand.' },
            },
            {
                id: 'echo',
                ja: { name: '経腟超音波', target: '所見なし', means: '卵巣と子宮の状態、進行した子宮内膜症や子宮筋腫の有無を確認します。', note: '初期の子宮内膜症はエコーに写りません。月経痛が強ければ、画像が正常でも治療の対象になります。' },
                en: { name: 'Transvaginal ultrasound', target: 'No abnormal findings', means: 'Assesses the ovaries and uterus, and looks for advanced endometriosis or fibroids.', note: 'Early endometriosis is invisible on ultrasound — severe period pain warrants treatment even with a normal scan.' },
            },
            {
                id: 'hsg',
                ja: { name: '卵管造影（通水）検査', target: '両側開通', means: '精子と卵子が出会う場である卵管の通り具合を確認します。', note: '通っていても卵管の機能までは分かりません。子宮内膜症の有無も分かりません。' },
                en: { name: 'HSG / tubal patency test', target: 'Both tubes open', means: 'Checks the passage where sperm and egg meet.', note: 'Patency does not prove function, and it cannot detect endometriosis.' },
            },
            {
                id: 'semen',
                ja: { name: '精液検査', target: 'WHO 2021基準値以上', means: '量・濃度・運動率・形態を確認します。男性因子は不妊原因の最大半数に関与します。', note: '1回の検体では判断しません。基準値は「妊娠させた男性の下位5%タイル」であって合否ラインではありません。' },
                en: { name: 'Semen analysis', target: 'At or above the WHO 2021 reference limits', means: 'Volume, concentration, motility and morphology. Male factor is involved in up to half of all cases.', note: 'Never judged on a single sample. The limits are the 5th centile of men who fathered a child — not a pass/fail line.' },
            },
        ],
    },
];
