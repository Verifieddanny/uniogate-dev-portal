import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  BookOpen01Icon,
  BubbleChatIcon,
  Copy01Icon,
  Mail01Icon,
  Menu01Icon,
  Notification01Icon,
  Search01Icon,
  Tick02Icon,
  TestTube01Icon,
  Plug01Icon,
} from '@hugeicons/core-free-icons';

// The one place icon names live. Swap here, and every usage follows.
export const ICONS = {
  arrowDown: ArrowDown01Icon,
  arrowRight: ArrowRight01Icon,
  book: BookOpen01Icon,
  chat: BubbleChatIcon,
  copy: Copy01Icon,
  mail: Mail01Icon,
  menu: Menu01Icon,
  bell: Notification01Icon,
  search: Search01Icon,
  check: Tick02Icon,
  simulated: TestTube01Icon,
  live: Plug01Icon,
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 16,
  className,
  strokeWidth = 1.8,
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return <HugeiconsIcon icon={ICONS[name]} size={size} strokeWidth={strokeWidth} className={className} aria-hidden />;
}