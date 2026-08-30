import { db } from "@/lib/db";
import { ContactMessagesClient } from "@/components/admin/contact-messages-client";

export default async function AdminContactPage() {
  const messages = await db.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return <ContactMessagesClient messages={JSON.parse(JSON.stringify(messages))} />;
}
