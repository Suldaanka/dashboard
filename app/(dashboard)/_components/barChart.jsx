"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Rectangle,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { TrendingUp } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useFetch } from "@/hooks/useFetch";

const chartConfig = {
  amount: {
    label: "Amount",
  },
  hall: {
    label: "Hall",
    color: "#4f46e1",
  },
  deen: {
    label: "Deen",
    color: "var(--chart-2)",
  },
  qudaar: {
    label: "Qudaar",
    color: "var(--chart-3)",
  },
  shidaal: {
    label: "Shidaal",
    color: "var(--chart-4)",
  },
  Farsamo: {
    label: "Farsamo",
    color: "var(--chart-5)",
  },
};

export function BChart() {
  const { data, isLoading, isError } = useFetch("/api/revenue/expenses", ["expenses"]);

  // Prepare data with amount as number and fill color
  const chartData = data
    ? data.map((item) => ({
        ...item,
        amount: parseFloat(item.amount), // ensure amount is a number
        fill: chartConfig[item.category]?.color || "var(--chart-1)",
      }))
    : [];

  if (isLoading) {
    return (
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Expenses Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Loading chart data...</p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Expenses Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error loading chart data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle>Expense by Category</CardTitle>
        <CardDescription>Visual breakdown of your expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ChartContainer config={chartConfig}>
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="category"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => chartConfig[value]?.label ?? value}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar
                dataKey="amount"
                radius={[8, 8, 0, 0]}
                isAnimationActive
                fill="#4f46e1"
                activeBar={(props) => (
                  <Rectangle
                    {...props}
                    fillOpacity={0.85}
                    stroke={props.payload.fill}
                    strokeWidth={2}
                    strokeDasharray="4"
                  />
                )}
              />
            </BarChart>
          </ChartContainer>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium text-muted-foreground">
          Trending up by <span className="text-foreground">5.2%</span> this month
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
      </CardFooter>
    </Card>
  );
}
