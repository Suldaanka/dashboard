"use client";

import { useQueryClient } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "../expenses/data-table";
import { useFetch } from "@/hooks/useFetch";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddExpense } from "./_components/addExpense";

export default function ExpenseDashboard() {
  const queryClient = useQueryClient();
  const tableColumns = columns(queryClient);
  const { data, isLoading, isError } = useFetch("/api/expense", ["expenses"]);

  const isEmpty = !data || data.length === 0;

  const income = data?.filter((e) => e.type === "income") || [];
  const outcome = data?.filter((e) => e.type === "outcome") || [];

  const totalIncome = income.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const totalOutcome = outcome.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const netBalance = totalIncome - totalOutcome;

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen p-6 bg-background text-foreground">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground text-sm">Track and analyze your spending habits</p>
        </div>
      </div>

      {/* Summary Cards */}
      {!isEmpty && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <SummaryCard
            title="Total Income"
            amount={totalIncome}
            icon={<ArrowDownCircle className="text-green-500 w-6 h-6" />}
          />
          <SummaryCard
            title="Total Outcome"
            amount={totalOutcome}
            icon={<ArrowUpCircle className="text-red-500 w-6 h-6" />}
          />
          <SummaryCard
            title="Net Balance"
            amount={netBalance}
            icon={<Wallet className="text-blue-500 w-6 h-6" />}
          />
        </div>
      )}

      {/* Main Section */}
      {isError ? (
        <div className="text-center py-20">
          <p className="text-destructive text-lg font-semibold">Error loading expenses. Try again later.</p>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <PlusCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No expenses recorded</h3>
          <p className="text-muted-foreground max-w-md mb-4">
            Start tracking your expenses by adding your first entry.
          </p>
          <div>
            <AddExpense/>
          </div>
        </div>
      ) : (
        <div className="">
          <DataTable data={data} columns={tableColumns} />
        </div>
      )}
    </div>
  );
}

// Summary Card Component
function SummaryCard({ title, amount, icon }) {
  return (
    <div className="bg-card p-4 rounded-2xl shadow-sm border flex items-center gap-4">
      <div className="p-3 bg-muted rounded-full">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <h2 className="text-2xl font-bold">${amount.toFixed(2)}</h2>
      </div>
    </div>
  );
}
