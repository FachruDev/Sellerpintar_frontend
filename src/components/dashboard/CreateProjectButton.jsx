'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { projectsAPI } from '@/lib/api';
import { Button, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui-bundle';
import { cn } from '@/lib/utils';

export function CreateProjectButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setProjectName('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectName.trim()) {
      setError('Nama proyek wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const response = await projectsAPI.createProject({ name: projectName.trim() });
      closeModal();
      router.refresh();
      router.push(`/projects/${response.project.id}`);
    } catch (error) {
      setError(error.message || 'Gagal membuat proyek. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open ? closeModal() : openModal()}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="gap-2"
          onClick={openModal}
        >
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Proyek Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Buat Proyek Baru</DialogTitle>
            <DialogDescription>
              Isi nama proyek yang ingin kamu buat. Proyek akan langsung tersedia setelah berhasil dibuat.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div>
              <Label htmlFor="projectName" className="mb-2">
                Nama Proyek
              </Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Masukkan nama proyek"
                className={cn(error && 'border-destructive')}
                disabled={isSubmitting}
                autoFocus
              />
              {error && (
                <p className="mt-1 text-sm text-destructive">{error}</p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="default"
              className="w-full sm:w-auto"
            >
              {isSubmitting ? 'Membuat...' : 'Buat'}
            </Button>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Batal
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}