// One module per icon: Metro does not tree-shake, so importing from the package root would
// bundle all ~1,850 lucide icons. Add a line here (and to ICONS) for each new name.
import ArrowLeft from 'lucide-react-native/icons/arrow-left';
import BookHeart from 'lucide-react-native/icons/book-heart';
import Bookmark from 'lucide-react-native/icons/bookmark';
import BookmarkCheck from 'lucide-react-native/icons/bookmark-check';
import BookmarkPlus from 'lucide-react-native/icons/bookmark-plus';
import BookOpen from 'lucide-react-native/icons/book-open';
import BookOpenText from 'lucide-react-native/icons/book-open-text';
import Briefcase from 'lucide-react-native/icons/briefcase';
import CalendarDays from 'lucide-react-native/icons/calendar-days';
import CalendarPlus from 'lucide-react-native/icons/calendar-plus';
import Camera from 'lucide-react-native/icons/camera';
import Check from 'lucide-react-native/icons/check';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import ChevronUp from 'lucide-react-native/icons/chevron-up';
import CircleAlert from 'lucide-react-native/icons/circle-alert';
import CircleHelp from 'lucide-react-native/icons/circle-question-mark';
import CirclePlus from 'lucide-react-native/icons/circle-plus';
import CircleUserRound from 'lucide-react-native/icons/circle-user-round';
import CircleX from 'lucide-react-native/icons/circle-x';
import Clock from 'lucide-react-native/icons/clock';
import Coins from 'lucide-react-native/icons/coins';
import Compass from 'lucide-react-native/icons/compass';
import Eye from 'lucide-react-native/icons/eye';
import EyeOff from 'lucide-react-native/icons/eye-off';
import Feather from 'lucide-react-native/icons/feather';
import Flame from 'lucide-react-native/icons/flame';
import Flower2 from 'lucide-react-native/icons/flower-2';
import Gem from 'lucide-react-native/icons/gem';
import Globe from 'lucide-react-native/icons/globe';
import HandHeart from 'lucide-react-native/icons/hand-heart';
import Handshake from 'lucide-react-native/icons/handshake';
import Hash from 'lucide-react-native/icons/hash';
import Heart from 'lucide-react-native/icons/heart';
import HeartCrack from 'lucide-react-native/icons/heart-crack';
import House from 'lucide-react-native/icons/house';
import ImageIcon from 'lucide-react-native/icons/image';
import InfinityIcon from 'lucide-react-native/icons/infinity';
import Languages from 'lucide-react-native/icons/languages';
import Leaf from 'lucide-react-native/icons/leaf';
import Lightbulb from 'lucide-react-native/icons/lightbulb';
import ListFilter from 'lucide-react-native/icons/list-filter';
import Lock from 'lucide-react-native/icons/lock';
import LockKeyhole from 'lucide-react-native/icons/lock-keyhole';
import MessageCircle from 'lucide-react-native/icons/message-circle';
import MessageCircleHeart from 'lucide-react-native/icons/message-circle-heart';
import MessageSquare from 'lucide-react-native/icons/message-square';
import Moon from 'lucide-react-native/icons/moon';
import MoonStar from 'lucide-react-native/icons/moon-star';
import NotebookPen from 'lucide-react-native/icons/notebook-pen';
import PawPrint from 'lucide-react-native/icons/paw-print';
import Pencil from 'lucide-react-native/icons/pencil';
import PenLine from 'lucide-react-native/icons/pen-line';
import PersonStanding from 'lucide-react-native/icons/person-standing';
import Phone from 'lucide-react-native/icons/phone';
import Plane from 'lucide-react-native/icons/plane';
import Plus from 'lucide-react-native/icons/plus';
import Quote from 'lucide-react-native/icons/quote';
import RefreshCw from 'lucide-react-native/icons/refresh-cw';
import Repeat from 'lucide-react-native/icons/repeat';
import RotateCcw from 'lucide-react-native/icons/rotate-ccw';
import Scale from 'lucide-react-native/icons/scale';
import Search from 'lucide-react-native/icons/search';
import Send from 'lucide-react-native/icons/send';
import Settings from 'lucide-react-native/icons/settings';
import Share2 from 'lucide-react-native/icons/share-2';
import Shuffle from 'lucide-react-native/icons/shuffle';
import Sparkle from 'lucide-react-native/icons/sparkle';
import Sparkles from 'lucide-react-native/icons/sparkles';
import Sprout from 'lucide-react-native/icons/sprout';
import Star from 'lucide-react-native/icons/star';
import Sun from 'lucide-react-native/icons/sun';
import Sunrise from 'lucide-react-native/icons/sunrise';
import Sunset from 'lucide-react-native/icons/sunset';
import Trash2 from 'lucide-react-native/icons/trash';
import UserRound from 'lucide-react-native/icons/user-round';
import Users from 'lucide-react-native/icons/users';
import Waves from 'lucide-react-native/icons/waves-horizontal';
import Wind from 'lucide-react-native/icons/wind';
import X from 'lucide-react-native/icons/x';
import type { LucideProps } from 'lucide-react-native';
import type { ComponentType } from 'react';

import { colors } from '../theme';
import { Butterfly, Lotus } from './customIcons';

/**
 * Icons are referenced by name from brand config so a re-skin can swap them
 * without touching components. Add to this map when a new name is needed.
 */
export const ICONS = {
  ArrowLeft,
  BookHeart,
  Bookmark,
  BookmarkCheck,
  BookmarkPlus,
  BookOpen,
  BookOpenText,
  Briefcase,
  CalendarDays,
  CalendarPlus,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  CircleHelp,
  CirclePlus,
  CircleUserRound,
  CircleX,
  Clock,
  Coins,
  Compass,
  Eye,
  EyeOff,
  Feather,
  Flame,
  Flower2,
  Gem,
  Globe,
  HandHeart,
  Handshake,
  Hash,
  Heart,
  HeartCrack,
  House,
  Image: ImageIcon,
  Infinity: InfinityIcon,
  Languages,
  Leaf,
  Lightbulb,
  ListFilter,
  Lock,
  LockKeyhole,
  MessageCircle,
  MessageCircleHeart,
  MessageSquare,
  Moon,
  MoonStar,
  NotebookPen,
  PawPrint,
  Pencil,
  PenLine,
  PersonStanding,
  Phone,
  Plane,
  Plus,
  Quote,
  RefreshCw,
  Repeat,
  RotateCcw,
  Scale,
  Search,
  Send,
  Settings,
  Share2,
  Shuffle,
  Sparkle,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Sunrise,
  Sunset,
  Trash2,
  UserRound,
  Users,
  Waves,
  Wind,
  X,
  // Custom line icons (src/ui/customIcons.tsx)
  Butterfly,
  Lotus,
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
