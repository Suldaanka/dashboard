import { NextResponse } from "next/server";

export async function GET(request, context) {
    const params = await context.params;
    const roomId = params.id;
    
    try {
        const User = await prisma.room.findUnique({where: {id: roomId}})
        if (!User) {
            return NextResponse.json({error: "Room not found"}, {status: 404})
        }
        return NextResponse.json(User, {status: 200})
    } catch (error) {
        return NextResponse.json(
            {error: "Something went wrong"},
            {status: 500}
        );
    }
}