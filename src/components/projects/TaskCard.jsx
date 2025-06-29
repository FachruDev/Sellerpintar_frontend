'use client';

import { Badge } from '@/components/ui-bundle';
import { stringToColor } from '@/lib/utils';
import { User, Loader2, CheckCircle2, Clock } from 'lucide-react';

// Helper buat inisial, ambil nama kalo ada, lalu email (2 huruf awalan)
function getInitials(nameOrEmail = '') {
  if (!nameOrEmail) return '?';
  const parts = nameOrEmail.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1][0] || '')).toUpperCase();
}

const statusMap = {
  todo: {
    label: 'Belum Dikerjakan',
    color: 'bg-muted text-gray-700 dark:text-gray-200',
    icon: Clock,
  },
  'in-progress': {
    label: 'Sedang Berjalan',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    icon: Loader2,
  },
  done: {
    label: 'Selesai',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    icon: CheckCircle2,
  }
};

export function TaskCard({ task, projectMembers }) {
  const assignee =
    projectMembers?.find(
      (member) =>
        member.id === task.assigneeId ||
        member.user?.id === task.assigneeId
    ) || null;

  const assigneeColor = assignee
    ? stringToColor(assignee.email || assignee.user?.email || 'user')
    : '#CBD5E0';

  // pake nama dulu, fallback ke email
  const nameOrEmail = assignee
    ? assignee.user?.name || assignee.email || assignee.user?.email || ''
    : '';

  const initials = assignee ? getInitials(nameOrEmail) : '';
  const status = statusMap[task.status] || statusMap.todo;
  const StatusIcon = status.icon;

  return (
    <div className="bg-background dark:bg-slate-900 rounded-xl border shadow-sm hover:shadow-md cursor-pointer transition-all p-4 group">
      <div className="flex justify-between items-start gap-2">
        <h4 className="text-base font-semibold text-foreground truncate pr-2">
          {task.title}
        </h4>
        <Badge
          variant="outline"
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${status.color}`}
        >
          <StatusIcon
            className={`w-3.5 h-3.5 ${
              task.status === 'in-progress' ? 'animate-spin-slow' : ''
            }`}
          />
          {status.label}
        </Badge>
      </div>
      {task.description && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between">
        {assignee ? (
          <div className="flex items-center min-w-0">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold uppercase ring-2 ring-background dark:ring-background shrink-0"
              style={{ backgroundColor: assigneeColor }}
              title={nameOrEmail}
            >
              {initials}
            </div>
            <span className="ml-2 text-xs text-muted-foreground truncate max-w-[120px]">
              {assignee.user?.name || assignee.email || assignee.user?.email}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="w-4 h-4" />
            Tidak Ditugaskan
          </div>
        )}

        {task.createdAt && (
          <div className="text-xs text-muted-foreground ml-3 whitespace-nowrap">
            {new Date(task.createdAt).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        )}
      </div>
    </div>
  );
}