import React, { useState, useEffect } from "react";
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react";
import { createClient } from '@supabase/supabase-js';
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

// Supabase client initialization with Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define interfaces
interface Team {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  training_group: string | null;
  is_recruiting: boolean;
  device_working: string[];
  quantity_of_positions: number;
}

// Sample device options
const deviceOptions = ["laptop", "mobile"];

// Remove sampleTeams as we'll fetch from Supabase

interface TeamsManagementProps {
  language: 'en' | 'vi';
}

const TeamsManagement = ({ language }: TeamsManagementProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch teams from Supabase
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      console.log('Fetching teams...');
      
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching teams:', error);
        throw error;
      }

      console.log('Fetched teams:', data);
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: language === 'en' ? 'Error loading teams' : 'Lỗi tải danh sách nhóm',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Form data interface to match Supabase schema
  interface TeamFormData {
    name: string;
    description: string;
    training_group: string;
    is_recruiting: boolean;
    device_working: string[];
    quantity_of_positions: number;
  }

  // Update form data state to match new interface
  const [formData, setFormData] = useState<TeamFormData>({
    name: "",
    description: "",
    training_group: "",
    is_recruiting: false,
    device_working: [],
    quantity_of_positions: 0
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
      showing: "Showing",
      of: "of",
      perPage: "per page",
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
      showing: "Hiển thị",
      of: "trong số",
      perPage: "mỗi trang",
    }
  };

  // Open dialog for adding or editing a team
  const openTeamDialog = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setFormData({
        name: team.name,
        description: team.description || "",
        training_group: team.training_group || "",
        is_recruiting: team.is_recruiting,
        device_working: [...team.device_working],
        quantity_of_positions: team.quantity_of_positions
      });
    } else {
      setEditingTeam(null);
      setFormData({
        name: "",
        description: "",
        training_group: "",
        is_recruiting: false,
        device_working: [],
        quantity_of_positions: 0
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

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === "quantity_of_positions" ? parseInt(value) || 0 : value
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
      is_recruiting: checked
    }));
  };

  // Handle device selection
  const handleDeviceSelectionChange = (device: string) => {
    setFormData(prev => {
      const deviceIndex = prev.device_working.indexOf(device);
      
      if (deviceIndex === -1) {
        return {
          ...prev,
          device_working: [...prev.device_working, device]
        };
      } else {
        return {
          ...prev,
          device_working: prev.device_working.filter(d => d !== device)
        };
      }
    });
  };

  // Validate form data
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = t[language].nameRequired;
    }
    
    if (!formData.training_group.trim()) {
      errors.training_group = t[language].trainingGroupRequired;
    } else {
      try {
        // Simple URL validation
        new URL(formData.training_group);
      } catch (e) {
        errors.training_group = t[language].trainingGroupInvalid;
      }
    }
    
    if (formData.quantity_of_positions < 0) {
      errors.quantity_of_positions = t[language].quantityInvalid;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle save team with Supabase
  const handleSaveTeam = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      console.log('Saving team...', formData);
      
      if (editingTeam) {
        // Update existing team
        const { error } = await supabase
          .from('teams')
          .update({
            name: formData.name,
            description: formData.description,
            training_group: formData.training_group,
            is_recruiting: formData.is_recruiting,
            device_working: formData.device_working,
            quantity_of_positions: formData.quantity_of_positions,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTeam.id);

        if (error) {
          console.error('Error updating team:', error);
          throw error;
        }

        console.log('Team updated successfully');
        toast({
          title: t[language].teamUpdated,
        });
      } else {
        // Add new team
        const { error } = await supabase
          .from('teams')
          .insert([{
            name: formData.name,
            description: formData.description,
            training_group: formData.training_group,
            is_recruiting: formData.is_recruiting,
            device_working: formData.device_working,
            quantity_of_positions: formData.quantity_of_positions
          }]);

        if (error) {
          console.error('Error creating team:', error);
          throw error;
        }

        console.log('Team created successfully');
        toast({
          title: t[language].teamAdded,
        });
      }

      // Refresh teams list
      await fetchTeams();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error saving team:', error);
      toast({
        title: language === 'en' ? 'Error saving team' : 'Lỗi lưu nhóm',
        variant: "destructive",
      });
    }
  };

  // Handle delete team with Supabase
  const handleDeleteTeam = async () => {
    if (selectedTeamId) {
      try {
        console.log('Deleting team:', selectedTeamId);
        
        const { error } = await supabase
          .from('teams')
          .delete()
          .eq('id', selectedTeamId);

        if (error) {
          console.error('Error deleting team:', error);
          throw error;
        }

        console.log('Team deleted successfully');
        toast({
          title: t[language].teamDeleted,
        });
        await fetchTeams();
      } catch (error) {
        console.error('Error deleting team:', error);
        toast({
          title: language === 'en' ? 'Error deleting team' : 'Lỗi xóa nhóm',
          variant: "destructive",
        });
      }
    }
    setIsDeleteDialogOpen(false);
    setSelectedTeamId(null);
  };

  // Filter teams based on search query
  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    {language === 'en' ? 'Loading teams...' : 'Đang tải danh sách nhóm...'}
                  </TableCell>
                </TableRow>
              ) : currentTeams.length > 0 ? (
                currentTeams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      {format(new Date(team.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-[300px] truncate">
                      {team.description}
                    </TableCell>
                    <TableCell>
                      <a 
                        href={team.training_group} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {team.training_group?.replace(/^https?:\/\/(www\.)?/i, '')}
                      </a>
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox checked={team.is_recruiting} disabled />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {team.device_working.map((device) => (
                          <Badge key={device} variant="outline">
                            {device}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {team.quantity_of_positions}
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
        <div className="flex justify-end">
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            totalItems={filteredTeams.length}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(value) => {
              setRowsPerPage(value);
              setCurrentPage(1);
            }}
            pageSizeOptions={[5, 10, 20, 30, 40, 50]}
            translations={{
              showing: t[language].showing,
              of: t[language].of,
              perPage: t[language].perPage
            }}
          />
          </div>
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
                name="training_group"
                placeholder="https://t.me/example"
                value={formData.training_group}
                onChange={handleInputChange}
                className={formErrors.training_group ? "border-red-500" : ""}
              />
              {formErrors.training_group && (
                <p className="text-red-500 text-sm">{formErrors.training_group}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecruiting"
                checked={formData.is_recruiting}
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
                      checked={formData.device_working.includes(device)}
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
                name="quantity_of_positions"
                type="number"
                min="0"
                value={formData.quantity_of_positions}
                onChange={handleInputChange}
                className={formErrors.quantity_of_positions ? "border-red-500" : ""}
              />
              {formErrors.quantity_of_positions && (
                <p className="text-red-500 text-sm">{formErrors.quantity_of_positions}</p>
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