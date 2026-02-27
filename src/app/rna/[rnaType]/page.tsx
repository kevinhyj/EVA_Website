import { notFound } from "next/navigation";
import { RNA_TYPES } from "@/data/rnaTypes";
import RNADesignPage from "@/components/rna-design-page";

interface PageProps {
  params: Promise<{ rnaType: string }>;
}

export function generateStaticParams() {
  return RNA_TYPES.map((rna) => ({ rnaType: rna.id }));
}

export async function generateMetadata({ params }: PageProps) {
  const { rnaType } = await params;
  const rna = RNA_TYPES.find((r) => r.id === rnaType);
  if (!rna) return { title: "Not Found — EVA" };
  return {
    title: `${rna.name} — EVA`,
    description: rna.desc,
  };
}

export default async function RNATypePage({ params }: PageProps) {
  const { rnaType } = await params;
  const rna = RNA_TYPES.find((r) => r.id === rnaType);
  if (!rna) notFound();
  return <RNADesignPage rnaType={rna} />;
}
