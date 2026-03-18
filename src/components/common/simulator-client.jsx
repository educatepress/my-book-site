"use client";

import dynamic from "next/dynamic";

const ArtSimulator = dynamic(
    () => import("@/components/common/art-simulator"),
    { ssr: false, loading: () => <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c8599', fontSize: 14 }}>シミュレーターを読み込み中...</div> }
);

export default function SimulatorClient({ lang = "ja" }) {
    return <ArtSimulator lang={lang} />;
}
