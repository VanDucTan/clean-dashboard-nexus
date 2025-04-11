import React, { useState } from "react";
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomPagination from "@/components/ui/custom-pagination";
import { format } from "date-fns";

// Define interfaces
interface Team {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  trainingGroup: string;
  isRecruiting: boolean;
  deviceWorking: string[];
  quantityOfPositions: number;
}

// Sample device options
const deviceOptions = ["laptop", "mobile"];

// Sample data
const sampleTeams: Team[] = [
  {
    id: "1",
    name: "Development Team",
    description: "Main software development team",
    createdAt: new Date(2023, 3, 15),
    trainingGroup: "https://t.me/dev_training",
    isRecruiting: true,
    deviceWorking: ["laptop", "mobile"],
    quantityOfPositions: 5
  },
  {
    id: "2",
    name: "Design Team",
    description: "UI/UX design team",
    createdAt: new Date(2023, 5, 22),
    trainingGroup: "https://t.me/design_group",
    isRecruiting: false,
    deviceWorking: ["laptop"],
    quantityOfPositions: 0
  },
  {
    id: "3",
    name: "Marketing Team",
    description: "Marketing and PR team",
    createdAt: new Date(2023, 8, 5),
    trainingGroup: "https://t.me/marketing_group",
    isRecruiting: true,
    deviceWorking: ["laptop", "mobile"],
    quantityOfPositions: 3
  },
];

interface TeamsManagementProps {
  language: 'en' | 'vi';
}

