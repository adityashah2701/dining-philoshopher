import { notFound } from "next/navigation";
import { Level1 } from "@/components/levels/Level1";
import { Level2 } from "@/components/levels/Level2";
import { Level3 } from "@/components/levels/Level3";

const SCREENS = { "1": Level1, "2": Level2, "3": Level3 } as const;

export function generateStaticParams() {
  return Object.keys(SCREENS).map((level) => ({ level }));
}

export default async function LevelPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const Screen = SCREENS[level as keyof typeof SCREENS];
  if (!Screen) notFound();
  return <Screen />;
}
