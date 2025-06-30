import type { Habit } from "@/types/habit";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Check } from "lucide-react";
import { getIconComponent } from "@/assets/icons";

interface HabitCardProps
  extends Omit<Habit, "id" | "userId" | "createdAt" | "updatedAt"> {
  onToggle: () => void;
}

const HabitCard = ({
  name,
  goal,
  streak,
  isDone,
  onToggle,
  icon,
}: HabitCardProps) => {
  const Icon = getIconComponent(icon);
  return (
    <Card className="bg-card hover:bg-card/80 transition-colors">
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-muted">
              {Icon && <Icon className="h-6 w-6 text-foreground" />}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">{name}</h3>
              <p className="text-muted-foreground">{goal}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{streak}</div>
              <div className="text-sm text-muted-foreground flex items-center">
                🔥 days
              </div>
            </div>
            <Button
              variant={isDone ? "default" : "secondary"}
              size="icon"
              onClick={onToggle}
              className="h-12 w-12 rounded-full cursor-pointer"
            >
              <Check className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitCard;
