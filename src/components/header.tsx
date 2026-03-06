"use client";

import { useEffect, useState } from "react";
import Button from "@/components/button";
import Text from "@/components/text";
import Container from "@/components/container";
import Row from "@/components/row";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? "bg-surface/75 backdrop-blur-lg shadow-elevation-1 py-2 border-b border-outline-variant"
                    : "bg-transparent py-4"
                }`}
        >
            <Container className="max-w-screen-xl relative">
                <Row className="justify-between items-center w-full">
                    {/* Logo / Title Area */}
                    <Link href="/" className="flex items-center gap-s no-underline hover:opacity-80 transition-opacity">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-elevation-1 border-2 border-surface">
                            <Image src="/250403kz_0002.JPG" alt="佐藤琢磨" fill className="object-cover" />
                        </div>
                        <div className="hidden sm:block">
                            <Text fontClass="label" className="text-on-surface-variant font-bold m-0 leading-tight">生殖医療専門医</Text>
                            <Text fontClass="body" className="text-primary font-bold m-0 leading-tight">佐藤 琢磨</Text>
                        </div>
                    </Link>

                    {/* Action Area */}
                    <Row className="gap-xs sm:gap-s items-center">
                        {/* Lang Toggle */}
                        <div className="flex bg-surface-variant/40 p-1 rounded-full backdrop-blur-sm border border-outline-variant/50">
                            <Link href="/">
                                <Button variant={pathname === "/" ? "fill" : "text"} size="sm" label="JP" className={pathname === "/" ? "rounded-full shadow-sm" : "rounded-full opacity-60 hover:opacity-100"} />
                            </Link>
                            <Link href="/book-landing-en.html">
                                <Button variant="text" size="sm" label="EN" className="rounded-full opacity-60 hover:opacity-100" />
                            </Link>
                        </div>
                        <a href="https://amzn.to/3X0yF3v" target="_blank" rel="noopener noreferrer" className="ml-xs">
                            <Button variant="fill" size="md" label="Amazonで購入" className="hidden sm:inline-flex bg-[#FFA41C] hover:bg-[#FFB74D] text-black border-none shadow-elevation-2" />
                            <Button variant="fill" size="sm" label="購入" className="sm:hidden bg-[#FFA41C] hover:bg-[#FFB74D] text-black border-none" />
                        </a>
                    </Row>
                </Row>
            </Container>
        </header>
    );
}
