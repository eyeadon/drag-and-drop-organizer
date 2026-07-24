"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Board } from "../generated/prisma/client";
import BoardView from "./BoardView";

interface Props {
  boards: Board[];
  authorId: number;
}

const BoardMenu = ({ boards, authorId }: Props) => {
  const router = useRouter();
  const [selectedBoard, setSelectedBoard] = useState<Board | undefined>();
  const [isEditingBoardName, setEditingBoardName] = useState(false);

  const handleUpdateBoard = (board: Board | undefined) => {
    setSelectedBoard(board);
    // router.refresh();
  };

  const handleEditingBoardName = (flag: boolean) => {
    setEditingBoardName(flag);
  };

  // console.log("BoardMenu selectedBoard ", selectedBoard);

  return (
    <>
      <menu className="flex flex-row">
        {boards.map((board) => (
          <a
            href="#"
            key={board.id}
            className="bg-blue-200 rounded-full border-2 border-indigo-500 px-3 py-1 text-md font-semibold text-blue-950 mr-2 mb-2"
            onClick={(event) => {
              event.preventDefault();
              setSelectedBoard(board);
              setEditingBoardName(false);
              // router.refresh();
            }}
          >
            {board.name}
          </a>
        ))}
        <button
          key={"newEvent"}
          className="cursor-pointer flex flex-row items-center bg-blue-200 rounded-full border-2 border-teal-500 pl-3 pr-1 py-1 text-md font-semibold text-blue-950 mr-2 mb-2"
          onClick={() => {
            setSelectedBoard(undefined);
            setEditingBoardName(true);
          }}
        >
          New Board
          <svg
            className="mx-1 h-5 w-5"
            viewBox="-2 -2 24 24"
            fill="currentColor"
            aria-hidden="true"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z"
            />
          </svg>
        </button>
      </menu>

      {selectedBoard ? (
        <BoardView
          authorId={authorId}
          board={selectedBoard}
          handleUpdateBoard={handleUpdateBoard}
          isEditingBoardName={isEditingBoardName}
          handleEditingBoardName={handleEditingBoardName}
        />
      ) : (
        <BoardView
          authorId={authorId}
          board={null}
          handleUpdateBoard={handleUpdateBoard}
          isEditingBoardName={isEditingBoardName}
          handleEditingBoardName={handleEditingBoardName}
        />
      )}
    </>
  );
};

export default BoardMenu;
