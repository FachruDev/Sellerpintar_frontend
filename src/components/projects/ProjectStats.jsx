'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Loader2, CheckCircle2, Clock } from 'lucide-react';

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
    labels: ['Belum Dikerjakan', 'Sedang Berjalan', 'Selesai'],
    datasets: [
      {
        data: [counts.todo, counts['in-progress'], counts.done],
        backgroundColor: [
          'rgba(156, 163, 175, 0.7)', 
          'rgba(59, 130, 246, 0.7)',  
          'rgba(34, 197, 94, 0.7)',   
        ],
        borderColor: [
          'rgb(156, 163, 175)',
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
        ],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  // Options untuk chart
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
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
    <Card className="p-0 overflow-hidden shadow-xl border-0 bg-background">
      <CardHeader className="flex flex-row items-center gap-2 border-b px-6 py-4 bg-gradient-to-r from-primary/5 via-white dark:via-slate-950 to-transparent">
        <ClipboardList className="w-6 h-6 text-primary" />
        <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
          Statistik Tugas Proyek
        </CardTitle>
        {total > 0 && (
          <Badge variant="outline" className="ml-auto text-xs">
            Total {total} tugas
          </Badge>
        )}
      </CardHeader>
      <CardContent className="py-6 px-6">
        {total === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <ClipboardList className="w-10 h-10 text-muted-foreground mb-2" />
            <p className="text-base text-muted-foreground font-medium text-center">
              Belum ada tugas pada proyek ini.
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Mulai tambah tugas agar progress proyek dapat terpantau!
            </p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* kiri: DONUT Chart */}
            <div className="w-full max-w-[260px] aspect-square flex items-center justify-center relative">
              <Doughnut data={chartData} options={chartOptions} />
              {/* Ring tengah info total */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-foreground">{total}</span>
                <span className="text-xs text-muted-foreground">Total Tugas</span>
              </div>
            </div>

            {/* kanan: Bar indicators */}
            <div className="flex-1 grid grid-cols-1 gap-4 w-full min-w-[180px]">
              {/* To Do */}
              <div className="rounded-lg px-4 py-3 shadow bg-muted/40 dark:bg-slate-900/60">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Belum Dikerjakan
                  </span>
                  <span className="ml-auto text-xs font-semibold text-gray-900 dark:text-white">
                    {counts.todo}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div
                    className="h-2 bg-gray-400 dark:bg-gray-500 rounded-full transition-all"
                    style={{ width: `${todoPct}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                  {todoPct}%
                </div>
              </div>

              {/* In Progress */}
              <div className="rounded-lg px-4 py-3 shadow bg-muted/40 dark:bg-slate-900/60">
                <div className="flex items-center gap-2 mb-1">
                  <Loader2 className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-blue-500 dark:text-blue-400">
                    Sedang Berjalan
                  </span>
                  <span className="ml-auto text-xs font-semibold text-gray-900 dark:text-white">
                    {counts['in-progress']}
                  </span>
                </div>
                <div className="h-2 bg-blue-100 dark:bg-blue-950 rounded-full">
                  <div
                    className="h-2 bg-blue-400 dark:bg-blue-500 rounded-full transition-all"
                    style={{ width: `${inProgressPct}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-blue-500 dark:text-blue-400 text-right">
                  {inProgressPct}%
                </div>
              </div>

              {/* Done/beres */}
              <div className="rounded-lg px-4 py-3 shadow bg-muted/40 dark:bg-slate-900/60">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    Selesai
                  </span>
                  <span className="ml-auto text-xs font-semibold text-gray-900 dark:text-white">
                    {counts.done}
                  </span>
                </div>
                <div className="h-2 bg-green-100 dark:bg-green-950 rounded-full">
                  <div
                    className="h-2 bg-green-400 dark:bg-green-500 rounded-full transition-all"
                    style={{ width: `${donePct}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-green-600 dark:text-green-400 text-right">
                  {donePct}%
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}