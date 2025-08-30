import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useCampaignGroups, CampaignGroup } from "@/hooks/useCampaignGroups";
import { useInsertionOrders } from "@/hooks/useInsertionOrders";
import { CampaignGroupCard } from "@/components/CampaignGroupCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CreateCampaignGroupDialog } from "@/components/CreateCampaignGroupDialog";
import { EditCampaignGroupDialog } from "@/components/EditCampaignGroupDialog";
import { useParams } from "react-router-dom";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

export default function Campanhas() {
  const { insertionOrderId } = useParams();
  const { campaignGroups, loading, deleteCampaignGroup, fetchCampaignGroups } = useCampaignGroups(insertionOrderId);
  const { insertionOrders } = useInsertionOrders();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCampaignGroup, setEditingCampaignGroup] = useState<CampaignGroup | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignGroupToDelete, setCampaignGroupToDelete] = useState<string | null>(null);

  const currentInsertionOrder = insertionOrders.find(io => io.id === insertionOrderId);

  const filteredCampaignGroups = campaignGroups.filter(campaignGroup =>
    campaignGroup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (campaignGroup.description && campaignGroup.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteClick = (id: string) => {
    setCampaignGroupToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (campaignGroupToDelete) {
      deleteCampaignGroup(campaignGroupToDelete);
      setCampaignGroupToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const breadcrumbItems = [
    { label: "Insertion Orders", href: "/insertion-orders" },
    ...(currentInsertionOrder ? [{ 
      label: currentInsertionOrder.client_name, 
      href: `/insertion-orders/${insertionOrderId}` 
    }] : []),
    { label: "Campanhas", href: `/insertion-orders/${insertionOrderId}/campanhas` }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Campanhas</h1>
              {currentInsertionOrder && (
                <p className="text-sm text-muted-foreground">
                  {currentInsertionOrder.client_name}
                </p>
              )}
            </div>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Campanha
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="space-y-6 mt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar campanhas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredCampaignGroups.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Nenhuma campanha encontrada
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece criando sua primeira campanha.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Campanha
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaignGroups.map((campaignGroup) => (
                <CampaignGroupCard
                  key={campaignGroup.id}
                  campaignGroup={campaignGroup}
                  onDelete={handleDeleteClick}
                  onEdit={setEditingCampaignGroup}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateCampaignGroupDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        insertionOrderId={insertionOrderId}
        onCampaignGroupCreated={fetchCampaignGroups}
      />

      {editingCampaignGroup && (
        <EditCampaignGroupDialog
          campaignGroup={editingCampaignGroup}
          open={!!editingCampaignGroup}
          onOpenChange={(open) => !open && setEditingCampaignGroup(null)}
          onCampaignGroupUpdated={fetchCampaignGroups}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Campanha</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita e todos os criativos associados também serão excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}