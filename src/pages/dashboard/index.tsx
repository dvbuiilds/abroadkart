import Image from "next/image";
import React from "react";

import FreeCounselling from "../../../public/free-counselling.png";
import ExploreUniversities from "../../../public/explore-universities.png";
import Link from "next/link";

const Dashboard = () => {
  return (
    <div className="flex items-center justify-center align-center h-full gap-4 bg-white">
      <Link href={"/dashboard/counselling"}>
        <div className="p-6 bg-white shadow rounded-lg flex flex-col items-center content-center gap-2">
          <Image
            priority
            src={FreeCounselling}
            alt="Avail Free Counselling"
            height={200}
          />
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold">Free Counselling</h3>
            <p className="text-gray-600">
              Schedule your free 30-minute session with expert counselors.
            </p>
          </div>
          <button className="px-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300 font-bold cursor-pointer">
            Start Now {">"}
          </button>
        </div>
      </Link>
      <Link href={"/dashboard/explore-universities"}>
        <div className="p-6 bg-white shadow rounded-lg flex flex-col items-center content-center gap-2">
          <Image
            src={ExploreUniversities}
            alt="Explore Universities for free"
            height={200}
          />
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold">Explore Universities</h3>
            <p className="text-gray-600">
              Discover top universities worldwide tailored to your preferences.
            </p>
          </div>
          <button className="px-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300 font-bold cursor-pointer">
            Explore Now {">"}
          </button>
        </div>
      </Link>
    </div>
  );
};

export default Dashboard;
