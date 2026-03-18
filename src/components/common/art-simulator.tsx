"use client";

import { useState, useMemo, useCallback } from "react";

// =====================================================================
// ART Simulator - PRO Monte Carlo Edition (True to Original JS Logic)
// 
// Original Simulator Features Retained (Time & Banking Integration):
// - Exact age-based piecewise probability curves
// - Strict monthly timeline tracking (aging during cycles)
// - Thaw survival rates & transfer cancellation rates
// - Sequential embryo transfers from frozen banks
// 
// Professional Adjustments Applied:
// 1. PGT-A age independence (Fixed ~55% LBR for euploid)
// 2. Negative Binomial distribution for overdispersion of oocytes
// 3. Frailty Model (12% decay per failed transfer)
// 4. Event-driven dropout (no embryos / failed transfers)
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
        cyclesLabel: "予定する最大採卵回数",
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
        explanation: "この推定は、CDC/SART全米データに基づく「3,000人の仮想患者コホート」を用いた本格的な時間進行型モンテカルロ・シミュレーションによって算出されています。",
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
        logicIntro: "本ツールは、治療の進行に伴う「加齢」を月単位で計算し、胚の凍結保存や融解生存率まで再現する本格的な時間軸モンテカルロモデルを採用しています。",
        logicCycleTitle: "「1回の治療（サイクル）」の定義",
        logicCycleText: "「1回の採卵を行い、そこで得られた受精卵（凍結胚）をストックし、それを一つずつ融解してすべて移植し終えるまで」を1サイクルとし、その間も患者の年齢（月数）は進行します。手持ちの凍結胚を使い切っても妊娠に至らなかった場合にのみ「次の採卵」に進みます。",
        logicFactorsTitle: "各項目の影響と高度な確率モデル",
        logicFactorsText: "実際の臨床的リアリティを再現するため、①PGT-A正常胚移植時は年齢による低下をキャンセルした固定確率（約55%）を採用、②採卵数のばらつきをPCOSやPORを考慮した「負の二項分布」で再現、③移植が不成功に終わるたびに着床障害の可能性を考慮して次回の確率を割引（Frailtyモデル）、④失敗イベント直後に治療を諦めるイベント駆動型ドロップアウト、を組み込んでいます。",
        disclaimerTitle: "免責事項（必ずお読みください）",
        disclaimer1: "本ツールの結果は、大規模な統計データに基づく「確率的な推論（平均値）」であり、あなた個人の妊娠や出産を保証するものでは決してありません。",
        disclaimer2: "実際の不妊治療の成績は、精子の状態（男性因子）、子宮内の環境、過去の治療歴など、本ツールでは入力しきれない無数の個別要因によって大きく変動します。",
        disclaimer3: "具体的な治療方針や見通しについては、必ず主治医（生殖医療専門医）と直接ご相談ください。",
    },
    en: {
        title: "IVF Success Rate Simulator", subtitle: "Estimate cumulative live birth rates", disclaimer: "For educational purposes only. Always consult your physician.", ageLabel: "Age (years)", amhLabel: "AMH (ng/mL)", amhHelp: "From blood test results.", amhUnknown: "Unknown (estimate from age)", cyclesLabel: "Max planned egg retrievals", cycleUnit: "cycles", bmiLabel: "BMI", bmiNormal: "Normal (18.5-24.9)", bmiOver: "Overweight (25-29.9)", bmiObese: "Obese (30+)", smokingLabel: "Smoking", smokingNo: "No", smokingYes: "Yes", pgtLabel: "PGT-A (Preimplantation Testing)", pgtNo: "No", pgtYes: "Yes", resultTitle: "Simulation Results", cumulativeRate: "Cumulative LBR (est.)", perCycleRate: "Avg. LBR per Transfer", expectedEggs: "Expected Eggs (1st Cycle)", expectedBlasts: "Expected Blasts (1st Cycle)", eggsUnit: "eggs", explanation: "Powered by a Monte Carlo simulation tracking 3,000 virtual patients, dynamically advancing age by month.", calculate: "Calculate", reset: "Reset", chartLabel: "Cumulative LBR by Cycle", references: "References", ref1: "CDC/SART National Summary Report", ref2: "Human Reproduction", ref3: "Fertility & Sterility", bookCta: "Want to learn more?", bookCtaText: "A comprehensive guide covering age, fertility, AMH, and treatment options", bookCtaButton: "View the Book →", bookUrl: "https://www.amazon.co.jp/dp/B0F7XTWJ3X/", logicTitle: "Calculation Logic", logicIntro: "Advanced Monte Carlo simulation tracking monthly progression.", logicCycleTitle: "Definition of 'One Cycle'", logicCycleText: "Includes embryo banking, thawing survival, and age progression during transfers.", logicFactorsTitle: "Advanced Models", logicFactorsText: "Incorporates Negative Binomial overdispersion, Frailty Models, and Event-driven dropouts.", disclaimerTitle: "Important Disclaimer", disclaimer1: "Statistical estimates do NOT guarantee pregnancy.", disclaimer2: "Actual outcomes depend on countless factors.", disclaimer3: "Always consult your physician."
    },
};

