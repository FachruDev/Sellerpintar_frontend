'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { projectsAPI, tasksAPI } from '@/lib/api';
import { exportToJson } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { CreateTaskModal } from '@/components/projects/CreateTaskModal';
import { ProjectStats } from '@/components/projects/ProjectStats';
import { initializeSocket } from '@/lib/socket';
import { TaskBoard } from '@/components/projects/TaskBoard';

export default function ProjectPage({ params }) {
  const router = useRouter();
  const { id } = use(params);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Pastikan rendering di sisi klien
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ambil proyek & tugas
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const proj = await projectsAPI.getProjectById(id);
        setProject(proj);
        const t = await tasksAPI.getProjectTasks(id);
        setTasks(t);
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('Failed to load project. Please try again later.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Socket.IO: Join ke room & handlee peristiwa tugas (include perubahan status)
  useEffect(() => {
    if (!isClient) return;
    const socket = initializeSocket();
    if (!socket) return;

    const handleConnect = () => {
      socket.emit('join-project', id);
      console.log('Joined project room:', id);
    };
    socket.on('connect', handleConnect);

    const handleTaskCreated = (task) => {
      if (task.projectId === id) {
        setTasks((prev) => [...prev, task]);
      }
    };
    const handleTaskUpdated = (taskData) => {
      const task = taskData.task || taskData;
      
      if (task.projectId === id) {
        console.log('Updating task in UI:', task);
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? task : t))
        );
      }
    };
    // Join ke kedua peristiwa update umum dan perubahan status
    socket.on('task-created', handleTaskCreated);
    socket.on('task-updated', handleTaskUpdated);
    socket.on('task-status-changed', handleTaskUpdated);
    socket.on('task-deleted', (task) => {
      if (task.projectId === id) {
        setTasks((prev) => prev.filter((t) => t.id !== task.id));
      }
    });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('task-created', handleTaskCreated);
      socket.off('task-updated', handleTaskUpdated);
      socket.off('task-status-changed', handleTaskUpdated);
      socket.off('task-deleted');
      socket.emit('leave-project', id);
      console.log('Left project room:', id);
    };
  }, [id, isClient]);

  // Handler tugas CRUD
  const handleTaskCreate = async (taskData) => {
    try {
      const newTask = await tasksAPI.createTask(id, taskData);
      setTasks((prev) => [...prev, newTask]);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Error creating task:', err);
      alert('Failed to create task. Please try again.');
    }
  };

  const handleTaskUpdate = async (taskId, updatedData) => {
    try {
      const updatedTask = await tasksAPI.updateTask(id, taskId, updatedData);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updatedTask : t))
      );
      return updatedTask;
    } catch (err) {
      console.error('Error updating task:', err);
      alert(`Error updating task: ${err.message || 'Unknown error'}`);
      throw err;
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      await tasksAPI.deleteTask(id, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      alert(`Failed to delete task: ${err.message || 'Unknown error'}`);
      throw err;
    }
  };

  // Export proyek
  const handleExportProject = () => {
    if (!project) return;
    exportToJson(
      { ...project, tasks },
      `${project.name.replace(/\s+/g, '-').toLowerCase()}-export.json`
    );
  };

  // Render loading / error / main UI
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 my-6">
        <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
      </div>
    );
  }
  if (!project) {
    return null;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {project.name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {tasks.length} tasks
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleExportProject}>Export</Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>Add Task</Button>
          <Link href={`/projects/${id}/settings`}>
            <Button>Settings</Button>
          </Link>
        </div>
      </div>

      <ProjectStats 
        projectId={id}
        tasks={tasks}      
      />

      {isClient && (
        <TaskBoard
          tasks={tasks}
          projectId={id}
          projectMembers={project.members}
          onUpdateTask={handleTaskUpdate}
          onDeleteTask={handleTaskDelete}
        />
      )}

      {isCreateModalOpen && (
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleTaskCreate}
          projectMembers={project.members}
        />
      )}
    </div>
  );
}
