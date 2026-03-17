"use client";

import { useState, useMemo, useCallback } from "react";

// =====================================================================
// ART (Assisted Reproductive Technology) Simulator
// Evidence: CDC/SART National Summary, Human Reproduction, Fertility & Sterility
// This is for EDUCATIONAL purposes only. NOT clinical advice.
// =====================================================================

type Language = "ja" | "en";

interface SimulatorProps {
    lang?: Language;
}

// ---- Localization ----
const t = {
    ja: {
        title: "IVF 成功率シミュレーター",
        subtitle: "年齢・AMH・治療歴から累積出生率を推定します",
        disclaimer: "※本シミュレーションは教育目的であり、個別の医学的助言ではありません。治療方針は必ず主治医とご相談ください。",
        ageLabel: "年齢（歳）",
        amhLabel: "AMH（ng/mL）",
        amhHelp: "血液検査の結果。不明な場合は年齢から推定されます。",
        amhUnknown: "不明（年齢から推定）",
        cyclesLabel: "予定する採卵回数",
        cycleUnit: "回",
        bmiLabel: "BMI",
        bmiNormal: "標準 (18.5-24.9)",
        bmiOver: "軽度肥満 (25-29.9)",
        bmiObese: "肥満 (30+)",
        smokingLabel: "喫煙習慣",
        smokingNo: "なし",
        smokingYes: "あり",
        pgtLabel: "PGT-A（着床前検査）",
        pgtNo: "行わない",
        pgtYes: "行う",
        resultTitle: "シミュレーション結果",
        cumulativeRate: "累積出生率（推定）",
        perCycleRate: "1回あたりの出生率",
        expectedEggs: "予想採卵数（中央値）",
        expectedBlasts: "予想胚盤胞数",
        eggsUnit: "個",
        explanation: "この推定は、CDC/SART全米データおよびHuman Reproduction誌の年齢別ART成績に基づいています。",
        calculate: "計算する",
        reset: "リセット",
        chartLabel: "回数別 累積出生率",
        references: "参考文献",
        ref1: "CDC/SART National Summary Report (2022)",
        ref2: "Human Reproduction, Age-specific ART outcomes",
        ref3: "Fertility & Sterility, AMH and ovarian response",
        bookCta: "もっと詳しく知りたい方へ",
        bookCtaText: "年齢と妊娠の関係、AMH、不妊治療の基礎を1冊にまとめた書籍はこちら",
        bookCtaButton: "書籍を見る →",
        bookUrl: "https://amzn.to/3NcOWBl",
        logicTitle: "シミュレーションの計算ロジックと前提条件",
        logicIntro: "本ツールは、米国CDC（疾病予防管理センター）やSARTの全米データ、および信頼性の高い生殖医学の統計モデルをベースに算出されています。",
        logicCycleTitle: "「1回の治療（サイクル）」の定義",
        logicCycleText: "本ツールにおける「予定する採卵回数（サイクル）」とは、単なる移植の回数ではありません。「1回の採卵を行い、そこで得られた受精卵（凍結胚）をすべて移植し終えるまで」を1サイクルとしています。もし手持ちの凍結胚をすべて使い切っても妊娠に至らなかった場合にのみ「次の採卵」に進むという、実際の臨床現場に即した前提で累積確率を計算しています。",
        logicFactorsTitle: "各項目の影響と確率の推移",
        logicFactorsText: "年齢は成功率のベースを決定する最大の要因です。AMHは「採卵できる卵子の数」の目安となり、数が多いほど1回の採卵から複数回の移植チャンスが生まれるため成功率を底上げします。また、複数回治療しても結果が出ない場合は隠れた難治要因（着床障害など）がある可能性が高まるため、単純な足し算ではなく、回数を重ねるごとに1回あたりの成功率が徐々に下がる、現実に近い計算モデルを採用しています。",
        disclaimerTitle: "免責事項（必ずお読みください）",
        disclaimer1: "本ツールの結果は、大規模な統計データに基づく「確率的な推論（平均値）」であり、あなた個人の妊娠や出産を保証するものでは決してありません。",
        disclaimer2: "実際の不妊治療の成績は、精子の状態（男性因子）、子宮内の環境、過去の治療歴など、本ツールでは入力しきれない無数の個別要因によって大きく変動します。",
        disclaimer3: "シミュレーションで厳しい数値が出た場合でも、あなたの可能性がゼロだという意味ではありません。具体的な治療方針や見通しについては、必ず主治医（生殖医療専門医）と直接ご相談ください。",
    },
    en: {
        title: "IVF Success Rate Simulator",
        subtitle: "Estimate cumulative live birth rates based on age, AMH, and clinical parameters",
        disclaimer: "This simulation is for educational purposes only and is not individual medical advice. Always consult with your physician.",
        ageLabel: "Age (years)",
        amhLabel: "AMH (ng/mL)",
        amhHelp: "From blood test results. If unknown, it will be estimated from age.",
        amhUnknown: "Unknown (estimate from age)",
        cyclesLabel: "Planned egg retrieval cycles",
        cycleUnit: "cycles",
        bmiLabel: "BMI",
        bmiNormal: "Normal (18.5-24.9)",
        bmiOver: "Overweight (25-29.9)",
        bmiObese: "Obese (30+)",
        smokingLabel: "Smoking",
        smokingNo: "No",
        smokingYes: "Yes",
        pgtLabel: "PGT-A (Preimplantation Testing)",
        pgtNo: "No",
        pgtYes: "Yes",
        resultTitle: "Simulation Results",
        cumulativeRate: "Cumulative Live Birth Rate (est.)",
        perCycleRate: "Per-Cycle Live Birth Rate",
        expectedEggs: "Expected Eggs Retrieved (median)",
        expectedBlasts: "Expected Blastocysts",
        eggsUnit: "eggs",
        explanation: "Estimates are based on CDC/SART national data and age-specific ART outcomes from Human Reproduction.",
        calculate: "Calculate",
        reset: "Reset",
        chartLabel: "Cumulative Live Birth Rate by Cycle",
        references: "References",
        ref1: "CDC/SART National Summary Report (2022)",
        ref2: "Human Reproduction, Age-specific ART outcomes",
        ref3: "Fertility & Sterility, AMH and ovarian response",
        bookCta: "Want to learn more?",
        bookCtaText: "A comprehensive guide covering age, fertility, AMH, and treatment options",
        bookCtaButton: "View the Book →",
        bookUrl: "https://www.amazon.co.jp/Doctor%E2%80%99s-Guide-Womens-Health-Preconception/dp/B0F7XTWJ3X/",
        logicTitle: "Calculation Logic & Assumptions",
        logicIntro: "This simulator uses statistical models based on national data from the US CDC/SART and peer-reviewed reproductive medicine journals.",
        logicCycleTitle: "Clinical Definition of 'One Cycle'",
        logicCycleText: "In this tool, 'one cycle' (or planned retrieval) does not mean a single embryo transfer. It represents the entire process of one egg retrieval and sequentially transferring all resulting frozen embryos. You only move on to a 'second retrieval' if all embryos from the first are depleted without a live birth, reflecting real-world clinical pathways.",
        logicFactorsTitle: "Impact of Factors & Probability Decay",
        logicFactorsText: "Age is the primary factor determining the baseline success rate. AMH indicates the expected number of eggs; more eggs mean more transfer opportunities from a single retrieval, boosting the success rate. Furthermore, the model assumes that if multiple cycles fail, the likelihood of hidden factors (e.g., implantation issues) rises, so the success rate per subsequent cycle slightly decreases to mirror clinical reality.",
        disclaimerTitle: "Important Disclaimer",
        disclaimer1: "The results provided are statistical estimates based on population data and do NOT guarantee your individual pregnancy or live birth.",
        disclaimer2: "Actual clinical outcomes depend on countless individual factors not captured here, such as sperm quality (male factor), uterine environment, and past medical history.",
        disclaimer3: "Even if the estimates appear low, they do not define your absolute potential. This tool is for educational purposes only. Always consult your reproductive endocrinologist for personalized medical advice and treatment planning.",
    },
};

