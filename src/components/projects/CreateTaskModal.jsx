'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
  projectMembers
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [assigneeId, setAssigneeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'done', label: 'Done' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Task title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      // Bangun payload, omit assigneeId jika kosong
      const payload = {
        title: title.trim(),
        description: description.trim(),
        status,
        ...(assigneeId && { assigneeId })
      };

      console.log('Creating task with payload:', payload);
      await onSubmit(payload);

      // reset form
      setTitle('');
      setDescription('');
      setStatus('todo');
      setAssigneeId('');
      onClose();
    } catch (err) {
      console.error('Error creating task:', err);
      alert(`Failed to create task: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md overflow-hidden shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Create New Task
              </h3>

              {/* Title */}
              <div className="mb-4">
                <Label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                  required
                  placeholder="Enter task title"
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <Label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter task description (optional)"
                />
              </div>

              {/* Status */}
              <div className="mb-4">
                <Label htmlFor="status" className="block text-sm font-medium mb-1">
                  Status
                </Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {statusOptions.map(o => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignee */}
              <div className="mb-4">
                <Label htmlFor="assignee" className="block text-sm font-medium mb-1">
                  Assignee
                </Label>
                <select
                  id="assignee"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Unassigned</option>
                  {projectMembers?.map(member => (
                    <option
                      key={member.user.id}
                      value={member.user.id}
                    >
                      {member.user.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex flex-row-reverse">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="ml-3 px-4 py-2 bg-blue-600 text-white"
              >
                {isSubmitting ? 'Creating...' : 'Create Task'}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
