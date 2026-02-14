import type { ComponentType } from 'react'

// Simple wireframe thumbnail SVGs for component cards
// Each returns a small SVG illustration

function NavigationBarThumb() {
  return (
    <svg viewBox="0 0 160 40" className="w-32 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="158" height="38" rx="4" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" fill="none" />
      <rect x="8" y="14" width="12" height="12" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
      <rect x="56" y="16" width="48" height="8" rx="2" className="fill-zinc-400 dark:fill-zinc-500" />
      <circle cx="140" cy="20" r="6" className="fill-zinc-300 dark:fill-zinc-600" />
    </svg>
  )
}

function TabBarThumb() {
  return (
    <svg viewBox="0 0 160 40" className="w-32 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="158" height="38" rx="4" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" fill="none" />
      {[20, 55, 90, 125].map((x) => (
        <g key={x}>
          <rect x={x} y="8" width="14" height="14" rx="3" className="fill-zinc-300 dark:fill-zinc-600" />
          <rect x={x - 2} y="26" width="18" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
        </g>
      ))}
      <rect x="47" y="6" width="26" height="18" rx="3" className="fill-primary-200 dark:fill-primary-800" />
    </svg>
  )
}

function SidebarThumb() {
  return (
    <svg viewBox="0 0 160 80" className="w-32 h-16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="50" height="78" rx="4" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      <rect x="56" y="1" width="103" height="78" rx="4" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" fill="none" />
      {[14, 28, 42, 56].map((y) => (
        <rect key={y} x="8" y={y} width="36" height="6" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
      ))}
      <rect x="8" y="14" width="36" height="6" rx="2" className="fill-primary-300 dark:fill-primary-700" />
    </svg>
  )
}

function ButtonThumb() {
  return (
    <svg viewBox="0 0 100 40" className="w-24 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="6" width="80" height="28" rx="8" className="fill-primary-200 dark:fill-primary-800 stroke-primary-400 dark:stroke-primary-600" strokeWidth="1" />
      <rect x="28" y="16" width="44" height="8" rx="2" className="fill-primary-500 dark:fill-primary-400" />
    </svg>
  )
}

function TextFieldThumb() {
  return (
    <svg viewBox="0 0 140 44" className="w-32 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="12" width="138" height="30" rx="6" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1" fill="none" />
      <rect x="8" y="1" width="40" height="10" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
      <rect x="10" y="22" width="60" height="6" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
      <rect x="10" y="22" width="1" height="10" className="fill-primary-500" />
    </svg>
  )
}

function CheckboxThumb() {
  return (
    <svg viewBox="0 0 100 30" className="w-24 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="22" height="22" rx="4" className="stroke-primary-500 dark:stroke-primary-400" strokeWidth="2" fill="none" />
      <path d="M9 15l4 4 8-8" className="stroke-primary-500 dark:stroke-primary-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="34" y="10" width="56" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
    </svg>
  )
}

function ToggleSwitchThumb() {
  return (
    <svg viewBox="0 0 60 30" className="w-14 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="3" width="48" height="24" rx="12" className="fill-primary-400 dark:fill-primary-600" />
      <circle cx="37" cy="15" r="9" className="fill-white" />
    </svg>
  )
}

function DropdownThumb() {
  return (
    <svg viewBox="0 0 120 50" className="w-28 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="118" height="28" rx="6" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1" fill="none" />
      <rect x="10" y="10" width="50" height="8" rx="2" className="fill-zinc-400 dark:fill-zinc-500" />
      <path d="M100 12l6 6 6-6" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="1" y="30" width="118" height="18" rx="4" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
      <rect x="10" y="35" width="40" height="6" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
    </svg>
  )
}

function AlertDialogThumb() {
  return (
    <svg viewBox="0 0 120 80" className="w-28 h-18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="120" height="80" rx="0" className="fill-zinc-200/50 dark:fill-zinc-800/50" />
      <rect x="15" y="15" width="90" height="50" rx="8" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      <rect x="28" y="22" width="64" height="6" rx="2" className="fill-zinc-400 dark:fill-zinc-500" />
      <rect x="28" y="32" width="50" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
      <rect x="28" y="48" width="28" height="10" rx="4" className="fill-zinc-200 dark:fill-zinc-700" />
      <rect x="62" y="48" width="28" height="10" rx="4" className="fill-primary-200 dark:fill-primary-800" />
    </svg>
  )
}

