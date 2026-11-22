import { redirect } from "next/navigation";

const SLUG_MAP: Record<string, string> = {
  "hospital-supplies": "consumables",
  "hospital-equipment": "icu-critical-care",
  "equipment": "icu-critical-care",
  "supplies": "consumables",
  "consumables": "consumables",
  "icu": "icu-critical-care",
  "icu-critical-care": "icu-critical-care",
  "imaging": "diagnostic-imaging",
  "diagnostic-imaging": "diagnostic-imaging",
  "dental": "dental",
  "operating-theater": "operating-theater",
  "ot": "operating-theater",
  "furniture": "hospital-furniture",
  "hospital-furniture": "hospital-furniture",
  "cardiology": "cardiology-pulmonology",
  "cardiology-pulmonology": "cardiology-pulmonology",
  "labs": "laboratory-pathology",
  "laboratory-pathology": "laboratory-pathology",
  "refurbished": "refurbished-devices",
  "refurbished-devices": "refurbished-devices",
  "orthopedics": "orthopedics",
  "physiotherapy-rehab": "physiotherapy-rehab",
  "sterilization-infection": "sterilization-infection",
  "clearance": "clearance",
};

export default async function MarketplaceSubCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const mapped = SLUG_MAP[category.toLowerCase()] || category;
  redirect(`/marketplace?category=${mapped}`);
}
