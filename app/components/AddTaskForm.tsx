"use client";
import axios from "axios";
import Form from "next/form";
import { Task } from "../generated/prisma/client";
import { ColumnType } from "./BoardView";
import { capitalizeFirstLetter } from "../functions";

interface Props {
  authorId: number;
  columns: ColumnType;
  handleUpdateColumn: (newTask: Task, columnKey: string) => void;
}

export default function AddTaskForm({
  authorId,
  columns,
  handleUpdateColumn,
}: Props) {
  async function createTask(formData: FormData) {
    const content = formData.get("content") as string;
    const group = capitalizeFirstLetter(formData.get("group") as string);

    async function postTask(data: { content: string; authorId: number }) {
      try {
        return await axios.post<Task>("/api/tasks", data);
      } catch (error) {
        console.error("Error posting data:", error);
      }
    }

    async function addNewTaskToBoard() {
      const response = await postTask({
        content,
        authorId,
      });

      // update column
      if (response?.data) {
        for (const [key] of Object.entries(columns)) {
          if (key === group) {
            handleUpdateColumn(response.data, key);
          }
        }
      }
    }

    addNewTaskToBoard();
  }

  return (
    <>
      <div className="max-w-2xl mx-auto py-4">
        <Form action={createTask} className="flex flex-row gap-3 items-end">
          <div className="flex flex-col">
            <label htmlFor="content" className="text-black text-lg mb-2">
              Task
            </label>
            <textarea
              id="content"
              name="content"
              placeholder="Task..."
              rows={1}
              className="w-full px-4 py-2 border rounded-lg bg-white"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="group" className="text-black text-lg mb-2">
              Group
            </label>
            <textarea
              id="group"
              name="group"
              placeholder="Group..."
              rows={1}
              className="w-full px-4 py-2 border rounded-lg bg-white"
            />
          </div>
          <div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Add Task
            </button>
          </div>
        </Form>
      </div>
    </>
  );
}
