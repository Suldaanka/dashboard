import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const expenses = await prisma.expense.groupBy({
    by: ['categoryId'],
    where: {
      createdAt: {
        gte: start,
        lt: end,
      },
    },
    _sum: {
      amount: true,
    },
    orderBy: {
      _sum: {
        amount: 'desc', // Order by sum amount in descending order
      },
    },
    take: 3, // Take only the top 3 results
  })

  const ExpenseCategory = await prisma.ExpenseCategory.findMany();

  const mixedData = expenses.map((expense) => {
    const category = ExpenseCategory.find((cat) => cat.id === expense.categoryId);
    return {
      category: category.name,
      amount: expense._sum.amount || 0,  
    };
  });

  console.log("this is mix data",mixedData)



  return NextResponse.json(mixedData)
}