function ToastThumb() {
  return (
    <svg viewBox="0 0 140 30" className="w-32 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="138" height="28" rx="8" className="fill-zinc-800 dark:fill-zinc-200" />
      <rect x="12" y="10" width="70" height="6" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
      <rect x="100" y="8" width="28" height="10" rx="4" className="fill-primary-500" />
    </svg>
  )
}

function ProgressBarThumb() {
  return (
    <svg viewBox="0 0 140 14" className="w-32 h-3" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="138" height="12" rx="6" className="fill-zinc-200 dark:fill-zinc-700" />
      <rect x="1" y="1" width="90" height="12" rx="6" className="fill-primary-400 dark:fill-primary-500" />
    </svg>
  )
}

function SpinnerThumb() {
  return (
    <svg viewBox="0 0 40 40" className="w-10 h-10 animate-spin" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="16" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="3" />
      <path d="M20 4a16 16 0 0 1 16 16" className="stroke-primary-500 dark:stroke-primary-400" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function ModalThumb() {
  return (
    <svg viewBox="0 0 120 80" className="w-28 h-18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="120" height="80" className="fill-zinc-200/50 dark:fill-zinc-800/50" />
      <rect x="10" y="10" width="100" height="60" rx="8" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      <rect x="18" y="16" width="60" height="6" rx="2" className="fill-zinc-400 dark:fill-zinc-500" />
      <rect x="18" y="28" width="84" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
      <rect x="18" y="36" width="70" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
      <rect x="56" y="54" width="24" height="10" rx="4" className="fill-zinc-200 dark:fill-zinc-700" />
      <rect x="84" y="54" width="24" height="10" rx="4" className="fill-primary-300 dark:fill-primary-700" />
    </svg>
  )
}

function BadgeThumb() {
  return (
    <svg viewBox="0 0 100 60" className="w-24 h-14" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Icon with badge */}
      <rect x="28" y="14" width="28" height="28" rx="6" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      {/* Bell icon shape inside */}
      <path d="M38 22v6a4 4 0 004 4h0a4 4 0 004-4v-6" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="42" cy="34" r="1.5" className="fill-zinc-400 dark:fill-zinc-500" />
      <path d="M36 28h12" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" strokeLinecap="round" />
      {/* Red badge circle with number */}
      <circle cx="52" cy="16" r="9" className="fill-red-500" />
      <text x="52" y="20" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">3</text>
      {/* Second example: dot badge on a smaller icon */}
      <rect x="68" y="22" width="18" height="18" rx="4" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      <circle cx="83" cy="23" r="4" className="fill-red-500" />
    </svg>
  )
}

function PopoverThumb() {
  return (
    <svg viewBox="0 0 130 80" className="w-28 h-18" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Trigger button */}
      <rect x="40" y="56" width="50" height="18" rx="5" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      <rect x="50" y="62" width="30" height="5" rx="1.5" className="fill-zinc-400 dark:fill-zinc-500" />
      {/* Popover container */}
      <rect x="18" y="4" width="94" height="44" rx="8" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      {/* Arrow / caret pointing down to trigger */}
      <polygon points="60,48 65,55 70,48" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" strokeLinejoin="round" />
      {/* Cover the stroke overlap between arrow and box */}
      <rect x="59" y="46" width="12" height="3" className="fill-white dark:fill-zinc-800" />
      {/* Content lines inside popover */}
      <rect x="28" y="12" width="74" height="5" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
      <rect x="28" y="22" width="58" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
      <rect x="28" y="32" width="66" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
    </svg>
  )
}

function TooltipThumb() {
  return (
    <svg viewBox="0 0 120 64" className="w-28 h-14" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Icon button that tooltip points to */}
      <circle cx="60" cy="46" r="12" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      <text x="60" y="50" textAnchor="middle" fontSize="12" fontWeight="bold" className="fill-zinc-400 dark:fill-zinc-500">?</text>
      {/* Tooltip bubble */}
      <rect x="22" y="4" width="76" height="26" rx="6" className="fill-zinc-800 dark:fill-zinc-200" />
      {/* Arrow pointing down */}
      <polygon points="55,30 60,36 65,30" className="fill-zinc-800 dark:fill-zinc-200" />
      {/* Text inside tooltip */}
      <rect x="32" y="12" width="56" height="4" rx="1" className="fill-zinc-400 dark:fill-zinc-500" />
      <rect x="38" y="20" width="44" height="3" rx="1" className="fill-zinc-500 dark:fill-zinc-400" />
    </svg>
  )
}

