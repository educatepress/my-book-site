import SimulatorClient from "@/components/common/simulator-client";

export const metadata = {
    title: "IVF Success Rate Simulator | Dr. Takuma Sato",
    description: "Estimate your cumulative IVF live birth rate based on age, AMH, BMI, and other clinical parameters. Built on CDC/SART data for educational purposes.",
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