// =====================================================================
// Evidence-based Statistical Functions
// =====================================================================

function mulberry32(seed: number) {
    let a = seed >>> 0;
    return function() {
        a |= 0; a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function randn(rng: () => number): number {
    let u = 0, v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function rgamma(alpha: number, rng: () => number): number {
    if (alpha < 1) {
        let u = 0; while (u === 0) u = rng();
        return rgamma(alpha + 1, rng) * Math.pow(u, 1 / alpha);
    }
    const d = alpha - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);
    while (true) {
        let x = randn(rng); let v = 1 + c * x;
        while (v <= 0) { x = randn(rng); v = 1 + c * x; }
        v = v * v * v; let u = 0; while (u === 0) u = rng();
        if (u < 1 - 0.0331 * x * x * x * x) return d * v;
        if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
    }
}

function rpoisson(lambda: number, rng: () => number): number {
    if (lambda <= 0) return 0;
    const L = Math.exp(-lambda);
    let k = 0, p = 1.0;
    do { k++; p *= rng(); } while (p > L);
    return k - 1;
}

// 【修正②】採卵数の「過分散（Overdispersion）」を負の二項分布で再現
function rnbinom(mu: number, dispersion: number, rng: () => number): number {
    if (mu <= 0) return 0;
    if (dispersion <= 0) return rpoisson(mu, rng);
    const shape = 1 / dispersion;
    const scale = mu * dispersion;
    const lambda = rgamma(shape, rng) * scale;
    return rpoisson(lambda, rng);
}

function rbinom(n: number, p: number, rng: () => number): number {
    let x = 0;
    for (let i = 0; i < n; i++) if (rng() < p) x++;
    return x;
}

function clamp(x: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, x)); }
function piecewiseLinear(x: number, pts: number[][]) {
    if (x <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) {
        if (x <= pts[i][0]) {
            const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
            const t = (x - x0) / (x1 - x0);
            return y0 + t * (y1 - y0);
        }
    }
    return pts[pts.length - 1][1];
}

// 元のHTML/JS版の精緻な年齢依存パラメータを復旧
const ageParams = {
    pMII: (age: number) => clamp(0.78 - Math.max(0, age - 38) * 0.012, 0.55, 0.88),
    pFertilization: (age: number) => clamp(0.72 - Math.max(0, age - 40) * 0.015, 0.50, 0.86),
    pBlast: (age: number) => clamp(piecewiseLinear(age, [[30,0.46],[35,0.43],[38,0.38],[41,0.32],[43,0.26],[45,0.20]]), 0.15, 0.60),
    pUsableFromBlast: (age: number) => clamp(piecewiseLinear(age, [[30,0.76],[35,0.72],[38,0.66],[41,0.60],[43,0.52],[45,0.44]]), 0.35, 0.85),
    pLBR_nonPGT: (age: number, kind: string) => {
        const v = clamp(piecewiseLinear(age, [[30,0.43],[35,0.40],[38,0.34],[41,0.26],[43,0.16],[45,0.08]]), 0.03, 0.60);
        return kind === 'fresh' ? v * 0.95 : v;
    },
    pEuploid: (age: number) => clamp(piecewiseLinear(age, [[30,0.60],[35,0.50],[38,0.35],[40,0.25],[42,0.15],[44,0.07],[45,0.04]]), 0.02, 0.75)
};

function expectedTotalOocytes(age: number, amh: number) {
    const penalty = Math.max(0, age - 35) * 0.75;
    return clamp((amh * 8) - penalty, 1, 40);
}

// =====================================================================
// Core Simulation Engine (True to Original simulateOnePatient)
// =====================================================================

interface PatientOptions {
    startAge: number; amh: number; maxCycles: number;
    pgt: boolean; lifestyleMultiplier: number;
}

