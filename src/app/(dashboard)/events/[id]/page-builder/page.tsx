import PageBuilderLayout from "@/components/page-builder/PageBuilderLayout";

interface PageBuilderPageProps {
  params: Promise<{ id: string }>;
}

export default async function PageBuilderPage({ params }: PageBuilderPageProps) {
  const { id } = await params;
  return <PageBuilderLayout eventId={id} />;
}
