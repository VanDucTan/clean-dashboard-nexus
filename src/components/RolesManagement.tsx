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
type Role = Tables['roles']['Row'] & {
  permissions?: {
    [moduleId: string]: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
  };
};
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
  { id: "webhooks", name: "Webhooks" },
  { id: "applies", name: "Applies" },
  { id: "test_about_yourself", name: "Test About Yourself" },
  { id: "interviews", name: "Interviews" },
  { id: "recruitment", name: "Recruitment" },
  { id: "members_information", name: "Members Information" },
  { id: "member_activities", name: "Member Activities" },
  { id: "teams", name: "Teams" },
  { id: "groups", name: "Groups" },
  { id: "exam", name: "Exam" },
  { id: "black_list", name: "Black List" },
  { id: "banned", name: "Banned" },
  { id: "return_lessons", name: "Return Lessons" },
  { id: "off_lessons", name: "Off Lessons" },
  { id: "time_report", name: "Time Report" },
  { id: "apply", name: "Apply" },
  { id: "question_types", name: "Question Types" },
  { id: "administration", name: "Administration" },
  { id: "questions", name: "Questions" },
  { id: "rules", name: "Rules" },
  { id: "webhook_topic", name: "Webhook Topic" },
  { id: "assessment_details", name: "Assessment Details" }
];

