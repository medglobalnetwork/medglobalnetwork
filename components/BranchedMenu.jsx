import { isValidElement, useLayoutEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import Analytics01Icon from "@hugeicons/core-free-icons/Analytics01Icon";
import BookOpen01Icon from "@hugeicons/core-free-icons/BookOpen01Icon";
import Briefcase01Icon from "@hugeicons/core-free-icons/Briefcase01Icon";
import Home01Icon from "@hugeicons/core-free-icons/Home01Icon";
import Settings02Icon from "@hugeicons/core-free-icons/Settings02Icon";
import ShoppingBag01Icon from "@hugeicons/core-free-icons/ShoppingBag01Icon";
import "./BranchedMenu.css";

const DEFAULT_ITEMS = [
  {
    label: "Main Navigation",
    children: [
      { value: "home", label: "Dashboard", icon: Home01Icon },
      { value: "study", label: "Study", icon: BookOpen01Icon },
      { value: "opportunities", label: "Opportunities", icon: Briefcase01Icon },
      { value: "marketplace", label: "Marketplace", icon: ShoppingBag01Icon },
    ],
  },
  {
    label: "Management",
    children: [
      { value: "analytics", label: "Analytics & Reports", icon: Analytics01Icon },
      { value: "settings", label: "Settings", icon: Settings02Icon },
    ],
  },
];

const PAD = 6;
const MARK = 16;
const toSet = (open) => new Set(Array.isArray(open) ? open : open >= 0 ? [open] : []);
const renderIcon = (icon) => (isValidElement(icon) ? icon : <HugeiconsIcon icon={icon} size={16} strokeWidth={1.8} />);

export default function BranchedMenu({
  items = DEFAULT_ITEMS,
  defaultOpen = [0],
  defaultActive = "home",
  onSelect,
  color = "#3f3f46",
  accentColor = "#1769c2",
  lineColor = "#d4d4d8",
  width = 220,
  rowHeight = 34,
  indent = 38,
  trunk = 13,
  radius = 9,
  lineWidth = 1.5,
  fontSize = 12,
  drawDuration = 350,
  foldDuration = 260,
  className = "",
}) {
  const [open, setOpen] = useState(() => toSet(defaultOpen));
  const [active, setActive] = useState(defaultActive);
  const navRef = useRef(null);
  const heads = useRef([]);
  const markerRef = useRef(null);

  const activeSection = items.findIndex((item) => item.children?.some((child) => child.value === active));
  const markerShown = activeSection >= 0 && open.has(activeSection);

  useLayoutEffect(() => {
    const marker = markerRef.current;
    const head = heads.current[activeSection];
    if (!marker) return;
    if (markerShown && head) marker.style.top = `${head.offsetTop + (head.offsetHeight - MARK) / 2}px`;
    marker.toggleAttribute("data-on", Boolean(markerShown && head));
  }, [activeSection, markerShown, items]);

  const select = (value, item) => {
    setActive(value);
    onSelect?.(value, item);
  };

  const toggle = (index) => {
    setOpen((previous) => {
      const next = new Set(previous);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const radiusValue = Math.min(radius, rowHeight / 2 - 2);
  const endX = indent - 8;
  const rowY = (index) => PAD + index * rowHeight + rowHeight / 2;
  const branch = (index) => `M ${trunk} ${rowY(index) - radiusValue} A ${radiusValue} ${radiusValue} 0 0 0 ${trunk + radiusValue} ${rowY(index)} H ${endX}`;
  const reach = (index) => `M ${trunk} 0 V ${rowY(index) - radiusValue} A ${radiusValue} ${radiusValue} 0 0 0 ${trunk + radiusValue} ${rowY(index)} H ${endX}`;
  const length = (index) => rowY(index) - radiusValue + (Math.PI * radiusValue) / 2 + (endX - trunk - radiusValue);

  return (
    <nav
      ref={navRef}
      className={`branched-menu ${className}`}
      style={{
        "--bm-w": `${width}px`,
        "--bm-ink": color,
        "--bm-accent": accentColor,
        "--bm-line": lineColor,
        "--bm-font": `${fontSize}px`,
        "--bm-row": `${rowHeight}px`,
        "--bm-indent": `${indent}px`,
        "--bm-line-w": lineWidth,
        "--bm-draw": `${drawDuration}ms`,
        "--bm-fold": `${foldDuration}ms`,
      }}
    >
      <span ref={markerRef} className="branched-menu__marker" aria-hidden="true" />
      {items.map((item, index) => {
        const children = item.children;
        const isOpen = children ? open.has(index) : false;
        const bodyHeight = children ? PAD * 2 + children.length * rowHeight : 0;
        return (
          <div key={item.label} className="branched-menu__section" data-open={isOpen ? "" : undefined}>
            <button
              ref={(element) => { heads.current[index] = element; }}
              type="button"
              className="branched-menu__head"
              aria-expanded={children ? isOpen : undefined}
              onClick={() => (children ? toggle(index) : select(item.value || item.label, item))}
            >
              {item.label}
              {children && <span className="branched-menu__chevron">⌄</span>}
            </button>
            {children && (
              <div className="branched-menu__body">
                <div className="branched-menu__fold">
                  <div className="branched-menu__tree" style={{ height: bodyHeight }}>
                    <svg className="branched-menu__lines" width={indent} height={bodyHeight} aria-hidden="true">
                      <path className="branched-menu__base" d={`M ${trunk} 0 V ${rowY(children.length - 1) - radiusValue}`} />
                      {children.map((child, childIndex) => <path key={child.value} className="branched-menu__base" d={branch(childIndex)} />)}
                      {children.map((child, childIndex) => <path key={child.value} className="branched-menu__reach" d={reach(childIndex)} style={{ strokeDasharray: length(childIndex), strokeDashoffset: child.value === active ? 0 : length(childIndex) }} />)}
                    </svg>
                    {children.map((child) => (
                      <button key={child.value} type="button" className="branched-menu__item" aria-current={child.value === active ? "page" : undefined} data-active={child.value === active ? "" : undefined} tabIndex={isOpen ? 0 : -1} onClick={() => select(child.value, child)}>
                        {child.icon && <span className="branched-menu__icon" aria-hidden="true">{renderIcon(child.icon)}</span>}
                        <span className="branched-menu__label">{child.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