// 元のHTML/JS版の「時間経過（ageMonths）をトラッキングする」シミュレーションを復旧
function simulateOnePatient(opts: PatientOptions, rng: () => number) {
    const { startAge, amh, maxCycles, pgt, lifestyleMultiplier } = opts;

    let m = 0; // 経過月
    let ageMonths = startAge * 12; // 年齢(月単位)
    let bank = 0; // 凍結胚ストック
    
    let retrievals = 0;
    let transfers = 0;
    let failedTransfers = 0; // Frailtyモデル用の失敗カウンタ
    
    let successCycle: number | null = null;
    let stoppedReason: string | null = null;
    let firstCycleEggs = 0;
    let firstCycleBlasts = 0;

    const maxAge = 46;
    const monthsPerRetrieval = pgt ? 2.5 : 1.5; 
    const monthsPerTransfer = pgt ? 2.0 : 1.0;
    const thawSurvival = 0.97;
    const transferCancelRate = 0.10;

    // 採卵ループ
    while (ageMonths < maxAge * 12 && retrievals < maxCycles) {
        retrievals++;
        m += monthsPerRetrieval; 
        ageMonths += monthsPerRetrieval;

        if (ageMonths >= maxAge * 12) { stoppedReason = 'age_limit'; break; }

        const age = ageMonths / 12;
        const lambda = expectedTotalOocytes(age, amh);
        
        // 【修正②】採卵数の過分散（PCOS / POR）を負の二項分布で再現 (dispersion=0.40)
        const totalOocytes = rnbinom(lambda, 0.40, rng);

        const mii = rbinom(totalOocytes, ageParams.pMII(age), rng);
        const fert = rbinom(mii, ageParams.pFertilization(age), rng);
        const blast = rbinom(fert, ageParams.pBlast(age), rng);

        if (retrievals === 1) {
            firstCycleEggs = totalOocytes;
            firstCycleBlasts = blast;
        }

        let usable = 0;
        if (pgt) {
            usable = rbinom(blast, ageParams.pEuploid(age), rng);
        } else {
            usable = rbinom(blast, ageParams.pUsableFromBlast(age), rng);
        }

        bank += usable; 

        // 【修正④】イベント駆動ドロップアウト：使える胚が0個だった場合の絶望離脱
        if (usable === 0) {
            if (rng() < 0.15) { stoppedReason = 'dropout_no_embryo'; break; }
        }

        // ストックした胚を一つずつ移植していくループ (時間の進行)
        while (bank > 0 && ageMonths < maxAge * 12) {
            m += monthsPerTransfer; 
            ageMonths += monthsPerTransfer;

            if (ageMonths >= maxAge * 12) { stoppedReason = 'age_limit'; break; }

            // 原本仕様の移植キャンセル（現実のスケジュール都合や内膜条件など）
            if (rng() < transferCancelRate) { continue; }

            // 原本仕様の凍結融解サバイバル
            bank -= 1;
            if (rng() >= thawSurvival) { continue; }

            transfers++;

            // 【修正①】PGT-A正常胚移植時の年齢依存キャンセル（約55%固定）
            let baseP = pgt ? 0.55 : ageParams.pLBR_nonPGT(ageMonths / 12, 'FET');
            baseP *= lifestyleMultiplier;

            // 【修正③】Frailty Model：着床障害等の隠れ要因による確率減衰（失敗ごとに12%低下）
            const actualP = clamp(baseP * Math.pow(0.88, failedTransfers), 0.01, 0.65);

            if (rng() < actualP) {
                successCycle = retrievals; // 妊娠した時の「採卵回数」を記録
                stoppedReason = 'target';
                break;
            } else {
                failedTransfers++;
                // 【修正④】イベント駆動ドロップアウト：移植陰性直後の絶望離脱
                if (rng() < 0.10) {
                    bank = 0; // 手持ちの胚を破棄して離脱
                    stoppedReason = 'dropout_failed_transfer';
                    break;
                }
            }
        }

        if (stoppedReason) break;
        
        // 胚を使い切って次の採卵に進む前に、10%は自然離脱する(原本仕様)
        if (bank === 0 && rng() < 0.10) { stoppedReason = 'dropout_exhausted'; break; }
    }

    return { successCycle, transfers, firstCycleEggs, firstCycleBlasts };
}

