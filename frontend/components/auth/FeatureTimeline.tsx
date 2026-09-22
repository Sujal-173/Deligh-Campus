import { FEATURES } from "@/data/features";
import FeatureCard from "./FeatureCard";

export default function FeatureTimeline() {
  return (
    <ul className="mt-9 space-y-4">
      {FEATURES.map((feature) => (
        <FeatureCard key={feature.title} {...feature} />
      ))}
    </ul>
  );
}
