import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to the Energy Leads Manager
        </h1>
        <p className="text-gray-600 mb-8">
          Manage and track leads for energy subsidy programs in France.
        </p>
        <Link
          href="/dashboard"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}