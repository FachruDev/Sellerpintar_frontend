'use client';

import { useState, useEffect } from 'react';
import { projectsAPI } from '@/lib/api';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { CreateProjectButton } from '@/components/dashboard/CreateProjectButton';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Frown, AlertCircle } from 'lucide-react';
import { Analytics } from "@vercel/analytics/next"

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ambil data projects pada component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await projectsAPI.getAllProjects();
        setProjects(response.projects || []);
      } catch (err) {
        setError('Gagal memuat daftar proyek. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <Analytics/>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daftar Proyek</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola seluruh proyek dan tugas Anda di satu tempat.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <CreateProjectButton />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive" className="my-8">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <AlertTitle>Gagal Memuat</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Frown className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Belum ada proyek</h3>
          <p className="text-sm text-muted-foreground">
            Mulai dengan membuat proyek baru terlebih dahulu.
          </p>
          <CreateProjectButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}