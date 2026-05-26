import { LiveAssignmentWorkspace } from "@/components/LiveAssignmentWorkspace";

export default async function LiveBillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LiveAssignmentWorkspace billId={id} />;
}
