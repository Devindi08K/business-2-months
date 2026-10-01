import connectDB from "@/lib/db";
import Message from "@/models/Message";
import Booking from "@/models/Booking";
import Item from "@/models/Item";
import AuditLog from "@/models/AuditLog";
import { requireAuth } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    await requireAuth();
    await connectDB();

    const [
      unreadMessages,
      pendingBookings,
      totalItems,
      recentMessages,
      recentBookings,
      recentAudit,
    ] = await Promise.all([
      Message.countDocuments({ isRead: false }),
      Booking.countDocuments({ status: "pending" }),
      Item.countDocuments(),
      Message.find().sort({ createdAt: -1 }).limit(5).lean(),
      Booking.find().sort({ createdAt: -1 }).limit(5).lean(),
      AuditLog.find().sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    return jsonOk({
      counts: {
        unreadMessages,
        pendingBookings,
        totalItems,
      },
      recentMessages,
      recentBookings,
      recentAudit,
    });
  } catch (err) {
    return handleApiError(err, "admin/dashboard");
  }
}
