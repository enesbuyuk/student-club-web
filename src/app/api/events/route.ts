import connect from "@/utils/startMongo";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const limitParam = new URL(request.url).searchParams.get("limit");
        const limit = limitParam ? parseInt(limitParam) : 100;

        const client = await connect;
        const db = client.db("university-student-club");
        const collection = db.collection("announcements");

        const cursor = collection
            .find({ announcement_type: "event" })
            .sort({ date: -1 })
            .limit(limit);

        const data = await cursor.toArray();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Events fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch events" },
            { status: 500 }
        );
    }
}