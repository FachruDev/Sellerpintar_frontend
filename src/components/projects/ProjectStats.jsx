'use client';

import { useState, useEffect } from 'react';
import { projectsAPI } from '@/lib/api';
import { Card } from '@/components/ui/Card';

export function ProjectStats({ projectId }) {
  const [stats, setStats] = useState({ todo: 0, 'in-progress': 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await projectsAPI.getProjectStats(projectId);
        setStats(data);
      } catch (err) {
        console.error('Error fetching project stats:', err);
        setError('Failed to load project statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [projectId]);

  // Calculate total tasks and percentages
  const totalTasks = stats.todo + stats['in-progress'] + stats.done;
  const todoPercentage = totalTasks > 0 ? Math.round((stats.todo / totalTasks) * 100) : 0;
  const inProgressPercentage = totalTasks > 0 ? Math.round((stats['in-progress'] / totalTasks) * 100) : 0;
  const donePercentage = totalTasks > 0 ? Math.round((stats.done / totalTasks) * 100) : 0;

  if (loading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
      </Card>
    );
  }

  // If there are no tasks, show a simple message
  if (totalTasks === 0) {
    return (
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Task Statistics</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">No tasks in this project yet.</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Task Statistics</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">To Do</span>
            <span className="text-xs font-semibold text-gray-900 dark:text-white">{stats.todo}</span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div 
              className="h-2 bg-gray-400 dark:bg-gray-500 rounded-full" 
              style={{ width: `${todoPercentage}%` }}
            ></div>
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">{todoPercentage}%</div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">In Progress</span>
            <span className="text-xs font-semibold text-gray-900 dark:text-white">{stats['in-progress']}</span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div 
              className="h-2 bg-blue-400 dark:bg-blue-500 rounded-full" 
              style={{ width: `${inProgressPercentage}%` }}
            ></div>
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">{inProgressPercentage}%</div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Done</span>
            <span className="text-xs font-semibold text-gray-900 dark:text-white">{stats.done}</span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div 
              className="h-2 bg-green-400 dark:bg-green-500 rounded-full" 
              style={{ width: `${donePercentage}%` }}
            ></div>
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">{donePercentage}%</div>
        </div>
      </div>
      
      {/* Simple chart */}
      <div className="h-8 flex rounded-md overflow-hidden">
        {stats.todo > 0 && (
          <div 
            className="bg-gray-400 dark:bg-gray-500 h-full" 
            style={{ width: `${todoPercentage}%` }}
            title={`To Do: ${stats.todo} (${todoPercentage}%)`}
          ></div>
        )}
        {stats['in-progress'] > 0 && (
          <div 
            className="bg-blue-400 dark:bg-blue-500 h-full" 
            style={{ width: `${inProgressPercentage}%` }}
            title={`In Progress: ${stats['in-progress']} (${inProgressPercentage}%)`}
          ></div>
        )}
        {stats.done > 0 && (
          <div 
            className="bg-green-400 dark:bg-green-500 h-full" 
            style={{ width: `${donePercentage}%` }}
            title={`Done: ${stats.done} (${donePercentage}%)`}
          ></div>
        )}
      </div>
      
      <div className="flex justify-between mt-2">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-400 dark:bg-gray-500 rounded-full mr-1"></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">To Do</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-400 dark:bg-blue-500 rounded-full mr-1"></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">In Progress</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-400 dark:bg-green-500 rounded-full mr-1"></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Done</span>
        </div>
      </div>
    </Card>
  );
} 