import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../hooks/useAuth";
import { useManageHabits } from "../../hooks/useManageHabits";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import HabitCard from "@/components/habit-card";

export const Route = createFileRoute("/_authenticated/")({
  component: Index,
});

function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { habits, isLoadingHabits, habitsError, toggleHabit, isTogglingHabit } =
    useManageHabits();

  const handleAddNewHabit = () => {
    navigate({ to: "/add-habit" });
  };

  const handleHabitClick = (id: string) => {
    navigate({ to: "/habit/$id", params: { id } });
  };

  const handleToggleHabit = (habitId: string) => {
    toggleHabit(habitId);
  };

  if (isLoadingHabits) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading habits...</div>
      </div>
    );
  }

  if (habitsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-red-500">
          Error loading habits: {habitsError.message}
        </div>
      </div>
    );
  }

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

        {habits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              No habits yet. Start building your routine!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.map((habit) => (
              <div key={habit.id} className="cursor-pointer">
                <HabitCard
                  onToggle={() => handleToggleHabit(habit.id)}
                  disabled={isTogglingHabit}
                  onCardClick={() => handleHabitClick(habit.id)}
                  {...habit}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
