import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AvatarGroup from '../../components/AvatarGroup';
import moment from 'moment';
import { LuSquareArrowOutUpRight } from 'react-icons/lu';

const ViewTaskDetails = () => {

    const { id } = useParams();
    const [task, setTask] = useState(null);

    const getStatusTagColor = (status) => {
        switch (status) {
            case "In Progress":
                return 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 shadow-inner';
            case "Pending":
                return "text-amber-400 bg-amber-500/10 border border-amber-500/20 shadow-inner";
            case "Completed":
                return "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shadow-inner";
            default:
                return "text-zinc-400 bg-zinc-500/10 border border-white/5 shadow-inner";
        }
    }

    //* get task info by ID
    const getTaskdetailsById = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(id))

            if (response.data) {
                const taskInfo = response.data;
                setTask(taskInfo)
            }
        } catch (error) {
            console.error("Error fetching users: ", error)
        }
    }

    //* handle todo check
    const updateTodoChecklist = async (index) => {
        const todoChecklist = [...task?.todoChecklist];
        const taskId = id;

        if (todoChecklist && todoChecklist[index]) {
            todoChecklist[index].completed = !todoChecklist[index].completed;

            try {
                const response = await axiosInstance.put(API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(taskId), {
                    todoChecklist
                })

                if (response.status === 200) {
                    setTask(response.data?.task || task);
                } else {
                    //* optionally revert the toggle if the API call fails
                    todoChecklist[index].completed = !todoChecklist[index].completed;
                }
            } catch (error) {
                todoChecklist[index].completed = !todoChecklist[index].completed;
            }
        }
    }

    //* handle attachments link
    const handleLinkClick = (link) => {
        if (!/^https?:\/\//i.test(link)) {
            link = "https://" + link;  //* default to https
        }
        window.open(link, "_blank");
    }

    useEffect(() => {
        if (id) {
            getTaskdetailsById();
        }
        return () => { }
    }, [id])

    return (
        <DashboardLayout activeMenu="My Tasks">
            <div className='mt-2 sm:mt-5'>
                {task && (
                    <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4'>

                        {/* Main Content Area */}
                        <div className='lg:col-span-8 xl:col-span-9'>
                            <div className='bg-zinc-950/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-6 sm:p-10 shadow-[0_15px_50px_rgba(0,0,0,0.6)] relative overflow-hidden'>

                                {/* Ambient Top Glow */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none"></div>

                                <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10'>
                                    <h2 className='text-xl sm:text-3xl font-black text-white tracking-tight leading-snug'>
                                        {task?.title}
                                    </h2>

                                    <div
                                        className={`text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider shrink-0 px-4 py-1.5 rounded-lg ${getStatusTagColor(
                                            task?.status
                                        )}`}
                                    >
                                        {task?.status}
                                    </div>
                                </div>

                                <div className='mt-8 relative z-10'>
                                    <InfoBox
                                        label="Description"
                                        value={task?.description}
                                    />
                                </div>

                                <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 p-6 bg-zinc-900/40 border border-white/5 rounded-3xl shadow-inner relative z-10'>
                                    <div>
                                        <InfoBox label="Priority" value={task?.priority} />
                                    </div>
                                    <div>
                                        <InfoBox label="Due Date" value={task?.dueDate ? moment(task?.dueDate).format("Do MMM YYYY") : "N/A"} />
                                    </div>

                                    <div>
                                        <label className='text-[10px] sm:text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider block mb-2.5'>
                                            Assigned To
                                        </label>
                                        <AvatarGroup
                                            avatars={
                                                task?.assignedTo?.map((item) => ({
                                                    image: item?.profileImageUrl || null,
                                                    name: item?.name || ""
                                                }))
                                            }
                                            maxVisible={5}
                                        />
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className='h-px w-full bg-white/5 my-8 relative z-10' />

                                <div className='mt-2 relative z-10'>
                                    <label className='text-[10px] sm:text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-4'>
                                        Todo Checklist
                                    </label>

                                    <div className="space-y-2.5">
                                        {task?.todoChecklist?.map((item, index) => (
                                            <TodoChecklist
                                                key={`todo_${index}`}
                                                text={item.text}
                                                isChecked={item?.completed}
                                                onChange={() => updateTodoChecklist(index)}
                                            />
                                        ))}
                                        {(!task?.todoChecklist || task.todoChecklist.length === 0) && (
                                            <p className="text-xs font-mono text-zinc-500 italic">No checklist items.</p>
                                        )}
                                    </div>
                                </div>

                                {task?.attachments?.length > 0 && (
                                    <div className='mt-8 relative z-10'>
                                        <label className='text-[10px] sm:text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-4'>
                                            Attachments
                                        </label>

                                        <div className="space-y-3">
                                            {task?.attachments?.map((link, index) => (
                                                <Attachment
                                                    key={`link_${index}`}
                                                    link={link}
                                                    index={index}
                                                    onClick={() => handleLinkClick(link)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default ViewTaskDetails

const InfoBox = ({ label, value }) => {
    return <>
        <label className='text-[10px] sm:text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider block mb-1.5'>{label}</label>
        <p className='text-sm sm:text-base font-mono text-zinc-300 leading-relaxed whitespace-pre-line'>
            {value || "N/A"}
        </p>
    </>
}

const TodoChecklist = ({ text, isChecked, onChange }) => {
    return (
        <div className={`flex items-start gap-3 p-4 border rounded-2xl transition-all duration-300 shadow-inner
            ${isChecked ? "bg-zinc-900/30 border-white/5 opacity-60" : "bg-zinc-900/60 border-white/10 hover:bg-zinc-900"}
        `}>
            <input
                type="checkbox"
                checked={isChecked}
                onChange={onChange}
                className='mt-0.5 w-4 h-4 rounded border-white/10 bg-zinc-950 text-cyan-500 focus:ring-cyan-500/50 cursor-pointer accent-cyan-500 shrink-0'
            />
            <p className={`text-xs sm:text-sm font-mono leading-snug ${isChecked ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                {text}
            </p>
        </div>
    )
}

const Attachment = ({ link, index, onClick }) => {
    return (
        <div
            className='group flex items-center justify-between bg-zinc-900/50 hover:bg-zinc-900/80 border border-white/5 hover:border-cyan-500/30 px-4 py-3.5 rounded-2xl cursor-pointer shadow-inner transition-all duration-300'
            onClick={onClick}
        >
            <div className='flex-1 flex items-center gap-3 overflow-hidden'>
                <span className='text-[10px] sm:text-xs font-mono font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg shrink-0'>
                    {index < 9 ? `0${index + 1}` : index + 1}
                </span>

                <p className='text-xs sm:text-sm font-mono text-zinc-400 group-hover:text-cyan-300 transition-colors truncate'>
                    {link}
                </p>
            </div>

            <div className="h-8 w-8 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-center shrink-0 ml-3 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10 transition-colors">
                <LuSquareArrowOutUpRight className='text-zinc-500 group-hover:text-cyan-400 transition-colors text-sm' />
            </div>
        </div>
    )
}