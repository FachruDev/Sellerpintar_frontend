'use client';

import { useState, useRef } from 'react';
import { groupTasksByStatus } from '@/lib/utils';
import { TaskCard } from './TaskCard';
import { TaskDetailModal } from './TaskDetailModal';

export function TaskBoard({ tasks, projectId, projectMembers, onUpdateTask, onDeleteTask }) {
  const [draggedTask, setDraggedTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const statuses = ['todo', 'in-progress', 'done'];
  const statusLabels = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'done': 'Done'
  };
  
  const tasksByStatus = groupTasksByStatus(tasks);
  
  // Initialize empty arrays for statuses with no tasks
  statuses.forEach(status => {
    if (!tasksByStatus[status]) {
      tasksByStatus[status] = [];
    }
  });
  
  // Drag and drop handlers
  const handleDragStart = (task) => {
    setDraggedTask(task);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleDrop = (e, status) => {
    e.preventDefault();
    
    if (draggedTask && draggedTask.status !== status) {
      onUpdateTask(draggedTask.id, { ...draggedTask, status });
      setDraggedTask(null);
    }
  };
  
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };
  
  const handleTaskUpdate = (taskId, updatedData) => {
    onUpdateTask(taskId, updatedData);
    setIsDetailModalOpen(false);
  };
  
  const handleTaskDelete = (taskId) => {
    onDeleteTask(taskId);
    setIsDetailModalOpen(false);
  };
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statuses.map((status) => (
          <div 
            key={status}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {statusLabels[status]}
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                {tasksByStatus[status].length}
              </span>
            </div>
            
            <div className="space-y-3">
              {tasksByStatus[status].map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  onClick={() => handleTaskClick(task)}
                >
                  <TaskCard task={task} projectMembers={projectMembers} />
                </div>
              ))}
              
              {tasksByStatus[status].length === 0 && (
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No tasks in this column
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {isDetailModalOpen && selectedTask && (
        <TaskDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          task={selectedTask}
          projectMembers={projectMembers}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />
      )}
    </>
  );
} 