function ActionSheetThumb() {
  return (
    <svg viewBox="0 0 120 80" className="w-28 h-18" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background scrim */}
      <rect x="0" y="0" width="120" height="80" className="fill-zinc-200/50 dark:fill-zinc-800/50" />
      {/* Sheet rising from bottom */}
      <rect x="8" y="28" width="104" height="52" rx="10" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      {/* Drag handle */}
      <rect x="50" y="32" width="20" height="3" rx="1.5" className="fill-zinc-300 dark:fill-zinc-600" />
      {/* Action items */}
      <rect x="16" y="40" width="88" height="10" rx="5" className="fill-zinc-100 dark:fill-zinc-700" />
      <rect x="28" y="43" width="40" height="4" rx="1" className="fill-zinc-400 dark:fill-zinc-500" />
      <rect x="16" y="54" width="88" height="10" rx="5" className="fill-zinc-100 dark:fill-zinc-700" />
      <rect x="28" y="57" width="32" height="4" rx="1" className="fill-red-400 dark:fill-red-500" />
      {/* Cancel button separated */}
      <rect x="16" y="68" width="88" height="8" rx="4" className="fill-zinc-200 dark:fill-zinc-700" />
      <rect x="42" y="70" width="36" height="4" rx="1" className="fill-zinc-500 dark:fill-zinc-400" />
    </svg>
  )
}

function ContextMenuThumb() {
  return (
    <svg viewBox="0 0 120 80" className="w-28 h-18" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background content area */}
      <rect x="0" y="0" width="120" height="80" rx="4" className="fill-zinc-50 dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
      {/* Simulated content */}
      <rect x="8" y="8" width="40" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
      <rect x="8" y="16" width="50" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
      {/* Context menu floating panel */}
      <rect x="36" y="24" width="72" height="50" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      {/* Menu items with icons */}
      <rect x="42" y="30" width="4" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
      <rect x="50" y="30" width="36" height="4" rx="1" className="fill-zinc-400 dark:fill-zinc-500" />
      <rect x="96" y="30" width="8" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
      <rect x="42" y="40" width="4" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
      <rect x="50" y="40" width="30" height="4" rx="1" className="fill-zinc-400 dark:fill-zinc-500" />
      {/* Separator */}
      <line x1="42" y1="49" x2="102" y2="49" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
      <rect x="42" y="54" width="4" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
      <rect x="50" y="54" width="28" height="4" rx="1" className="fill-zinc-400 dark:fill-zinc-500" />
      <rect x="42" y="64" width="4" height="4" rx="1" className="fill-red-300 dark:fill-red-700" />
      <rect x="50" y="64" width="24" height="4" rx="1" className="fill-red-400 dark:fill-red-500" />
    </svg>
  )
}

function ListThumb() {
  return (
    <svg viewBox="0 0 120 80" className="w-28 h-18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="118" height="78" rx="6" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" fill="none" />
      {/* List rows */}
      {[8, 30, 52].map((y) => (
        <g key={y}>
          {/* Avatar circle */}
          <circle cx="18" cy={y + 9} r="7" className="fill-zinc-200 dark:fill-zinc-700" />
          {/* Primary text */}
          <rect x="30" y={y + 3} width="50" height="5" rx="1.5" className="fill-zinc-400 dark:fill-zinc-500" />
          {/* Secondary text */}
          <rect x="30" y={y + 11} width="36" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
          {/* Chevron */}
          <path d={`M104 ${y + 6} l4 4 -4 4`} className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* Divider */}
          {y < 52 && <line x1="30" y1={y + 20} x2="114" y2={y + 20} className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.5" />}
        </g>
      ))}
    </svg>
  )
}