interface RolesManagementProps {
  language: 'en' | 'vi';
  text: {
    title: string;
    loading: string;
    noRoles: string;
    showing: string;
    perPage: string;
    rowsPerPage: string;  // Added this property
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

interface RoleData {
  id?: string;
  name: string;
  description: string | null;
  permissions: {
    [moduleId: string]: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
  };
  created_at?: string;
  updated_at: string;
}

interface RolePermissions {
  [moduleId: string]: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

const DEFAULT_ROLES = [
  {
    id: crypto.randomUUID(),
    name: 'Admin',
    description: 'Full system access',
    permissions: {
      dashboard: { view: true, create: true, edit: true, delete: true },
      accounts: { view: true, create: true, edit: true, delete: true },
      roles: { view: true, create: true, edit: true, delete: true },
      webhooks: { view: true, create: true, edit: true, delete: true },
      applies: { view: true, create: true, edit: true, delete: true },
      test_about_yourself: { view: true, create: true, edit: true, delete: true },
      interviews: { view: true, create: true, edit: true, delete: true },
      recruitment: { view: true, create: true, edit: true, delete: true },
      members_information: { view: true, create: true, edit: true, delete: true },
      member_activities: { view: true, create: true, edit: true, delete: true },
      teams: { view: true, create: true, edit: true, delete: true },
      groups: { view: true, create: true, edit: true, delete: true },
      exam: { view: true, create: true, edit: true, delete: true },
      black_list: { view: true, create: true, edit: true, delete: true },
      banned: { view: true, create: true, edit: true, delete: true },
      return_lessons: { view: true, create: true, edit: true, delete: true },
      off_lessons: { view: true, create: true, edit: true, delete: true },
      time_report: { view: true, create: true, edit: true, delete: true },
      apply: { view: true, create: true, edit: true, delete: true },
      question_types: { view: true, create: true, edit: true, delete: true },
      administration: { view: true, create: true, edit: true, delete: true },
      questions: { view: true, create: true, edit: true, delete: true },
      rules: { view: true, create: true, edit: true, delete: true },
      webhook_topic: { view: true, create: true, edit: true, delete: true },
      assessment_details: { view: true, create: true, edit: true, delete: true }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    name: 'User',
    description: 'Basic user access',
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false },
      accounts: { view: false, create: false, edit: false, delete: false },
      roles: { view: false, create: false, edit: false, delete: false }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const RolesManagement = ({ language, text }: RolesManagementProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  // Dialog form state
  const [formData, setFormData] = useState<{
    name: string;
    description: string | null;
    permissions: Record<string, Record<string, boolean>>;
  }>({
    name: "",
    description: "",
    permissions: {},
  });

  // Fetch roles from Supabase
  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const { data: existingRoles, error: checkError } = await supabase
        .from('roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (checkError) {
        throw checkError;
      }

      // If no roles exist, create default roles
      if (!existingRoles || existingRoles.length === 0) {
        console.log('No roles found, creating default roles...');
        const { data: insertedRoles, error: insertError } = await supabase
          .from('roles')
          .insert(DEFAULT_ROLES)
          .select();

        if (insertError) {
          throw insertError;
        }

        console.log('Default roles created successfully:', insertedRoles);
        setRoles(insertedRoles || []);
      } else {
        console.log('Existing roles found:', existingRoles);
        const rolesWithPermissions = existingRoles.map(role => ({
          ...role,
          permissions: role.permissions || {}
        }));
        setRoles(rolesWithPermissions);
      }
    } catch (error) {
      console.error('Error in fetchRoles:', error);
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
      if (!formData.name.trim()) {
        toast({
          title: language === 'en' ? 'Error' : 'Lỗi',
          description: language === 'en' ? 'Role name is required' : 'Tên vai trò là bắt buộc',
          variant: 'destructive',
        });
        return;
      }

      // Convert permissions to correct type
      const permissions: RolePermissions = {};
      Object.keys(formData.permissions || {}).forEach(moduleId => {
        permissions[moduleId] = {
          view: Boolean(formData.permissions[moduleId]?.view),
          create: Boolean(formData.permissions[moduleId]?.create),
          edit: Boolean(formData.permissions[moduleId]?.edit),
          delete: Boolean(formData.permissions[moduleId]?.delete)
        };
      });

      const timestamp = new Date().toISOString();

      if (editingRole?.id) {
        // Update existing role
        const { error: updateError } = await supabase
          .from('roles')
          .update({
            name: formData.name.trim(),
            description: formData.description?.trim() || null,
            permissions,
            updated_at: timestamp
          })
          .eq('id', editingRole.id);

        if (updateError) {
          console.error('Supabase update error:', updateError);
          throw new Error(updateError.message);
        }

        // Fetch updated data
        const { data: updatedRole, error: fetchError } = await supabase
          .from('roles')
          .select('*')
          .eq('id', editingRole.id)
          .single();

        if (fetchError || !updatedRole) {
          throw new Error(language === 'en' ? 'Failed to fetch updated role' : 'Không thể tải vai trò đã cập nhật');
        }

        // Update local state
        setRoles(prevRoles => 
          prevRoles.map(role => role.id === editingRole.id ? { ...role, ...updatedRole } : role)
        );

        toast({
          title: language === 'en' ? 'Success' : 'Thành công',
          description: language === 'en' ? 'Role updated successfully' : 'Cập nhật vai trò thành công',
        });
      } else {
        // Create new role
        const newRoleId = crypto.randomUUID();
        const { error: insertError } = await supabase
          .from('roles')
          .insert([{
            id: newRoleId,
            name: formData.name.trim(),
            description: formData.description?.trim() || null,
            permissions,
            created_at: timestamp,
            updated_at: timestamp
          }]);

        if (insertError) {
          console.error('Supabase insert error:', insertError);
          throw new Error(insertError.message);
        }

        // Fetch created data
        const { data: createdRole, error: fetchError } = await supabase
          .from('roles')
          .select('*')
          .eq('id', newRoleId)
          .single();

        if (fetchError || !createdRole) {
          throw new Error(language === 'en' ? 'Failed to fetch created role' : 'Không thể tải vai trò đã tạo');
        }

        // Update local state
        setRoles(prevRoles => [...prevRoles, createdRole]);

        toast({
          title: language === 'en' ? 'Success' : 'Thành công',
          description: language === 'en' ? 'Role created successfully' : 'Tạo vai trò thành công',
        });
      }

      // Reset form and close dialog
      setIsAddDialogOpen(false);
      setEditingRole(null);
      setFormData({ name: "", description: "", permissions: {} });

    } catch (error) {
      console.error('Error saving role:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Lỗi',
        description: error instanceof Error ? error.message : 
          (language === 'en' ? 'Failed to save role' : 'Không thể lưu vai trò'),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRoleId) return;

    try {
      // First verify the role exists
      const { data: existingRole, error: checkError } = await supabase
        .from('roles')
        .select('id')
        .eq('id', selectedRoleId)
        .single();

      if (checkError) {
        console.error('Check error:', checkError);
        throw new Error(language === 'en' ? 'Role not found' : 'Không tìm thấy vai trò');
      }

      if (!existingRole) {
        throw new Error(language === 'en' ? 'Role not found' : 'Không tìm thấy vai trò');
      }

      // Then delete the role
      const { error: deleteError } = await supabase
        .from('roles')
        .delete()
        .match({ id: selectedRoleId });

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw new Error(language === 'en' ? 'Failed to delete role' : 'Không thể xóa vai trò');
      }

      // Verify deletion
      const { data: checkDeleted, error: verifyError } = await supabase
        .from('roles')
        .select('id')
        .eq('id', selectedRoleId)
        .single();

      if (verifyError?.code !== 'PGRST116') { // PGRST116 means no rows returned, which is what we want
        console.error('Verify error:', verifyError);
        throw new Error(language === 'en' ? 'Failed to verify deletion' : 'Không thể xác nhận việc xóa');
      }

      if (checkDeleted) {
        throw new Error(language === 'en' ? 'Role was not deleted' : 'Vai trò chưa được xóa');
      }

      // Update local state only after successful deletion
      setRoles(prevRoles => prevRoles.filter(role => role.id !== selectedRoleId));
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
        description: error instanceof Error ? error.message :
          (language === 'en' ? 'Failed to delete role' : 'Không thể xóa vai trò'),
        variant: 'destructive',
      });
    }
  };

  // Filter and pagination
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (role.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  // Pagination
  const indexOfLastRole = currentPage * rowsPerPage;
  const indexOfFirstRole = indexOfLastRole - rowsPerPage;
  const paginatedRoles = filteredRoles.slice(indexOfFirstRole, indexOfLastRole);
  const totalPages = Math.ceil(filteredRoles.length / rowsPerPage);

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
        description: role.description || "",
        permissions: role.permissions || {},
      });
    } else {
      // Add mode
      setEditingRole(null);
      setFormData({
        name: "",
        description: "",
        permissions: {},
      });
    }
    setIsAddDialogOpen(true);
  };

  // Open delete confirmation
  const openDeleteDialog = (roleId: string) => {
    setSelectedRoleId(roleId);
    setIsDeleteDialogOpen(true);
  };

  const handlePermissionChange = (moduleId: string, action: 'view' | 'create' | 'edit' | 'delete', checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleId]: {
          ...prev.permissions[moduleId] || {},
          [action]: checked,
        },
      },
    }));
  };

  const handleSelectAllPermissions = (moduleId?: string, action?: 'view' | 'create' | 'edit' | 'delete') => {
    setFormData(prev => {
      const newPermissions = { ...prev.permissions };
      
      if (moduleId && action) {
        // Select/deselect all for specific action in a module
        const currentValue = newPermissions[moduleId]?.[action] || false;
        newPermissions[moduleId] = {
          ...newPermissions[moduleId] || {},
          [action]: !currentValue
        };
      } else if (moduleId) {
        // Select/deselect all actions for a module
        const hasAllSelected = ['view', 'create', 'edit', 'delete'].every(
          act => newPermissions[moduleId]?.[act as keyof typeof newPermissions[typeof moduleId]]
        );
        const newValue = !hasAllSelected;
        newPermissions[moduleId] = {
          view: newValue,
          create: newValue,
          edit: newValue,
          delete: newValue
        };
      } else if (action) {
        // Select/deselect specific action for all modules
        const hasAllSelected = modules.every(
          module => newPermissions[module.id]?.[action]
        );
        const newValue = !hasAllSelected;
        modules.forEach(module => {
          newPermissions[module.id] = {
            ...newPermissions[module.id] || {},
            [action]: newValue
          };
        });
      } else {
        // Select/deselect all actions for all modules
        const hasAllSelected = modules.every(module =>
          ['view', 'create', 'edit', 'delete'].every(
            act => newPermissions[module.id]?.[act as keyof typeof newPermissions[typeof module.id]]
          )
        );
        const newValue = !hasAllSelected;
        modules.forEach(module => {
          newPermissions[module.id] = {
            view: newValue,
            create: newValue,
            edit: newValue,
            delete: newValue
          };
        });
      }
      
      return { ...prev, permissions: newPermissions };
    });
  };

  return (
    <div className="space-y-6 p-6">
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
              <TableHead className="w-[30px]"></TableHead>
              <TableHead>{text.name}</TableHead>
              <TableHead>{text.description}</TableHead>
              <TableHead>{text.createdAt}</TableHead>
              <TableHead className="text-right">{text.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex justify-center items-center space-x-2">
                    <Spinner size="sm" />
                    <span>{text.loading}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {text.noRoles}
                </TableCell>
              </TableRow>
            ) : (
              paginatedRoles.map((role) => (
                <React.Fragment key={role.id}>
                  <TableRow>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleRoleExpansion(role.id)}
                      >
                        {expandedRole === role.id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>{role.name}</TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {language === 'en' ? 'Created:' : 'Tạo:'} {format(new Date(role.created_at), 'PPp')}
                        </div>
                        {role.updated_at && role.updated_at !== role.created_at && (
                          <div className="text-sm text-muted-foreground">
                            {language === 'en' ? 'Updated:' : 'Cập nhật:'} {format(new Date(role.updated_at), 'PPp')}
                          </div>
                        )}
                      </div>
                    </TableCell>
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
                  {expandedRole === role.id && (
                    <TableRow>
                      <TableCell colSpan={5} className="p-4 bg-muted/50">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">
                              {language === 'en' ? 'Permissions' : 'Quyền hạn'}
                            </h4>
                          </div>
                          <div className="border rounded-lg">
                            <div className="grid grid-cols-5 gap-4 p-4 border-b bg-muted/30">
                              <div className="col-span-1 font-medium">
                                {language === 'en' ? 'Module' : 'Phân hệ'}
                              </div>
                              <div className="col-span-4 grid grid-cols-4 gap-4">
                                <div className="text-center font-medium">
                                  {language === 'en' ? 'View' : 'Xem'}
                                </div>
                                <div className="text-center font-medium">
                                  {language === 'en' ? 'Create' : 'Tạo'}
                                </div>
                                <div className="text-center font-medium">
                                  {language === 'en' ? 'Edit' : 'Sửa'}
                                </div>
                                <div className="text-center font-medium">
                                  {language === 'en' ? 'Delete' : 'Xóa'}
                                </div>
                              </div>
                            </div>
                            {modules.map((module) => (
                              <div key={module.id} className="grid grid-cols-5 gap-4 p-4 border-b last:border-0">
                                <div className="col-span-1">{module.name}</div>
                                <div className="col-span-4 grid grid-cols-4 gap-4">
                                  <div className="flex justify-center">
                                    <Checkbox 
                                      id={`${role.id}-${module.id}-view`}
                                      checked={role.permissions?.[module.id]?.view || false}
                                      disabled={true}
                                    />
                                  </div>
                                  <div className="flex justify-center">
                                    <Checkbox 
                                      id={`${role.id}-${module.id}-create`}
                                      checked={role.permissions?.[module.id]?.create || false}
                                      disabled={true}
                                    />
                                  </div>
                                  <div className="flex justify-center">
                                    <Checkbox 
                                      id={`${role.id}-${module.id}-edit`}
                                      checked={role.permissions?.[module.id]?.edit || false}
                                      disabled={true}
                                    />
                                  </div>
                                  <div className="flex justify-center">
                                    <Checkbox 
                                      id={`${role.id}-${module.id}-delete`}
                                      checked={role.permissions?.[module.id]?.delete || false}
                                      disabled={true}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end">
      <CustomPagination
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
        totalItems={filteredRoles.length}
        translations={{
          showing: text.showing,
          of: text.of,
          perPage: text.perPage,
          rowsPerPage: text.perPage
        }}
      />
      </div>

      {/* Loading Spinner */}

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? text.editRole : text.create}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid gap-4">
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
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">
                  {language === 'en' ? 'Permissions' : 'Quyền hạn'}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAllPermissions()}
                >
                  {language === 'en' ? 'Select/Deselect All' : 'Chọn/Bỏ chọn tất cả'}
                </Button>
              </div>
              <div className="border rounded-lg">
                <div className="grid grid-cols-5 gap-4 p-4 border-b bg-muted/30">
                  <div className="col-span-1 font-medium">
                    {language === 'en' ? 'Module' : 'Phân hệ'}
                  </div>
                  <div className="col-span-4 grid grid-cols-4 gap-4">
                    {['view', 'create', 'edit', 'delete'].map((action) => (
                      <div key={action} className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 font-medium"
                          onClick={() => handleSelectAllPermissions(undefined, action as 'view' | 'create' | 'edit' | 'delete')}
                        >
                          {language === 'en' 
                            ? action.charAt(0).toUpperCase() + action.slice(1)
                            : action === 'view' ? 'Xem'
                              : action === 'create' ? 'Tạo'
                              : action === 'edit' ? 'Sửa'
                              : 'Xóa'
                          }
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                {modules.map((module) => (
                  <div key={module.id} className="grid grid-cols-5 gap-4 p-4 border-b last:border-0">
                    <div className="col-span-1 flex items-center justify-between">
                      <span>{module.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => handleSelectAllPermissions(module.id)}
                      >
                        {language === 'en' ? 'All' : 'Tất cả'}
                      </Button>
                    </div>
                    <div className="col-span-4 grid grid-cols-4 gap-4">
                      <div className="flex justify-center">
                        <Checkbox 
                          id={`new-${module.id}-view`}
                          checked={formData.permissions?.[module.id]?.view || false}
                          onCheckedChange={(checked) => handlePermissionChange(module.id, 'view', !!checked)}
                        />
                      </div>
                      <div className="flex justify-center">
                        <Checkbox 
                          id={`new-${module.id}-create`}
                          checked={formData.permissions?.[module.id]?.create || false}
                          onCheckedChange={(checked) => handlePermissionChange(module.id, 'create', !!checked)}
                        />
                      </div>
                      <div className="flex justify-center">
                        <Checkbox 
                          id={`new-${module.id}-edit`}
                          checked={formData.permissions?.[module.id]?.edit || false}
                          onCheckedChange={(checked) => handlePermissionChange(module.id, 'edit', !!checked)}
                        />
                      </div>
                      <div className="flex justify-center">
                        <Checkbox 
                          id={`new-${module.id}-delete`}
                          checked={formData.permissions?.[module.id]?.delete || false}
                          onCheckedChange={(checked) => handlePermissionChange(module.id, 'delete', !!checked)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {language === 'en' ? 'Cancel' : 'Hủy'}
            </Button>
            <Button onClick={handleSaveRole}>
              {language === 'en' ? 'Save' : 'Lưu'}
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