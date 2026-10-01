export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import { requireAuth } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET(request) {
  try {
    await requireAuth();
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const filter = status ? { status } : {};
    const bookings = await Booking.find(filter).sort({ date: 1, time: 1 }).lean();
    return jsonOk({ bookings });
  } catch (err) {
    return handleApiError(err, "admin/bookings");
  }
}
