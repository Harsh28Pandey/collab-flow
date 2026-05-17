import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { PRIORITY_DATA } from "../../utils/data.js";
import axiosInstance from '../../utils/axiosInstance.js';
import { API_PATHS } from '../../utils/apiPaths.js';
import toast from "react-hot-toast";
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { LuTrash } from 'react-icons/lu';
import SelectDropdown from '../../components/inputs/SelectDropdown.jsx';
import SelectUsers from '../../components/inputs/SelectUsers.jsx';
import TodoListInput from '../../components/inputs/TodoListInput.jsx';
import AddAttachmentsInput from '../../components/inputs/AddAttachmentsInput.jsx';
import Model from '../../components/Model.jsx';
import DeleteAlert from '../../components/DeleteAlert.jsx';

const CreateTask = () => {

    const location = useLocation();
    const { taskId } = location.state || {};
    const navigate = useNavigate();

    const [taskData, setTaskData] = useState({
        title: "",
        description: "",
        priority: "",
        dueDate: null,
        assignedTo: [],
        todoChecklist: [],
        attachments: [],
    });

    const [currentTask, setCurrentTask] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

    const handleValueChange = (key, value) => {
        setTaskData((prevData) => ({ ...prevData, [key]: value }))
    }

    const clearData = () => {
        //* reset form
        setTaskData({
            title: "",
            description: "",
            priority: "Low",
            dueDate: null,
            assignedTo: [],
            todoChecklist: [],
            attachments: [],
        })
    }

    //* create a task
    const createTask = async () => {
        setLoading(true);

        try {
            const todolist = taskData.todoChecklist?.map((item) => ({
                text: item,
                completed: false
            }));

            const response = await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, {
                ...taskData,
                dueDate: new Date(taskData.dueDate).toISOString(),
                todoChecklist: todolist
            })

            toast.success("Task created successfully");

            clearData();
        } catch (error) {
            console.error("Error creating task: ", error);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }

    //* update a task
    const updateTask = async () => {
        setLoading(true);

        try {
            const todolist = taskData.todoChecklist?.map((item) => {
                const prevTodoChecklist = currentTask?.todoChecklist || []
                const matchedTask = prevTodoChecklist.find((task) => task.text == item)

                return {
                    text: item,
                    completed: matchedTask ? matchedTask.completed : false
                }
            })

            const response = await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK(taskId), {
                ...taskData,
                dueDate: new Date(taskData.dueDate).toISOString(),
                todoChecklist: todolist
            })

            toast.success("Task updated successfully");
        } catch (error) {
            console.error("Error creating task: ", error);
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async () => {
        setError(null);

        //* input validation
        if (!taskData.title.trim()) {
            setError("Title is required");
            return;
        }

        if (!taskData.description.trim()) {
            setError("Description is required");
            return;
        }

        if (!taskData.dueDate) {
            setError("Due Date is required");
            return;
        }

        if (taskData.assignedTo?.length === 0) {
            setError("Task not assigned to any member");
            return;
        }

        if (taskData.todoChecklist?.length === 0) {
            setError("Add atleast one todo task");
            return;
        }

        if (taskId) {
            updateTask();
            return;
        }

        createTask();
    }

    //* get task by ID
    const getTaskDetailsByID = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(taskId))

            if (response.data) {
                const taskInfo = response.data;
                setCurrentTask(taskInfo);

                setTaskData((prevState) => ({
                    title: taskInfo.title,
                    description: taskInfo.description,
                    priority: taskInfo.priority,
                    dueDate: taskInfo.dueDate
                        ? moment(taskInfo.dueDate).format("YYYY-MM-DD")
                        : null,
                    assignedTo: taskInfo?.assignedTo?.map((item) => item?._id) || [],
                    todoChecklist: taskInfo?.todoChecklist?.map((item) => item?.text) || [],
                    attachments: taskInfo?.attachments || [],
                }))
            }
        } catch (error) {
            console.error("Error fetching task details: ", error);
        }
    }

    //* delete a task
    const deleteTask = async () => {
        try {
            await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskId))

            setOpenDeleteAlert(false);
            toast.success("Task deleted successfully");
            navigate("/admin/tasks");
        } catch (error) {
            console.error("Error deleting task: ", error.response?.data?.message || error.message);
        }
    }

    useEffect(() => {
        if (taskId) {
            getTaskDetailsByID(taskId);
        }
        return () => { }
    }, [taskId])

    return (
        <DashboardLayout activeMenu="Create Task">

            <div className='py-4 md:py-6'>

                <div className='max-w-7xl mx-auto'>

                    {/* Header */}

                    <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6'>

                        <div>
                            <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
                                {taskId ? "Update Task" : "Create Task"}
                            </h1>

                            <p className='text-sm text-gray-600 mt-1'>
                                {taskId
                                    ? "Update task details, members and progress."
                                    : "Create and assign tasks to your team members."
                                }
                            </p>
                        </div>

                        {taskId && (
                            <button
                                className='w-fit flex items-center gap-2 text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 hover:border-rose-400 px-4 py-2.5 rounded-2xl transition-all duration-200 cursor-pointer'
                                onClick={() => setOpenDeleteAlert(true)}
                            >
                                <LuTrash className='text-lg' />
                                Delete Task
                            </button>
                        )}

                    </div>

                    {/* Main Card */}

                    <div className='bg-white border border-gray-200 rounded-[28px] shadow-sm p-4 sm:p-6 md:p-8'>

                        {/* Task Title */}

                        <div>
                            <label className='text-sm font-semibold text-gray-800 mb-2 block'>
                                Task Title
                            </label>

                            <input
                                placeholder='Create App UI'
                                className='w-full h-12 md:h-14 px-4 rounded-2xl border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm md:text-[15px] text-gray-800 placeholder:text-gray-400'
                                value={taskData.title}
                                onChange={({ target }) =>
                                    handleValueChange("title", target.value)
                                }
                            />
                        </div>

                        {/* Description */}

                        <div className='mt-5'>
                            <label className='text-sm font-semibold text-gray-800 mb-2 block'>
                                Description
                            </label>

                            <textarea
                                placeholder='Describe the task'
                                rows={5}
                                className='w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none text-sm md:text-[15px] text-gray-800 placeholder:text-gray-400'
                                value={taskData.description}
                                onChange={({ target }) =>
                                    handleValueChange("description", target.value)
                                }
                            />
                        </div>

                        {/* Grid Fields */}

                        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-5'>

                            {/* Priority */}

                            <div>
                                <label className='text-sm font-semibold text-gray-800 mb-2 block'>
                                    Priority
                                </label>

                                <SelectDropdown
                                    options={PRIORITY_DATA}
                                    value={taskData.priority}
                                    onChange={(value) =>
                                        handleValueChange("priority", value)
                                    }
                                    placeholder="Select Priority"
                                />
                            </div>

                            {/* Due Date */}

                            <div>
                                <label className='text-sm font-semibold text-gray-800 mb-2 block'>
                                    Due Date
                                </label>

                                <input
                                    type="date"
                                    className='custom-date-input w-full h-12 md:h-14 px-4 rounded-2xl border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm md:text-[15px] text-gray-800 cursor-pointer'
                                    value={taskData.dueDate}
                                    onChange={({ target }) =>
                                        handleValueChange("dueDate", target.value)
                                    }
                                />
                            </div>

                            {/* Assign Users */}

                            <div className='sm:col-span-2 xl:col-span-1'>
                                <label className='text-sm font-semibold text-gray-800 mb-2 block'>
                                    Assign To
                                </label>

                                <SelectUsers
                                    selectedUsers={taskData.assignedTo}
                                    setSelectedUsers={(value) => {
                                        handleValueChange("assignedTo", value)
                                    }}
                                />
                            </div>

                        </div>

                        {/* Todo Checklist */}

                        <div className='mt-6'>
                            <label className='text-sm font-semibold text-gray-800 mb-3 block'>
                                TODO Checklist
                            </label>

                            <div className='bg-gray-50 border border-gray-200 rounded-3xl p-4 md:p-5'>
                                <TodoListInput
                                    todoList={taskData?.todoChecklist}
                                    setTodoList={(value) =>
                                        handleValueChange("todoChecklist", value)
                                    }
                                />
                            </div>
                        </div>

                        {/* Attachments */}

                        <div className='mt-6'>
                            <label className='text-sm font-semibold text-gray-800 mb-3 block'>
                                Add Attachments
                            </label>

                            <div className='bg-gray-50 border border-gray-200 rounded-3xl p-4 md:p-5'>
                                <AddAttachmentsInput
                                    attachments={taskData?.attachments}
                                    setAttachments={(value) =>
                                        handleValueChange("attachments", value)
                                    }
                                />
                            </div>
                        </div>

                        {/* Error */}

                        {error && (
                            <div className='mt-5 bg-rose-50 border border-rose-300 text-rose-700 text-sm font-medium px-4 py-3 rounded-2xl'>
                                {error}
                            </div>
                        )}

                        {/* Buttons */}

                        <div className='flex flex-col-reverse sm:flex-row items-center justify-end gap-3 mt-8'>

                            <button
                                type='button'
                                onClick={() => navigate("/admin/tasks")}
                                className='w-full sm:w-auto h-12 px-6 rounded-2xl border border-gray-500 hover:bg-gray-100 hover:border-gray-600 text-gray-700 text-sm font-medium transition-all cursor-pointer'
                            >
                                Cancel
                            </button>

                            <button
                                className='w-full sm:w-auto h-12 px-7 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading
                                    ? taskId
                                        ? "UPDATING..."
                                        : "CREATING..."
                                    : taskId
                                        ? "UPDATE TASK"
                                        : "CREATE TASK"
                                }
                            </button>

                        </div>

                    </div>

                </div>

            </div>

            {/* Delete Modal */}

            <Model
                isOpen={openDeleteAlert}
                onClose={() => setOpenDeleteAlert(false)}
                title="Delete Task"
            >
                <DeleteAlert
                    content="Are you sure you want to delete this task?"
                    onDelete={() => deleteTask()}
                />
            </Model>

        </DashboardLayout>
    )
}

export default CreateTask;