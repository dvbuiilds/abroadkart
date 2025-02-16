import React from "react";

const Counselling = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Counselling Sessions</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Recent Session</h3>
        <div className="p-4 bg-gray-100 shadow rounded-lg">
          <h4 className="text-lg font-medium">Counselor: Dr. Jane Smith</h4>
          <p className="mt-2 text-gray-600">Date: 2025-01-05</p>
          <button className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">
            View Feedback
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Available Counselors</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Example Counselor Card */}
          <div className="p-4 bg-white shadow rounded-lg">
            <h4 className="text-lg font-medium">Dr. John Doe</h4>
            <p className="mt-2 text-gray-600">Specialization: Study Abroad</p>
            <p className="mt-2 text-green-600">Available Now</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Counselling;
