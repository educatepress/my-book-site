import SimulatorClient from "@/components/common/simulator-client";

export const metadata = {
    title: "ART妊活シミュレーター | 佐藤琢磨 生殖医療専門医",
    description: "年齢とAMHを入力するだけで、モンテカルロ法による3,000人の仮想コホートシミュレーションを実行。体外受精の累積妊娠確率と治療期間を推定します。",
};

export default function SimulatorPageJp() {
    return (
        <main className="min-h-screen bg-[var(--color-cream)]">
            <div className="py-16 md:py-24 px-6">
                <SimulatorClient lang="ja" />
            </div>

            {/* LPへ戻る */}
            <div className="text-center pb-16">
                <a
                    href="/"
                    className="text-sm font-bold text-[var(--color-sage)] hover:text-[var(--color-sage-dark)] transition-colors"
                >
                    ← ホームに戻る
                </a>
            </div>
        </main>
    );
}
