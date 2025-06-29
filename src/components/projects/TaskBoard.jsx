'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { groupTasksByStatus } from '@/lib/utils';
import { TaskCard } from './TaskCard';
import { TaskDetailModal } from './TaskDetailModal';
import { Card, CardHeader, CardTitle, CardContent, Badge, Skeleton } from '@/components/ui-bundle';
import { ClipboardList, Loader2, CheckCircle2 } from 'lucide-react';

function StrictModeDroppable(props) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEnabled(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!enabled) return null;

  return <Droppable {...props}>{props.children}</Droppable>;
}

export function TaskBoard({
  tasks,
  projectId,
  projectMembers,
  onUpdateTask,
  onDeleteTask,
}) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Status + label + icon
  const statuses = ['todo', 'in-progress', 'done'];
  const statusLabels = {
    todo: { label: 'Belum Dikerjakan', icon: ClipboardList, badge: 'gray' },
    'in-progress': { label: 'Sedang Berjalan', icon: Loader2, badge: 'blue' },
    done: { label: 'Selesai', icon: CheckCircle2, badge: 'green' },
  };

  // State lokal untuk immediate reorder
  const [localTasksByStatus, setLocalTasksByStatus] = useState({});

  // Sync saat props.tasks berubah
  useEffect(() => {
    const grouped = groupTasksByStatus(tasks);
    statuses.forEach((s) => {
      if (!grouped[s]) grouped[s] = [];
    });
    setLocalTasksByStatus(grouped);
  }, [tasks]);

  // Delay mount untuk hindari hydration mismatch
  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    // Reorder di UI lokal
    const updated = { ...localTasksByStatus };
    const srcList = Array.from(updated[source.droppableId]);
    const [moved] = srcList.splice(source.index, 1);
    updated[source.droppableId] = srcList;

    const destList = Array.from(updated[destination.droppableId]);
    destList.splice(destination.index, 0, moved);
    updated[destination.droppableId] = destList;

    setLocalTasksByStatus(updated);

    // Simpan ke server kalo pindah kolom
    if (destination.droppableId !== source.droppableId) {
      onUpdateTask(moved.id, { status: destination.droppableId });
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleTaskUpdate = async (taskId, data) => {
    await onUpdateTask(taskId, data);
    setIsDetailModalOpen(false);
  };
  const handleTaskDelete = async (taskId) => {
    await onDeleteTask(taskId);
    setIsDetailModalOpen(false);
  };

  // Skeleton sebelum mount
  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statuses.map((status) => {
          const Icon = statusLabels[status].icon;
          return (
            <Card key={status} className="min-h-[320px] flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b bg-muted/40 dark:bg-slate-900/40">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <CardTitle className="text-base font-semibold text-foreground">
                    {statusLabels[status].label}
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5">
                  0
                </Badge>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center items-center gap-2">
                <Skeleton className="w-full h-24 rounded-lg" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="w-8 h-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statuses.map((status) => {
            const Icon = statusLabels[status].icon;
            const badgeColor =
              status === 'todo'
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                : status === 'in-progress'
                ? 'bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
                : 'bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-300';

            return (
              <Card key={status} className="min-h-[320px] flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b bg-muted/40 dark:bg-slate-900/40">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`w-5 h-5 ${
                        status === 'todo'
                          ? 'text-gray-400'
                          : status === 'in-progress'
                          ? 'text-blue-500 animate-spin'
                          : 'text-green-500'
                      }`}
                    />
                    <CardTitle className="text-base font-semibold text-foreground">
                      {statusLabels[status].label}
                    </CardTitle>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium  ${badgeColor}`}
                  >
                    {localTasksByStatus[status]?.length || 0}
                  </span>
                </CardHeader>
                <CardContent className="flex-1 pt-3">
                  <StrictModeDroppable
                    droppableId={status}
                    type="TASK"
                    isDropDisabled={false}
                    isCombineEnabled={false}
                    ignoreContainerClipping={false}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 min-h-[210px] transition-colors ${
                          snapshot.isDraggingOver
                            ? 'bg-primary/10 dark:bg-primary/20'
                            : ''
                        } px-0 py-1 rounded-lg`}
                      >
                        {localTasksByStatus[status].map((task, index) => (
                          <Draggable
                            key={`${status}-${task.id}-${index}`}
                            draggableId={`${status}-${task.id}-${index}`}
                            index={index}
                          >
                            {(prov, snap) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                                onClick={() => handleTaskClick(task)}
                                className={`transition-shadow ${
                                  snap.isDragging
                                    ? 'shadow-lg ring-2 ring-primary/30 opacity-80 scale-[0.98]'
                                    : ''
                                }`}
                              >
                                <TaskCard
                                  task={task}
                                  projectMembers={projectMembers}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}

                        {provided.placeholder}

                        {localTasksByStatus[status].length === 0 &&
                          !snapshot.isDraggingOver && (
                            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                              <p className="text-sm text-muted-foreground">
                                Tidak ada tugas di kolom ini
                              </p>
                            </div>
                          )}
                      </div>
                    )}
                  </StrictModeDroppable>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DragDropContext>

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