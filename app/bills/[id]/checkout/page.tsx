import { CheckoutWorkspace } from "@/components/CheckoutWorkspace";

export default async function CheckoutBillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CheckoutWorkspace billId={id} />;
}
