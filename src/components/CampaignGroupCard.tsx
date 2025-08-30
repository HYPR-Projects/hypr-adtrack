import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Calendar, FileText, Trash2, Edit } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { CampaignGroup } from "@/hooks/useCampaignGroups";
import { memo } from "react";

interface CampaignGroupCardProps {
  campaignGroup: CampaignGroup;
  onDelete: (id: string) => void;
  onEdit: (campaignGroup: CampaignGroup) => void;
}

export const CampaignGroupCard = memo(({ campaignGroup, onDelete, onEdit }: CampaignGroupCardProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'paused':
        return 'Pausada';
      case 'completed':
        return 'Finalizada';
      default:
        return 'Indefinido';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-1">
              <Link 
                to={`/campanhas/${campaignGroup.id}/criativos`}
                className="hover:text-primary transition-colors"
              >
                {campaignGroup.name}
              </Link>
            </CardTitle>
            {campaignGroup.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {campaignGroup.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50 bg-background border shadow-md">
              <DropdownMenuItem onClick={() => onEdit(campaignGroup)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(campaignGroup.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(campaignGroup.status)}>
            {getStatusLabel(campaignGroup.status)}
          </Badge>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{campaignGroup._count?.campaigns || 0} criativo(s)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Criada em {formatDate(campaignGroup.created_at)}</span>
          </div>
        </div>

        {(campaignGroup.start_date || campaignGroup.end_date) && (
          <div className="text-sm text-muted-foreground">
            {campaignGroup.start_date && (
              <div>Início: {formatDate(campaignGroup.start_date)}</div>
            )}
            {campaignGroup.end_date && (
              <div>Fim: {formatDate(campaignGroup.end_date)}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});