function CardThumb() {
  return (
    <svg viewBox="0 0 100 80" className="w-24 h-18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="92" height="72" rx="8" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      {/* Image area */}
      <rect x="4" y="4" width="92" height="30" rx="8" className="fill-zinc-200 dark:fill-zinc-700" />
      <rect x="4" y="26" width="92" height="8" className="fill-zinc-200 dark:fill-zinc-700" />
      {/* Title */}
      <rect x="12" y="40" width="56" height="5" rx="2" className="fill-zinc-400 dark:fill-zinc-500" />
      {/* Body text */}
      <rect x="12" y="50" width="76" height="3" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
      <rect x="12" y="56" width="60" height="3" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
      {/* Action */}
      <rect x="12" y="64" width="28" height="7" rx="3" className="fill-primary-200 dark:fill-primary-800" />
    </svg>
  )
}

function DividerThumb() {
  return (
    <svg viewBox="0 0 120 40" className="w-28 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Content above */}
      <rect x="10" y="4" width="70" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
      <rect x="10" y="11" width="50" height="3" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
      {/* Divider line */}
      <line x1="4" y1="20" x2="116" y2="20" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      {/* Content below */}
      <rect x="10" y="26" width="60" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
      <rect x="10" y="33" width="44" height="3" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
    </svg>
  )
}

function FloatingActionButtonThumb() {
  return (
    <svg viewBox="0 0 100 80" className="w-24 h-18" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background content area */}
      <rect x="1" y="1" width="98" height="78" rx="4" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" fill="none" />
      <rect x="8" y="8" width="60" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
      <rect x="8" y="16" width="50" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
      <rect x="8" y="24" width="56" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
      {/* FAB circle */}
      <circle cx="78" cy="60" r="16" className="fill-primary-500 dark:fill-primary-600" />
      {/* Shadow */}
      <ellipse cx="78" cy="78" rx="12" ry="2" className="fill-zinc-300/50 dark:fill-zinc-700/50" />
      {/* Plus icon */}
      <line x1="78" y1="52" x2="78" y2="68" className="stroke-white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="70" y1="60" x2="86" y2="60" className="stroke-white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function SegmentedControlThumb() {
  return (
    <svg viewBox="0 0 140 36" className="w-32 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer container */}
      <rect x="1" y="1" width="138" height="34" rx="10" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      {/* Active segment pill */}
      <rect x="4" y="4" width="44" height="28" rx="8" className="fill-white dark:fill-zinc-800" />
      {/* Segment labels */}
      <rect x="12" y="14" width="28" height="6" rx="2" className="fill-zinc-800 dark:fill-zinc-200" />
      <rect x="56" y="14" width="28" height="6" rx="2" className="fill-zinc-400 dark:fill-zinc-500" />
      <rect x="100" y="14" width="28" height="6" rx="2" className="fill-zinc-400 dark:fill-zinc-500" />
    </svg>
  )
}

function BreadcrumbThumb() {
  return (
    <svg viewBox="0 0 140 24" className="w-32 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Breadcrumb items */}
      <rect x="2" y="8" width="24" height="6" rx="2" className="fill-primary-300 dark:fill-primary-700" />
      <path d="M30 8l4 4-4 4" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="38" y="8" width="32" height="6" rx="2" className="fill-primary-300 dark:fill-primary-700" />
      <path d="M74 8l4 4-4 4" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="82" y="8" width="44" height="6" rx="2" className="fill-zinc-400 dark:fill-zinc-500" />
    </svg>
  )
}

function MenuBarThumb() {
  return (
    <svg viewBox="0 0 160 50" className="w-32 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Menu bar */}
      <rect x="1" y="1" width="158" height="16" rx="2" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      <rect x="6" y="5" width="16" height="6" rx="1" className="fill-zinc-400 dark:fill-zinc-500" />
      <rect x="26" y="5" width="14" height="6" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
      <rect x="44" y="5" width="16" height="6" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
      <rect x="64" y="5" width="18" height="6" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
      {/* Open dropdown */}
      <rect x="2" y="17" width="60" height="32" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      <rect x="8" y="22" width="36" height="5" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
      <rect x="50" y="22" width="8" height="5" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
      <rect x="8" y="31" width="28" height="5" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
      <line x1="8" y1="40" x2="56" y2="40" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.5" />
      <rect x="8" y="43" width="32" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
    </svg>
  )
}

function SliderThumb() {
  return (
    <svg viewBox="0 0 140 30" className="w-32 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Track */}
      <rect x="8" y="12" width="124" height="6" rx="3" className="fill-zinc-200 dark:fill-zinc-700" />
      {/* Filled track */}
      <rect x="8" y="12" width="76" height="6" rx="3" className="fill-primary-400 dark:fill-primary-500" />
      {/* Thumb */}
      <circle cx="84" cy="15" r="9" className="fill-white dark:fill-zinc-100 stroke-primary-500 dark:stroke-primary-400" strokeWidth="2" />
    </svg>
  )
}

function DatePickerThumb() {
  return (
    <svg viewBox="0 0 120 80" className="w-28 h-18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="118" height="78" rx="8" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      {/* Month header */}
      <rect x="32" y="6" width="56" height="8" rx="2" className="fill-zinc-400 dark:fill-zinc-500" />
      <path d="M18 10l-4-4M18 10l-4 4" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M102 10l4-4M102 10l4 4" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" strokeLinecap="round" />
      {/* Day grid */}
      {[22, 36, 50, 64].map((y) =>
        [12, 28, 44, 60, 76, 92].map((x) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="12" height="8" rx="2" className="fill-zinc-100 dark:fill-zinc-700" />
        )),
      )}
      {/* Selected day */}
      <rect x="44" y="36" width="12" height="8" rx="2" className="fill-primary-500 dark:fill-primary-600" />
      {/* Today indicator */}
      <rect x="60" y="50" width="12" height="8" rx="2" className="stroke-primary-400 dark:stroke-primary-500" strokeWidth="1" fill="none" />
    </svg>
  )
}

