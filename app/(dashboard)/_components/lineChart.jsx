"use client"
import { TrendingDown, TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
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

const chartConfig = {
  booking: {
    label: "Booking Revenue",
    color: "var(--color-chart-1)",
  },
  order: {
    label: "Order Revenue",
    color: "hsl(var(--chart-2))",
  },
}

export function LnChart() {
  const { data: revenueData, loading, error } = useFetch('/api/revenue/monthly',['revenue'])

  if (loading) return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Loading Revenue Data...</CardTitle>
      </CardHeader>
    </Card>
  )

  if (error) return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Error</CardTitle>
        <CardDescription>{error.message}</CardDescription>
      </CardHeader>
    </Card>
  )

  // Calculate total growth percentage
  const totalGrowth = revenueData && revenueData.length > 1 ? 
    ((revenueData[revenueData.length-1].booking + revenueData[revenueData.length-1].order) / 
     (revenueData[revenueData.length-2].booking + revenueData[revenueData.length-2].order) - 1) * 100 : 0

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Monthly Revenue</CardTitle>
        <CardDescription>Last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={revenueData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="booking"
              type="monotone"
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="order"
              type="monotone"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {totalGrowth > 0 ? 'Trending up' : 'Trending down'} by {Math.abs(totalGrowth).toFixed(1)}% this month 
              {totalGrowth > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Showing total revenue for the last 6 months
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}