// ---- Evidence-based calculation functions ----

/** Estimate AMH by age (median, if unknown) */
function estimateAmh(age: number): number {
    if (age <= 25) return 4.5;
    if (age <= 30) return 3.5;
    if (age <= 33) return 2.8;
    if (age <= 35) return 2.2;
    if (age <= 37) return 1.7;
    if (age <= 39) return 1.2;
    if (age <= 41) return 0.8;
    if (age <= 43) return 0.5;
    return 0.3;
}

/** Expected eggs per retrieval based on AMH (approximate median) */
function expectedEggs(amh: number): number {
    if (amh >= 5.0) return 18;
    if (amh >= 3.5) return 14;
    if (amh >= 2.5) return 11;
    if (amh >= 1.5) return 8;
    if (amh >= 1.0) return 6;
    if (amh >= 0.5) return 4;
    if (amh >= 0.2) return 2;
    return 1;
}

/** Per-cycle live birth rate by age (CDC/SART 2022 approximation) */
function perCycleLbr(age: number): number {
    if (age <= 30) return 0.46;
    if (age <= 32) return 0.42;
    if (age <= 34) return 0.38;
    if (age <= 35) return 0.34;
    if (age <= 36) return 0.30;
    if (age <= 37) return 0.26;
    if (age <= 38) return 0.22;
    if (age <= 39) return 0.18;
    if (age <= 40) return 0.14;
    if (age <= 41) return 0.10;
    if (age <= 42) return 0.07;
    if (age <= 43) return 0.04;
    return 0.02;
}