function TimePickerThumb() {
  return (
    <svg viewBox="0 0 100 60" className="w-24 h-14" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Clock face */}
      <circle cx="50" cy="30" r="26" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" fill="none" />
      {/* Hour marks */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
        const r = 22
        const x = 50 + r * Math.sin((deg * Math.PI) / 180)
        const y = 30 - r * Math.cos((deg * Math.PI) / 180)
        return <circle key={deg} cx={x} cy={y} r="1.2" className="fill-zinc-400 dark:fill-zinc-500" />
      })}
      {/* Hour hand */}
      <line x1="50" y1="30" x2="50" y2="16" className="stroke-zinc-600 dark:stroke-zinc-300" strokeWidth="2" strokeLinecap="round" />
      {/* Minute hand */}
      <line x1="50" y1="30" x2="62" y2="22" className="stroke-primary-500 dark:stroke-primary-400" strokeWidth="1.5" strokeLinecap="round" />
      {/* Center dot */}
      <circle cx="50" cy="30" r="2" className="fill-primary-500 dark:fill-primary-400" />
    </svg>
  )
}

function SearchBarThumb() {
  return (
    <svg viewBox="0 0 140 34" className="w-32 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="138" height="32" rx="16" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      {/* Search icon */}
      <circle cx="18" cy="17" r="5" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" fill="none" />
      <line x1="22" y1="21" x2="25" y2="24" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" strokeLinecap="round" />
      {/* Placeholder text */}
      <rect x="32" y="14" width="52" height="6" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
    </svg>
  )
}

function RadioButtonThumb() {
  return (
    <svg viewBox="0 0 100 50" className="w-24 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Selected radio */}
      <circle cx="14" cy="13" r="8" className="stroke-primary-500 dark:stroke-primary-400" strokeWidth="2" fill="none" />
      <circle cx="14" cy="13" r="4" className="fill-primary-500 dark:fill-primary-400" />
      <rect x="28" y="9" width="50" height="6" rx="2" className="fill-zinc-400 dark:fill-zinc-500" />
      {/* Unselected radio */}
      <circle cx="14" cy="37" r="8" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" fill="none" />
      <rect x="28" y="33" width="40" height="6" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
    </svg>
  )
}

