"use client";

import { useState, useMemo, useCallback } from "react";

// =====================================================================
// ART (Assisted Reproductive Technology) Simulator - PRO Monte Carlo Edition
// Evidence: CDC/SART National Summary, Human Reproduction, Fertility & Sterility
// 
// Professional Adjustments Applied:
// 1. PGT-A age independence (Fixed LBR for euploid)
// 2. Negative Binomial distribution for oocyte retrieval (Overdispersion)
// 3. Frailty Model for repeated implantation failure
// 4. Event-driven dropout based on clinical milestones
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
        perCycleRate: "平均1移植あたりの出生率",
        expectedEggs: "予想採卵数（1回目中央値）",
        expectedBlasts: "予想胚盤胞数（1回目中央値）",
        eggsUnit: "個",
        explanation: "この推定は、単純な数式ではなく、CDC/SART全米データに基づく「3,000人の仮想患者コホート」を用いたモンテカルロ・シミュレーションによって算出されています。",
        calculate: "計算する",
        reset: "リセット",
        chartLabel: "採卵回数別 累積出生率",
        references: "参考文献",
        ref1: "CDC/SART National Summary Report (2022)",
        ref2: "Human Reproduction, Age-specific ART outcomes",
        ref3: "Fertility & Sterility, AMH and ovarian response",
        bookCta: "もっと詳しく知りたい方へ",
        bookCtaText: "年齢と妊娠の関係、AMH、不妊治療の基礎を1冊にまとめた書籍はこちら",
        bookCtaButton: "書籍を見る →",
        bookUrl: "https://amzn.to/3NcOWBl",
        logicTitle: "シミュレーションの計算ロジックと前提条件",
        logicIntro: "本ツールは、米国CDC等の全米データをベースに、3,000人の仮想患者コホートを生成して時間を進める「モンテカルロ法」で算出されています。",
        logicCycleTitle: "「1回の治療（サイクル）」の定義",
        logicCycleText: "「1回の採卵を行い、そこで得られた受精卵（凍結胚）をすべて移植し終えるまで」を1サイクルとしています。手持ちの凍結胚をすべて使い切っても妊娠に至らなかった場合にのみ「次の採卵」に進みます。また、採卵結果が0個だったり、移植失敗が続いた場合には、現実のデータに基づいて一定確率で「治療からの離脱（ドロップアウト）」が発生するモデルを採用しています。",
        logicFactorsTitle: "各項目の影響と高度な確率モデル",
        logicFactorsText: "実際の臨床的リアリティを再現するため、①PGT-A正常胚移植時は年齢による低下をキャンセルした固定確率（約55%）を採用、②採卵数のばらつきをPCOSやPORを考慮した「負の二項分布」で再現、③移植が不成功に終わるたびに着床障害の可能性を考慮して次回の確率を割引（Frailtyモデル）、④失敗イベント直後に治療を諦めるイベント駆動型ドロップアウト、を組み込んでいます。",
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
        perCycleRate: "Avg. LBR per Transfer",
        expectedEggs: "Expected Eggs (1st Cycle Median)",
        expectedBlasts: "Expected Blasts (1st Cycle Median)",
        eggsUnit: "eggs",
        explanation: "Estimates are powered by a Monte Carlo simulation tracking 3,000 virtual patients, based on CDC/SART national data and age-specific outcomes.",
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
        logicIntro: "This simulator uses advanced Monte Carlo methods, dynamically simulating 3,000 virtual patients based on national data from the US CDC/SART.",
        logicCycleTitle: "Clinical Definition of 'One Cycle'",
        logicCycleText: "In this tool, 'one cycle' means one egg retrieval and sequentially transferring all resulting frozen embryos. You only move on to a 'second retrieval' if all embryos from the first are depleted without a live birth. The model also simulates real-world treatment dropouts driven by negative events.",
        logicFactorsTitle: "Impact of Factors & Advanced Models",
        logicFactorsText: "The simulator accounts for biological overdispersion in egg yields (Negative Binomial) and the age-independent success rate (approx. 55%) of PGT-A euploid embryos. Furthermore, it incorporates a Frailty Model: if multiple high-quality embryos fail to implant, the likelihood of hidden implantation issues rises, progressively reducing the success rate. It also triggers event-driven dropouts upon cycle failures.",
        disclaimerTitle: "Important Disclaimer",
        disclaimer1: "The results provided are statistical estimates based on population data and do NOT guarantee your individual pregnancy or live birth.",
        disclaimer2: "Actual clinical outcomes depend on countless individual factors not captured here, such as sperm quality (male factor), uterine environment, and past medical history.",
        disclaimer3: "Even if the estimates appear low, they do not define your absolute potential. This tool is for educational purposes only. Always consult your reproductive endocrinologist for personalized medical advice and treatment planning.",
    },
};

