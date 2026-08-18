/**
 * fact-details.ts — 24事実それぞれの詳細本文
 *
 * 2026-08-18。/24-facts/[n] で表示する。書籍本文の転載ではなくWeb用の書き起こし
 * （KDP独占条項の回避＋本の価値は選定・順序・図解にあるという整理）。
 * 数値は /fertility-numbers と必ず一致させること。出典は公表論文・学会GL・書籍のみ
 * （特定医療機関の実績データは使用しない）。
 */

export type FactDetail = {
    ja: { detail: string; action: string };
    en: { detail: string; action: string };
    /** 関連する内部リンク（key: ラベルのid） */
    links?: Array<{ ja: string; en: string; href: string; hrefEn: string }>;
};

const NUMBERS = { ja: '数字と、その限界', en: 'Fertility numbers', href: '/fertility-numbers', hrefEn: '/en/fertility-numbers' };
const PANEL = { ja: '検査結果の読み方', en: 'Reading your results', href: '/screening-panel', hrefEn: '/en/screening-panel' };

export const FACT_DETAILS: Record<number, FactDetail> = {
    1: {
        ja: { detail: '1年間避妊せずに性交渉をしても妊娠しない状態を不妊症と呼びます。この状態になると、そのまま自然に任せていても妊娠率は回復しません。妊娠しない期間が長いほど、その集団に残っているのは何らかの妊娠しにくい要因を持つ人になっていくためです。', action: '避妊していないのに妊娠しない期間が続いているなら、1年を待たずに一度検査を受けてください。' },
        en: { detail: 'Infertility means a year of unprotected sex without conception. Once you are in that state, simply continuing does not restore the odds — the longer a group tries without success, the more it consists of people with an underlying reason.', action: 'If you have been trying without contraception and nothing is happening, get tested before the twelve-month mark.' },
        links: [NUMBERS],
    },
    2: {
        ja: { detail: '妊娠の1つ目のタイムリミットです。体外受精で得た受精卵を戻したときの妊娠率は、20代から32歳までは比較的高く保たれますが、33歳以降で徐々に下がり、36歳を超えると1年ごとの低下幅が大きくなります。これは治療で補える範囲を超えていく変化です。', action: '35歳までに希望する人数を産み終える計画を、逆算して立ててください。' },
        en: { detail: 'The first clock. Pregnancy rates after embryo transfer hold up reasonably well through the twenties and to about 32, decline gradually from 33, and fall faster each year past 36. This is a change treatment cannot fully offset.', action: 'Work backwards from a plan that has your family complete by around 35.' },
        links: [NUMBERS],
    },
    3: {
        ja: { detail: '早発卵巣不全は40歳未満の100人に1人、30歳未満では1000人に1人に起こります。平均初婚年齢のすぐ後に、子どもを授かるのが極めて困難と診断されうるということです。卵子は一度なくなると増えることがありません。', action: '節目の年齢でAMHを測り、自分がその側にいないかを確認してください。' },
        en: { detail: 'Premature ovarian insufficiency affects 1 in 100 women under 40 and 1 in 1,000 under 30 — meaning a diagnosis can land just after the average age of marriage. Eggs, once gone, are never replaced.', action: 'Check AMH at a milestone birthday so you know which side of this you are on.' },
        links: [PANEL],
    },
    4: {
        ja: { detail: '2つ目のタイムリミットです。卵子は毎月およそ1000個ずつ消えていきますが、自覚症状は一切ありません。重要なのは、卵子の数は年齢と相関しないことです。同じ年齢でも個人差が極めて大きいため、平均値からは自分の状態が分かりません。', action: '20歳・25歳など節目でAMH検査を。ピル内服中は正確に測れないため、開始前か3ヶ月中断してから測ります。' },
        en: { detail: 'The second clock. About a thousand eggs disappear every month, with no symptoms at all. Crucially, egg count does not correlate with age — the spread between women of the same age is enormous, so an average tells you nothing about yourself.', action: 'Test AMH at a milestone age. It cannot be measured accurately on the pill, so test before starting or after a three-month break.' },
        links: [PANEL, NUMBERS],
    },
    5: {
        ja: { detail: 'キャリアを築く20〜35歳と、妊娠しやすい時期はぴたりと重なります。しかも卵子の数には個人差が大きいため、適齢期は人によって違います。一般論ではなく、自分の数字を知ったうえで優先順位を決める必要があります。', action: '「何歳までに何人」を数字にして、そこから逆算してください。1人あたり約2年が目安です。' },
        en: { detail: 'The years for building a career, 20 to 35, sit exactly on top of the fertile years. And because egg count varies so much between individuals, the right timing differs per person. You need your own numbers, not the average, to set priorities.', action: 'Put a number on it — how many children, by what age — and count backwards at roughly two years each.' },
        links: [NUMBERS],
    },
    6: {
        ja: { detail: '月経の周期・痛み・量は、自分で読み取れる最も早いサインです。周期が25〜26日と短くなってきた、あるいは40〜60日と伸びてきたという変化には意味があります。順調に妊娠していく人は28〜32日周期が多い一方、教科書的な正常範囲は25〜38日と幅があります。', action: '毎月の周期と体調を記録してください。変化に気づけることが早期発見の条件です。' },
        en: { detail: 'Cycle length, pain and flow are the earliest signals you can read yourself. A shift to 25–26 days, or a stretch to 40–60, means something. Women who conceive smoothly often sit at 28–32 days, though the textbook normal range is a wide 25–38.', action: 'Track your cycle and how you feel each month — noticing change is what makes early detection possible.' },
        links: [NUMBERS],
    },
    7: {
        ja: { detail: '排卵が起こらないと、子宮内膜がリセットされないままエストロゲンの作用を受け続け、子宮体がんのリスクが上がります。月経不順を放置することには、妊娠以外のリスクがあるということです。初期の子宮体がんは無症状か、だらだらとした不正出血だけのことがあります。', action: '月経不順があり、直近で妊娠を希望しないなら、低用量ピルで周期をコントロールしておく選択があります。' },
        en: { detail: 'Without ovulation the lining is never shed and reset, so it keeps receiving oestrogen — and endometrial cancer risk rises. Ignoring irregular cycles carries consequences beyond fertility. Early endometrial cancer is often silent, or shows only as prolonged spotting.', action: 'If your cycles are irregular and you are not trying right now, the pill is a way to keep the lining under control.' },
    },
    8: {
        ja: { detail: '痛みは他人と比べられないため、自分が異常かどうかを判断しづらいのが問題です。毎月痛み止めが必要な人、飲んでも痛みが残る人は月経困難症の可能性があります。子宮内膜症は閉経まで年単位で悪化し続け、卵管や卵巣にダメージを与えて不妊の原因になります。', action: '痛みが強いなら、エコーで異常が写らなくても治療の対象です。低用量ピルやジエノゲストで悪化を止められます。' },
        en: { detail: 'Pain cannot be compared with anyone else, which is exactly why it is hard to judge. Needing painkillers every month — or still hurting despite them — points to dysmenorrhoea. Endometriosis then worsens year on year until menopause, damaging tubes and ovaries.', action: 'Severe pain warrants treatment even when the ultrasound looks normal. The pill or dienogest can stop the progression.' },
    },
    9: {
        ja: { detail: 'クラミジアは20代前半の10〜20人に1人が感染しているとされ、感染者との性行為では30〜50%が感染します。ほとんど無症状のまま子宮から卵管、お腹の中へと広がり、卵管を閉塞させます。気づかないうちに不妊の原因が作られる典型例です。', action: '性交歴があり検査したことがなければ、一度受けてください。抗生剤で容易に治療できます。パートナーも同時に。' },
        en: { detail: 'Chlamydia is carried by roughly 1 in 10–20 women in their early twenties, and a single exposure to an infected partner transmits it 30–50% of the time. It spreads silently from cervix to tubes and abdomen, blocking them — a textbook case of infertility created unnoticed.', action: 'If you have ever been sexually active and never tested, test once. Antibiotics clear it easily — and treat the partner at the same time.' },
        links: [PANEL],
    },
    10: {
        ja: { detail: '生涯で50〜80%の女性が性行為でHPVに感染し、その90%は2年以内に自然に治癒します。問題は残りの持続感染で、5〜10年かけて子宮頸がんに進展します。日本では年間約1万人が罹患し、約3000人が亡くなっています。25〜40歳女性のがん死亡原因の第2位です。', action: 'ワクチンと1〜2年ごとの検診でほぼ防げます。進行する前に見つけられる病気です。' },
        en: { detail: '50–80% of women acquire HPV in their lifetime and 90% clear it within two years. The problem is the persistent minority, which progresses to cervical cancer over 5–10 years. In Japan around 10,000 women are diagnosed and 3,000 die each year — the second leading cause of cancer death in women aged 25–40.', action: 'Vaccination plus screening every 1–2 years prevents almost all of it. This is a cancer you can catch before it starts.' },
        links: [PANEL],
    },
    11: {
        ja: { detail: '避妊しない性交では、1ヶ月で21%、3ヶ月で52%、6ヶ月で73%、12ヶ月で95%が妊娠します。20代は人生で最も妊娠しやすい時期であり、それは望まない妊娠のリスクが最も高い時期でもあります。精子は約1週間生存するため、確実な「安全日」は存在しません。', action: '避妊は女性が主体的に選べる方法を。低用量ピルとコンドームの併用が、妊娠と性感染症の両方を防ぎます。' },
        en: { detail: 'Without contraception, 21% conceive within a month, 52% by three, 73% by six and 95% by twelve. The twenties are the most fertile years of your life — which makes them the highest-risk years for unintended pregnancy. Since sperm survive about a week, there is no reliably safe day.', action: 'Choose a method you control. The pill plus condoms covers both pregnancy and infection.' },
        links: [NUMBERS],
    },
    12: {
        ja: { detail: '低用量ピルは避妊だけの薬ではありません。周期を整え、月経痛の悪化を防ぎ、子宮内膜症の進行を抑えます。学業や仕事のパフォーマンスを保つ手段であると同時に、将来の妊活を良い状態で始めるための準備でもあります。月4000円程度です。', action: '血栓症の既往・家族歴、高血圧、片頭痛、喫煙、35歳以上などは使用可否の相談が必要です。' },
        en: { detail: 'The pill is not only contraception. It regulates cycles, slows worsening period pain and holds endometriosis in check. It protects your performance at work or study now, and it means you start trying later in better condition. About ¥4,000 a month in Japan.', action: 'A history of clots, high blood pressure, migraine, smoking or being over 35 all need discussing before starting.' },
    },
    13: {
        ja: { detail: '卵子は排卵から約24時間で受精する力を失います。一方、精子は卵管の中で約1週間生存します。つまり待っているのは精子の側で、妊娠可能な期間は排卵5日前から排卵後1日まで、最も妊娠しやすいのは排卵2日前から当日までです。', action: '排卵日「当日」を狙うのでは遅いことがあります。2日前から意識してください。' },
        en: { detail: 'An egg loses the ability to be fertilised about 24 hours after ovulation, while sperm survive around a week in the tubes. It is the sperm that waits. The fertile window runs from five days before ovulation to one day after, and peaks in the two days before through the day itself.', action: 'Aiming for the day of ovulation can already be too late — start two days earlier.' },
        links: [NUMBERS],
    },
    14: {
        ja: { detail: '排卵の約2週間後に月経が来ます。この関係は安定しているため、次の月経予定日が正確に読める人は、その2週間前が排卵日だと逆算できます。毎月の月経開始日を正確に予測できる人は、ほとんどの場合きちんと排卵しています。', action: '次の月経予定日から2週間引いてください。そこが排卵日、その2日前からが勝負どころです。' },
        en: { detail: 'Your period arrives about two weeks after ovulation, and that interval is stable. So if you can predict your next period accurately, ovulation was two weeks before it. Being able to predict your start date reliably is itself good evidence that you are ovulating.', action: 'Subtract two weeks from your next expected period — that is ovulation, and the two days before it matter most.' },
    },
    15: {
        ja: { detail: '基礎体温は排卵後にプロゲステロンの作用で約0.3℃上がります。つまり体温が上がったと分かった時点で、排卵は既に終わっています。妊娠しやすい時期は過ぎているため、予測の道具にはなりません。排卵があったかどうかの事後確認としては有用です。', action: '予測には排卵検査薬や頸管粘液を、確認には基礎体温を。目的を分けて使ってください。' },
        en: { detail: 'Basal body temperature rises about 0.3°C after ovulation, under the influence of progesterone. By the time you can see the rise, ovulation is over and the fertile window has closed. It confirms; it does not forecast — though as confirmation it is genuinely useful.', action: 'Use LH tests or cervical mucus to predict, and BBT to confirm. Different tools for different jobs.' },
        links: [NUMBERS],
    },
    16: {
        ja: { detail: '月経管理アプリは、最後の月経開始日と過去の周期の傾向から計算しているだけです。周期が不安定なら、原理的に排卵日を当てられません。月経不順の背景には、排卵日が大きく変動している場合と、排卵せず出血だけ起きている場合があります。', action: '月経不順なら自己流で続けるより、通院してエコーで排卵日を追う方が確実で早いです。' },
        en: { detail: 'Period apps calculate from your last start date and the trend of past cycles — nothing more. If cycles vary, the maths cannot work. Behind irregularity lies either ovulation that shifts widely, or bleeding without ovulation at all.', action: 'With irregular cycles, tracking follicles by ultrasound at a clinic is both faster and more reliable than persevering alone.' },
    },
    17: {
        ja: { detail: '排卵日を把握してタイミングを合わせた場合、1周期で38%、3周期で68%、6周期で81%、12周期で92%が妊娠します。注目すべきは6周期以降の伸びの鈍さです。タイミングを合わせて6周期経っても妊娠しない場合、残っているカップルの約半数には何らかの妊娠しにくい要因があると報告されています。', action: '6ヶ月が方針を見直す分岐点です。「もう少し様子を見る」の根拠がここで切れます。' },
        en: { detail: 'When ovulation is tracked and intercourse timed, 38% conceive in the first cycle, 68% by three, 81% by six and 92% by twelve. What matters is how the curve flattens after six: of the couples still not pregnant at that point, about half have an underlying reason.', action: 'Six months is the decision point. That is where "let us wait a bit longer" runs out of evidence.' },
        links: [NUMBERS],
    },
    18: {
        ja: { detail: '検査で妊娠しづらい状態が事前に分かれば、治してから妊活を始められます。明らかに自然妊娠が難しいと分かれば、早く治療に進めます。どちらの場合も得られるのは時間です。ライフプランの実現は時間との勝負なので、これが最大の利益になります。', action: '結婚前後や妊活開始前に一度受けてください。各項目の読み方は検査結果ページにまとめています。' },
        en: { detail: 'If screening finds something, you can treat it before you start. If it shows natural conception is unlikely, you move to treatment sooner. Either way what you gain is time — and since a life plan is a race against time, that is the whole point.', action: 'Get screened around marriage or before you start trying. We explain how to read each result on the panel page.' },
        links: [PANEL],
    },
    19: {
        ja: { detail: '不妊治療は、自分の排卵を使う治療（タイミング療法・人工授精）と、排卵させずに卵子を取り出す治療（体外受精）に分かれます。前者はエコーで排卵日を正確に予測して行い、後者は一度に複数の卵子を扱うため効率が上がります。妊娠率はタイミング療法1〜4%、人工授精4〜8%、体外受精は30歳まで20〜30%です。', action: '一般不妊治療は3〜5周期を目安に、妊娠しなければ次の段階へ進む設計にしてください。' },
        en: { detail: 'Treatment divides into methods that use your own ovulation (timed intercourse, IUI) and one that bypasses it to collect eggs directly (IVF). The first relies on ultrasound to pinpoint ovulation; the second gains efficiency by handling several eggs at once. Per cycle: 1–4%, 4–8%, and 20–30% up to age 30.', action: 'Plan first-line treatment in blocks of 3–5 cycles, with a decision to step up if it has not worked.' },
        links: [NUMBERS],
    },
    20: {
        ja: { detail: '検査で分かるのは、卵管が通っているかと、運動する精子がいるかまでです。排卵後に卵子が卵管に入れているか、受精しているか、胚盤胞まで育っているか、着床しているかは、体の中で起きるため確認できません。タイミング療法と人工授精は、どこで止まっているか分からないまま行う治療です。', action: '3〜5周期で妊娠しない場合、検査で分からない部分に原因がある確率が上がります。ステップアップの判断材料にしてください。' },
        en: { detail: 'Testing reaches as far as tubal patency and motile sperm. Whether the egg entered the tube, whether fertilisation happened, whether the embryo reached blastocyst, whether it implanted — all of it happens unobserved. Timed intercourse and IUI are treatments run without knowing which step fails.', action: 'If 3–5 cycles pass without success, the odds shift towards the part testing cannot see. Use that in deciding to step up.' },
        links: [PANEL],
    },
    21: {
        ja: { detail: '凍結した卵子や受精卵は加齢の影響を受けません。採卵した年齢の妊娠率が、そのまま将来に持ち越されます。第一子の治療で使わなかった受精卵を第二子・第三子に使うこともできます。未婚でも卵子凍結という選択があります。', action: '卵子の数が減っている兆候があるなら、残っているうちに選択肢を確保することを検討してください。' },
        en: { detail: 'Frozen eggs and embryos do not age. The success rate of the age at which you froze carries forward intact, and embryos left over from a first child can be used for a second or third. Egg freezing is available without a partner.', action: 'If there are signs your reserve is falling, consider securing the option while eggs remain.' },
    },
    22: {
        ja: { detail: '治療が始まると、通院はカレンダーではなく月経周期に従属します。採卵周期は2週間のうちに3〜5回、しかも日程が確定するのは2〜3日前です。診察のたびに採血とエコーで1〜2時間かかります。女性側の通院回数は男性の数倍になります。', action: '職場の制度（時間休・在宅・妊活休暇）を、始める前に確認しておいてください。' },
        en: { detail: 'Once treatment starts, visits follow your cycle rather than your calendar: 3–5 appointments inside two weeks for a retrieval, with dates fixed only two or three days ahead, each taking one to two hours. The woman attends several times more often than the man.', action: 'Check what your workplace offers — hourly leave, remote days, fertility leave — before you begin, not after.' },
    },
    23: {
        ja: { detail: '職場にはループがあります。当事者は「話しても伝わらない」と考えて話さない。会社は困っている人がいないと認識する。だから研修もサポートも用意されない。結果、管理職は不妊治療の実態を知らないままで、当事者が話しても理解されない。', action: '上司の側が知っていると分かることが、当事者が言い出せる条件になります。まず周りが知ることです。' },
        en: { detail: 'A loop forms at work. People stay silent because explaining feels futile. The employer concludes nobody is affected. So no training or support is put in place. Managers therefore never learn what treatment involves — and the next person who does speak up is not understood either.', action: 'What breaks the loop is the manager knowing first. The people around the patient are where this starts.' },
    },
    24: {
        ja: { detail: '妊娠・出産・授乳は、医学的に女性にしかできません。しかしそれ以外の家事と育児は、どちらにもできます。食事を作る、洗濯をする、送迎する、発熱時に病院へ連れて行く。この線引きが曖昧なままだと、日中は働き夜は家事育児というダブルシフトが女性側に固定されます。', action: '「子どもは何人か」だけでなく「家事育児をどう分けるか」を、妊活を始める前に話してください。' },
        en: { detail: 'Pregnancy, birth and breastfeeding are medically hers alone. Everything else — cooking, laundry, the school run, the trip to the doctor on a sick day — is shareable. Leave that line undrawn and the double shift, paid work by day and domestic work by night, settles onto one person by default.', action: 'Before you start trying, agree not just how many children, but how the domestic load divides.' },
    },
};