function ChipsThumb() {
  return (
    <svg viewBox="0 0 140 40" className="w-32 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Chip 1 - selected */}
      <rect x="2" y="8" width="44" height="24" rx="12" className="fill-primary-100 dark:fill-primary-900 stroke-primary-400 dark:stroke-primary-600" strokeWidth="1" />
      <path d="M12 18l3 3 5-5" className="stroke-primary-500 dark:stroke-primary-400" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="22" y="16" width="18" height="6" rx="2" className="fill-primary-500 dark:fill-primary-400" />
      {/* Chip 2 */}
      <rect x="50" y="8" width="38" height="24" rx="12" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" fill="none" />
      <rect x="58" y="16" width="22" height="6" rx="2" className="fill-zinc-400 dark:fill-zinc-500" />
      {/* Chip 3 with remove */}
      <rect x="92" y="8" width="44" height="24" rx="12" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" fill="none" />
      <rect x="100" y="16" width="18" height="6" rx="2" className="fill-zinc-400 dark:fill-zinc-500" />
      <circle cx="126" cy="20" r="5" className="fill-zinc-200 dark:fill-zinc-700" />
      <path d="M124 18l4 4M128 18l-4 4" className="stroke-zinc-500 dark:stroke-zinc-400" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

function TabsThumb() {
  return (
    <svg viewBox="0 0 140 50" className="w-32 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tab strip */}
      <rect x="8" y="8" width="30" height="8" rx="2" className="fill-zinc-500 dark:fill-zinc-300" />
      <rect x="46" y="8" width="30" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
      <rect x="84" y="8" width="30" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
      {/* Active indicator underline */}
      <rect x="8" y="18" width="30" height="2" rx="1" className="fill-primary-500 dark:fill-primary-400" />
      {/* Divider */}
      <line x1="1" y1="21" x2="139" y2="21" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
      {/* Content area */}
      <rect x="8" y="28" width="90" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
      <rect x="8" y="36" width="70" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
      <rect x="8" y="44" width="80" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
    </svg>
  )
}

function CarouselThumb() {
  return (
    <svg viewBox="0 0 140 70" className="w-32 h-16" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Previous peek card */}
      <rect x="-8" y="8" width="30" height="44" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
      {/* Main card */}
      <rect x="26" y="4" width="88" height="48" rx="8" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      <rect x="34" y="10" width="72" height="24" rx="4" className="fill-zinc-200 dark:fill-zinc-700" />
      <rect x="34" y="38" width="48" height="5" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
      {/* Next peek card */}
      <rect x="118" y="8" width="30" height="44" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
      {/* Page indicators */}
      {[55, 65, 75, 85].map((x, i) => (
        <circle key={x} cx={x} cy="60" r="2.5" className={i === 0 ? 'fill-primary-500 dark:fill-primary-400' : 'fill-zinc-300 dark:fill-zinc-600'} />
      ))}
    </svg>
  )
}

function AccordionThumb() {
  return (
    <svg viewBox="0 0 120 70" className="w-28 h-16" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Section 1 - expanded */}
      <rect x="1" y="1" width="118" height="16" rx="4" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      <rect x="8" y="6" width="48" height="5" rx="2" className="fill-zinc-400 dark:fill-zinc-500" />
      <path d="M106 6l4 4 4-4" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Expanded content */}
      <rect x="1" y="17" width="118" height="24" className="fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
      <rect x="12" y="23" width="80" height="3" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
      <rect x="12" y="30" width="60" height="3" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
      {/* Section 2 - collapsed */}
      <rect x="1" y="41" width="118" height="14" rx="4" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      <rect x="8" y="45" width="40" height="5" rx="2" className="fill-zinc-400 dark:fill-zinc-500" />
      <path d="M106 44l4 4 4-4" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="rotate(-90 110 46)" />
      {/* Section 3 - collapsed */}
      <rect x="1" y="55" width="118" height="14" rx="4" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      <rect x="8" y="59" width="52" height="5" rx="2" className="fill-zinc-400 dark:fill-zinc-500" />
      <path d="M106 58l4 4 4-4" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="rotate(-90 110 60)" />
    </svg>
  )
}

