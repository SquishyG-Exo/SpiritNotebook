import {
  ArrowLeft,
  BookmarkPlus,
  BookOpen,
  Briefcase,
  CalendarDays,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleHelp,
  Coins,
  Compass,
  Eye,
  EyeOff,
  Feather,
  Flame,
  Flower2,
  Gem,
  Globe,
  Handshake,
  Hash,
  Heart,
  HeartCrack,
  House,
  Image,
  Infinity,
  Languages,
  Leaf,
  Lightbulb,
  Lock,
  LockKeyhole,
  MessageCircle,
  MessageSquare,
  Moon,
  PawPrint,
  PenLine,
  PersonStanding,
  Phone,
  Plane,
  Plus,
  Repeat,
  RotateCcw,
  Scale,
  Send,
  Sparkle,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Trash2,
  UserRound,
  Users,
  Waves,
  X,
  type LucideProps,
} from 'lucide-react-native';
import type { ComponentType } from 'react';

import { colors } from '../theme';

/**
 * Icons are referenced by name from brand config so a re-skin can swap them
 * without touching components. Add to this map when a new name is needed.
 */
export const ICONS = {
  ArrowLeft,
  BookmarkPlus,
  BookOpen,
  Briefcase,
  CalendarDays,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleHelp,
  Coins,
  Compass,
  Eye,
  EyeOff,
  Feather,
  Flame,
  Flower2,
  Gem,
  Globe,
  Handshake,
  Hash,
  Heart,
  HeartCrack,
  House,
  Image,
  Infinity,
  Languages,
  Leaf,
  Lightbulb,
  Lock,
  LockKeyhole,
  MessageCircle,
  MessageSquare,
  Moon,
  PawPrint,
  PenLine,
  PersonStanding,
  Phone,
  Plane,
  Plus,
  Repeat,
  RotateCcw,
  Scale,
  Send,
  Sparkle,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Trash2,
  UserRound,
  Users,
  Waves,
  X,
} satisfies Record<string, ComponentType<LucideProps>>;

export type IconName = keyof typeof ICONS;

export interface IconProps extends Omit<LucideProps, 'color' | 'size'> {
  name: IconName | string;
  size?: number;
  color?: string;
}

export function isIconName(name: string): name is IconName {
  return name in ICONS;
}

/** Thin-stroke line icon, matching the brand's light visual weight. */
export function Icon({ name, size = 22, color = colors.ink, strokeWidth = 1.75, ...rest }: IconProps) {
  const Component = isIconName(name) ? ICONS[name] : Sparkle;
  return <Component size={size} color={color} strokeWidth={strokeWidth} {...rest} />;
}
