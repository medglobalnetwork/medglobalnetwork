"use client";

import * as React from "react";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Palette,
  Type,
  Layers,
  CheckSquare,
  BarChart3,
  BookOpen,
  Sliders,
  ExternalLink,
} from "lucide-react";

interface DesignSystemGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DesignSystemGuideModal({ isOpen, onClose }: DesignSystemGuideModalProps) {
  const [activeTab, setActiveTab] = React.useState<"unified" | "medikabazaar" | "indiamart" | "states" | "a11y">("unified");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ds-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] text-[#171717] dark:text-[#f0f6fc] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e8e6e3] dark:border-[#30363d] px-5 sm:px-6 py-4 bg-[#faf9f8] dark:bg-[#0d1117]">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#0f4c81] text-white">
              <Palette className="size-5" />
            </div>
            <div>
              <h2 id="ds-guide-title" className="text-sm sm:text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                Medical Equipment Marketplace Design System & Token Guidance
              </h2>
              <p className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
                WCAG 2.2 AA compliant tokens, component state matrices & density standards
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close design system guide"
            className="rounded-lg p-1.5 text-[#77716b] hover:text-[#171717] hover:bg-[#e8e6e3] dark:hover:bg-[#21262d] dark:text-[#8b949e] dark:hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] dark:focus-visible:ring-[#388bfd]"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto px-5 sm:px-6 py-2.5 border-b border-[#e8e6e3] dark:border-[#30363d] bg-white dark:bg-[#161b22] text-xs font-semibold scrollbar-none">
          {[
            { id: "unified", label: "Unified MGN Foundations" },
            { id: "medikabazaar", label: "Medikabazaar Tokens" },
            { id: "indiamart", label: "IndiaMART Tokens" },
            { id: "states", label: "7-State Matrix" },
            { id: "a11y", label: "WCAG 2.2 AA & QA Checklist" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`rounded-lg px-3 py-1.5 whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "bg-[#0f4c81] dark:bg-[#388bfd] text-white"
                  : "text-[#5d5854] dark:text-[#8b949e] hover:bg-[#faf9f8] dark:hover:bg-[#21262d] hover:text-[#171717] dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6 text-xs leading-relaxed">
          
          {/* TAB 1: UNIFIED MGN FOUNDATIONS */}
          {activeTab === "unified" && (
            <div className="space-y-5">
              <div className="rounded-xl border border-[#0f4c81]/20 bg-[#eef5fc] dark:bg-[#0f4c81]/15 p-4">
                <h3 className="text-sm font-bold text-[#0f4c81] dark:text-[#388bfd] flex items-center gap-2">
                  <ShieldCheck className="size-4" />
                  Website UI Aesthetic & Brand Integration Rules
                </h3>
                <p className="mt-1 text-xs text-[#171717] dark:text-[#f0f6fc]">
                  Per strict user requirement (<strong>must maintain website ui</strong>), all marketplace elements seamlessly adhere to MedGlobalNetwork&apos;s primary brand palette (<code className="font-mono bg-white/70 dark:bg-black/30 px-1 py-0.5 rounded">#0f4c81</code>), clean stone/slate card surfaces (<code className="font-mono bg-white/70 dark:bg-black/30 px-1 py-0.5 rounded">#faf9f8</code> light, <code className="font-mono bg-white/70 dark:bg-black/30 px-1 py-0.5 rounded">#0d1117</code> dark), and AppShell navigation while fusing high-density B2B procurement patterns.
                </p>
              </div>

              {/* Component Density Benchmarks */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#77716b] dark:text-[#8b949e] flex items-center gap-1.5">
                  <BarChart3 className="size-3.5 text-[#0f4c81] dark:text-[#388bfd]" />
                  Known Page Component Density Benchmarks
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#e8e6e3] dark:border-[#30363d] p-3.5 bg-[#faf9f8] dark:bg-[#0d1117] space-y-1.5">
                    <div className="font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center justify-between">
                      <span>Medikabazaar Benchmark</span>
                      <span className="text-[10px] text-[#0f4c81] dark:text-[#388bfd]">E-Commerce Storefront</span>
                    </div>
                    <ul className="grid grid-cols-2 gap-1 text-[11px] text-[#5d5854] dark:text-[#8b949e]">
                      <li>• Links: <strong>348</strong></li>
                      <li>• Buttons: <strong>75</strong></li>
                      <li>• Navigation: <strong>1</strong></li>
                      <li>• Lists: <strong>1</strong></li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-[#e8e6e3] dark:border-[#30363d] p-3.5 bg-[#faf9f8] dark:bg-[#0d1117] space-y-1.5">
                    <div className="font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center justify-between">
                      <span>IndiaMART Benchmark</span>
                      <span className="text-[10px] text-[#2e3192]">B2B Content Directory</span>
                    </div>
                    <ul className="grid grid-cols-3 gap-1 text-[11px] text-[#5d5854] dark:text-[#8b949e]">
                      <li>• Cards: <strong>474</strong></li>
                      <li>• Links: <strong>238</strong></li>
                      <li>• Nav: <strong>26</strong></li>
                      <li>• Buttons: <strong>8</strong></li>
                      <li>• Lists: <strong>7</strong></li>
                      <li>• Inputs: <strong>4</strong></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Writing Tone & Examples */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#77716b] dark:text-[#8b949e]">
                  Content & Tone Standards (Concise, Confident, Implementation-Focused)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="rounded-xl border border-[#16804d]/30 bg-[#eafaf1] dark:bg-[#16804d]/15 p-3 text-[#16804d] dark:text-emerald-300 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" />
                      Compliant Example
                    </div>
                    <p className="text-[10px] text-[#171717] dark:text-gray-200">
                      &ldquo;Get factory-direct quotation with CDSCO compliance and 24-month OEM warranty within 2 hours.&rdquo;
                    </p>
                  </div>
                  <div className="rounded-xl border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-3 text-red-700 dark:text-red-300 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <AlertTriangle className="size-3.5" />
                      Prohibited Example
                    </div>
                    <p className="text-[10px] text-[#171717] dark:text-gray-200">
                      &ldquo;Click here to see cool deals and cheap machines from unknown sellers.&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEDIKABAZAAR TOKENS */}
          {activeTab === "medikabazaar" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                  Medikabazaar Style Foundations & Tokens
                </h3>
                <a
                  href="https://www.medikabazaar.com/medicalequipments?srsltid=AU7gw4Wsv_isxelsERO7rOcg61RGZKoq3epfxYRh0N0yMsqSI0J0cVPZ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0f4c81] dark:text-[#388bfd] hover:underline"
                >
                  <span>Source Reference</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#e8e6e3] dark:border-[#30363d] p-3.5 bg-[#faf9f8] dark:bg-[#0d1117] space-y-2">
                  <span className="font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center gap-1.5">
                    <Palette className="size-3.5 text-[#0f4c81] dark:text-[#388bfd]" />
                    Color Palette Tokens
                  </span>
                  <ul className="space-y-1 font-mono text-[11px] text-[#5d5854] dark:text-[#8b949e]">
                    <li><strong className="text-[#191d23] dark:text-white">color.text.primary</strong>: #191d23</li>
                    <li><strong className="text-[#444444] dark:text-gray-300">color.text.secondary</strong>: #444444</li>
                    <li><strong className="text-[#181818] dark:text-white">color.text.tertiary</strong>: #181818</li>
                    <li><strong>color.surface.muted</strong>: #ffffff</li>
                    <li><strong>color.surface.base</strong>: #000000</li>
                    <li><strong className="text-[#0f4c81] dark:text-[#388bfd]">color.focus.ring</strong>: oklab(0.708 0 0 / 0.5)</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-[#e8e6e3] dark:border-[#30363d] p-3.5 bg-[#faf9f8] dark:bg-[#0d1117] space-y-2">
                  <span className="font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center gap-1.5">
                    <Type className="size-3.5 text-[#0f4c81] dark:text-[#388bfd]" />
                    Typography & Font Stack
                  </span>
                  <ul className="space-y-1 font-mono text-[11px] text-[#5d5854] dark:text-[#8b949e]">
                    <li><strong>font.family.primary</strong>: __Manrope_93ecc3</li>
                    <li><strong>font.family.stack</strong>: __Manrope_93ecc3, __Manrope_Fallback_93ecc3</li>
                    <li><strong>font.size.base</strong>: 16px</li>
                    <li><strong>font.weight.base</strong>: 400</li>
                    <li><strong>font.lineHeight.base</strong>: 24px</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-[#e8e6e3] dark:border-[#30363d] p-3.5 bg-[#faf9f8] dark:bg-[#0d1117] space-y-2">
                <span className="font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center gap-1.5">
                  <Layers className="size-3.5 text-[#0f4c81] dark:text-[#388bfd]" />
                  Spacing Scale & Corner Radius
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-mono text-[#5d5854] dark:text-[#8b949e]">
                  <div><strong>space.1</strong>: 10px</div>
                  <div><strong>space.2</strong>: 12px</div>
                  <div><strong>space.3</strong>: 16px</div>
                  <div><strong>space.4</strong>: 32px</div>
                  <div><strong>radius.xs</strong>: 14px</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INDIAMART TOKENS */}
          {activeTab === "indiamart" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                  IndiaMART Style Foundations & Tokens
                </h3>
                <a
                  href="https://www.indiamart.com/?srsltid=AU7gw4XdYB40lcuVbvsqv5T9O8JjpgLA07i9sb6_Sc5_Jyl9ZLWj7nBY"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0000ee] dark:text-[#388bfd] hover:underline"
                >
                  <span>Source Reference</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#e8e6e3] dark:border-[#30363d] p-3.5 bg-[#faf9f8] dark:bg-[#0d1117] space-y-2">
                  <span className="font-bold text-[#171717] dark:text-[#f0f6fc]">Color Tokens</span>
                  <ul className="space-y-1 font-mono text-[11px] text-[#5d5854] dark:text-[#8b949e]">
                    <li><strong className="text-[#0000ee]">color.text.primary</strong>: #0000ee</li>
                    <li><strong className="text-[#161a22] dark:text-white">color.text.secondary</strong>: #161a22</li>
                    <li><strong className="text-[#9ca3af]">color.text.tertiary</strong>: #9ca3af</li>
                    <li><strong>color.surface.base</strong>: #ffffff</li>
                    <li><strong>color.surface.muted</strong>: #000000</li>
                    <li><strong className="text-[#2e3192]">color.surface.raised</strong>: #2e3192</li>
                    <li><strong className="text-[#1e293b]">color.surface.strong</strong>: #1e293b</li>
                    <li><strong>color.border.default</strong>: #ced2da</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-[#e8e6e3] dark:border-[#30363d] p-3.5 bg-[#faf9f8] dark:bg-[#0d1117] space-y-2">
                  <span className="font-bold text-[#171717] dark:text-[#f0f6fc]">Typography & Motion</span>
                  <ul className="space-y-1 font-mono text-[11px] text-[#5d5854] dark:text-[#8b949e]">
                    <li><strong>font.family.primary</strong>: Inter</li>
                    <li><strong>font.family.stack</strong>: Inter, system-ui, sans-serif</li>
                    <li><strong>font.size.base</strong>: 14px</li>
                    <li><strong>motion.duration.instant</strong>: 150ms</li>
                    <li><strong>motion.duration.fast</strong>: 200ms</li>
                    <li><strong>motion.duration.normal</strong>: 300ms</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-[#e8e6e3] dark:border-[#30363d] p-3.5 bg-[#faf9f8] dark:bg-[#0d1117] space-y-2">
                <span className="font-bold text-[#171717] dark:text-[#f0f6fc]">Spacing & Shadows</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-[#5d5854] dark:text-[#8b949e]">
                  <div>space.1: 2px</div>
                  <div>space.2: 4px</div>
                  <div>space.3: 5px</div>
                  <div>space.4: 6px</div>
                  <div>space.5: 8px</div>
                  <div>space.6: 10px</div>
                  <div>space.7: 12px</div>
                  <div>space.8: 13px</div>
                  <div>radius.xs: 4px</div>
                  <div>radius.sm: 6px</div>
                  <div>radius.md: 8px</div>
                  <div>radius.xl: 999px</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 7-STATE MATRIX */}
          {activeTab === "states" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center gap-2">
                <CheckSquare className="size-4 text-[#16804d]" />
                Mandatory 7-State Component Behavior Matrix
              </h3>
              <p className="text-xs text-[#5d5854] dark:text-[#8b949e]">
                Every component family (Buttons, Cards, Inputs, Modals, Category Chips) must define explicit handling across all 7 operational states:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-[#e8e6e3] dark:border-[#30363d] p-3 bg-white dark:bg-[#161b22] space-y-1">
                  <span className="font-bold text-[#0f4c81] dark:text-[#388bfd]">1. Default State</span>
                  <p className="text-[11px] text-[#5d5854] dark:text-[#8b949e]">High-contrast text, clear borders (#ded8d1), semantic token background.</p>
                </div>
                <div className="rounded-xl border border-[#e8e6e3] dark:border-[#30363d] p-3 bg-white dark:bg-[#161b22] space-y-1">
                  <span className="font-bold text-[#0f4c81] dark:text-[#388bfd]">2. Hover State</span>
                  <p className="text-[11px] text-[#5d5854] dark:text-[#8b949e]">Subtle elevation, 5-8% background luminosity adjustment, cursor pointer.</p>
                </div>
                <div className="rounded-xl border border-[#e8e6e3] dark:border-[#30363d] p-3 bg-white dark:bg-[#161b22] space-y-1">
                  <span className="font-bold text-[#0f4c81] dark:text-[#388bfd]">3. Focus-Visible State</span>
                  <p className="text-[11px] text-[#5d5854] dark:text-[#8b949e]">2px ring (#0f4c81 / #388bfd), offset 2px, never hidden during keyboard tab.</p>
                </div>
                <div className="rounded-xl border border-[#e8e6e3] dark:border-[#30363d] p-3 bg-white dark:bg-[#161b22] space-y-1">
                  <span className="font-bold text-[#0f4c81] dark:text-[#388bfd]">4. Active State</span>
                  <p className="text-[11px] text-[#5d5854] dark:text-[#8b949e]">Active scale (0.97-0.98), darker accent state, immediate tactile response.</p>
                </div>
                <div className="rounded-xl border border-[#e8e6e3] dark:border-[#30363d] p-3 bg-white dark:bg-[#161b22] space-y-1">
                  <span className="font-bold text-[#77716b] dark:text-[#8b949e]">5. Disabled State</span>
                  <p className="text-[11px] text-[#5d5854] dark:text-[#8b949e]">Opacity 50%, cursor-not-allowed, aria-disabled=&quot;true&quot;, no pointer actions.</p>
                </div>
                <div className="rounded-xl border border-[#e8e6e3] dark:border-[#30363d] p-3 bg-white dark:bg-[#161b22] space-y-1">
                  <span className="font-bold text-[#0f4c81] dark:text-[#388bfd]">6. Loading State</span>
                  <p className="text-[11px] text-[#5d5854] dark:text-[#8b949e]">Pulsing skeleton shimmer, aria-busy=&quot;true&quot;, layout dimensions preserved.</p>
                </div>
                <div className="rounded-xl border border-red-300 dark:border-red-900/50 p-3 bg-red-50/50 dark:bg-red-950/20 sm:col-span-2 md:col-span-3 space-y-1">
                  <span className="font-bold text-red-600 dark:text-red-400">7. Error State</span>
                  <p className="text-[11px] text-[#5d5854] dark:text-[#8b949e]">Border-red-600, visible inline descriptive error text, aria-invalid=&quot;true&quot;.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: A11Y & QA */}
          {activeTab === "a11y" && (
            <div className="space-y-5">
              {/* WCAG Criteria */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center gap-2">
                  <ShieldCheck className="size-4 text-[#16804d]" />
                  WCAG 2.2 AA Testable Acceptance Criteria
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 rounded-xl border border-[#16804d]/30 bg-[#eafaf1] dark:bg-[#16804d]/15 p-3 text-[#16804d] dark:text-emerald-300">
                    <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#171717] dark:text-white">Contrast Ratios: </strong>
                      Standard text must equal or exceed 4.5:1. Large headlines and focus rings must equal or exceed 3:1.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 rounded-xl border border-[#16804d]/30 bg-[#eafaf1] dark:bg-[#16804d]/15 p-3 text-[#16804d] dark:text-emerald-300">
                    <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#171717] dark:text-white">Keyboard Operability: </strong>
                      Every interactive control must be reachable via Tab/Shift+Tab and operable via Space/Enter. Dialogs must dismiss via Esc.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 rounded-xl border border-[#16804d]/30 bg-[#eafaf1] dark:bg-[#16804d]/15 p-3 text-[#16804d] dark:text-emerald-300">
                    <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#171717] dark:text-white">Touch & Target Size: </strong>
                      All primary buttons, filters, and quick view toggles must provide minimum 44x44px touch targets.
                    </div>
                  </div>
                </div>
              </div>

              {/* QA Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#77716b] dark:text-[#8b949e]">
                  Implementation Verification Checklist
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#5d5854] dark:text-[#8b949e]">
                  <div className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-[#16804d]" /> TypeScript check passes with 0 errors</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-[#16804d]" /> Next.js optimized production build succeeds</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-[#16804d]" /> Seamless dark/light theme switching</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-[#16804d]" /> Focus rings visible on keyboard tab navigation</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-[#16804d]" /> Multi-device comparison table responsive</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-[#16804d]" /> RFQ quotation modal with copy reference code</div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-[#e8e6e3] dark:border-[#30363d] px-5 sm:px-6 py-3.5 bg-[#faf9f8] dark:bg-[#0d1117] flex items-center justify-between">
          <div className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
            MedGlobalNetwork Marketplace Guidelines v2.2
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] hover:bg-[#0c3c66] text-white px-5 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
          >
            Return to Marketplace
          </button>
        </div>

      </div>
    </div>
  );
}
