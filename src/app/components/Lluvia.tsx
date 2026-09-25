"use client";

import dynamic from "next/dynamic";

const LluviaGranos = dynamic(() => import("./three/LluviaGranos"), { ssr: false });

export default function Lluvia() {
  return <LluviaGranos />;
}
