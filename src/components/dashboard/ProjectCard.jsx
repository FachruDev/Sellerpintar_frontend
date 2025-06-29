'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRelativeTime, stringToColor } from '@/lib/utils';

// Fungsi untuk mengambil inisial (1-2 huruf, dari nama atau email)
function getInitials(nameOrEmail) {
  if (!nameOrEmail) return '?';

  const source = nameOrEmail.split('@')[0] || '';
  const words = source.trim().split(/[\s._-]+/);
  let initials = '';
  
  if (words.length === 1) {
    initials = words[0].slice(0, 2).toUpperCase();
  } else {
    initials = words[0].charAt(0) + words[1].charAt(0);
    initials = initials.toUpperCase();
  }
  return initials;
}

export function ProjectCard({ project }) {
  const projectColor = stringToColor(project.name);

  // Hitung jumlah task
  const totalTasks = project._count?.tasks || 0;

  return (
    <Card className="group hover:shadow-xl transition-shadow duration-200 border-none bg-background dark:bg-background/80">
      <Link href={`/projects/${project.id}`}>
        <CardHeader className="flex flex-row gap-3 items-center pb-0">
          {/* Avatar Proyek */}
          <div
            className="w-12 h-12 flex items-center justify-center rounded-lg font-bold text-lg text-white"
            style={{ backgroundColor: projectColor }}
          >
            {getInitials(project.name)}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate text-foreground">
              {project.name}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-3">
            <Badge
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              {totalTasks} {totalTasks === 1 ? 'tugas' : 'tugas'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {project.updatedAt && formatRelativeTime(project.updatedAt)}
            </span>
          </div>
          {project.members && project.members.length > 0 && (
            <div className="mt-5 flex -space-x-2">
              {project.members.slice(0, 3).map((member, idx) => (
                <div
                  key={member.id || idx}
                  className="w-7 h-7 flex items-center justify-center rounded-full font-semibold text-xs text-white ring-2 ring-background dark:ring-background uppercase"
                  style={{
                    backgroundColor: stringToColor(member.user?.email || member.user?.name || 'user'),
                    zIndex: 30 - idx,
                  }}
                  title={member.user?.name || member.user?.email}
                >
                  {getInitials(member.user?.name || member.user?.email)}
                </div>
              ))}
              {project.members.length > 3 && (
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-muted text-xs font-medium text-muted-foreground ring-2 ring-background dark:ring-background" style={{ zIndex: 10 }}>
                  +{project.members.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}