import { SplitWorkspace } from "@/components/SplitWorkspace";

export default async function SplitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SplitWorkspace billId={id} />;
}
