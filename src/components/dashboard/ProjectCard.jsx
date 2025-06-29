'use client';

import Link from 'next/link';
import { formatRelativeTime, stringToColor } from '@/lib/utils';

export function ProjectCard({ project }) {
  const projectColor = stringToColor(project.name);
  
  // Hitung jumlah task
  const totalTasks = project._count?.tasks || 0;
  
  return (
    <Link 
      href={`/projects/${project.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
    >
      <div className="p-5">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-md flex items-center justify-center text-white text-lg font-semibold"
            style={{ backgroundColor: projectColor }}
          >
            {project.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {project.name}
            </h3>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
              />
            </svg>
            {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {project.updatedAt && formatRelativeTime(project.updatedAt)}
          </div>
        </div>
        
        {project.members && project.members.length > 0 && (
          <div className="mt-4 flex -space-x-2 overflow-hidden">
            {project.members.slice(0, 3).map((member, index) => (
              <div 
                key={member.id || index}
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-800"
                style={{ 
                  backgroundColor: stringToColor(member.user?.email || 'user'),
                  zIndex: 30 - index
                }}
              />
            ))}
            
            {project.members.length > 3 && (
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 ring-2 ring-white dark:ring-gray-800" style={{ zIndex: 10 }}>
                +{project.members.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
} 