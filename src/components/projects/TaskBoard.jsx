'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { groupTasksByStatus } from '@/lib/utils';
import { TaskCard } from './TaskCard';
import { TaskDetailModal } from './TaskDetailModal';

// Wrapper Droppable untuk strict-mode safety
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
  onDeleteTask
}) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const statuses = ['todo', 'in-progress', 'done'];
  const statusLabels = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    done: 'Done'
  };

  // State lokal untuk immediate reorder
  const [localTasksByStatus, setLocalTasksByStatus] = useState({});

  // Sync saat props.tasks berubah
  useEffect(() => {
    const grouped = groupTasksByStatus(tasks);
    statuses.forEach(s => {
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
    ) return;

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
        {statuses.map(status => (
          <div key={status} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {statusLabels[status]}
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                0
              </span>
            </div>
            <div className="space-y-3 min-h-[200px]">
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statuses.map(status => (
            <div
              key={status}
              className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {statusLabels[status]}
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  {localTasksByStatus[status]?.length || 0}
                </span>
              </div>

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
                    className={`space-y-3 min-h-[200px] ${
                      snapshot.isDraggingOver
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : ''
                    }`}
                  >
                    {localTasksByStatus[status].map((task, index) => (
                      <Draggable
                        key={task.id.toString()}
                        draggableId={task.id.toString()}
                        index={index}
                      >
                        {(prov, snap) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            onClick={() => handleTaskClick(task)}
                            className={snap.isDragging ? 'opacity-70' : ''}
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
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            No tasks in this column
                          </p>
                        </div>
                      )}
                  </div>
                )}
              </StrictModeDroppable>
            </div>
          ))}
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
