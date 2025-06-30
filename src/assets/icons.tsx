import {
  Dumbbell,
  BookOpen,
  Check,
  ChartNetwork,
  Calendar,
  BriefcaseBusiness,
  BicepsFlexed,
  Target,
  BookText,
  NotebookPen,
  Atom,
  Apple,
  Brain,
  Bitcoin,
  Drum,
  Gamepad2,
  Heart,
  HeartHandshake,
  Flame,
  Gem,
  Car,
  Code,
} from "lucide-react";

export const icons = {
  Dumbbell: Dumbbell,
  BookOpen: BookOpen,
  Check: Check,
  ChartNetwork: ChartNetwork,
  Calendar: Calendar,
  BriefcaseBusiness: BriefcaseBusiness,
  BicepsFlexed: BicepsFlexed,
  Target: Target,
  BookText: BookText,
  NotebookPen: NotebookPen,
  Atom: Atom,
  Apple: Apple,
  Brain: Brain,
  Bitcoin: Bitcoin,
  Drum: Drum,
  Gamepad2: Gamepad2,
  Heart: Heart,
  HeartHandshake: HeartHandshake,
  Flame: Flame,
  Gem: Gem,
  Car: Car,
  Code: Code,
};

export const getIconComponent = (icon: IconName) => {
  return icons[icon] || null;
};

export type IconName = keyof typeof icons;