"use client";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import "../App.css";
import { saveBoard } from "../functions";
import { Board, Task } from "../generated/prisma/client";
import AddTaskForm from "./AddTaskForm";
import Column from "./Column";
import Item from "./Item";
import BoardName from "./BoardName";
import AddTaskFormInColumn from "./AddTaskFormInColumn";

interface Props {
  authorId: number;
  board: Board | null;
  handleUpdateBoard: (board: Board | undefined) => void;
  isEditingBoardName: boolean;
  handleEditingBoardName: (flag: boolean) => void;
}

export interface ColumnType {
  [key: string]: Task[];
}

export default function BoardView({
  authorId,
  board,
  handleUpdateBoard,
  isEditingBoardName,
  handleEditingBoardName,
}: Props) {
  const router = useRouter();

  let startingColumns: ColumnType = {
    A: [],
    B: [],
    C: [],
    D: [],
  };

  const [columns, setColumns] = useState<ColumnType>(startingColumns);
  const previousColumns = useRef(columns);
  const [columnOrder, setColumnOrder] = useState(() => Object.keys(columns));

  // set starting columns using board content
  useEffect(() => {
    if (board) setColumns(board.content as ColumnType);
    else setColumns(startingColumns);
  }, [board]);

  const updateBoard = async (updatedColumns: ColumnType) => {
    const response = await saveBoard(board ? board.id : null, {
      name: board ? board.name : "Untitled Board",
      content: updatedColumns,
      authorId,
    });

    console.log("saveBoard response: ", response);

    if (response?.data) handleUpdateBoard(response.data);

    router.refresh();
  };

  const handleUpdateColumn = async (newTask: Task, columnKey: string) => {
    let updatedTaskArray: Task[] = [...columns[columnKey]];

    if (columns[columnKey].some((task) => task.id === newTask.id)) {
      updatedTaskArray = updatedTaskArray.map((task) =>
        task.id === newTask.id ? newTask : task,
      );
    } else {
      updatedTaskArray = [...updatedTaskArray, newTask];
    }

    const updatedColumns = { ...columns, [columnKey]: updatedTaskArray };

    setColumns(updatedColumns);

    console.log("updated columns: ", updatedColumns);

    await updateBoard(updatedColumns);
  };

  const handleDeleteTaskInColumn = async (id: number, columnKey: string) => {
    const updatedArray = [...columns[columnKey]].filter(
      (task) => task.id !== id,
    );
    const updatedColumns = { ...columns, [columnKey]: updatedArray };

    setColumns(updatedColumns);

    console.log("updated columns: ", updatedColumns);

    await updateBoard(updatedColumns);
  };

  return (
    <>
      <div className="flex flex-col gap-4 items-start sm:flex-col">
        <BoardName
          authorId={authorId}
          board={board}
          columns={columns}
          handleUpdateBoard={handleUpdateBoard}
          isEditingBoardName={isEditingBoardName}
          handleEditingBoardName={handleEditingBoardName}
        />
      </div>
      <div className="flex flex-col gap-4 items-center sm:flex-col">
        <AddTaskForm
          authorId={authorId}
          columns={columns}
          handleUpdateColumn={handleUpdateColumn}
        />
      </div>

      <div className="flex flex-col gap-4 items-center sm:flex-col">
        <DragDropProvider
          onDragStart={() => {
            previousColumns.current = columns;
          }}
          onDragOver={(event) => {
            const { source } = event.operation;

            if (source?.type === "column") return;

            setColumns((columns) => move(columns, event));
          }}
          onDragEnd={(event) => {
            const { source } = event.operation;

            if (event.canceled) {
              if (source?.type === "item") {
                setColumns(previousColumns.current);
              }
              return;
            }

            if (source?.type === "column") {
              setColumnOrder((columns) => move(columns, event));
            }

            saveBoard(board ? board.id : null, {
              name: board ? board.name : "Untitled Board",
              content: columns,
              authorId,
            });

            // router.refresh();
          }}
        >
          <div className="ColumnRoot">
            {columnOrder.map((column, columnIndex) => (
              <Column key={column} id={column} index={columnIndex}>
                {columns[column].map((task, index) => (
                  <Item
                    key={task.id}
                    id={task.id}
                    authorId={authorId}
                    index={index}
                    column={column}
                    handleUpdateColumn={handleUpdateColumn}
                    handleDeleteTaskInColumn={handleDeleteTaskInColumn}
                  >
                    {task.content}
                  </Item>
                ))}
                <AddTaskFormInColumn
                  authorId={authorId}
                  column={column}
                  handleUpdateColumn={handleUpdateColumn}
                />
              </Column>
            ))}
          </div>
        </DragDropProvider>
      </div>
    </>
  );
}