/** Estimate blastocysts from eggs, age-adjusted */
function expectedBlastocysts(eggs: number, age: number): number {
    // Fertilization rate ~70%, blastocyst formation ~50% at young ages, drops with age
    const fertRate = 0.70;
    let blastRate = 0.50;
    if (age > 35) blastRate = 0.42;
    if (age > 38) blastRate = 0.35;
    if (age > 40) blastRate = 0.28;
    if (age > 42) blastRate = 0.20;
    return Math.max(0, Math.round(eggs * fertRate * blastRate * 10) / 10);
}

/** Cumulative LBR = 1 - (1 - per_cycle)^n, with modifiers */
function cumulativeLbr(
    age: number,
    amh: number,
    cycles: number,
    bmi: string,
    smoking: boolean,
    pgt: boolean
): { cumulative: number; perCycle: number; byCycle: number[] } {
    let base = perCycleLbr(age);

    // AMH modifier: Low AMH mainly reduces egg count, modest effect on per-cycle rate
    if (amh < 1.0) base *= 0.90;
    else if (amh > 4.0 && age < 35) base *= 1.05; // Slight boost for high AMH + young

    // BMI modifier
    if (bmi === "over") base *= 0.92;
    if (bmi === "obese") base *= 0.82;

    // Smoking modifier
    if (smoking) base *= 0.85;

    // PGT-A: Reduces per-transfer pregnancy rate but improves per-embryo rate slightly for older patients
    if (pgt && age >= 38) base *= 1.08;
    else if (pgt && age < 35) base *= 0.95; // slight reduction in younger patients (fewer transfers)

    base = Math.min(base, 0.55); // cap
    base = Math.max(base, 0.01); // floor

    const byCycle: number[] = [];
    for (let i = 1; i <= cycles; i++) {
        const cum = 1 - Math.pow(1 - base, i);
        byCycle.push(Math.round(cum * 1000) / 10);
    }

    const cumulative = 1 - Math.pow(1 - base, cycles);

    return {
        cumulative: Math.round(cumulative * 1000) / 10,
        perCycle: Math.round(base * 1000) / 10,
        byCycle,
    };
}

