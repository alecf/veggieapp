import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownCircle, CheckCircle2, Plus, X, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";

// Simple Toast component
const Toast = ({
  message,
  title,
  onClose,
}: {
  message: string;
  title: string;
  onClose: () => void;
}) => (
  <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
    <div className="bg-white rounded-lg shadow-lg border p-4 max-w-sm">
      <div className="flex justify-between items-start">
        <div>
          {title && <h4 className="font-medium mb-1">{title}</h4>}
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  </div>
);

const FoodTracker = () => {
  const defaultFoods = [
    "Apple",
    "Banana",
    "Orange",
    "Strawberry",
    "Blueberry",
    "Spinach",
    "Kale",
    "Carrot",
    "Broccoli",
    "Cucumber",
    "Tomato",
    "Bell Pepper",
    "Cauliflower",
    "Sweet Potato",
    "Peas",
    "Asparagus",
    "Zucchini",
    "Mango",
    "Pineapple",
    "Grapes",
    "Brussels Sprouts",
    "Green Beans",
    "Celery",
    "Radish",
    "Mushroom",
    "Lettuce",
    "Beet",
    "Cabbage",
    "Eggplant",
    "Avocado",
    "Watermelon",
    "Pear",
    "Plum",
    "Pomegranate",
    "Artichoke",
  ].sort();

  const [customFoods, setCustomFoods] = useState<string[]>(() => {
    const savedCustomFoods = localStorage.getItem("trackerCustomFoods");
    return savedCustomFoods ? JSON.parse(savedCustomFoods) : [];
  });

  const foods = [...defaultFoods, ...customFoods].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );

  const [eatenFoods, setEatenFoods] = useState<Set<string>>(() => {
    const savedEatenFoods = localStorage.getItem("trackerEatenFoods");
    return new Set(savedEatenFoods ? JSON.parse(savedEatenFoods) : []);
  });

  const [weekStart, setWeekStart] = useState<string>(() => {
    const savedWeekStart = localStorage.getItem("trackerWeekStart");
    return savedWeekStart || new Date().toLocaleDateString();
  });

  const [showReport, setShowReport] = useState(false);
  const [newFood, setNewFood] = useState("");
  const [toast, setToast] = useState<{ title: string; message: string } | null>(
    null,
  );

  const showToast = (title: string, message: string) => {
    setToast({ title, message });
    // Auto-dismiss after 3 seconds
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    localStorage.setItem("trackerCustomFoods", JSON.stringify(customFoods));
  }, [customFoods]);

  useEffect(() => {
    localStorage.setItem("trackerEatenFoods", JSON.stringify([...eatenFoods]));
  }, [eatenFoods]);

  useEffect(() => {
    localStorage.setItem("trackerWeekStart", weekStart);
  }, [weekStart]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const startDate = new Date(weekStart).getTime();
      const daysPassed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));

      if (daysPassed >= 7) {
        setShowReport(true);
        if (!showReport) {
          setEatenFoods(new Set());
          setWeekStart(new Date().toLocaleDateString());
        }
      }
    }, 1000 * 60 * 60);

    return () => clearInterval(timer);
  }, [weekStart, showReport]);

  const toggleFood = (food: string) => {
    const newEatenFoods = new Set(eatenFoods);
    if (newEatenFoods.has(food)) {
      newEatenFoods.delete(food);
    } else {
      newEatenFoods.add(food);
    }
    setEatenFoods(newEatenFoods);
  };

  const addNewFood = (
    e: React.FormEvent<HTMLFormElement | HTMLInputElement>,
  ) => {
    e.preventDefault();
    const formattedFood = newFood.trim();

    if (!formattedFood) return;

    // Check if food already exists (case-insensitive)
    const existingFood = foods.find(
      (food) => food.toLowerCase() === formattedFood.toLowerCase(),
    );

    if (existingFood) {
      // If it exists but wasn't eaten, mark it as eaten
      if (!eatenFoods.has(existingFood)) {
        setEatenFoods(new Set([...eatenFoods, existingFood]));
        showToast(
          "Already in your list!",
          `${existingFood} was already in your list. Marked it as eaten for you.`,
        );
      } else {
        showToast(
          "Already in your list!",
          `${existingFood} was already in your list and marked as eaten.`,
        );
      }
    } else {
      // Add new food and mark as eaten
      setCustomFoods((prev) =>
        [...prev, formattedFood].sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: "base" }),
        ),
      );
      setEatenFoods(new Set([...eatenFoods, formattedFood]));
    }
    // Clear the input
    setNewFood("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addNewFood(e);
    }
  };

  const getProgressMessage = () => {
    const remaining = 30 - eatenFoods.size;
    if (remaining <= 0) return "🎉 Congratulations! You've reached your goal!";
    return `${remaining} more unique items to reach your goal`;
  };

  const getWeeklyReport = () => {
    const percentage = (eatenFoods.size / 30) * 100;
    let message = "";

    if (percentage >= 100) {
      message =
        "Amazing job! You've achieved your goal of 30 different fruits and vegetables!";
    } else if (percentage >= 75) {
      message =
        "Great effort! You're well on your way to a varied, healthy diet!";
    } else if (percentage >= 50) {
      message = "Good progress! Keep exploring new fruits and vegetables!";
    } else {
      message =
        "You've made a start! Next week, try to add more variety to your diet!";
    }

    return (
      <div className="p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-bold mb-2">Weekly Report</h3>
        <p>{message}</p>
        <p className="mt-2">
          You ate {eatenFoods.size} different fruits and vegetables this week.
        </p>
        {customFoods.length > 0 && (
          <p className="mt-2 text-sm text-gray-600">
            Including {customFoods.length} custom items you've added
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-full w-full">
      <div className="max-w-md mx-auto p-4">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-xl">
              Weekly Fruit & Veggie Tracker
              <div className="text-sm font-normal mt-1">
                Week starting: {weekStart}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="text-lg">
                {eatenFoods.size}/30
              </Badge>
              <div className="text-sm text-gray-600">
                {getProgressMessage()}
              </div>
            </div>

            <form onSubmit={addNewFood} className="flex gap-2 mb-4">
              <Input
                type="text"
                value={newFood}
                onChange={(e) => setNewFood(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Add new fruit or vegetable"
                className="flex-1"
              />
              <Button type="submit" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </form>

            <Tabs defaultValue="uneaten" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="uneaten">To Eat</TabsTrigger>
                <TabsTrigger value="eaten">Eaten</TabsTrigger>
              </TabsList>

              <TabsContent value="uneaten">
                <div className="grid grid-cols-2 gap-2">
                  {foods
                    .filter((food) => !eatenFoods.has(food))
                    .map((food) => (
                      <button
                        key={food}
                        onClick={() => toggleFood(food)}
                        className="flex items-center justify-between p-2 rounded border hover:bg-gray-50"
                      >
                        <span>{food}</span>
                        <XCircle className="w-5 h-5 text-gray-300" />
                      </button>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="eaten">
                <div className="grid grid-cols-2 gap-2">
                  {foods
                    .filter((food) => eatenFoods.has(food))
                    .map((food) => (
                      <button
                        key={food}
                        onClick={() => toggleFood(food)}
                        className="flex items-center justify-between p-2 rounded border hover:bg-gray-50"
                      >
                        <span>{food}</span>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </button>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {showReport && getWeeklyReport()}

        <div className="mt-4 text-center text-gray-500">
          <ArrowDownCircle className="w-6 h-6 mx-auto mb-1" />
          Install this PWA for offline use
        </div>

        {toast && (
          <Toast
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default FoodTracker;
