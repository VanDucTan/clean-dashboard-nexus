import React, { useState, useEffect } from "react";
import { PlusCircle, Search, Edit, Trash2, ChevronDown, ChevronRight, Check } from "lucide-react";
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
  DialogDescription,
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
import CustomPagination from "@/components/ui/custom-pagination";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Spinner from "@/components/ui/spinner";

type Tables = Database['public']['Tables'];
type Role = Tables['roles']['Row'];
type RoleInsert = Tables['roles']['Insert'];
type RoleUpdate = Tables['roles']['Update'];

interface Permission {
  id: string;
  name: string;
  actions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

// Modules with permissions
const modules = [
  { id: "dashboard", name: "Dashboard" },
  { id: "accounts", name: "Accounts" },
  { id: "roles", name: "Roles" },
  { id: "teams", name: "Teams" },
  { id: "applies", name: "Applies" },
  { id: "interview", name: "Interview" },
  { id: "rule-assessment", name: "Rule Assessment" },
  { id: "qa", name: "Q&A" },
  { id: "type", name: "Type" },
  { id: "questions", name: "Questions" },
  { id: "history", name: "History" },
  { id: "webhooks", name: "Webhooks" },
];

interface RolesManagementProps {
  language: 'en' | 'vi';
  text: {
    title: string;
    loading: string;
    noRoles: string;
    showing: string;
    perPage: string;
    editRole: string;
    create: string;
    searchPlaceholder: string;
    deleteRole: string;
    deleteConfirmation: string;
    delete: string;
    name: string;
    description: string;
    createdAt: string;
    actions: string;
    of: string;
  };
}

const RolesManagement = ({ language, text }: RolesManagementProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  // Dialog form state
  const [formData, setFormData] = useState<{
    name: string;
    description: string | null;
  }>({
    name: "",
    description: "",
  });

  // Fetch roles from Supabase
  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setRoles(data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Lỗi',
        description: language === 'en' ? 'Failed to fetch roles' : 'Không thể tải danh sách vai trò',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();

    // Set up real-time subscription
    const channel = supabase.channel('roles_changes');
    
    const subscription = channel
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'roles' 
        }, 
        () => {
          fetchRoles();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to roles changes');
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSaveRole = async () => {
    try {
      const timestamp = new Date().toISOString();
      const roleData = {
        name: formData.name,
        description: formData.description,
        updated_at: timestamp,
      };

      if (editingRole) {
        // Update existing role
        const { error } = await supabase
          .from('roles')
          .update(roleData)
          .eq('id', editingRole.id);

        if (error) throw error;

        toast({
          title: language === 'en' ? 'Success' : 'Thành công',
          description: language === 'en' ? 'Role updated successfully' : 'Cập nhật vai trò thành công',
        });
      } else {
        // Create new role
        const { error } = await supabase
          .from('roles')
          .insert({
            ...roleData,
            id: crypto.randomUUID(),
            created_at: timestamp,
          });

        if (error) throw error;

        toast({
          title: language === 'en' ? 'Success' : 'Thành công',
          description: language === 'en' ? 'Role created successfully' : 'Tạo vai trò thành công',
        });
      }

      setIsAddDialogOpen(false);
      setEditingRole(null);
      setFormData({ name: "", description: "" });
    } catch (error) {
      console.error('Error saving role:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Lỗi',
        description: language === 'en' ? 'Failed to save role' : 'Không thể lưu vai trò',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRoleId) return;

    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', selectedRoleId);

      if (error) throw error;

      setIsDeleteDialogOpen(false);
      setSelectedRoleId(null);
      toast({
        title: language === 'en' ? 'Success' : 'Thành công',
        description: language === 'en' ? 'Role deleted successfully' : 'Xóa vai trò thành công',
      });
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Lỗi',
        description: language === 'en' ? 'Failed to delete role' : 'Không thể xóa vai trò',
        variant: 'destructive',
      });
    }
  };

  // Filter and pagination
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (role.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const paginatedRoles = filteredRoles.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Toggle role permissions view
  const toggleRoleExpansion = (roleId: string) => {
    setExpandedRole(expandedRole === roleId ? null : roleId);
  };

  // Open add/edit role dialog
  const openRoleDialog = (role?: Role) => {
    if (role) {
      // Edit mode
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description,
      });
    } else {
      // Add mode
      setEditingRole(null);
      setFormData({
        name: "",
        description: "",
      });
    }
    setIsAddDialogOpen(true);
  };

  // Open delete confirmation
  const openDeleteDialog = (roleId: string) => {
    setSelectedRoleId(roleId);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{text.title}</h2>
        <Button onClick={() => openRoleDialog()}>
          <PlusCircle className="w-4 h-4 mr-2" />
          {text.create}
        </Button>
      </div>

      {/* Search */}
      {!isLoading && (
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={text.searchPlaceholder}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{text.name}</TableHead>
              <TableHead>{text.description}</TableHead>
              <TableHead>{text.createdAt}</TableHead>
              <TableHead>{text.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex justify-center items-center space-x-2">
                    <Spinner size="sm" />
                    <span>{text.loading}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  {text.noRoles}
                </TableCell>
              </TableRow>
            ) : (
              paginatedRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>{format(new Date(role.created_at), 'PPP')}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openRoleDialog(role)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(role.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Select
            value={rowsPerPage.toString()}
            onValueChange={(value) => {
              setRowsPerPage(parseInt(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize} {text.perPage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {text.showing} {((currentPage - 1) * rowsPerPage) + 1}-
            {Math.min(currentPage * rowsPerPage, filteredRoles.length)} {text.of}{" "}
            {filteredRoles.length}
          </span>
        </div>
        <CustomPagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredRoles.length / rowsPerPage)}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          translations={{
            showing: text.showing,
            of: text.of,
            perPage: text.perPage
          }}
        />
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRole ? text.editRole : text.create}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{text.name}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{text.description}</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{text.deleteRole}</AlertDialogTitle>
            <AlertDialogDescription>
              {text.deleteConfirmation}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {text.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RolesManagement; 