/**
 * fact-articles.ts — 24事実 ↔ ブログ記事の対応（自動検証済み）
 *
 * 2026-08-18。事実ページから深掘り記事へ、記事から事実へ、双方向に導線を作る。
 * ★日本語版・英語版の両方が存在する記事だけを載せている（リンク切れ防止のため、
 *   追加時は必ず両言語のファイルの存在を確認すること）。
 */
export type FactArticle = { jp: string; en: string; jaTitle: string; enTitle: string };

export const FACT_ARTICLES: Record<number, FactArticle[]> = {
    1: [
        { jp: 'watchful-waiting-proactive-testing-fertility', en: 'watchful-waiting-proactive-testing-fertility', jaTitle: '「様子を見ましょう」が不安な時 — 積極的な検査を依頼してよいケースの判断基準', enTitle: 'When "Let\'s Wait and See" Feels Unsettling — Criteria for Proactive Fertility Testing' },
    ],
    2: [
        { jp: 'ivf-over-40-cumulative-success-rate', en: 'ivf-over-40-cumulative-success-rate', jaTitle: '40歳からの体外受精：1回の採卵で諦めるのはまだ早い？累積妊娠率の考え方', enTitle: 'IVF Over 40: Is One Egg Retrieval Too Soon to Give Up? Understanding Cumulative Success Rates' },
    ],
    3: [
        { jp: 'high-fsh-amh-comparison-pregnancy-potential', en: 'high-fsh-amh-comparison-pregnancy-potential', jaTitle: 'FSHが高いと言われた — AMHとの違いと、高FSHでも妊娠できるケース', enTitle: 'High FSH Levels: Understanding the Difference from AMH and Pregnancy Potential' },
        { jp: 'amh-egg-freezing-reality', en: 'amh-egg-freezing-reality-en', jaTitle: '卵子凍結は「保険」ではない：AMHデータが示す現実', enTitle: 'AMH and the Egg Freezing Reality: Why It\'s Not an \'Insurance Policy\' for Your Future' },
    ],
    4: [
        { jp: 'amh-afc-discordance-which-to-trust', en: 'amh-afc-discordance-which-to-trust', jaTitle: 'AMHとAFCの数値が合わない時に信じるべきは？不一致が起きる理由と対策', enTitle: 'AMH and AFC Discordance: Which to Trust When Numbers Don\'t Match? Why it Happens.' },
    ],
    5: [
        { jp: 'amh-egg-freezing-reality', en: 'amh-egg-freezing-reality-en', jaTitle: '卵子凍結は「保険」ではない：AMHデータが示す現実', enTitle: 'AMH and the Egg Freezing Reality: Why It\'s Not an \'Insurance Policy\' for Your Future' },
    ],
    6: [
        { jp: 'short-luteal-phase-fertility-impact', en: 'short-luteal-phase-fertility-impact', jaTitle: '黄体期が短い（10日未満）— 黄体機能不全は妊娠に影響する？対処法は？', enTitle: 'Short Luteal Phase (Under 10 Days) — Does Luteal Phase Defect Affect Fertility? What Are the Solutions?' },
        { jp: 'irregular-cycle-fertility-timing', en: 'irregular-cycle-fertility-timing', jaTitle: '生理周期が不規則でも諦めない：32〜60日のバラバラ周期で妊娠のタイミングを掴む方法', enTitle: 'Navigating Irregular Cycles (32-60 Days): Timing Intercourse for Conception' },
    ],
    8: [
        { jp: 'acog-2026-endometriosis-guidelines-no-wait-for-surgery', en: 'acog-2026-endometriosis-guidelines-no-wait-for-surgery-en', jaTitle: '子宮内膜症、手術を待たない時代へ：ACOG 2026改訂', enTitle: 'ACOG 2026 Endometriosis Guidelines: The Era of \'Treat First, Diagnose Later\' for Better Fertility Outcomes' },
    ],
    13: [
        { jp: 'cervical-mucus-dry-fertility-impact', en: 'cervical-mucus-dry-fertility-impact', jaTitle: '排卵日のおりもの（頸管粘液）が少ない？受精への影響と改善策について専門医が解説', enTitle: 'Low Cervical Mucus Around Ovulation? Impact on Conception and Potential Solutions Explained by a Fertility Specialist' },
        { jp: 'fertility-sex-position-myth-science', en: 'fertility-sex-position-myth-science', jaTitle: '特定の性体位で妊娠しやすくなるは迷信？妊活におけるセックスのタイミングと体位に関する科学的真実', enTitle: 'Fertility and Sexual Positions: Myth or Science? The Truth About Timing and Intercourse for Conception' },
    ],
    14: [
        { jp: 'opk-never-positive-other-reasons', en: 'opk-never-positive-other-reasons', jaTitle: '排卵検査薬（OPK）が2本線にならない？PCOS以外に考えられる5つの理由', enTitle: 'Ovulation Predictor Kit (OPK) Never Shows Two Lines? 5 Reasons Beyond PCOS' },
        { jp: 'fertility-app-ovulation-prediction-accuracy', en: 'fertility-app-ovulation-prediction-accuracy', jaTitle: '妊活アプリの排卵予測はどこまで正確？アプリ間で日がズレる理由', enTitle: 'How Accurate Are Fertility App Ovulation Predictions? Why Dates Differ Between Apps' },
    ],
    15: [
        { jp: 'fertility-app-ovulation-prediction-accuracy', en: 'fertility-app-ovulation-prediction-accuracy', jaTitle: '妊活アプリの排卵予測はどこまで正確？アプリ間で日がズレる理由', enTitle: 'How Accurate Are Fertility App Ovulation Predictions? Why Dates Differ Between Apps' },
    ],
    16: [
        { jp: 'irregular-cycle-fertility-timing', en: 'irregular-cycle-fertility-timing', jaTitle: '生理周期が不規則でも諦めない：32〜60日のバラバラ周期で妊娠のタイミングを掴む方法', enTitle: 'Navigating Irregular Cycles (32-60 Days): Timing Intercourse for Conception' },
        { jp: 'fertility-app-ovulation-prediction-accuracy', en: 'fertility-app-ovulation-prediction-accuracy', jaTitle: '妊活アプリの排卵予測はどこまで正確？アプリ間で日がズレる理由', enTitle: 'How Accurate Are Fertility App Ovulation Predictions? Why Dates Differ Between Apps' },
    ],
    17: [
        { jp: 'just-relax-get-pregnant-myth-scientific-response', en: 'just-relax-get-pregnant-myth-scientific-response', jaTitle: '「リラックスすれば妊娠する」と言われた時の科学的な返し方：不妊とストレスに関する真実', enTitle: 'The Scientific Rebuttal to \'Just Relax and You\'ll Get Pregnant\': Unpacking Infertility and Stress' },
        { jp: 'watchful-waiting-proactive-testing-fertility', en: 'watchful-waiting-proactive-testing-fertility', jaTitle: '「様子を見ましょう」が不安な時 — 積極的な検査を依頼してよいケースの判断基準', enTitle: 'When "Let\'s Wait and See" Feels Unsettling — Criteria for Proactive Fertility Testing' },
    ],
    18: [
        { jp: 'preconception-checkup-guide', en: 'preconception-checkup-guide-en', jaTitle: '妊娠前の健康チェック：何を調べるべき？', enTitle: 'Scheduling Your Essential Preconception Check-up: A Guide for Your Future Self and Baby' },
        { jp: 'vitamin-d-fertility', en: 'vitamin-d-fertility', jaTitle: '「太陽のビタミン」は妊活の鍵？ビタミンDが卵巣機能、子宮内膜、そして男性不妊に与える影響。不足が招くリスクと効果的な補給戦略。', enTitle: '"The Sunshine Vitamin" Key to Fertility? Vitamin D\'s Impact on Ovarian Function, Endometrial Receptivity, and Male Infertility. Risks of Deficiency and Effective Supplementation Strategies.' },
        { jp: 'folic-acid-preconception-care', en: 'folic-acid-preconception-care-en', jaTitle: '葉酸の正しいタイミング：妊娠前から始める理由', enTitle: 'The Importance of Folic Acid and Intake Timing: A Crucial Nutrient in Preconception Care' },
    ],
    19: [
        { jp: 'iui-timing-meta-analysis', en: 'iui-timing-meta-analysis', jaTitle: '人工授精（IUI）のタイミング — 排卵前と排卵後、どちらが有効？最新メタ解析', enTitle: 'IUI Timing: Before or After Ovulation? Latest Meta-Analysis Unpacked' },
        { jp: 'iui-ivf-switch-data-feelings', en: 'iui-ivf-switch-data-feelings', jaTitle: 'IUIからIVFへの移行時期はいつ？ 3回 vs 6回、データが示す「分岐点」と心の声', enTitle: 'When to Transition from IUI to IVF? 3 vs 6 Cycles, Data-Driven Turning Points, and Honoring Your Feelings' },
    ],
    20: [
        { jp: 'era-implantation-window-evidence', en: 'era-implantation-window-evidence', jaTitle: '「着床の窓」は本当に存在する？ERA検査の最新エビデンス', enTitle: 'Does the Implantation Window Truly Exist? Latest Evidence on Endometrial Receptivity Array (ERA) and the Potential for Personalized Medicine' },
        { jp: 'sperm-dna-fragmentation-infertility-hidden-cause', en: 'sperm-dna-fragmentation-infertility-hidden-cause', jaTitle: '精子のDNA損傷が不妊の隠れた原因？従来の検査では見過ごされがちな精子DNA断片化の真実と、その改善アプローチ', enTitle: 'Sperm DNA Damage: A Hidden Cause of Infertility? The Truth About DNA Fragmentation and Its Improvement Approaches' },
    ],
    21: [
        { jp: 'amh-egg-freezing-reality', en: 'amh-egg-freezing-reality-en', jaTitle: '卵子凍結は「保険」ではない：AMHデータが示す現実', enTitle: 'AMH and the Egg Freezing Reality: Why It\'s Not an \'Insurance Policy\' for Your Future' },
        { jp: 'ivf-over-40-cumulative-success-rate', en: 'ivf-over-40-cumulative-success-rate', jaTitle: '40歳からの体外受精：1回の採卵で諦めるのはまだ早い？累積妊娠率の考え方', enTitle: 'IVF Over 40: Is One Egg Retrieval Too Soon to Give Up? Understanding Cumulative Success Rates' },
    ],
    22: [
        { jp: 'fertility-work-balance', en: 'fertility-work-balance', jaTitle: '妊活と仕事の両立 — 通院を隠し続けるストレスと、職場に伝えるメリット', enTitle: 'Balancing Fertility Treatment and Work: The Stress of Hiding Appointments vs. The Benefits of Telling Your Employer' },
    ],
    23: [
        { jp: 'fertility-work-balance', en: 'fertility-work-balance', jaTitle: '妊活と仕事の両立 — 通院を隠し続けるストレスと、職場に伝えるメリット', enTitle: 'Balancing Fertility Treatment and Work: The Stress of Hiding Appointments vs. The Benefits of Telling Your Employer' },
        { jp: 'stopping-fertility-treatment', en: 'stopping-fertility-treatment', jaTitle: '妊活の「やめどき」を考え始めたあなたへ — 治療終了の意思決定プロセス', enTitle: 'To You Who Has Started Thinking About "When to Stop" Fertility Treatment — The Decision-Making Process for Treatment Cessation' },
    ],
    24: [
        { jp: 'fertility-partner-communication-gap', en: 'fertility-partner-communication-gap', jaTitle: '妊活中のパートナーとの温度差を乗り越える：理解を深めるコミュニケーション術', enTitle: 'Bridging the Gap: Communication Strategies for Partners in TTC with Different Fertility Perspectives' },
        { jp: 'timed-intercourse-pressure-intimacy-tips', en: 'timed-intercourse-pressure-intimacy-tips', jaTitle: 'タイミング法のプレッシャーで性生活が苦痛に — カップルで乗り越えるヒント', enTitle: 'Timed Intercourse Pressure Making Sex a Chore? Tips for Couples to Overcome It' },
    ],
};

/** 記事slugから、その記事が属する事実番号を引く（記事→事実の逆引き） */
export function factsForSlug(slug: string): number[] {
    const base = slug.replace(/-en$/, '');
    const hits: number[] = [];
    for (const [n, arts] of Object.entries(FACT_ARTICLES)) {
        if (arts.some((a) => a.jp === base || a.en === slug || a.en === base)) hits.push(Number(n));
    }
    return hits;
}
