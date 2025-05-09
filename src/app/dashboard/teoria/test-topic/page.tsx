// Using the same props pattern as the dynamic route to match the type constraints
async function TestTopicPage(props: any) {
  // Extract the searchParams safely
  const searchParams = await props.searchParams;
  const subtopicId = searchParams?.subtopic;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Test Teoria Direct Page</h1>
      <p className="mb-2">
        This is a direct test page for the /dashboard/teoria/test-topic route.
      </p>
      <p className="mb-2">
        This page should be accessible if the route is configured correctly.
      </p>
      <p className="mb-2">Subtopic ID: {subtopicId || "none"}</p>
      <p>Environment: {process.env.NODE_ENV}</p>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h2 className="text-xl font-semibold mb-2">Debug Information</h2>
        <p>
          This page is NOT using a dynamic route - it's a dedicated page at
          /dashboard/teoria/test-topic.
        </p>
        <p>
          If you can see this page but not the dynamic routes, it means your
          dynamic route handling needs fixing.
        </p>
      </div>
    </div>
  );
}

// Export with the 'any' type to bypass Next.js type constraints
export default TestTopicPage;
