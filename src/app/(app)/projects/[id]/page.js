'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, LayoutGrid, List, Plus, StickyNote, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import Spinner from '@/components/ui/Spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import ProjectIcon from '@/components/project/ProjectIcon';
import KanbanBoard from '@/components/task/KanbanBoard';
import TaskListView from '@/components/task/TaskListView';
import CreateTaskModal from '@/components/task/CreateTaskModal';
import TaskDrawer from '@/components/task/TaskDrawer';
import NoteCard from '@/components/notes/NoteCard';
import CreateNoteModal from '@/components/notes/CreateNoteModal';
import FileAttachments from '@/components/files/FileAttachments';
import ChatPanel from '@/components/chat/ChatPanel';
import noteService from '@/services/noteService';
import { PROJECT_STATUSES, PROJECT_COLORS, PROJECT_ICONS, getStatusLabel } from '@/constants/project';
import { ROUTES } from '@/constants/routes';
import projectService from '@/services/projectService';
import taskService from '@/services/taskService';
import Select from '@/components/ui/Select';
import { cn } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  description: z.string().max(2000).optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed']),
  color: z.enum(['zinc', 'blue', 'violet', 'emerald', 'amber', 'rose']),
  icon: z.string(),
});

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskView, setTaskView] = useState('kanban');
  const [isLoading, setIsLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [createNoteOpen, setCreateNoteOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const selectedColor = watch('color');
  const selectedIcon = watch('icon');

  const loadProject = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await projectService.getById(id);
      setProject(data.project);
      reset({
        title: data.project.title,
        description: data.project.description || '',
        status: data.project.status,
        color: data.project.color,
        icon: data.project.icon,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  }, [id, reset]);

  const loadTasks = useCallback(async () => {
    if (!project?.workspaceId) return;
    setTasksLoading(true);
    try {
      const data = await taskService.getAll({
        workspaceId: project.workspaceId,
        projectId: id,
      });
      setTasks(data.tasks);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setTasksLoading(false);
    }
  }, [id, project?.workspaceId]);

  useEffect(() => {
    if (id) loadProject();
  }, [id, loadProject]);

  useEffect(() => {
    if (project) loadTasks();
  }, [project, loadTasks]);

  const loadNotes = useCallback(async () => {
    if (!project?.workspaceId) return;
    setNotesLoading(true);
    try {
      const data = await noteService.getAll({
        workspaceId: project.workspaceId,
        projectId: id,
        type: 'project',
      });
      setNotes(data.notes);
    } catch {
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  }, [id, project?.workspaceId]);

  useEffect(() => {
    if (project) loadNotes();
  }, [project, loadNotes]);

  const handleCreateNote = async (payload) => {
    const data = await noteService.create(payload);
    setNotes((prev) => [data.note, ...prev]);
  };

  const onSave = async (values) => {
    setMessage('');
    setError('');
    try {
      const data = await projectService.update(id, values);
      setProject(data.project);
      setIsEditing(false);
      setMessage('Project updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project');
    }
  };

  const onDelete = async () => {
    const confirmed = window.confirm(`Delete "${project?.title}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await projectService.delete(id);
      router.push(ROUTES.PROJECTS);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleCreateTask = async (payload) => {
    const data = await taskService.create({ ...payload, projectId: id });
    setTasks((prev) => [data.task, ...prev]);
    return data;
  };

  const handleStatusChange = async (taskId, status) => {
    const data = await taskService.updateStatus(taskId, status);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? data.task : t)));
  };

  const handleTaskUpdated = (updated) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleTaskDeleted = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTaskId(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Link
          href={ROUTES.PROJECTS}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <Link
        href={ROUTES.PROJECTS}
        className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <ProjectIcon icon={project.icon} color={project.color} size="lg" />
              <div>
                {!isEditing ? (
                  <>
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {project.description || 'No description'}
                    </CardDescription>
                    <p className="mt-3 text-xs font-medium uppercase tracking-wide text-zinc-400">
                      Status: {getStatusLabel(project.status)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-zinc-500">Editing project</p>
                )}
              </div>
            </div>
            {!isEditing && (
              <div className="flex shrink-0 gap-2 self-start">
                <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        {isEditing && (
          <CardContent>
            <form onSubmit={handleSubmit(onSave)} className="space-y-4">
              <div className="flex items-center gap-4">
                <ProjectIcon icon={selectedIcon} color={selectedColor} size="lg" />
                <div className="flex-1">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" error={errors.title} {...register('title')} />
                  {errors.title && (
                    <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  rows={4}
                  className="mt-1 flex w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
                  {...register('description')}
                />
              </div>

              <div>
                <Label>Color</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PROJECT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setValue('color', c.value)}
                      className={cn(
                        'h-8 w-8 rounded-full border-2',
                        c.class,
                        selectedColor === c.value ? 'border-zinc-900 scale-110' : 'border-transparent'
                      )}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label>Icon</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PROJECT_ICONS.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setValue('icon', iconName)}
                      className={cn(
                        'rounded-xl border p-2',
                        selectedIcon === iconName ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200'
                      )}
                    >
                      <ProjectIcon icon={iconName} color={selectedColor} size="sm" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  className="mt-1"
                  value={watch('status')}
                  options={PROJECT_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
                  {...register('status')}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    reset({
                      title: project.title,
                      description: project.description || '',
                      status: project.status,
                      color: project.color,
                      icon: project.icon,
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  Save changes
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Tasks</CardTitle>
              <CardDescription>
                {tasks.length} task{tasks.length !== 1 ? 's' : ''} in this project
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-xl border border-zinc-200 bg-zinc-50 p-1">
                <button
                  type="button"
                  onClick={() => setTaskView('kanban')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors',
                    taskView === 'kanban' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Board
                </button>
                <button
                  type="button"
                  onClick={() => setTaskView('list')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors',
                    taskView === 'list' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
                  )}
                >
                  <List className="h-3.5 w-3.5" />
                  List
                </button>
              </div>
              <Button size="sm" onClick={() => setCreateTaskOpen(true)}>
                <Plus className="h-4 w-4" />
                Add task
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {tasksLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : taskView === 'kanban' ? (
            <KanbanBoard
              tasks={tasks}
              onTaskClick={(task) => setSelectedTaskId(task.id)}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <TaskListView tasks={tasks} onTaskClick={(task) => setSelectedTaskId(task.id)} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Project notes</CardTitle>
              <CardDescription>
                {notes.length} note{notes.length !== 1 ? 's' : ''} for this project
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setCreateNoteOpen(true)}>
              <StickyNote className="h-4 w-4" />
              Add note
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {notesLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : notes.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500">
              No project notes yet. Add documentation or ideas linked to this project.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project files</CardTitle>
          <CardDescription>Upload files linked to this project</CardDescription>
        </CardHeader>
        <CardContent>
          <FileAttachments workspaceId={project.workspaceId} projectId={id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project chat</CardTitle>
          <CardDescription>Discuss this project with your team</CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-0">
          <ChatPanel
            workspaceId={project.workspaceId}
            projectId={id}
            title={project.title}
            subtitle="Project channel"
            showHeader={false}
            compact
            className="border-0 rounded-none shadow-none"
          />
        </CardContent>
      </Card>

      <CreateTaskModal
        open={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        workspaceId={project.workspaceId}
        projectId={id}
        onCreated={handleCreateTask}
      />

      <CreateNoteModal
        open={createNoteOpen}
        onClose={() => setCreateNoteOpen(false)}
        workspaceId={project.workspaceId}
        defaultType="project"
        defaultProjectId={id}
        onCreated={handleCreateNote}
      />

      <TaskDrawer
        taskId={selectedTaskId}
        open={Boolean(selectedTaskId)}
        onClose={() => setSelectedTaskId(null)}
        workspaceId={project.workspaceId}
        onUpdated={handleTaskUpdated}
        onDeleted={handleTaskDeleted}
      />
    </div>
  );
}
