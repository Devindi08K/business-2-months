export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Message from "@/models/Message";
import { requireAuth } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET(request) {
  try {
    await requireAuth();
    await connectDB();
    const { searchParams } = new URL(request.url);
    const unread = searchParams.get("unread");
    const filter = unread === "1" ? { isRead: false } : {};
    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    return jsonOk({ messages });
  } catch (err) {
    return handleApiError(err, "admin/messages");
  }
}
