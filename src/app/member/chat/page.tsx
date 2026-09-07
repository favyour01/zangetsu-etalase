import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import { MessageSquare, Send } from "lucide-react";

async function getChats(userId: string) {
  return prisma.chat.findMany({
    where: { userId },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export default async function MemberChatPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const chats = await getChats((session.user as Record<string, unknown>).id as string);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <MessageSquare size={22} />
          Chat Support
        </h2>
        <p className="text-gray-500 text-sm mt-1">Hubungi tim support kami</p>
      </div>

      <div className="card p-6">
        {chats.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada percakapan</p>
            <p className="text-sm text-gray-400 mt-1">Mulai chat baru dengan tim support</p>
            <button className="btn btn-primary mt-4">
              <Send size={16} /> Mulai Chat Baru
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => (
              <div key={chat.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-gray-800">{chat.subject || "Percakapan"}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {chat.messages[0]?.content || "Belum ada pesan"}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={chat.status} />
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(chat.updatedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
