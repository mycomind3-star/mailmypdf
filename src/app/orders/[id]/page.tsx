import { OrderPage } from "@/components/order-page";

export default async function OrderDetailsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { token?: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);

  return <OrderPage orderId={resolvedParams.id} token={resolvedSearchParams.token ?? null} />;
}
