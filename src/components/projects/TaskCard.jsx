'use client';

import { stringToColor } from '@/lib/utils';

export function TaskCard({ task, projectMembers }) {
  // Find assignee from project members
  const assignee = projectMembers?.find(member => 
    member.id === task.assigneeId || member.user?.id === task.assigneeId
  );
  
  // Generate background color for assignee avatar
  const assigneeColor = assignee 
    ? stringToColor(assignee.email || assignee.user?.email || 'user')
    : '#CBD5E0';
  
  // Get assignee initials
  const getAssigneeInitials = () => {
    if (!assignee) return '';
    
    const email = assignee.email || assignee.user?.email || '';
    return email.charAt(0).toUpperCase();
  };
  
  // Status badge color
  const statusColors = {
    'todo': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'done': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
  };
  
  const statusLabels = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'done': 'Done'
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</h4>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[task.status]}`}>
          {statusLabels[task.status]}
        </span>
      </div>
      
      {task.description && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
          {task.description}
        </p>
      )}
      
      <div className="mt-3 flex items-center justify-between">
        {assignee ? (
          <div className="flex items-center">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
              style={{ backgroundColor: assigneeColor }}
            >
              {getAssigneeInitials()}
            </div>
            <span className="ml-1.5 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
              {assignee.email || assignee.user?.email}
            </span>
          </div>
        ) : (
          <div className="text-xs text-gray-400 dark:text-gray-500">Unassigned</div>
        )}
        
        {task.createdAt && (
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {new Date(task.createdAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
} 