// ---- Visual Bar Chart ----
function BarChart({ data, label }: { data: number[]; label: string }) {
    const maxVal = Math.max(...data, 100);
    return (
        <div className="mt-6">
            <p className="text-xs font-bold text-[var(--color-text-muted)] mb-3 uppercase tracking-wider">{label}</p>
            <div className="flex items-end gap-2 h-[160px]">
                {data.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                        <span className="text-[0.65rem] font-bold text-[var(--color-sage-dark)] mb-1">{val}%</span>
                        <div
                            className="w-full rounded-t-md transition-all duration-700 ease-out"
                            style={{
                                height: `${(val / maxVal) * 100}%`,
                                minHeight: "4px",
                                background: `linear-gradient(180deg, #8A9A86 0%, ${val > 50 ? '#6C7D68' : '#A3BFA7'} 100%)`,
                            }}
                        />
                        <span className="text-[0.6rem] text-[var(--color-text-muted)] mt-1 font-bold">{i + 1}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ---- Main Component ----
export default function ArtSimulator({ lang = "en" }: SimulatorProps) {
    const l = t[lang];

    const [age, setAge] = useState(32);
    const [amhKnown, setAmhKnown] = useState(false);
    const [amhValue, setAmhValue] = useState(2.5);
    const [cycles, setCycles] = useState(3);
    const [bmi, setBmi] = useState("normal");
    const [smoking, setSmoking] = useState(false);
    const [pgt, setPgt] = useState(false);
    const [showResult, setShowResult] = useState(false);

    const effectiveAmh = amhKnown ? amhValue : estimateAmh(age);
    const eggs = expectedEggs(effectiveAmh);
    const blasts = expectedBlastocysts(eggs, age);

    const result = useMemo(() => {
        if (!showResult) return null;
        return cumulativeLbr(age, effectiveAmh, cycles, bmi, smoking, pgt);
    }, [showResult, age, effectiveAmh, cycles, bmi, smoking, pgt]);

    const handleCalc = useCallback(() => setShowResult(true), []);
    const handleReset = useCallback(() => {
        setShowResult(false);
        setAge(32);
        setAmhKnown(false);
        setAmhValue(2.5);
        setCycles(3);
        setBmi("normal");
        setSmoking(false);
        setPgt(false);
    }, []);

    return (
        <div className="w-full max-w-[680px] mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-wider uppercase">
                    🔬 {lang === "ja" ? "インタラクティブツール" : "Interactive Tool"}
                </div>
                <h1 className="text-[clamp(1.4rem,3.5vw,2rem)] font-bold text-[var(--color-text-dark)] leading-snug mb-3">
                    {l.title}
                </h1>
                <p className="text-sm text-[var(--color-text-muted)] max-w-[500px] mx-auto leading-relaxed">
                    {l.subtitle}
                </p>
            </div>

            {/* Input Form */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Age */}
                    <div>
                        <label className="block text-sm font-bold text-[var(--color-text-dark)] mb-2">{l.ageLabel}</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min={20}
                                max={45}
                                value={age}
                                onChange={(e) => { setAge(+e.target.value); setShowResult(false); }}
                                className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[var(--color-sage)]"
                            />
                            <span className="text-lg font-bold text-[var(--color-sage-dark)] w-12 text-right">{age}</span>
                        </div>
                    </div>

                    {/* Cycles */}
                    <div>
                        <label className="block text-sm font-bold text-[var(--color-text-dark)] mb-2">{l.cyclesLabel}</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min={1}
                                max={6}
                                value={cycles}
                                onChange={(e) => { setCycles(+e.target.value); setShowResult(false); }}
                                className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[var(--color-sage)]"
                            />
                            <span className="text-lg font-bold text-[var(--color-sage-dark)] w-16 text-right">{cycles} {l.cycleUnit}</span>
                        </div>
                    </div>

                    {/* AMH */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-[var(--color-text-dark)] mb-2">{l.amhLabel}</label>
                        <p className="text-xs text-[var(--color-text-muted)] mb-2">{l.amhHelp}</p>
                        <div className="flex flex-wrap items-center gap-3">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={amhKnown}
                                    onChange={(e) => { setAmhKnown(e.target.checked); setShowResult(false); }}
                                    className="accent-[var(--color-sage)] w-4 h-4"
                                />
                                {lang === "ja" ? "値を入力する" : "Enter value"}
                            </label>
                            {amhKnown ? (
                                <input
                                    type="number"
                                    min={0.1}
                                    max={15}
                                    step={0.1}
                                    value={amhValue}
                                    onChange={(e) => { setAmhValue(+e.target.value); setShowResult(false); }}
                                    className="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-sage)] focus:outline-none"
                                />
                            ) : (
                                <span className="text-sm text-[var(--color-text-muted)] bg-slate-50 px-3 py-1.5 rounded-lg">
                                    {l.amhUnknown} → {effectiveAmh} ng/mL
                                </span>
                            )}
                        </div>
                    </div>

                    {/* BMI */}
                    <div>
                        <label className="block text-sm font-bold text-[var(--color-text-dark)] mb-2">{l.bmiLabel}</label>
                        <select
                            value={bmi}
                            onChange={(e) => { setBmi(e.target.value); setShowResult(false); }}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[var(--color-sage)] focus:outline-none"
                        >
                            <option value="normal">{l.bmiNormal}</option>
                            <option value="over">{l.bmiOver}</option>
                            <option value="obese">{l.bmiObese}</option>
                        </select>
                    </div>

                    {/* Smoking & PGT */}
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="block text-sm font-bold text-[var(--color-text-dark)] mb-2">{l.smokingLabel}</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="smoking" checked={!smoking} onChange={() => { setSmoking(false); setShowResult(false); }} className="accent-[var(--color-sage)]" />
                                    {l.smokingNo}
                                </label>
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="smoking" checked={smoking} onChange={() => { setSmoking(true); setShowResult(false); }} className="accent-[var(--color-sage)]" />
                                    {l.smokingYes}
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[var(--color-text-dark)] mb-2">{l.pgtLabel}</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="pgt" checked={!pgt} onChange={() => { setPgt(false); setShowResult(false); }} className="accent-[var(--color-sage)]" />
                                    {l.pgtNo}
                                </label>
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="pgt" checked={pgt} onChange={() => { setPgt(true); setShowResult(false); }} className="accent-[var(--color-sage)]" />
                                    {l.pgtYes}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-8">
                    <button
                        onClick={handleCalc}
                        className="flex-1 bg-gradient-to-r from-[var(--color-sage)] to-[var(--color-sage-dark)] text-white font-bold text-sm rounded-full px-6 py-3.5 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                    >
                        {l.calculate}
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-5 py-3.5 text-sm font-bold text-[var(--color-text-muted)] border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"
                    >
                        {l.reset}
                    </button>
                </div>
            </div>

            {/* Results */}
            {result && (
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100 mb-6 animate-in fade-in duration-500">
                    <h2 className="text-lg font-bold text-[var(--color-text-dark)] mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-sage)]" />
                        {l.resultTitle}
                    </h2>

                    {/* Main result cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        <div className="bg-gradient-to-br from-[var(--color-sage-pale)] to-white rounded-xl p-4 text-center border border-[var(--color-sage)]/20">
                            <p className="text-[0.65rem] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">{l.cumulativeRate}</p>
                            <p className="text-2xl font-black text-[var(--color-sage-dark)]">{result.cumulative}%</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                            <p className="text-[0.65rem] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">{l.perCycleRate}</p>
                            <p className="text-2xl font-black text-[var(--color-text-dark)]">{result.perCycle}%</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                            <p className="text-[0.65rem] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">{l.expectedEggs}</p>
                            <p className="text-2xl font-black text-[var(--color-text-dark)]">{eggs} <span className="text-sm font-bold">{l.eggsUnit}</span></p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                            <p className="text-[0.65rem] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">{l.expectedBlasts}</p>
                            <p className="text-2xl font-black text-[var(--color-text-dark)]">{blasts}</p>
                        </div>
                    </div>

                    {/* Chart */}
                    <BarChart data={result.byCycle} label={l.chartLabel} />

                    {/* Explanation */}
                    <p className="text-xs text-[var(--color-text-muted)] mt-6 leading-relaxed">
                        {l.explanation}
                    </p>

                    {/* References */}
                    <div className="mt-6 pt-4 border-t border-slate-100">
                        <p className="text-[0.65rem] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">{l.references}</p>
                        <ul className="text-[0.7rem] text-[var(--color-text-muted)] space-y-1">
                            <li>1. {l.ref1}</li>
                            <li>2. {l.ref2}</li>
                            <li>3. {l.ref3}</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Book CTA */}
            <div className="bg-gradient-to-r from-[var(--color-gold-pale)] to-white rounded-2xl p-6 border border-[var(--color-gold)]/20 text-center">
                <h3 className="text-base font-bold text-[var(--color-text-dark)] mb-2">{l.bookCta}</h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-4">{l.bookCtaText}</p>
                <a
                    href={l.bookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center cta-button btn-amazon text-sm font-bold rounded-full px-8 py-3 shadow-md"
                >
                    {l.bookCtaButton}
                </a>
            </div>

            {/* 💡 計算ロジック（アコーディオン） */}
            <div className="mt-8 mb-6">
                <details className="group bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden transition-all duration-300">
                    <summary className="flex items-center justify-between cursor-pointer p-5 text-sm font-bold text-[var(--color-text-dark)] hover:bg-slate-100 transition-colors focus:outline-none">
                        <span className="flex items-center gap-2">
                            <span className="text-[var(--color-sage)] text-lg">💡</span>
                            {l.logicTitle}
                        </span>
                        <span className="transition duration-300 group-open:-rotate-180 text-slate-400 text-xs">
                            ▼
                        </span>
                    </summary>
                    <div className="px-5 pb-6 text-xs text-[var(--color-text-muted)] leading-relaxed space-y-5 border-t border-slate-200 pt-5 bg-white">
                        <p>{l.logicIntro}</p>
                        <div>
                            <h4 className="font-bold text-[var(--color-text-dark)] mb-1.5 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-sage)]"></span>
                                {l.logicCycleTitle}
                            </h4>
                            <p>{l.logicCycleText}</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-[var(--color-text-dark)] mb-1.5 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-sage)]"></span>
                                {l.logicFactorsTitle}
                            </h4>
                            <p>{l.logicFactorsText}</p>
                        </div>
                    </div>
                </details>
            </div>

            {/* ⚠️ 免責事項（常に表示・柔らかいトーン） */}
            <div className="bg-red-50/80 rounded-2xl p-5 md:p-6 border border-red-100 text-red-800 mb-8">
                <h4 className="font-bold mb-3 text-sm flex items-center gap-2">
                    <span className="text-red-500 text-lg">⚠️</span>
                    {l.disclaimerTitle}
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-[0.75rem] md:text-xs text-red-800/90 marker:text-red-300 leading-relaxed">
                    <li>{l.disclaimer1}</li>
                    <li>{l.disclaimer2}</li>
                    <li>{l.disclaimer3}</li>
                </ul>
            </div>
        </div>
    );
}
