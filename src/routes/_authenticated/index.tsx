import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../hooks/useAuth";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Habit } from "@/types/habit";
import HabitCard from "@/components/habit-card";

export const Route = createFileRoute("/_authenticated/")({
  component: Index,
});

const habits: Habit[] = [
  {
    id: "1",
    name: "Morning Workout",
    goal: "30 mins",
    streak: 42,
    icon: "Dumbbell",
    isDone: true,
    userId: "",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "2",
    name: "Read a Book",
    goal: "1 chapter",
    streak: 115,
    icon: "BookOpen",
    isDone: false,
    userId: "",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "3",
    name: "Read a Book",
    goal: "1 chapter",
    streak: 115,
    icon: "BookOpen",
    isDone: false,
    userId: "",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "4",
    name: "Read a Book",
    goal: "1 chapter",
    streak: 115,
    icon: "BookOpen",
    isDone: false,
    userId: "",
    createdAt: "",
    updatedAt: "",
  },
];

function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddNewHabit = () => {
    navigate({ to: "/add-habit" });
  };

  const handleHabitClick = (id: string) => {
    navigate({ to: "/habit/$id", params: { id } });
  };

  console.log(user);
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl mt-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Habits</h1>
          <p className="text-lg text-muted-foreground">
            {"Let's make today count!"}
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full mb-6 h-16 border-dashed border-2 hover:bg-muted/50 transition-colors bg-transparent"
          onClick={handleAddNewHabit}
        >
          <Plus className="mr-2 h-5 w-5" />
          Add New Habit
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((habit) => (
            <div
              key={habit.id}
              onClick={() => handleHabitClick(habit.id)}
              className="cursor-pointer"
            >
              <HabitCard
                onToggle={function (): void {
                  throw new Error("Function not implemented.");
                }}
                {...habit}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