// =====================================================================
// Evidence-based Statistical & Monte Carlo Functions
// =====================================================================

// Pseudo-random number generator (Mulberry32) for deterministic simulations
function mulberry32(seed: number) {
    let a = seed >>> 0;
    return function () {
        a |= 0; a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Standard normal distribution
function randn(rng: () => number): number {
    let u = 0, v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Gamma distribution sampling (Marsaglia and Tsang)
function rgamma(alpha: number, rng: () => number): number {
    if (alpha < 1) {
        let u = 0; while(u === 0) u = rng();
        return rgamma(alpha + 1, rng) * Math.pow(u, 1 / alpha);
    }
    const d = alpha - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);
    while (true) {
        let x = randn(rng);
        let v = 1 + c * x;
        while (v <= 0) { x = randn(rng); v = 1 + c * x; }
        v = v * v * v;
        let u = 0; while(u === 0) u = rng();
        if (u < 1 - 0.0331 * x * x * x * x) return d * v;
        if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
    }
}

// Poisson distribution
function rpoisson(lambda: number, rng: () => number): number {
    if (lambda <= 0) return 0;
    const L = Math.exp(-lambda);
    let k = 0, p = 1.0;
    do { k++; p *= rng(); } while (p > L);
    return k - 1;
}

// Negative Binomial distribution (Overdispersion in oocyte retrieval)
function rnbinom(mu: number, dispersion: number, rng: () => number): number {
    if (mu <= 0) return 0;
    if (dispersion <= 0) return rpoisson(mu, rng);
    const shape = 1 / dispersion;
    const scale = mu * dispersion;
    const lambda = rgamma(shape, rng) * scale;
    return rpoisson(lambda, rng);
}

// Binomial distribution
function rbinom(n: number, p: number, rng: () => number): number {
    let x = 0;
    for (let i = 0; i < n; i++) if (rng() < p) x++;
    return x;
}

// Interpolation & Utilities
function clamp(x: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, x)); }
function piecewiseLinear(x: number, pts: number[][]) {
    if (x <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) {
        if (x <= pts[i][0]) {
            const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
            return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
        }
    }
    return pts[pts.length - 1][1];
}

// --- Age-specific Parameters ---
const ageParams = {
    pMII: (age: number) => clamp(0.78 - Math.max(0, age - 38) * 0.012, 0.55, 0.88),
    pFertilization: (age: number) => clamp(0.72 - Math.max(0, age - 40) * 0.015, 0.50, 0.86),
    pBlast: (age: number) => piecewiseLinear(age, [[30, 0.46], [35, 0.43], [38, 0.38], [41, 0.32], [43, 0.26], [45, 0.20]]),
    pUsableFromBlast: (age: number) => piecewiseLinear(age, [[30, 0.76], [35, 0.72], [38, 0.66], [41, 0.60], [43, 0.52], [45, 0.44]]),
    pLBR_nonPGT: (age: number) => piecewiseLinear(age, [[30, 0.43], [35, 0.40], [38, 0.34], [41, 0.26], [43, 0.16], [45, 0.08]]),
    pEuploid: (age: number) => piecewiseLinear(age, [[30, 0.60], [35, 0.50], [38, 0.35], [40, 0.25], [42, 0.15], [44, 0.07], [45, 0.04]])
};

function expectedTotalOocytes(age: number, amh: number) {
    const penalty = Math.max(0, age - 35) * 0.75;
    return clamp((amh * 8) - penalty, 1, 40);
}

