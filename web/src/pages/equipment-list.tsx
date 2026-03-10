import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEquipments,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} from '@/api/equipments';
import type {
  Equipment,
  CreateEquipmentPayload,
  UpdateEquipmentPayload,
} from '@/api/types';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';

const PAGE_SIZE = 10;

export default function EquipmentListPage() {
  const { canWrite, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Cursor pagination state
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(
    undefined,
  );

  // Dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null,
  );
  const [deletingEquipment, setDeletingEquipment] = useState<Equipment | null>(
    null,
  );

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    tags: '',
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['equipments', currentCursor, PAGE_SIZE],
    queryFn: () => getEquipments(currentCursor, PAGE_SIZE),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateEquipmentPayload) => createEquipment(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['equipments'] });
      setIsCreateOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data: payload,
    }: {
      id: string;
      data: UpdateEquipmentPayload;
    }) => updateEquipment(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['equipments'] });
      setEditingEquipment(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEquipment(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['equipments'] });
      setDeletingEquipment(null);
    },
  });

  function resetForm() {
    setFormData({ id: '', name: '', description: '', tags: '' });
  }

  function openCreate() {
    resetForm();
    setIsCreateOpen(true);
  }

  function openEdit(equipment: Equipment) {
    setFormData({
      id: equipment.id,
      name: equipment.name || '',
      description: equipment.description || '',
      tags: equipment.tags?.join(', ') || '',
    });
    setEditingEquipment(equipment);
  }

  function handleCreate() {
    const tags = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    createMutation.mutate({
      id: formData.id,
      name: formData.name,
      description: formData.description,
      tags: tags.length > 0 ? tags : undefined,
    });
  }

  function handleUpdate() {
    if (!editingEquipment) return;
    const tags = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    updateMutation.mutate({
      id: editingEquipment.id,
      data: {
        name: formData.name,
        description: formData.description,
        tags: tags.length > 0 ? tags : undefined,
      },
    });
  }

  function handleNextPage() {
    if (data?.nextCursor) {
      setCursorStack((prev) => [...prev, currentCursor || '']);
      setCurrentCursor(data.nextCursor);
    }
  }

  function handlePrevPage() {
    if (cursorStack.length > 0) {
      const prev = [...cursorStack];
      const lastCursor = prev.pop()!;
      setCursorStack(prev);
      setCurrentCursor(lastCursor || undefined);
    }
  }

  const pageNumber = cursorStack.length + 1;
  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Equipamentos</h2>
          <p className="text-muted-foreground">
            Gerencie os equipamentos do almoxarifado
            {data && (
              <span className="ml-1">
                ({data.total} equipamento{data.total !== 1 ? 's' : ''})
              </span>
            )}
          </p>
        </div>
        {canWrite && (
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Equipamento
          </Button>
        )}
      </div>

      {/* Equipment Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">ID (Patrimônio)</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Descrição</TableHead>
              <TableHead className="hidden lg:table-cell">Tags</TableHead>
              <TableHead className="hidden sm:table-cell">Criado em</TableHead>
              {canWrite && <TableHead className="w-[100px]">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  {canWrite && (
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canWrite ? 6 : 5}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhum equipamento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((eq) => (
                <TableRow key={eq.id}>
                  <TableCell className="font-mono text-sm font-medium">
                    {eq.id}
                  </TableCell>
                  <TableCell className="font-medium">
                    {eq.name || '—'}
                  </TableCell>
                  <TableCell className="hidden max-w-[300px] truncate md:table-cell">
                    {eq.description || '—'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {eq.tags?.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      )) || '—'}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {new Date(eq.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  {canWrite && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(eq)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingEquipment(eq)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Página {pageNumber} {totalPages > 0 && `de ${totalPages}`}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={cursorStack.length === 0 || isFetching}
            onClick={handlePrevPage}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!data?.nextCursor || isFetching}
            onClick={handleNextPage}
          >
            Próxima
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Equipamento</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo equipamento.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-id">ID (Patrimônio)</Label>
              <Input
                id="create-id"
                placeholder="PAT-001"
                value={formData.id}
                onChange={(e) =>
                  setFormData({ ...formData, id: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-name">Nome</Label>
              <Input
                id="create-name"
                placeholder="Notebook Dell Latitude 5520"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-description">Descrição</Label>
              <Textarea
                id="create-description"
                placeholder="Descrição detalhada do equipamento..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-tags">Tags (separadas por vírgula)</Label>
              <Input
                id="create-tags"
                placeholder="notebook, dell, administrativo"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                createMutation.isPending ||
                !formData.id ||
                !formData.name ||
                !formData.description
              }
            >
              {createMutation.isPending ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
          {createMutation.isError && (
            <p className="text-sm text-destructive">
              {createMutation.error.message}
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editingEquipment !== null}
        onOpenChange={(open) => {
          if (!open) setEditingEquipment(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Equipamento</DialogTitle>
            <DialogDescription>
              Editando equipamento {editingEquipment?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags (separadas por vírgula)</Label>
              <Input
                id="edit-tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEquipment(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
          {updateMutation.isError && (
            <p className="text-sm text-destructive">
              {updateMutation.error.message}
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deletingEquipment !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingEquipment(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o equipamento{' '}
              <strong>{deletingEquipment?.id}</strong> (
              {deletingEquipment?.name})? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingEquipment) {
                  deleteMutation.mutate(deletingEquipment.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
