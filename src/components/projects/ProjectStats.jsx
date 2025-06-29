'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export function ProjectStats({ tasks = [] }) {
  // Hitung jumlah tiap status
  const counts = { todo: 0, 'in-progress': 0, done: 0 };
  tasks.forEach((t) => {
    if (counts[t.status] !== undefined) {
      counts[t.status] += 1;
    }
  });

  // Total dan persentase
  const total = counts.todo + counts['in-progress'] + counts.done;
  const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);
  const todoPct = pct(counts.todo);
  const inProgressPct = pct(counts['in-progress']);
  const donePct = pct(counts.done);

  // Data untuk donut chart
  const chartData = {
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [
      {
        data: [counts.todo, counts['in-progress'], counts.done],
        backgroundColor: [
          'rgba(107, 114, 128, 0.7)', 
          'rgba(59, 130, 246, 0.7)',  
          'rgba(34, 197, 94, 0.7)',   
        ],
        borderColor: [
          'rgb(107, 114, 128)',
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Options untuk chart
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgb(156, 163, 175)',
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const label = ctx.label || '';
            const value = ctx.raw || 0;
            const percentage = pct(value);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
        Task Statistics
      </h3>

      {total === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No tasks in this project yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Bar indicators */}
          <div className="md:col-span-1 flex flex-col space-y-4">
            {/* To Do */}
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  To Do
                </span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                  {counts.todo}
                </span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div
                  className="h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                  style={{ width: `${todoPct}%` }}
                ></div>
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                {todoPct}%
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  In Progress
                </span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                  {counts['in-progress']}
                </span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div
                  className="h-2 bg-blue-400 dark:bg-blue-500 rounded-full"
                  style={{ width: `${inProgressPct}%` }}
                ></div>
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                {inProgressPct}%
              </div>
            </div>

            {/* Done */}
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Done
                </span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                  {counts.done}
                </span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div
                  className="h-2 bg-green-400 dark:bg-green-500 rounded-full"
                  style={{ width: `${donePct}%` }}
                ></div>
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                {donePct}%
              </div>
            </div>
          </div>

          {/* DONUT Chart */}
          <div className="md:col-span-3 flex items-center justify-center">
            <div className="h-64 w-full">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
