const ExploreUniversities = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Explore Universities</h2>
      {["United States", "Canada", "Germany"].map((country) => (
        <div key={country} className="mb-8">
          <h3 className="text-xl font-semibold mb-4">{country}</h3>
          <div className="flex overflow-x-scroll space-x-4">
            {/* Example University Card */}
            <div className="p-4 bg-white shadow rounded-lg min-w-[250px]">
              <h4 className="text-lg font-medium">Harvard University</h4>
              <p className="mt-2 text-gray-600">Cambridge, MA</p>
              <p className="mt-2 text-gray-600">Rank: #1</p>
              <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExploreUniversities;
