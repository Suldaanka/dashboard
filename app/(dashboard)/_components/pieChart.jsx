"use client"
import { useState, useEffect } from "react"
import { TrendingUp } from "lucide-react"
import { Pie, PieChart, Sector } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useFetch } from "@/hooks/useFetch"
import { useTheme } from "next-themes"

// Using CSS variables that will automatically switch with theme
const COLOR_PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
]

export function PChart() {
  const { data, loading, error } = useFetch("api/revenue/expenses", ["expenses"])
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (loading) return (
    <Card className="flex flex-col">
      <CardHeader className="items-center">
        <CardTitle>Loading...</CardTitle>
      </CardHeader>
    </Card>
  )

  if (error) return (
    <Card className="flex flex-col">
      <CardHeader className="items-center">
        <CardTitle>Error</CardTitle>
        <CardDescription>{error}</CardDescription>
      </CardHeader>
    </Card>
  )

  // Process data for the chart (keeping your original structure)
  const categories = [...new Set(data?.map(item => item.category))] || []
  const chartData = data?.map((item, index) => ({
    category: item.category,
    amount: parseInt(item.amount, 10),
    fill: COLOR_PALETTE[index % COLOR_PALETTE.length]
  })) || []

  // Original chart config setup
  const chartConfig = {
    amount: {
      label: "Amount",
    },
    ...categories.reduce((acc, category, index) => {
      acc[category] = {
        label: category,
        color: COLOR_PALETTE[index % COLOR_PALETTE.length],
      }
      return acc
    }, {})
  }

  const totalAmount = chartData.reduce((sum, item) => sum + item.amount, 0)

  return (
    <Card className="flex flex-col ">
      <CardHeader className="items-center pb-0">
        <CardTitle>Expense Categories</CardTitle>
        <CardDescription>Total: ${totalAmount}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={0}
              activeShape={({
                outerRadius = 0,
                ...props
              }) => (
                <Sector {...props} outerRadius={outerRadius + 10} />
              )}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {chartData.length} Categories <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Data from expense records
        </div>
      </CardFooter>
      <div>
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between px-8 gap-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.fill }}
              />
              <div>{item.category}</div>
            </div>
            <div>${item.amount}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}