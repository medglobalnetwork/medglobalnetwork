"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  SlidersHorizontal,
  X,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  PackageSearch,
  Zap,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  MARKETPLACE_PRODUCTS,
  PRICE_RANGES,
  EQUIPMENT_CATEGORIES,
} from "@/modules/marketplace/data";
import {
  EquipmentCategorySlug,
  FilterState,
  MarketplaceProduct,
  VerifiedSupplier,
} from "@/modules/marketplace/types";
import { MarketplaceHeader } from "@/modules/marketplace/components/MarketplaceHeader";
import { MarketplaceDepartmentGrid } from "@/modules/marketplace/components/MarketplaceDepartmentGrid";
import { MarketplaceCategoryBar } from "@/modules/marketplace/components/MarketplaceCategoryBar";
import { MarketplaceFilters } from "@/modules/marketplace/components/MarketplaceFilters";
import { MarketplaceProductCard } from "@/modules/marketplace/components/MarketplaceProductCard";
import { MarketplaceProductListItem } from "@/modules/marketplace/components/MarketplaceProductListItem";
import { MarketplaceHeroBanners } from "@/modules/marketplace/components/MarketplaceHeroBanners";
import { MarketplaceDepartmentRail } from "@/modules/marketplace/components/MarketplaceDepartmentRail";
import { GroupBuyingSection } from "@/modules/marketplace/components/GroupBuyingSection";
import { GroupBuyingInterestModal } from "@/modules/marketplace/components/GroupBuyingInterestModal";
import { TopBrandsSection } from "@/modules/marketplace/components/TopBrandsSection";
import { QuickOrderModal } from "@/modules/marketplace/components/QuickOrderModal";
import { PincodeDeliveryModal } from "@/modules/marketplace/components/PincodeDeliveryModal";
import { RfqModal } from "@/modules/marketplace/components/RfqModal";
import { ProductDetailModal } from "@/modules/marketplace/components/ProductDetailModal";
import { CompareModal } from "@/modules/marketplace/components/CompareModal";
import { VerifiedSuppliersSection } from "@/modules/marketplace/components/VerifiedSuppliersSection";
import { DesignSystemGuideModal } from "@/modules/marketplace/components/DesignSystemGuideModal";

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();

  const urlCategory = (searchParams?.get("category") as EquipmentCategorySlug) || "all";
  const urlItemType = (searchParams?.get("itemType") as FilterState["itemType"]) || "all";
  const urlSearch = searchParams?.get("search") || "";

  // Filter State
  const [filters, setFilters] = React.useState<FilterState>({
    searchQuery: urlSearch,
    category: urlCategory,
    subcategory: "",
    selectedCity: "All India",
    priceRange: "all",
    certifications: [],
    inStockOnly: false,
    verifiedSupplierOnly: false,
    condition: "all",
    sortBy: "featured",
    viewMode: "grid",
    brand: undefined,
    itemType: urlItemType,
  });

  // Keep state in sync if URL searchParams changes externally
  React.useEffect(() => {
    const cat = (searchParams?.get("category") as EquipmentCategorySlug) || "all";
    if (cat !== filters.category) {
      setFilters((prev) => ({ ...prev, category: cat, subcategory: "" }));
    }
  }, [searchParams]);

  // Delivery Pincode State (Medikabazaar header feature)
  const [deliveryPincode, setDeliveryPincode] = React.useState("110001");
  const [deliveryCity, setDeliveryCity] = React.useState("New Delhi");
  const [isPincodeModalOpen, setIsPincodeModalOpen] = React.useState(false);

  // Modals & Drawers state
  const [isRfqModalOpen, setIsRfqModalOpen] = React.useState(false);
  const [selectedRfqProduct, setSelectedRfqProduct] = React.useState<MarketplaceProduct | null>(null);

  const [isQuickOrderModalOpen, setIsQuickOrderModalOpen] = React.useState(false);
  const [selectedQuickOrderProduct, setSelectedQuickOrderProduct] = React.useState<MarketplaceProduct | null>(null);

  const [isGroupBuyModalOpen, setIsGroupBuyModalOpen] = React.useState(false);
  const [selectedGroupProduct, setSelectedGroupProduct] = React.useState<MarketplaceProduct | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [selectedDetailProduct, setSelectedDetailProduct] = React.useState<MarketplaceProduct | null>(null);

  const [isDsGuideModalOpen, setIsDsGuideModalOpen] = React.useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);

  // Compare List state (up to 4 products)
  const [compareList, setCompareList] = React.useState<MarketplaceProduct[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = React.useState(false);

  // Filter handlers with URL sync
  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters((prev) => {
      const next = { ...prev, ...updates };
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (next.category && next.category !== "all") {
          url.searchParams.set("category", next.category);
        } else {
          url.searchParams.delete("category");
        }
        if (next.itemType && next.itemType !== "all") {
          url.searchParams.set("itemType", next.itemType);
        } else {
          url.searchParams.delete("itemType");
        }
        if (next.searchQuery) {
          url.searchParams.set("search", next.searchQuery);
        } else {
          url.searchParams.delete("search");
        }
        window.history.replaceState({}, "", url.toString());
      }
      return next;
    });
  };

  const handleResetCategory = () => {
    handleFilterChange({ category: "all", subcategory: "" });
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: "",
      category: "all",
      subcategory: "",
      selectedCity: "All India",
      priceRange: "all",
      certifications: [],
      inStockOnly: false,
      verifiedSupplierOnly: false,
      condition: "all",
      sortBy: "featured",
      viewMode: "grid",
      brand: undefined,
      itemType: "all",
    });
  };

  // Compare toggle
  const handleToggleCompare = (product: MarketplaceProduct) => {
    setCompareList((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), product];
      }
      return [...prev, product];
    });
  };

  const handleRemoveCompareProduct = (id: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== id));
  };

  // RFQ trigger handlers
  const handleOpenRfqForProduct = (product: MarketplaceProduct) => {
    setSelectedRfqProduct(product);
    setIsRfqModalOpen(true);
  };

  const handleOpenGeneralRfq = () => {
    setSelectedRfqProduct(null);
    setIsRfqModalOpen(true);
  };

  const handleDirectSupplierInquiry = (supplier: VerifiedSupplier) => {
    const firstSupplierProduct = MARKETPLACE_PRODUCTS.find((p) => p.supplier.id === supplier.id);
    setSelectedRfqProduct(firstSupplierProduct || null);
    setIsRfqModalOpen(true);
  };

  const handleQuickView = (product: MarketplaceProduct) => {
    setSelectedDetailProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleJoinGroupPool = (product: MarketplaceProduct) => {
    setSelectedGroupProduct(product);
    setIsGroupBuyModalOpen(true);
  };

  const handleOpenQuickOrderForProduct = (product: MarketplaceProduct) => {
    setSelectedQuickOrderProduct(product);
    setIsQuickOrderModalOpen(true);
  };

  const handleOpenGeneralQuickOrder = () => {
    setSelectedQuickOrderProduct(null);
    setIsQuickOrderModalOpen(true);
  };

  // Filtering Logic
  const filteredProducts = React.useMemo(() => {
    return MARKETPLACE_PRODUCTS.filter((product) => {
      // 1. Search Query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesBrand = product.brand.toLowerCase().includes(query);
        const matchesModel = product.modelNumber.toLowerCase().includes(query);
        const matchesCategory = product.categoryName.toLowerCase().includes(query);
        const matchesSubcategory = product.subcategory.toLowerCase().includes(query);
        const matchesSpecs = Object.values(product.keySpecs).some((v) =>
          v.toLowerCase().includes(query)
        );

        if (!matchesName && !matchesBrand && !matchesModel && !matchesCategory && !matchesSubcategory && !matchesSpecs) {
          return false;
        }
      }

      // 2. Category
      if (filters.category !== "all" && product.category !== filters.category) {
        return false;
      }

      // 3. Subcategory
      if (filters.subcategory && product.subcategory !== filters.subcategory) {
        return false;
      }

      // 4. Brand filter (Medikabazaar feature with robust prefix/match)
      if (filters.brand) {
        const targetBrand = filters.brand.toLowerCase();
        const productBrand = product.brand.toLowerCase();
        if (
          productBrand !== targetBrand &&
          !productBrand.startsWith(targetBrand) &&
          !targetBrand.startsWith(productBrand)
        ) {
          return false;
        }
      }

      // 5. Item Type filter
      if (filters.itemType && filters.itemType !== "all") {
        const isConsumable = product.itemType === "consumable" || product.category === "consumables";
        if (filters.itemType === "equipment" && isConsumable) return false;
        if (filters.itemType === "consumable" && !isConsumable) return false;
        if (filters.itemType === "group-buying" && !product.isGroupBuyingEligible) return false;
        if (
          filters.itemType === "refurbished" &&
          product.category !== "refurbished-devices" &&
          product.condition !== "OEM Refurbished (Grade A)"
        ) {
          return false;
        }
      }

      // 6. City / Location (IndiaMART model)
      if (filters.selectedCity !== "All India") {
        const supplierCity = product.supplier.city.toLowerCase();
        const supplierState = product.supplier.state.toLowerCase();
        const targetCity = filters.selectedCity.toLowerCase();
        if (!supplierCity.includes(targetCity) && !supplierState.includes(targetCity)) {
          return false;
        }
      }

      // 7. Price Range
      if (filters.priceRange !== "all") {
        const rangeConfig = PRICE_RANGES.find((r) => r.id === filters.priceRange);
        if (rangeConfig && rangeConfig.min !== undefined && rangeConfig.max !== undefined) {
          if (product.price < rangeConfig.min || product.price > rangeConfig.max) {
            return false;
          }
        }
      }

      // 8. Regulatory Certifications
      if (filters.certifications.length > 0) {
        const hasAllCertifications = filters.certifications.every((cert) =>
          product.certifications.includes(cert)
        );
        if (!hasAllCertifications) return false;
      }

      // 9. In Stock Only
      if (filters.inStockOnly && !product.inStock) {
        return false;
      }

      // 10. Verified Supplier Only
      if (filters.verifiedSupplierOnly && !product.supplier.verifiedBadge) {
        return false;
      }

      // 11. Condition
      if (filters.condition !== "all" && product.condition !== filters.condition) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === "price-asc") return a.price - b.price;
      if (filters.sortBy === "price-desc") return b.price - a.price;
      if (filters.sortBy === "rating") return b.rating - a.rating;
      if (filters.sortBy === "fastest-delivery") return a.leadTimeDays - b.leadTimeDays;
      // "featured": bestsellers and featured first
      if (a.bestSeller && !b.bestSeller) return -1;
      if (!a.bestSeller && b.bestSeller) return 1;
      return 0;
    });
  }, [filters]);

  if (isPending) {
    return <main className="min-h-dvh bg-white dark:bg-[#0d1117]" />;
  }

  return (
    <main className="min-h-dvh bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] pb-32">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        
        {/* Marketplace Header with Pincode delivery, Search, and Quick Order */}
        <MarketplaceHeader
          filters={filters}
          onFilterChange={handleFilterChange}
          onOpenRfqModal={handleOpenGeneralRfq}
          onOpenDsGuideModal={() => setIsDsGuideModalOpen(true)}
          onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
          totalProductsCount={filteredProducts.length}
          onOpenQuickOrderModal={handleOpenGeneralQuickOrder}
          onOpenPincodeModal={() => setIsPincodeModalOpen(true)}
          onResetCategory={handleResetCategory}
          selectedPincode={deliveryPincode}
          selectedCity={deliveryCity}
        />

        {/* Hero Promotional Carousel (Medikabazaar B2B Campaigns) */}
        <MarketplaceHeroBanners
          onFilterChange={handleFilterChange}
          onOpenRfqModal={handleOpenGeneralRfq}
        />

        {/* When on the main Marketplace Hub (all categories), showcase the visual departments grid */}
        {filters.category === "all" && !filters.searchQuery && (
          <MarketplaceDepartmentGrid
            activeCategory={filters.category}
            onSelectCategory={(cat) => handleFilterChange({ category: cat, subcategory: "" })}
          />
        )}

        {/* Category & Subcategory Navigation Bar */}
        <MarketplaceCategoryBar
          activeCategory={filters.category}
          activeSubcategory={filters.subcategory}
          onSelectCategory={(catId) => handleFilterChange({ category: catId })}
          onSelectSubcategory={(subcat) => handleFilterChange({ subcategory: subcat })}
        />

        {/* Catalog Main Layout (Sidebar Explore + Filters + Products Grid/List) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start pt-2">
          
          {/* Desktop Left Rail (1 Col): Explore Department Rail + Detailed Filters */}
          <div className="hidden lg:flex lg:flex-col gap-6 lg:col-span-1">
            <MarketplaceDepartmentRail
              activeCategory={filters.category}
              onSelectCategory={(cat) => handleFilterChange({ category: cat, subcategory: "" })}
              onSupplierJoin={() => router.push("/opportunities")}
            />

            <MarketplaceFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Product Catalog Display (3 Cols) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Medikabazaar Hallmark: Group Buying Showcase ("Buy together. Pay less.") */}
            <GroupBuyingSection
              onJoinPool={handleJoinGroupPool}
              onQuickView={handleQuickView}
            />

            {/* Top Medical Brands Showcase with direct 1-click brand filtering */}
            <TopBrandsSection
              selectedBrand={filters.brand}
              onSelectBrand={(brand) => handleFilterChange({ brand })}
              onClearBrand={() => handleFilterChange({ brand: undefined })}
            />

            {/* Product Catalog Heading & Count */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <h3 className="text-base font-extrabold text-[#171717] dark:text-[#f0f6fc]">
                  {filters.category === "all"
                    ? "All Medical Supplies & Equipment"
                    : (EQUIPMENT_CATEGORIES.find((c) => c.id === filters.category)?.name || filters.category)}
                </h3>
                <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                  Showing {filteredProducts.length} verified hospital listings with GST input credit
                </p>
              </div>

              {/* Quick Reset if filters active */}
              {(filters.category !== "all" ||
                !!filters.subcategory ||
                !!filters.brand ||
                !!filters.searchQuery ||
                (filters.itemType && filters.itemType !== "all") ||
                filters.priceRange !== "all" ||
                filters.certifications.length > 0 ||
                filters.inStockOnly ||
                filters.verifiedSupplierOnly ||
                filters.condition !== "all" ||
                filters.selectedCity !== "All India") && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-[#0f4c81] dark:text-[#388bfd] hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Products Display */}
            {filteredProducts.length === 0 ? (
              /* Empty Search / Filter State */
              <div className="rounded-2xl border border-[#e8e6e3] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-10 text-center space-y-4">
                <div className="flex size-14 items-center justify-center rounded-full bg-[#faf9f8] dark:bg-[#0d1117] text-[#77716b] dark:text-[#8b949e] mx-auto">
                  <PackageSearch className="size-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                    No Medical Supplies Match Your Criteria
                  </h3>
                  <p className="text-xs text-[#5d5854] dark:text-[#8b949e] max-w-md mx-auto">
                    Try clearing the brand filter, resetting price tiers, or broadcasting a custom procurement RFQ to our nationwide verified supplier network.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="rounded-xl border border-[#ded8d1] dark:border-[#30363d] px-4 py-2 text-xs font-semibold hover:bg-[#faf9f8] dark:hover:bg-[#21262d] transition"
                  >
                    Reset All Filters
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenGeneralRfq}
                    className="rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] text-white px-5 py-2 text-xs font-bold shadow-xs hover:bg-[#0c3c66] transition"
                  >
                    Post Custom Requirement RFQ
                  </button>
                </div>
              </div>
            ) : filters.viewMode === "grid" ? (
              /* Grid View */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <MarketplaceProductCard
                    key={product.id}
                    product={product}
                    onOpenRfq={handleOpenRfqForProduct}
                    onQuickView={handleQuickView}
                    onToggleCompare={handleToggleCompare}
                    isCompared={compareList.some((p) => p.id === product.id)}
                    onJoinGroupPool={handleJoinGroupPool}
                    onAddToQuickOrder={handleOpenQuickOrderForProduct}
                  />
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <MarketplaceProductListItem
                    key={product.id}
                    product={product}
                    onOpenRfq={handleOpenRfqForProduct}
                    onQuickView={handleQuickView}
                    onToggleCompare={handleToggleCompare}
                    isCompared={compareList.some((p) => p.id === product.id)}
                    onJoinGroupPool={handleJoinGroupPool}
                    onAddToQuickOrder={handleOpenQuickOrderForProduct}
                  />
                ))}
              </div>
            )}

            {/* Featured Verified Suppliers Section */}
            <VerifiedSuppliersSection onDirectInquiry={handleDirectSupplierInquiry} />

            {/* Institutional Tender Notice Banner */}
            <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-gradient-to-r from-white to-[#f4f7fb] dark:from-[#161b22] dark:to-[#0d1117] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f4c81] dark:text-[#388bfd]">
                  <ShieldCheck className="size-4" />
                  <span>Are you an authorized medical equipment OEM or certified distributor?</span>
                </div>
                <p className="text-xs text-[#5d5854] dark:text-[#8b949e] max-w-xl">
                  List your CDSCO and CE-certified clinical devices on MedGlobalNetwork to receive verified institutional RFQs from top hospitals, nursing homes, and diagnostic chains across India.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/opportunities")}
                className="shrink-0 rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] text-white px-5 py-2.5 text-xs font-bold hover:bg-[#0c3c66] transition active:scale-95 whitespace-nowrap"
              >
                Join Supplier Network →
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Floating Compare Tray (when 1+ items selected) */}
      {compareList.length > 0 && (
        <div
          role="region"
          aria-label="Product Comparison Tray"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <Scale className="size-4 text-[#0f4c81] dark:text-[#388bfd]" />
              <span className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">
                Compare Equipment ({compareList.length}/4)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCompareList([])}
              className="text-[11px] font-semibold text-[#77716b] dark:text-[#8b949e] hover:text-[#171717] dark:hover:text-white"
            >
              Clear All
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-3 scrollbar-none">
            {compareList.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-1.5 rounded-lg border border-[#e8e6e3] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] px-2 py-1 text-[11px] shrink-0"
              >
                <span className="font-semibold text-[#171717] dark:text-[#f0f6fc] truncate max-w-[120px]">
                  {p.name}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveCompareProduct(p.id)}
                  aria-label={`Remove ${p.name}`}
                  className="text-[#77716b] hover:text-red-500"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            disabled={compareList.length < 2}
            onClick={() => setIsCompareModalOpen(true)}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] hover:bg-[#0c3c66] dark:hover:bg-[#2075e8] text-white py-2 px-3 text-xs font-bold shadow-xs transition disabled:opacity-50"
          >
            <span>{compareList.length < 2 ? "Select at least 2 to compare" : "Compare Specifications Side-by-Side"}</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      )}

      {/* Mobile Filter Sheet Modal */}
      {isMobileFiltersOpen && (
        <MarketplaceFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          isMobileModal={true}
          onCloseMobileModal={() => setIsMobileFiltersOpen(false)}
        />
      )}

      {/* Rapid Multi-SKU Quick Order Pad Modal */}
      <QuickOrderModal
        isOpen={isQuickOrderModalOpen}
        onClose={() => setIsQuickOrderModalOpen(false)}
        userSession={session?.user}
        preselectedProduct={selectedQuickOrderProduct}
      />

      {/* Group Buying Interest & Allocation Modal */}
      <GroupBuyingInterestModal
        isOpen={isGroupBuyModalOpen}
        onClose={() => setIsGroupBuyModalOpen(false)}
        product={selectedGroupProduct}
      />

      {/* Pincode & Transit Estimator Modal */}
      <PincodeDeliveryModal
        isOpen={isPincodeModalOpen}
        onClose={() => setIsPincodeModalOpen(false)}
        currentPincode={deliveryPincode}
        currentCity={deliveryCity}
        onSelectPincode={(pin, city) => {
          setDeliveryPincode(pin);
          setDeliveryCity(city);
        }}
      />

      {/* RFQ / Price Quotation Modal */}
      <RfqModal
        isOpen={isRfqModalOpen}
        onClose={() => setIsRfqModalOpen(false)}
        preselectedProduct={selectedRfqProduct}
        userSession={session?.user}
      />

      {/* Full Technical Specification Detail Modal */}
      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        product={selectedDetailProduct}
        onOpenRfq={handleOpenRfqForProduct}
        onJoinGroupPool={handleJoinGroupPool}
        onAddToQuickOrder={handleOpenQuickOrderForProduct}
      />

      {/* Compare Side-by-Side Modal */}
      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        products={compareList}
        onRemoveProduct={handleRemoveCompareProduct}
        onOpenRfq={handleOpenRfqForProduct}
      />

      {/* Token-Driven Design System Guidance Modal */}
      <DesignSystemGuideModal
        isOpen={isDsGuideModalOpen}
        onClose={() => setIsDsGuideModalOpen(false)}
      />

    </main>
  );
}

export default function MarketplacePage() {
  return (
    <React.Suspense fallback={<main className="min-h-dvh bg-[#faf9f8] dark:bg-[#0d1117]" />}>
      <MarketplaceContent />
    </React.Suspense>
  );
}