// 3,000人のコホートを回してReactのUI用に集計するラッパー関数
function runCohortMonteCarlo(startAge: number, amh: number, maxCycles: number, bmi: string, smoking: boolean, pgt: boolean) {
    const N = 3000;
    const rng = mulberry32(12345); // 計算の度にUIがブレないようシード固定
    
    let lifestyleMultiplier = 1.0;
    if (bmi === "over") lifestyleMultiplier *= 0.92;
    if (bmi === "obese") lifestyleMultiplier *= 0.82;
    if (smoking) lifestyleMultiplier *= 0.85;

    const opts: PatientOptions = {
        startAge, amh, maxCycles, pgt, lifestyleMultiplier
    };

    const successesByCycle = new Array(maxCycles).fill(0);
    const firstCycleEggsArr: number[] = [];
    const firstCycleBlastsArr: number[] = [];
    let totalTransfers = 0;
    let totalPregnancies = 0;

    for (let i = 0; i < N; i++) {
        const sim = simulateOnePatient(opts, rng);

        firstCycleEggsArr.push(sim.firstCycleEggs);
        firstCycleBlastsArr.push(sim.firstCycleBlasts);
        totalTransfers += sim.transfers;

        // 成功した場合、その「採卵回数」以降の累積配列をすべてインクリメント
        if (sim.successCycle !== null && sim.successCycle <= maxCycles) {
            totalPregnancies++;
            for (let c = sim.successCycle - 1; c < maxCycles; c++) {
                successesByCycle[c]++;
            }
        }
    }

    firstCycleEggsArr.sort((a, b) => a - b);
    firstCycleBlastsArr.sort((a, b) => a - b);
    const medianEggs = firstCycleEggsArr.length > 0 ? firstCycleEggsArr[Math.floor(N / 2)] : 0;
    const medianBlasts = firstCycleBlastsArr.length > 0 ? firstCycleBlastsArr[Math.floor(N / 2)] : 0;

    const byCycle = successesByCycle.map(hits => Math.round((hits / N) * 1000) / 10);
    const cumulative = byCycle[maxCycles - 1] || 0;
    const perCycleRate = totalTransfers > 0 ? Math.round((totalPregnancies / totalTransfers) * 1000) / 10 : 0;

    return { cumulative, perCycle: perCycleRate, expectedEggs: medianEggs, expectedBlasts: medianBlasts, byCycle };
}

function estimateAmh(age: number): number {
    if (age <= 25) return 4.5; if (age <= 30) return 3.5; if (age <= 33) return 2.8;
    if (age <= 35) return 2.2; if (age <= 37) return 1.7; if (age <= 39) return 1.2;
    if (age <= 41) return 0.8; if (age <= 43) return 0.5; return 0.3;
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
    const l = t[lang as keyof typeof t] || t.ja;

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
        // 復元された「時間軸ベース」の本格的モンテカルロエンジンを実行
        return runCohortMonteCarlo(age, effectiveAmh, cycles, bmi, smoking, pgt);
    }, [showResult, age, effectiveAmh, cycles, bmi, smoking, pgt]);

    const handleCalc = useCallback(() => setShowResult(true), []);
    const handleReset = useCallback(() => {
        setShowResult(false); setAge(32); setAmhKnown(false); setAmhValue(2.5);
        setCycles(3); setBmi("normal"); setSmoking(false); setPgt(false);
    }, []);

    return (
        <div className="w-full max-w-[680px] mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-wider uppercase">
                    🔬 {lang === "ja" ? "時間軸モンテカルロ・エンジン" : "Time-based Monte Carlo Engine"}
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
                                type="range" min={20} max={45} value={age}
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
                                type="range" min={1} max={6} value={cycles}
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
                                    type="checkbox" checked={amhKnown}
                                    onChange={(e) => { setAmhKnown(e.target.checked); setShowResult(false); }}
                                    className="accent-[var(--color-sage)] w-4 h-4"
                                />
                                {lang === "ja" ? "値を入力する" : "Enter value"}
                            </label>
                            {amhKnown ? (
                                <input
                                    type="number" min={0.1} max={15} step={0.1} value={amhValue}
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
                            value={bmi} onChange={(e) => { setBmi(e.target.value); setShowResult(false); }}
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

                    <BarChart data={result.byCycle} label={l.chartLabel} />

                    <p className="text-xs text-[var(--color-text-muted)] mt-6 leading-relaxed">
                        {l.explanation}
                    </p>

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

            {/* 💡 計算ロジック（アコーディオン） */}
            <div className="mt-8 mb-6">
                <details className="group bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden transition-all duration-300">
                    <summary className="flex items-center justify-between cursor-pointer p-5 text-sm font-bold text-[var(--color-text-dark)] hover:bg-slate-100 transition-colors focus:outline-none">
                        <span className="flex items-center gap-2">
                            <span className="text-[var(--color-sage)] text-lg">💡</span>
                            {l.logicTitle}
                        </span>
                        <span className="transition duration-300 group-open:-rotate-180 text-slate-400 text-xs">▼</span>
                    </summary>
                    <div className="px-5 pb-6 text-xs text-[var(--color-text-muted)] leading-relaxed space-y-5 border-t border-slate-200 pt-5 bg-white">
                        <p>{l.logicIntro}</p>
                        <div>
                            <h4 className="font-bold text-[var(--color-text-dark)] mb-1.5 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-sage)]"></span>{l.logicCycleTitle}
                            </h4>
                            <p>{l.logicCycleText}</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-[var(--color-text-dark)] mb-1.5 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-sage)]"></span>{l.logicFactorsTitle}
                            </h4>
                            <p>{l.logicFactorsText}</p>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    );
}
