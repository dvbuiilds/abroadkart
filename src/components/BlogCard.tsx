import Image from "next/image";
import Link from "next/link";

export const BlogCard = ({
  data,
}: {
  data: { imgUrl: string; date: string; title: string; pageId: string };
}) => {
  return (
    <div className="bg-white shadow-md p-6 rounded-lg">
      <Image
        src={data.imgUrl}
        width={300}
        height={200}
        alt={data.title}
        className="rounded-md"
      />
      <p className="text-gray-500 text-sm mt-2">{data.date}</p>
      <div className="flex flex-col justify-between h-[128px]">
        <h3 className="text-lg font-bold text-gray-900 mt-2 line-clamp-2 overflow-hidden text-ellipsis">
          {data.title}
        </h3>
        <div className="mt-6">
          <Link href={`/blog/${data.pageId}`}>
            <button className="bg-blue-600 text-white py-2 px-4 rounded-lg w-full">
              Read More
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
