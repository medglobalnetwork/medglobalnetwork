// ============================================================
// MGN Healthcare Marketplace System — TypeScript Types
// modules/marketplace/types.ts
// Medical Equipment Online – Buy Hospital & Diagnostic Supplies
// WCAG 2.2 AA Accessible, Token-driven, High-density E-commerce B2B
// Medikabazaar-grade B2B Architecture + MedGlobalNetwork Brand Design
// ============================================================

export type EquipmentCategorySlug =
  | "all"
  | "consumables"
  | "diagnostic-imaging"
  | "icu-critical-care"
  | "operating-theater"
  | "hospital-furniture"
  | "laboratory-pathology"
  | "cardiology-pulmonology"
  | "dental"
  | "orthopedics"
  | "physiotherapy-rehab"
  | "sterilization-infection"
  | "refurbished-devices"
  | "clearance";

export interface EquipmentCategory {
  id: EquipmentCategorySlug;
  name: string;
  shortName: string;
  description: string;
  itemCount: number;
  iconName: string;
  popularSubcategories: string[];
}

export type EquipmentCertification =
  | "CDSCO Approved"
  | "CE Marked"
  | "ISO 13485"
  | "US FDA Cleared"
  | "AERB Approved"
  | "BIS Certified";

export type DeviceCondition =
  | "Brand New"
  | "OEM Refurbished (Grade A)"
  | "Certified Pre-Owned";

export interface BulkPriceTier {
  minQty: number;
  maxQty?: number;
  pricePerUnit: number;
  savingsPercentage: number;
}

export interface VerifiedSupplier {
  id: string;
  name: string;
  companyType: "OEM Manufacturer" | "Authorized National Distributor" | "Certified Importer" | "Regional Dealer";
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  verifiedBadge: "MGN Gold Verified" | "OEM Direct" | "GST & CDSCO Verified";
  establishedYear: number;
  responseRatePercent: number;
  responseTimeText: string;
  gstNumber: string;
  cdscoRegistration: string;
  hospitalClientsServed: number;
  totalOrdersDelivered: number;
  phone: string;
  email: string;
}

export interface MarketplaceProduct {
  id: string;
  slug: string;
  name: string;
  imageUrl?: string;
  images?: string[];
  brand: string;
  modelNumber: string;
  category: EquipmentCategorySlug;
  categoryName: string;
  subcategory: string;
  itemType?: "equipment" | "consumable";
  packSize?: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  originalPrice?: number;
  priceDisplayUnit: string; // e.g. "per unit", "per set", "per box", "per pack of 100"
  institutionalPricingAvailable: boolean;
  bulkPricing: BulkPriceTier[];
  minOrderQuantity: number;
  inStock: boolean;
  stockCount: number;
  leadTimeDays: number;
  condition: DeviceCondition;
  certifications: EquipmentCertification[];
  warrantyMonths: number;
  amcAvailable: boolean; // Annual Maintenance Contract
  cmcAvailable: boolean; // Comprehensive Maintenance Contract
  installationIncluded: boolean;
  trainingIncluded: boolean;
  rating: number;
  reviewCount: number;
  featured: boolean;
  bestSeller?: boolean;

  // Medikabazaar Group Buying ("Buy together. Pay less.")
  isGroupBuyingEligible?: boolean;
  groupPrice?: number;
  groupInterestedCount?: number;
  groupTargetQty?: number;
  groupDiscountPercent?: number;

  keySpecs: Record<string, string>;
  standardAccessories: string[];
  powerRequirements: string;
  dimensionsWeight: string;
  supplier: VerifiedSupplier;
  catalogPdfUrl?: string;
}

export interface TopBrand {
  id: string;
  name: string;
  country: string;
  productCount: number;
  category: string;
  popularProduct: string;
  badge?: string;
}

export interface ExploreDepartment {
  id: string;
  name: string;
  shortName: string;
  description: string;
  categorySlug: EquipmentCategorySlug;
  iconName: string;
  imageUrl?: string;
  itemCount: number;
  highlightBadge?: string;
}

export interface BannerPromotion {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  badge: string;
  discountText: string;
  ctaText: string;
  imageUrl?: string;
  filterCategory?: EquipmentCategorySlug;
  filterItemType?: "all" | "equipment" | "consumable" | "group-buying" | "refurbished";
  accentColor: string;
}

export interface QuickOrderItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  packSize?: string;
}

export interface RfqFormData {
  productId?: string;
  productName: string;
  category: string;
  quantity: number;
  quantityUnit: "Units" | "Sets" | "Hospital Package" | "Tender Lot" | "Cartons / Packs";
  urgency: "Immediate (< 48 hrs)" | "Within 15 Days" | "Within 30 Days" | "Budgetary / Project Planning";
  procurementType: "Hospital Purchase" | "Clinic / OPD Setup" | "Diagnostic Lab" | "Tender / Institutional" | "Replacement";
  destinationCity: string;
  pincode: string;
  hospitalName: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  additionalNotes: string;
  requireFinancing: boolean;
  requireLiveDemo: boolean;
  requireAMC: boolean;
}

export interface RfqSubmissionResult {
  rfqId: string;
  timestamp: string;
  matchedSuppliersCount: number;
  status: "Broadcasting to Verified Suppliers" | "Quotes Received" | "Review Pending";
  estimatedFirstQuoteHours: number;
  summary: RfqFormData;
}

export interface FilterState {
  searchQuery: string;
  category: EquipmentCategorySlug;
  subcategory: string;
  selectedCity: string;
  priceRange: "all" | "under-50k" | "50k-200k" | "200k-1000k" | "above-1000k";
  certifications: EquipmentCertification[];
  inStockOnly: boolean;
  verifiedSupplierOnly: boolean;
  condition: "all" | DeviceCondition;
  sortBy: "featured" | "price-asc" | "price-desc" | "rating" | "fastest-delivery";
  viewMode: "grid" | "list";
  // Medikabazaar enhancements
  brand?: string;
  itemType?: "all" | "equipment" | "consumable" | "group-buying" | "refurbished";
}
