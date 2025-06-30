import type { IconName } from "@/assets/icons";
import { icons } from "@/assets/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const habitFormSchema = z.object({
  name: z
    .string()
    .min(1, "Habit name is required")
    .max(50, "Name must be less than 50 characters"),
  goal: z
    .string()
    .min(1, "Goal is required")
    .max(100, "Goal must be less than 100 characters"),
  icon: z.string().min(1, "Please select an icon"),
});

type HabitFormData = z.infer<typeof habitFormSchema>;
type Props = {
  id?: string;
};
const HabitForm = ({ id }: Props) => {
  const navigate = useNavigate();

  const form = useForm<HabitFormData>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      name: "",
      goal: "",
      icon: "",
    },
  });

  const iconNames = Object.keys(icons) as IconName[];
  const selectedIcon = form.watch("icon") as IconName | "";

  const onSubmit = (data: HabitFormData) => {
    console.log(data);
    // Handle form submission here

    // Navigate back to dashboard after successful submission
    navigate({ to: "/" });
  };

  const handleGoBack = () => {
    navigate({ to: "/" });
  };
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="mr-4"
              onClick={handleGoBack}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {id ? "Edit Habit" : "Create New Habit"}
              </h1>
              <p className="text-muted-foreground mt-1">
                Fill in the details below.
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium text-foreground">
                    Habit Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Meditate"
                      className="h-14 text-base bg-card border-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium text-foreground">
                    Goal
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 15 minutes"
                      className="h-14 text-base bg-card border-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium text-foreground">
                    Choose an Icon
                  </FormLabel>
                  <FormControl>
                    <div className="overflow-x-auto">
                      <div className="flex space-x-3 py-2 min-w-max">
                        {iconNames.map((iconName) => {
                          const IconComponent = icons[iconName];
                          return (
                            <button
                              key={iconName}
                              type="button"
                              onClick={() => field.onChange(iconName)}
                              className={`flex-shrink-0 p-4 rounded-xl border-2 transition-all duration-200 bg-card hover:bg-card/80 cursor-pointer ${
                                selectedIcon === iconName
                                  ? "border-primary ring-2 ring-primary/20"
                                  : "border-border hover:border-border/80"
                              }`}
                            >
                              <IconComponent className="h-8 w-8 text-foreground" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
              disabled={!form.formState.isValid}
            >
              {id ? "Update Habit" : "Save Habit"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default HabitForm;
