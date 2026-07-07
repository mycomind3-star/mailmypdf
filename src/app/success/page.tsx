import { SuccessPage } from "@/components/success-page";

export default async function SuccessRoute({
  searchParams,
}: {
  searchParams: { session_id?: string; order_id?: string; token?: string };
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams);

  return (
    <SuccessPage
      sessionId={resolvedSearchParams.session_id ?? null}
      orderId={resolvedSearchParams.order_id ?? ""}
      token={resolvedSearchParams.token ?? null}
    />
  );
}
