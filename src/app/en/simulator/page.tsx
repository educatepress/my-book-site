import SimulatorClient from "@/components/common/simulator-client";

export const metadata = {
    title: "IVF Success Rate Simulator | Dr. Takuma Sato",
    description: "Enter your age and AMH to run a Monte Carlo simulation with a 3,000-patient virtual cohort. Estimate cumulative pregnancy probability and treatment timelines for IVF.",
};

export default function SimulatorPage() {
    return (
        <main className="min-h-screen bg-[var(--color-cream)]">
            <div className="py-16 md:py-24 px-6">
                <SimulatorClient lang="en" />
            </div>

            {/* Back to LP */}
            <div className="text-center pb-16">
                <a
                    href="/en"
                    className="text-sm font-bold text-[var(--color-sage)] hover:text-[var(--color-sage-dark)] transition-colors"
                >
                    ← Back to Home
                </a>
            </div>
        </main>
    );
}