function TreeViewThumb() {
  return (
    <svg viewBox="0 0 120 80" className="w-28 h-18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="118" height="78" rx="6" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" fill="none" />
      {/* Root expanded */}
      <path d="M10 14l4-4 4 4" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="rotate(90 14 12)" />
      <rect x="20" y="8" width="8" height="8" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
      <rect x="32" y="9" width="40" height="6" rx="2" className="fill-zinc-400 dark:fill-zinc-500" />
      {/* Child 1 */}
      <line x1="20" y1="16" x2="20" y2="26" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
      <line x1="20" y1="26" x2="30" y2="26" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
      <rect x="32" y="22" width="8" height="8" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
      <rect x="44" y="23" width="32" height="6" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
      {/* Child 2 - selected */}
      <line x1="20" y1="26" x2="20" y2="40" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
      <line x1="20" y1="40" x2="30" y2="40" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
      <rect x="30" y="35" width="80" height="12" rx="3" className="fill-primary-100 dark:fill-primary-900" />
      <rect x="34" y="37" width="8" height="8" rx="1" className="fill-primary-300 dark:fill-primary-700" />
      <rect x="46" y="38" width="36" height="6" rx="2" className="fill-primary-500 dark:fill-primary-400" />
      {/* Second root collapsed */}
      <path d="M10 58l4-4 4 4" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="20" y="54" width="8" height="8" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
      <rect x="32" y="55" width="44" height="6" rx="2" className="fill-zinc-400 dark:fill-zinc-500" />
      {/* Third root collapsed */}
      <path d="M10 72l4-4 4 4" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="20" y="68" width="8" height="8" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
      <rect x="32" y="69" width="38" height="6" rx="2" className="fill-zinc-400 dark:fill-zinc-500" />
    </svg>
  )
}

