import React from "react";

import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import ActionButtons from "./ActionButtons";

const TimesheetTable = ({
    data,
    onView,
    onApprove,
    onReject,
}) => {

    if (!data.length)
        return <EmptyState />;

    return (

        <>
            {/* Desktop */}

            <div className="hidden lg:block overflow-auto rounded-2xl border">

                <table className="w-full">

                    <thead className="sticky top-0 bg-gray-50 z-10">

                        <tr>

                            <th className="p-4 text-left">
                                Employee
                            </th>

                            <th>
                                Department
                            </th>

                            <th>
                                Date
                            </th>

                            <th>
                                In
                            </th>

                            <th>
                                Out
                            </th>

                            <th>
                                Break
                            </th>

                            <th>
                                Hours
                            </th>

                            <th>
                                Overtime
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Actions
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {data.map((item) => (

                            <tr
                                key={item._id}
                                className="border-t hover:bg-gray-50 transition"
                            >

                                <td className="p-4">

                                    <div className="flex gap-3 items-center">

                                        <img
                                            src={
                                                item.employee?.profileImageUrl ||
                                                "/default-avatar.png"
                                            }
                                            alt=""
                                            className="w-10 h-10 rounded-full object-cover"
                                        />

                                        <div>

                                            <p className="font-semibold">

                                                {item.employee?.name}

                                            </p>

                                            <p className="text-xs text-gray-500">

                                                {item.employee?.email}

                                            </p>

                                        </div>

                                    </div>

                                </td>

                                <td>

                                    {item.employee?.department}

                                </td>

                                <td>

                                    {new Date(item.date)
                                        .toLocaleDateString()}

                                </td>

                                <td>

                                    {item.clockIn}

                                </td>

                                <td>

                                    {item.clockOut}

                                </td>

                                <td>

                                    {item.breakMinutes} min

                                </td>

                                <td>

                                    {item.totalHours}

                                </td>

                                <td>

                                    {item.overtimeHours}

                                </td>

                                <td>

                                    <StatusBadge
                                        status={item.status}
                                    />

                                </td>

                                <td>

                                    <ActionButtons
                                        row={item}
                                        onView={onView}
                                        onApprove={onApprove}
                                        onReject={onReject}
                                    />

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            {/* Mobile */}

            <div className="grid gap-4 lg:hidden">

                {data.map((item) => (

                    <div
                        key={item._id}
                        className="bg-white rounded-2xl border p-5 shadow-sm"
                    >

                        <div className="flex gap-3 items-center">

                            <img
                                src={
                                    item.employee?.profileImageUrl ||
                                    "/default-avatar.png"
                                }
                                alt=""
                                className="w-12 h-12 rounded-full"
                            />

                            <div>

                                <h3 className="font-semibold">

                                    {item.employee?.name}

                                </h3>

                                <p className="text-gray-500 text-sm">

                                    {item.employee?.department}

                                </p>

                            </div>

                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">

                            <p>Date</p>
                            <p>{new Date(item.date).toLocaleDateString()}</p>

                            <p>Total Hours</p>
                            <p>{item.totalHours}</p>

                            <p>Status</p>

                            <StatusBadge
                                status={item.status}
                            />

                        </div>

                        <div className="mt-5">

                            <ActionButtons
                                row={item}
                                onView={onView}
                                onApprove={onApprove}
                                onReject={onReject}
                            />

                        </div>

                    </div>

                ))}

            </div>
        </>
    );

};

export default TimesheetTable;