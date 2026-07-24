import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import "./App.css";
import BoardMenu from "./components/BoardMenu";

export default async function Home() {
  // const users = await prisma.user.findMany();
  const userId = 2;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { boards: { orderBy: { name: "asc" } } },
  });

  if (!user) notFound();

  const startingBoards = user.boards;
  // console.log(user);
  // console.log(startingBoards);

  return (
    <>
      <div className="font-sans grid grid-rows-1 items-start justify-items-center min-h-screen pt-8 px-20 pb-10 gap-16">
        <main className="flex flex-col gap-4 row-start-1 items-center sm:items-start">
          <BoardMenu boards={startingBoards} authorId={userId} />
        </main>
      </div>
    </>
  );
}
