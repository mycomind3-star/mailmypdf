import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function uploadOrderPdf(orderId: string, fileName: string, file: File) {
  const db = getSupabaseAdminClient();
  if (!db) return null;

  const bucket = "letter-uploads";
  const objectPath = `orders/${orderId}/original.pdf`;
  const bytes = await file.arrayBuffer();

  const { error } = await db.storage.from(bucket).upload(objectPath, bytes, {
    contentType: "application/pdf",
    upsert: true,
  });

  if (error) throw error;

  await db
    .from("orders")
    .update({
      upload_path: objectPath,
      file_name: fileName,
      file_size_bytes: file.size,
    })
    .eq("id", orderId);

  return objectPath;
}

export async function createOrderPdfSignedUrl(orderId: string) {
  const db = getSupabaseAdminClient();
  if (!db) return null;

  const { data, error } = await db.storage
    .from("letter-uploads")
    .createSignedUrl(`orders/${orderId}/original.pdf`, 60 * 10);

  if (error) throw error;
  return data.signedUrl;
}
