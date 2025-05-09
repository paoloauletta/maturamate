export default function TestTeoriaPage({
  params,
}: {
  params: { topic: string };
}) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Test Teoria Page</h1>
      <p className="mb-2">Topic ID: {params.topic}</p>
      <p>Environment: {process.env.NODE_ENV}</p>
    </div>
  );
}

// Generate static params for all topics - this enables static generation
export async function generateStaticParams() {
  return [{ topic: "test-topic" }];
}
