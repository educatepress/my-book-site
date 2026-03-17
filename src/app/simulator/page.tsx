import ArtSimulator from "@/components/common/art-simulator";

export const metadata = {
    title: "IVF 成功率シミュレーター | 佐藤琢磨 生殖医療専門医",
    description: "年齢・AMH・BMI等のパラメータから、体外受精の累積出生率を推定するシミュレーターです。CDC/SARTデータに基づく教育目的のツールです。",
};

export default function SimulatorPageJp() {
    return (
        <main className="min-h-screen bg-[var(--color-cream)]">
            <div className="py-16 md:py-24 px-6">
                <ArtSimulator lang="ja" />
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
