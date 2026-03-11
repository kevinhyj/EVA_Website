import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { DesignCase } from "@/components/design-case";
import { BiggestData } from "@/components/biggest-data";
import { LargestParameters } from "@/components/largest-parameters";
import { ZeroShotPrediction } from "@/components/zeroshot-prediction";
import { AccurateRnaModeling } from "@/components/accurate-rna-modeling";
import { MultiLevelDesign } from "@/components/multilevel-design";
import { OpeningBlackBox } from "@/components/opening-blackbox";
import { Team } from "@/components/team";
import { Contact } from "@/components/contact";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <div className="theme-light">
        <Features />
        <DesignCase />
        <BiggestData />
        <LargestParameters />
        <ZeroShotPrediction />
        <AccurateRnaModeling />
        <MultiLevelDesign />
        <OpeningBlackBox />
        <Team />
        <Contact />
      </div>
    </div>
  );
}