const TeamsManagement = ({ language }: TeamsManagementProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [teams, setTeams] = useState<Team[]>(sampleTeams);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form data
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    trainingGroup: string;
    isRecruiting: boolean;
    deviceWorking: string[];
    quantityOfPositions: number;
  }>({
    name: "",
    description: "",
    trainingGroup: "",
    isRecruiting: false,
    deviceWorking: [],
    quantityOfPositions: 0
  });

  // Translations
  const t = {
    en: {
      title: "Teams Management",
      search: "Search teams...",
      addTeam: "Create Team",
      name: "Name",
      description: "Description",
      createdAt: "Date Create",
      trainingGroup: "Training Group",
      isRecruiting: "Recruitment",
      deviceWorking: "Device Working",
      quantityOfPositions: "Quantity Of Positions",
      actions: "Actions",
      edit: "Edit",
      delete: "Delete",
      deleteConfirm: "Are you sure you want to delete this team?",
      deleteDescription: "This action cannot be undone. This will permanently delete the team and remove it from our servers.",
      cancel: "Cancel",
      confirm: "Confirm",
      save: "Save",
      noResults: "No teams found",
      teamAdded: "Team added successfully",
      teamUpdated: "Team updated successfully",
      teamDeleted: "Team deleted successfully",
      rowsPerPage: "Rows per page",
      nameRequired: "Name is required",
      trainingGroupRequired: "Training Group link is required",
      trainingGroupInvalid: "Training Group must be a valid URL",
      quantityInvalid: "Quantity must be 0 or greater",
    },
    vi: {
      title: "Quản lý nhóm",
      search: "Tìm kiếm nhóm...",
      addTeam: "Tạo nhóm",
      name: "Tên",
      description: "Mô tả",
      createdAt: "Ngày tạo",
      trainingGroup: "Nhóm đào tạo",
      isRecruiting: "Đang tuyển",
      deviceWorking: "Thiết bị làm việc",
      quantityOfPositions: "Số lượng vị trí",
      actions: "Hành động",
      edit: "Sửa",
      delete: "Xóa",
      deleteConfirm: "Bạn có chắc chắn muốn xóa nhóm này?",
      deleteDescription: "Hành động này không thể hoàn tác. Điều này sẽ xóa vĩnh viễn nhóm và xóa nó khỏi máy chủ của chúng tôi.",
      cancel: "Hủy",
      confirm: "Xác nhận",
      save: "Lưu",
      noResults: "Không tìm thấy nhóm nào",
      teamAdded: "Thêm nhóm thành công",
      teamUpdated: "Cập nhật nhóm thành công",
      teamDeleted: "Xóa nhóm thành công",
      rowsPerPage: "Hàng mỗi trang",
      nameRequired: "Tên là bắt buộc",
      trainingGroupRequired: "Liên kết nhóm đào tạo là bắt buộc",
      trainingGroupInvalid: "Nhóm đào tạo phải là URL hợp lệ",
      quantityInvalid: "Số lượng phải là 0 hoặc lớn hơn",
    }
  };

  // Open dialog for adding or editing a team
  const openTeamDialog = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setFormData({
        name: team.name,
        description: team.description || "",
        trainingGroup: team.trainingGroup,
        isRecruiting: team.isRecruiting,
        deviceWorking: [...team.deviceWorking],
        quantityOfPositions: team.quantityOfPositions
      });
    } else {
      setEditingTeam(null);
      setFormData({
        name: "",
        description: "",
        trainingGroup: "",
        isRecruiting: false,
        deviceWorking: [],
        quantityOfPositions: 0
      });
    }
    setFormErrors({});
    setIsAddDialogOpen(true);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (teamId: string) => {
    setSelectedTeamId(teamId);
    setIsDeleteDialogOpen(true);
  };

  // Validate form data
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = t[language].nameRequired;
    }
    
    if (!formData.trainingGroup.trim()) {
      errors.trainingGroup = t[language].trainingGroupRequired;
    } else {
      try {
        // Simple URL validation
        new URL(formData.trainingGroup);
      } catch (e) {
        errors.trainingGroup = t[language].trainingGroupInvalid;
      }
    }
    
    if (formData.quantityOfPositions < 0) {
      errors.quantityOfPositions = t[language].quantityInvalid;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle save team
  const handleSaveTeam = () => {
    if (!validateForm()) {
      return;
    }
    
    if (editingTeam) {
      // Update existing team
      setTeams(teams.map(team => 
        team.id === editingTeam.id 
          ? { 
              ...team, 
              name: formData.name,
              description: formData.description,
              trainingGroup: formData.trainingGroup,
              isRecruiting: formData.isRecruiting,
              deviceWorking: [...formData.deviceWorking],
              quantityOfPositions: formData.quantityOfPositions
            } 
          : team
      ));
      toast({
        title: t[language].teamUpdated,
      });
    } else {
      // Add new team
      const newTeam: Team = {
        id: String(Date.now()),
        name: formData.name,
        description: formData.description,
        createdAt: new Date(),
        trainingGroup: formData.trainingGroup,
        isRecruiting: formData.isRecruiting,
        deviceWorking: [...formData.deviceWorking],
        quantityOfPositions: formData.quantityOfPositions
      };
      setTeams([...teams, newTeam]);
      toast({
        title: t[language].teamAdded,
      });
    }
    
    setIsAddDialogOpen(false);
  };

  // Handle delete team
  const handleDeleteTeam = () => {
    if (selectedTeamId) {
      setTeams(teams.filter(team => team.id !== selectedTeamId));
      toast({
        title: t[language].teamDeleted,
      });
    }
    setIsDeleteDialogOpen(false);
    setSelectedTeamId(null);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === "quantityOfPositions" ? parseInt(value) || 0 : value
    }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isRecruiting: checked
    }));
  };

  // Handle device selection
  const handleDeviceSelectionChange = (device: string) => {
    setFormData(prev => {
      const deviceIndex = prev.deviceWorking.indexOf(device);
      
      if (deviceIndex === -1) {
        return {
          ...prev,
          deviceWorking: [...prev.deviceWorking, device]
        };
      } else {
        return {
          ...prev,
          deviceWorking: prev.deviceWorking.filter(d => d !== device)
        };
      }
    });
  };

  // Filter teams based on search query
  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const indexOfLastTeam = currentPage * rowsPerPage;
  const indexOfFirstTeam = indexOfLastTeam - rowsPerPage;
  const currentTeams = filteredTeams.slice(indexOfFirstTeam, indexOfLastTeam);
  const totalPages = Math.ceil(filteredTeams.length / rowsPerPage);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t[language].title}</h1>
          <Button onClick={() => openTeamDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t[language].addTeam}
          </Button>
        </div>

        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t[language].search}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t[language].createdAt}</TableHead>
                <TableHead>{t[language].name}</TableHead>
                <TableHead className="hidden md:table-cell">{t[language].description}</TableHead>
                <TableHead>{t[language].trainingGroup}</TableHead>
                <TableHead className="text-center">{t[language].isRecruiting}</TableHead>
                <TableHead>{t[language].deviceWorking}</TableHead>
                <TableHead className="text-right">{t[language].quantityOfPositions}</TableHead>
                <TableHead className="text-right">{t[language].actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTeams.length > 0 ? (
                currentTeams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      {format(team.createdAt, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-[300px] truncate">
                      {team.description}
                    </TableCell>
                    <TableCell>
                      <a 
                        href={team.trainingGroup} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {team.trainingGroup.replace(/^https?:\/\/(www\.)?/i, '')}
                      </a>
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox checked={team.isRecruiting} disabled />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {team.deviceWorking.map((device) => (
                          <Badge key={device} variant="outline">
                            {device}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {team.quantityOfPositions}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openTeamDialog(team)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteDialog(team.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    {t[language].noResults}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(value) => {
            setRowsPerPage(value);
            setCurrentPage(1);
          }}
          translations={{
            rowsPerPage: t[language].rowsPerPage
          }}
        />
      </div>

      {/* Add/Edit Team Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingTeam ? t[language].edit : t[language].addTeam}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="flex items-center">
                {t[language].name}<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder={t[language].name}
                value={formData.name}
                onChange={handleInputChange}
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm">{formErrors.name}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">{t[language].description}</Label>
              <Textarea
                id="description"
                name="description"
                placeholder={t[language].description}
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="trainingGroup" className="flex items-center">
                {t[language].trainingGroup}<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="trainingGroup"
                name="trainingGroup"
                placeholder="https://t.me/example"
                value={formData.trainingGroup}
                onChange={handleInputChange}
                className={formErrors.trainingGroup ? "border-red-500" : ""}
              />
              {formErrors.trainingGroup && (
                <p className="text-red-500 text-sm">{formErrors.trainingGroup}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecruiting"
                checked={formData.isRecruiting}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="isRecruiting">{t[language].isRecruiting}</Label>
            </div>
            
            <div className="grid gap-2">
              <Label>{t[language].deviceWorking}</Label>
              <div className="flex flex-col space-y-2">
                {deviceOptions.map((device) => (
                  <div key={device} className="flex items-center space-x-2">
                    <Checkbox
                      id={`device-${device}`}
                      checked={formData.deviceWorking.includes(device)}
                      onCheckedChange={() => handleDeviceSelectionChange(device)}
                    />
                    <Label htmlFor={`device-${device}`}>{device}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="quantityOfPositions" className="flex items-center">
                {t[language].quantityOfPositions}
              </Label>
              <Input
                id="quantityOfPositions"
                name="quantityOfPositions"
                type="number"
                min="0"
                value={formData.quantityOfPositions}
                onChange={handleInputChange}
                className={formErrors.quantityOfPositions ? "border-red-500" : ""}
              />
              {formErrors.quantityOfPositions && (
                <p className="text-red-500 text-sm">{formErrors.quantityOfPositions}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t[language].cancel}
            </Button>
            <Button onClick={handleSaveTeam}>
              {t[language].save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t[language].deleteConfirm}</AlertDialogTitle>
            <AlertDialogDescription>
              {t[language].deleteDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t[language].cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTeam}>
              {t[language].confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeamsManagement; 