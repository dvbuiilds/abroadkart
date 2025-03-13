const Home = () => {
  console.log(
    "@@ process.env.NEXT_PUBLIC_ENVIRONMENT: ",
    process.env.NEXT_PUBLIC_ENVIRONMENT
  );
  return (
    <div className="flex flex-col items-center justify-center grow bg-gray-100">
      <h1 className="text-4xl font-bold">Welcome to AbroadKart.com</h1>
      <p className="mt-4 text-lg text-gray-700">
        Your gateway to global opportunities.
      </p>
    </div>
  );
};

export default Home;
