import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await prisma.$connect();
        const expenses = await prisma.expense.findMany();

        
            const ExpenseCategory = await prisma.ExpenseCategory.findMany();

            const mixedData = expenses.map((expense) => {
                const category = ExpenseCategory.find((cat) => cat.id === expense.categoryId);
                return {
                    ...expense,
                    categoryName: category ? category.name : "Unknown",
                };
            });

            
        

        return NextResponse.json( mixedData , { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }finally{
        prisma.$disconnect();
    }
}