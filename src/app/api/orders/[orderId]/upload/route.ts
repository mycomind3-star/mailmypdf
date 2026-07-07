import { NextResponse } from "next/server";
import { detectPdfPageCount } from "@/lib/pdf";
import { hasSupabaseEnv } from "@/lib/env";
import { addOrderEvent, findOrderById, findOrderByLookupToken, updateOrder } from "@/lib/orders";
import { uploadOrderPdf } from "@/lib/storage";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const formData = await request.formData();
  const file = formData.get("file");
  const lookupToken = String(formData.get("lookupToken") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "PDF file is required." }, { status: 400 });
  }

  const pageCount = await detectPdfPageCount(file);

  if (hasSupabaseEnv()) {
    const order = lookupToken ? await findOrderByLookupToken(orderId, lookupToken) : await findOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const uploadPath = await uploadOrderPdf(orderId, file.name, file);
    await updateOrder(orderId, {
      page_count: pageCount,
      status: "uploaded",
      upload_path: uploadPath,
      file_name: file.name,
      file_size_bytes: file.size,
    });
    await addOrderEvent(orderId, "file.uploaded", "The PDF was uploaded and validated.", {
      page_count: pageCount,
      upload_path: uploadPath,
    });
  }

  return NextResponse.json({
    orderId,
    fileName: file.name,
    pageCount,
    fileSizeBytes: file.size,
  });
}