function StepperThumb() {
  return (
    <svg viewBox="0 0 100 34" className="w-24 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Minus button */}
      <rect x="1" y="1" width="28" height="32" rx="8" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      <line x1="9" y1="17" x2="21" y2="17" className="stroke-zinc-500 dark:stroke-zinc-400" strokeWidth="2" strokeLinecap="round" />
      {/* Value display */}
      <text x="50" y="22" textAnchor="middle" fontSize="14" fontWeight="bold" className="fill-zinc-600 dark:fill-zinc-300">5</text>
      {/* Plus button */}
      <rect x="71" y="1" width="28" height="32" rx="8" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      <line x1="79" y1="17" x2="91" y2="17" className="stroke-zinc-500 dark:stroke-zinc-400" strokeWidth="2" strokeLinecap="round" />
      <line x1="85" y1="11" x2="85" y2="23" className="stroke-zinc-500 dark:stroke-zinc-400" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ColorPickerThumb() {
  return (
    <svg viewBox="0 0 80 80" className="w-18 h-18" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Color spectrum square */}
      <defs>
        <linearGradient id="hue" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff0000" />
          <stop offset="17%" stopColor="#ffff00" />
          <stop offset="33%" stopColor="#00ff00" />
          <stop offset="50%" stopColor="#00ffff" />
          <stop offset="67%" stopColor="#0000ff" />
          <stop offset="83%" stopColor="#ff00ff" />
          <stop offset="100%" stopColor="#ff0000" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="52" height="52" rx="6" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" fill="url(#hue)" opacity="0.7" />
      {/* Picker dot */}
      <circle cx="30" cy="24" r="5" className="stroke-white" strokeWidth="2" fill="none" />
      {/* Hue slider */}
      <rect x="62" y="4" width="14" height="52" rx="7" fill="url(#hue)" />
      <rect x="60" y="20" width="18" height="6" rx="3" className="fill-white stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1" />
      {/* Color preview */}
      <rect x="4" y="62" width="16" height="14" rx="4" className="fill-primary-500" />
      <rect x="24" y="64" width="36" height="5" rx="1" className="fill-zinc-400 dark:fill-zinc-500" />
      <rect x="24" y="72" width="24" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
    </svg>
  )
}

function ToolbarThumb() {
  return (
    <svg viewBox="0 0 160 34" className="w-32 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="158" height="32" rx="4" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      {/* Action buttons */}
      {[12, 36, 60].map((x) => (
        <rect key={x} x={x} y="8" width="18" height="18" rx="4" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="0.5" />
      ))}
      {/* Separator */}
      <line x1="86" y1="8" x2="86" y2="26" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      {/* More action buttons */}
      {[94, 118].map((x) => (
        <rect key={x} x={x} y="8" width="18" height="18" rx="4" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="0.5" />
      ))}
      {/* Overflow menu */}
      <g>
        <circle cx="148" cy="13" r="1.5" className="fill-zinc-400 dark:fill-zinc-500" />
        <circle cx="148" cy="17" r="1.5" className="fill-zinc-400 dark:fill-zinc-500" />
        <circle cx="148" cy="21" r="1.5" className="fill-zinc-400 dark:fill-zinc-500" />
      </g>
    </svg>
  )
}

function MenuButtonThumb() {
  return (
    <svg viewBox="0 0 120 50" className="w-28 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Split button */}
      <rect x="10" y="2" width="60" height="24" rx="6" className="fill-primary-200 dark:fill-primary-800 stroke-primary-400 dark:stroke-primary-600" strokeWidth="1" />
      <rect x="18" y="9" width="30" height="6" rx="2" className="fill-primary-500 dark:fill-primary-400" />
      {/* Divider */}
      <line x1="56" y1="6" x2="56" y2="22" className="stroke-primary-400 dark:stroke-primary-600" strokeWidth="1" />
      {/* Arrow */}
      <path d="M62 12l4 4 4-4" className="stroke-primary-500 dark:stroke-primary-400" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Dropdown */}
      <rect x="28" y="28" width="66" height="20" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
      <rect x="34" y="32" width="36" height="5" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
      <rect x="34" y="40" width="28" height="5" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
    </svg>
  )
}

function RatingThumb() {
  return (
    <svg viewBox="0 0 120 24" className="w-28 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
      {[14, 34, 54, 74, 94].map((cx, i) => (
        <path
          key={cx}
          d={`M${cx} 4l2.5 5 5.5.8-4 3.9 1 5.5L${cx} 16.5l-5 2.7 1-5.5-4-3.9 5.5-.8z`}
          className={i < 3 ? 'fill-amber-400 dark:fill-amber-500' : i === 3 ? 'fill-amber-400/40 dark:fill-amber-500/40' : 'fill-zinc-200 dark:fill-zinc-700'}
          strokeWidth="0.5"
        />
      ))}
    </svg>
  )
}

function GenericThumb({ letter }: { letter: string }) {
  return (
    <svg viewBox="0 0 80 80" className="w-16 h-16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="72" height="72" rx="16" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" strokeDasharray="4 4" fill="none" />
      <text x="40" y="48" textAnchor="middle" className="fill-zinc-400 dark:fill-zinc-500" fontSize="28" fontWeight="bold">
        {letter}
      </text>
    </svg>
  )
}

// Map component slugs to their thumbnail illustrations
const thumbnailMap: Record<string, ComponentType> = {
  'navigation-bar': NavigationBarThumb,
  'tab-bar': TabBarThumb,
  sidebar: SidebarThumb,
  breadcrumb: BreadcrumbThumb,
  'menu-bar': MenuBarThumb,
  button: ButtonThumb,
  'text-field': TextFieldThumb,
  checkbox: CheckboxThumb,
  'toggle-switch': ToggleSwitchThumb,
  'dropdown-select': DropdownThumb,
  slider: SliderThumb,
  'alert-dialog': AlertDialogThumb,
  'toast-snackbar': ToastThumb,
  'progress-bar': ProgressBarThumb,
  spinner: SpinnerThumb,
  badge: BadgeThumb,
  modal: ModalThumb,
  popover: PopoverThumb,
  tooltip: TooltipThumb,
  'action-sheet': ActionSheetThumb,
  'context-menu': ContextMenuThumb,
  list: ListThumb,
  card: CardThumb,
  divider: DividerThumb,
  'floating-action-button': FloatingActionButtonThumb,
  'segmented-control': SegmentedControlThumb,
  'date-picker': DatePickerThumb,
  'time-picker': TimePickerThumb,
  'search-bar': SearchBarThumb,
  'radio-button': RadioButtonThumb,
  chips: ChipsThumb,
  tabs: TabsThumb,
  carousel: CarouselThumb,
  accordion: AccordionThumb,
  'tree-view': TreeViewThumb,
  stepper: StepperThumb,
  'color-picker': ColorPickerThumb,
  toolbar: ToolbarThumb,
  'menu-button': MenuButtonThumb,
  rating: RatingThumb,
}

export function getIllustrationThumbnail(slug: string): ComponentType | null {
  if (thumbnailMap[slug]) return thumbnailMap[slug]
  // Fallback: first letter in a dashed box
  const letter = slug.charAt(0).toUpperCase()
  return () => <GenericThumb letter={letter} />
}
