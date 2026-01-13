import { caller } from "@/trpc/server";
const page = async () => {
  const user = await caller.getUser();
  return <div className="text-red-500 font-extrabold">{JSON.stringify(user)}</div>;
};

export default page;