// =====================================================================
// Monte Carlo Engine (3,000 Virtual Patients)
// =====================================================================
function runMonteCarlo(
    startAge: number, amh: number, maxCycles: number,
    bmi: string, smoking: boolean, pgt: boolean
) {
    const N = 3000;
    const rng = mulberry32(12345); 

    let lifestyleMultiplier = 1.0;
    if (bmi === "over") lifestyleMultiplier *= 0.92;
    if (bmi === "obese") lifestyleMultiplier *= 0.82;
    if (smoking) lifestyleMultiplier *= 0.85;

    const OOCYTE_DISPERSION = 0.40;
    const PGT_BASE_LBR = 0.55;
    const FRAILTY_DECAY = 0.88;
    const DROPOUT_NO_EMBRYO = 0.15;
    const DROPOUT_FAILED_TRANSFER = 0.10;

    const successesByCycle = new Array(maxCycles).fill(0);
    const firstCycleEggsArr: number[] = [];
    const firstCycleBlastsArr: number[] = [];
    
    let totalTransfers = 0;
    let totalPregnancies = 0;

    for (let i = 0; i < N; i++) {
        let currentAge = startAge;
        let failedTransfers = 0;
        let successCycle = -1;

        for (let cycle = 1; cycle <= maxCycles; cycle++) {
            currentAge += (pgt ? 2.5 : 1.5) / 12;
            if (currentAge >= 46) break;

            const lambda = expectedTotalOocytes(currentAge, amh);
            const oocytes = rnbinom(lambda, OOCYTE_DISPERSION, rng);
            
            const mii = rbinom(oocytes, ageParams.pMII(currentAge), rng);
            const fert = rbinom(mii, ageParams.pFertilization(currentAge), rng);
            const blast = rbinom(fert, ageParams.pBlast(currentAge), rng);

            if (cycle === 1) {
                firstCycleEggsArr.push(oocytes);
                firstCycleBlastsArr.push(blast);
            }

            let usableEmbryos = 0;
            if (pgt) {
                usableEmbryos = rbinom(blast, ageParams.pEuploid(currentAge), rng);
            } else {
                usableEmbryos = rbinom(blast, ageParams.pUsableFromBlast(currentAge), rng);
            }

            if (usableEmbryos === 0) {
                if (rng() < DROPOUT_NO_EMBRYO) break;
                continue;
            }

            let achievedPregnancy = false;

            while (usableEmbryos > 0 && currentAge < 46) {
                usableEmbryos--;
                totalTransfers++;
                currentAge += (pgt ? 2.0 : 1.0) / 12;

                const baseProb = pgt ? PGT_BASE_LBR : ageParams.pLBR_nonPGT(currentAge);
                const frailtyMultiplier = Math.pow(FRAILTY_DECAY, failedTransfers);
                const actualProb = clamp(baseProb * lifestyleMultiplier * frailtyMultiplier, 0.01, 0.65);

                if (rng() < actualProb) {
                    achievedPregnancy = true;
                    successCycle = cycle;
                    totalPregnancies++;
                    break;
                } else {
                    failedTransfers++;
                    if (rng() < DROPOUT_FAILED_TRANSFER) {
                        usableEmbryos = 0;
                        break;
                    }
                }
            }

            if (achievedPregnancy) break;
            if (usableEmbryos === 0 && rng() < 0.10) break;
        }

        if (successCycle !== -1) {
            for (let c = successCycle - 1; c < maxCycles; c++) {
                successesByCycle[c]++;
            }
        }
    }

    const byCycle: number[] = [];
    for (let c = 0; c < maxCycles; c++) {
        byCycle.push(Math.round((successesByCycle[c] / N) * 1000) / 10);
    }

    firstCycleEggsArr.sort((a, b) => a - b);
    firstCycleBlastsArr.sort((a, b) => a - b);
    const medianEggs = firstCycleEggsArr.length > 0 ? firstCycleEggsArr[Math.floor(firstCycleEggsArr.length / 2)] : 0;
    const medianBlasts = firstCycleBlastsArr.length > 0 ? firstCycleBlastsArr[Math.floor(firstCycleBlastsArr.length / 2)] : 0;
    const perCycleRate = totalTransfers > 0 ? Math.round((totalPregnancies / totalTransfers) * 1000) / 10 : 0;

    return {
        cumulative: byCycle[maxCycles - 1] || 0,
        perCycle: perCycleRate,
        byCycle,
        expectedEggs: medianEggs,
        expectedBlasts: medianBlasts
    };
}

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

// =====================================================================
// UI Components
// =====================================================================

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

export default function ArtSimulator({ lang = "ja" }: SimulatorProps) {
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

    const result = useMemo(() => {
        if (!showResult) return null;
        return runMonteCarlo(age, effectiveAmh, cycles, bmi, smoking, pgt);
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
                    🔬 {lang === "ja" ? "モンテカルロ・エンジン" : "Monte Carlo Engine"}
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
                            <p className="text-2xl font-black text-[var(--color-text-dark)]">{result.expectedEggs} <span className="text-sm font-bold">{l.eggsUnit}</span></p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                            <p className="text-[0.65rem] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">{l.expectedBlasts}</p>
                            <p className="text-2xl font-black text-[var(--color-text-dark)]">{result.expectedBlasts}</p>
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
