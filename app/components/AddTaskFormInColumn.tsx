import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { taskSchema } from "../api/validationSchemas";
import { z } from "zod";
import { Task } from "../generated/prisma/client";
import axios from "axios";

interface Props {
  authorId: number;
  column: string;
  handleUpdateColumn: (newTask: Task, columnKey: string) => void;
}

type TaskFormData = z.infer<typeof taskSchema>;

const AddTaskFormInColumn = ({
  authorId,
  column,
  handleUpdateColumn,
}: Props) => {
  const [isEditing, setEditing] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const handleAddTask = () => setEditing(!isEditing);

  async function createTask(data: { content: string }) {
    async function postTask(data: { content: string; authorId: number }) {
      try {
        setSubmitting(true);
        return await axios.post<Task>("/api/tasks", data);
      } catch (error) {
        setSubmitting(false);
        console.error("Error patching data:", error);
        setError("An unexpected error occured");
      }
    }

    async function addNewTaskToBoard() {
      const response = await postTask({
        content: data.content,
        authorId,
      });

      // update column
      if (response?.data) {
        handleUpdateColumn(response.data, column);
      }
    }

    await addNewTaskToBoard();
    reset();
    setEditing(false);
  }

  return (
    <div className="AddTaskItem">
      <button
        className="AddTaskButton flex flex-row cursor-pointer"
        onClick={handleAddTask}
      >
        <svg
          className="h-5 w-5"
          viewBox="2 -4 24 24"
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
        Add task
      </button>
      {isEditing && (
        <form onSubmit={handleSubmit(createTask)} className="px-4 py-3">
          <div>
            {error && <p className="text-red-800">{error}</p>}
            <textarea
              id="content"
              placeholder="Task..."
              rows={1}
              className="w-full px-4 py-2 border rounded-lg bg-white"
              {...register("content")}
            />
            {errors && (
              <p className="text-red-800">{errors.content?.message}</p>
            )}
            <button
              disabled={isSubmitting}
              type="submit"
              className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mr-2"
            >
              Done
            </button>
            <button
              onClick={() => setEditing(false)}
              className="cursor-pointer bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddTaskFormInColumn;
