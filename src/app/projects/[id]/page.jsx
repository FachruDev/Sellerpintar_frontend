'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { projectsAPI, tasksAPI } from '@/lib/api';
import { exportToJson } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CreateTaskModal } from '@/components/projects/CreateTaskModal';
import { ProjectStats } from '@/components/projects/ProjectStats';
import { initializeSocket } from '@/lib/socket';
import { TaskBoard } from '@/components/projects/TaskBoard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Settings, PlusCircle, Download, ArrowLeft } from 'lucide-react';

export default function ProjectPage({ params }) {
  const router = useRouter();
  const { id } = use(params);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Memastikan rendering di sisi klien
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ambil projek & tugas
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const proj = await projectsAPI.getProjectById(id);
        setProject(proj);
        const t = await tasksAPI.getProjectTasks(id);
        setTasks(t);
      } catch (err) {
        setError('Gagal memuat proyek. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Socket.IO: Join ke room + handle event tugas
  useEffect(() => {
    if (!isClient) return;
    const socket = initializeSocket();
    if (!socket) return;

    const handleConnect = () => {
      socket.emit('join-project', id);
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
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? task : t))
        );
      }
    };
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
    };
  }, [id, isClient]);

  // handle CRUD
  const handleTaskCreate = async (taskData) => {
    try {
      const newTask = await tasksAPI.createTask(id, taskData);
      setTasks((prev) => [...prev, newTask]);
      setIsCreateModalOpen(false);
    } catch (err) {
      alert('Gagal membuat tugas. Silakan coba lagi.');
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
      alert(`Gagal memperbarui tugas: ${err.message || 'Unknown error'}`);
      throw err;
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      await tasksAPI.deleteTask(id, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      alert(`Gagal menghapus tugas: ${err.message || 'Unknown error'}`);
      throw err;
    }
  };

  // Export projek
  const handleExportProject = () => {
    if (!project) return;
    exportToJson(
      { ...project, tasks },
      `${project.name.replace(/\s+/g, '-').toLowerCase()}-export.json`
    );
  };

  // loding
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }
  if (error) {
    return (
      <Card className="max-w-lg mx-auto mt-10 border-destructive bg-red-50 dark:bg-red-900/20">
        <CardHeader>
          <CardTitle className="text-destructive">Gagal Memuat</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }
  if (!project) return null;

  return (
    <div className="px-2 sm:px-6 lg:px-8 py-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center mb-4">
        <Link href="/dashboard">
        <Button variant="outline">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali ke Dashboard
        </Button>
        </Link>
      </div>
      
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between gap-6">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-foreground">
              {project.name}
              {project.archived && (
                <Badge variant="destructive" className="ml-2">Arsip</Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {tasks.length} tugas • {project.members?.length || 0} anggota
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleExportProject}
              title="Export Proyek"
            >
              <Download className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsCreateModalOpen(true)}
              title="Tambah Tugas"
            >
              <PlusCircle className="w-5 h-5" />
            </Button>
            <Link href={`/projects/${id}/settings`}>
              <Button
                variant="outline"
                size="icon"
                title="Pengaturan Proyek"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      <ProjectStats projectId={id} tasks={tasks} />

      {isClient && (
        <TaskBoard
          tasks={tasks}
          projectId={id}
          projectMembers={project.members}
          onUpdateTask={handleTaskUpdate}
          onDeleteTask={handleTaskDelete}
        />
      )}

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleTaskCreate}
        projectMembers={project.members}
      />
    </div>
  );
}