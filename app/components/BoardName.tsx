"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { boardSchema } from "../api/validationSchemas";
import { saveBoard } from "../functions";
import { Board } from "../generated/prisma/client";
import { ColumnType } from "./BoardView";

interface Props {
  authorId: number;
  board: Board | null;
  columns: ColumnType;
  handleUpdateBoard: (board: Board | undefined) => void;
  isEditingBoardName: boolean;
  handleEditingBoardName: (flag: boolean) => void;
}

type TaskFormData = z.infer<typeof boardSchema>;

const BoardName = ({
  authorId,
  board,
  columns,
  handleUpdateBoard,
  isEditingBoardName,
  handleEditingBoardName,
}: Props) => {
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isDeleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(boardSchema),
  });

  useEffect(() => {
    setFocus("name");
  }, [isEditingBoardName]);

  async function editBoardName(data: { name: string }) {
    setSubmitting(true);

    const response = await saveBoard(board ? board.id : null, {
      name: data.name,
      content: columns,
      authorId,
    });

    if (response) handleUpdateBoard(response.data as Board);

    reset();
    handleEditingBoardName(false);
    setSubmitting(false);
  }

  async function removeBoard(id: number | undefined) {
    async function deleteBoard(id: number) {
      try {
        return await axios.delete<Board>("/api/boards/" + id);
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("An unexpected error occured");
      }
    }

    async function removeTaskFromBoard() {
      if (board === null) return;

      const response = await deleteBoard(id!);

      // delete column
      if (response?.status === 200) {
        handleUpdateBoard(undefined);
      }
    }

    removeTaskFromBoard();
    reset();
  }

  return (
    <>
      <div className="flex flex-row gap-2 items-start">
        <button
          className="flex flex-row items-center cursor-pointer bg-gray-200 border border-gray-200 rounded-lg pl-3 pr-1 py-2 text-lg font-semibold mr-2 mb-2 hover:border-blue-600 hover:border"
          onClick={() => handleEditingBoardName(!isEditingBoardName)}
        >
          {board ? board.name : "Untitled Board"}
          <svg className="fill-gray-500 mx-2 h-5 w-5" viewBox="-2 -2 24 24">
            <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.154-1.262a4 4 0 001.615-1.186L16.5 6.452l-2.952-2.951L3.881 13.148a4 4 0 00-1.186 1.615zM17.147 5.805l-2.952-2.951 1.135-1.135a1.5 1.5 0 012.122 0l.83.83a1.5 1.5 0 010 2.122l-1.135 1.135z" />
          </svg>
        </button>
        {isEditingBoardName && (
          <div className="flex flex-row items-start">
            <form onSubmit={handleSubmit(editBoardName)}>
              {error && <p className="text-red-800">{error}</p>}
              <input
                id="name"
                placeholder={board ? board.name : "Untitled Board"}
                className="border bg-white text-lg rounded-lg px-3 py-2 mr-2 mb-2"
                {...register("name")}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer border border-blue-600 bg-blue-500 text-white text-lg rounded-lg px-3 py-2 mr-2 mb-2 hover:bg-blue-600 hover:border-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:pointer-events-none"
              >
                Save
              </button>
            </form>
            <button
              disabled={isDeleting}
              onClick={async () => {
                setDeleting(true);
                handleEditingBoardName(false);
                await removeBoard(board?.id);
                setDeleting(false);
              }}
              className="cursor-pointer border border-red-600 bg-red-500 text-white text-lg rounded-lg px-3 py-2 mr-2 mb-2 hover:bg-red-600 hover:border-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              Delete
            </button>
            {errors && <p className="text-red-800">{errors.name?.message}</p>}
          </div>
        )}
      </div>
    </>
  );
};

export default BoardName;
