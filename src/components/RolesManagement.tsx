import React, { useState } from "react";
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

interface Role {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  permissions: Permission[];
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

// Sample data
const sampleRoles: Role[] = [
  {
    id: "1",
    name: "Administrator",
    description: "Full access to all resources",
    createdAt: new Date(2023, 3, 15),
    permissions: modules.map(module => ({
      id: module.id,
      name: module.name,
      actions: {
        view: true,
        create: true,
        edit: true,
        delete: true
      }
    }))
  },
  {
    id: "2",
    name: "Editor",
    description: "Can edit but not delete content",
    createdAt: new Date(2023, 5, 22),
    permissions: modules.map(module => ({
      id: module.id,
      name: module.name,
      actions: {
        view: true,
        create: true,
        edit: true,
        delete: false
      }
    }))
  },
  {
    id: "3",
    name: "Viewer",
    description: "Read-only access",
    createdAt: new Date(2023, 8, 5),
    permissions: modules.map(module => ({
      id: module.id,
      name: module.name,
      actions: {
        view: true,
        create: false,
        edit: false,
        delete: false
      }
    }))
  },
];

interface RolesManagementProps {
  language: 'en' | 'vi';
}

const RolesManagement = ({ language }: RolesManagementProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [roles, setRoles] = useState<Role[]>(sampleRoles);
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
    description: string;
    permissions: Permission[];
  }>({
    name: "",
    description: "",
    permissions: modules.map(module => ({
      id: module.id,
      name: module.name,
      actions: {
        view: false,
        create: false,
        edit: false,
        delete: false
      }
    }))
  });

  // Translations
  const t = {
    en: {
      title: "Roles Management",
      search: "Search roles...",
      addRole: "Add Role",
      name: "Name",
      description: "Description",
      createdAt: "Created At",
      actions: "Actions",
      editAction: "Edit",
      deleteAction: "Delete",
      deleteConfirm: "Are you sure you want to delete this role?",
      deleteDescription: "This action cannot be undone. This will permanently delete the role and remove it from our servers.",
      cancel: "Cancel",
      confirm: "Confirm",
      save: "Save",
      permissions: "Permissions",
      selectAll: "Select All",
      deselectAll: "Deselect All",
      viewAction: "View",
      createAction: "Create",
      editPermission: "Edit",
      deletePermission: "Delete",
      module: "Module",
      noResults: "No roles found",
      roleAdded: "Role added successfully",
      roleUpdated: "Role updated successfully",
      roleDeleted: "Role deleted successfully",
      rowsPerPage: "Rows per page",
    },
    vi: {
      title: "Quản lý vai trò",
      search: "Tìm kiếm vai trò...",
      addRole: "Thêm vai trò",
      name: "Tên",
      description: "Mô tả",
      createdAt: "Ngày tạo",
      actions: "Thao tác",
      editAction: "Sửa",
      deleteAction: "Xóa",
      deleteConfirm: "Bạn có chắc chắn muốn xóa vai trò này?",
      deleteDescription: "Hành động này không thể hoàn tác. Vai trò sẽ bị xóa vĩnh viễn khỏi hệ thống.",
      cancel: "Hủy",
      confirm: "Xác nhận",
      save: "Lưu",
      permissions: "Quyền",
      selectAll: "Chọn tất cả",
      deselectAll: "Bỏ chọn tất cả",
      viewAction: "Xem",
      createAction: "Tạo",
      editPermission: "Sửa",
      deletePermission: "Xóa",
      module: "Phân hệ",
      noResults: "Không tìm thấy vai trò nào",
      roleAdded: "Thêm vai trò thành công",
      roleUpdated: "Cập nhật vai trò thành công",
      roleDeleted: "Xóa vai trò thành công",
      rowsPerPage: "Hàng mỗi trang",
    }
  };

  const text = t[language];

  // Pagination
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredRoles.length / rowsPerPage);
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
        permissions: [...role.permissions]
      });
    } else {
      // Add mode
      setEditingRole(null);
      setFormData({
        name: "",
        description: "",
        permissions: modules.map(module => ({
          id: module.id,
          name: module.name,
          actions: {
            view: false,
            create: false,
            edit: false,
            delete: false
          }
        }))
      });
    }
    setIsAddDialogOpen(true);
  };

  // Open delete confirmation
  const openDeleteDialog = (roleId: string) => {
    setSelectedRoleId(roleId);
    setIsDeleteDialogOpen(true);
  };

  // Save role
  const handleSaveRole = () => {
    if (editingRole) {
      // Update existing role
      setRoles(roles.map(role => 
        role.id === editingRole.id 
          ? { ...role, ...formData, createdAt: role.createdAt } 
          : role
      ));
      
      toast({
        title: text.roleUpdated,
      });
    } else {
      // Add new role
      const newRole: Role = {
        id: `${roles.length + 1}`,
        ...formData,
        createdAt: new Date()
      };
      
      setRoles([...roles, newRole]);
      toast({
        title: text.roleAdded,
      });
    }
    
    setIsAddDialogOpen(false);
  };

  // Delete role
  const handleDeleteRole = () => {
    if (selectedRoleId) {
      setRoles(roles.filter(role => role.id !== selectedRoleId));
      toast({
        title: text.roleDeleted,
      });
      setIsDeleteDialogOpen(false);
      setSelectedRoleId(null);
    }
  };

  // Handle form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle permission checkbox changes
  const handlePermissionChange = (moduleId: string, action: keyof Permission['actions'], checked: boolean) => {
    setFormData({
      ...formData,
      permissions: formData.permissions.map(permission => 
        permission.id === moduleId 
          ? { 
              ...permission, 
              actions: { 
                ...permission.actions, 
                [action]: checked 
              } 
            } 
          : permission
      )
    });
  };

  // Select/deselect all permissions
  const handleSelectAllPermissions = (selectAll: boolean) => {
    setFormData({
      ...formData,
      permissions: formData.permissions.map(permission => ({
        ...permission,
        actions: {
          view: selectAll,
          create: selectAll,
          edit: selectAll,
          delete: selectAll
        }
      }))
    });
  };

  // Select/deselect all actions for a module
  const handleSelectAllModuleActions = (moduleId: string, selectAll: boolean) => {
    setFormData({
      ...formData,
      permissions: formData.permissions.map(permission => 
        permission.id === moduleId 
          ? {
              ...permission,
              actions: {
                view: selectAll,
                create: selectAll,
                edit: selectAll,
                delete: selectAll
              }
            }
          : permission
      )
    });
  };

  // Select/deselect all modules for an action
  const handleSelectAllActionForModules = (action: keyof Permission['actions'], selectAll: boolean) => {
    setFormData({
      ...formData,
      permissions: formData.permissions.map(permission => ({
        ...permission,
        actions: {
          ...permission.actions,
          [action]: selectAll
        }
      }))
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6">{text.title}</h1>
      
      {/* Search and Add button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={text.search}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => openRoleDialog()}>
          <PlusCircle className="h-4 w-4 mr-2" />
          {text.addRole}
        </Button>
      </div>
      
      {/* Roles Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>{text.name}</TableHead>
              <TableHead className="hidden md:table-cell">{text.description}</TableHead>
              <TableHead className="hidden md:table-cell">{text.createdAt}</TableHead>
              <TableHead className="text-right">{text.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRoles.length > 0 ? (
              paginatedRoles.map((role) => (
                <React.Fragment key={role.id}>
                  <TableRow>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => toggleRoleExpansion(role.id)}
                        aria-label={expandedRole === role.id ? "Collapse" : "Expand"}
                      >
                        {expandedRole === role.id ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{role.description}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {format(role.createdAt, 'PPP')}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openRoleDialog(role)}
                        aria-label={text.editAction}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
                        onClick={() => openDeleteDialog(role.id)}
                        aria-label={text.deleteAction}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded view with permissions */}
                  {expandedRole === role.id && (
                    <TableRow>
                      <TableCell colSpan={5} className="p-4 bg-muted/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {role.permissions.map(permission => (
                            <div key={permission.id} className="border rounded-md p-3 bg-card">
                              <h4 className="font-medium mb-2">{permission.name}</h4>
                              <div className="flex flex-wrap gap-1">
                                {permission.actions.view && (
                                  <Badge variant="outline" className="bg-primary/10">
                                    {text.viewAction}
                                  </Badge>
                                )}
                                {permission.actions.create && (
                                  <Badge variant="outline" className="bg-primary/10">
                                    {text.createAction}
                                  </Badge>
                                )}
                                {permission.actions.edit && (
                                  <Badge variant="outline" className="bg-primary/10">
                                    {text.editPermission}
                                  </Badge>
                                )}
                                {permission.actions.delete && (
                                  <Badge variant="outline" className="bg-primary/10">
                                    {text.deletePermission}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {text.noResults}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {filteredRoles.length > 0 && (
        <div className="mt-6">
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
              rowsPerPage: text.rowsPerPage
            }}
          />
        </div>
      )}
      
      {/* Add/Edit Role Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? `${text.editAction} ${editingRole.name}` : text.addRole}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{text.name}</Label>
              <Input 
                id="name" 
                name="name"
                value={formData.name} 
                onChange={handleInputChange} 
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">{text.description}</Label>
              <Textarea 
                id="description" 
                name="description"
                value={formData.description} 
                onChange={handleInputChange} 
                rows={3}
              />
            </div>
            
            <div className="grid gap-4 mt-2">
              <div className="flex justify-between items-center">
                <Label className="text-base">{text.permissions}</Label>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSelectAllPermissions(true)}
                  >
                    {text.selectAll}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSelectAllPermissions(false)}
                  >
                    {text.deselectAll}
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <div className="grid grid-cols-5 gap-1 p-2 bg-muted font-medium text-sm">
                  <div className="col-span-1">{text.module}</div>
                  <div className="text-center">{text.viewAction}</div>
                  <div className="text-center">{text.createAction}</div>
                  <div className="text-center">{text.editPermission}</div>
                  <div className="text-center">{text.deletePermission}</div>
                </div>
                
                {/* Select all for each action column */}
                <div className="grid grid-cols-5 gap-1 p-2 border-b">
                  <div className="col-span-1 font-medium text-sm">Select All</div>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={formData.permissions.every(p => p.actions.view)}
                      onCheckedChange={(checked) => 
                        handleSelectAllActionForModules('view', checked === true)
                      }
                    />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={formData.permissions.every(p => p.actions.create)}
                      onCheckedChange={(checked) => 
                        handleSelectAllActionForModules('create', checked === true)
                      }
                    />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={formData.permissions.every(p => p.actions.edit)}
                      onCheckedChange={(checked) => 
                        handleSelectAllActionForModules('edit', checked === true)
                      }
                    />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={formData.permissions.every(p => p.actions.delete)}
                      onCheckedChange={(checked) => 
                        handleSelectAllActionForModules('delete', checked === true)
                      }
                    />
                  </div>
                </div>
                
                {formData.permissions.map((permission) => (
                  <div 
                    key={permission.id} 
                    className="grid grid-cols-5 gap-1 p-2 border-b last:border-0 hover:bg-muted/30"
                  >
                    <div className="col-span-1 flex items-center gap-2">
                      <Checkbox
                        checked={
                          permission.actions.view && 
                          permission.actions.create && 
                          permission.actions.edit && 
                          permission.actions.delete
                        }
                        onCheckedChange={(checked) => 
                          handleSelectAllModuleActions(permission.id, checked === true)
                        }
                      />
                      <span>{permission.name}</span>
                    </div>
                    
                    <div className="flex justify-center">
                      <Checkbox
                        checked={permission.actions.view}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(permission.id, 'view', checked === true)
                        }
                      />
                    </div>
                    
                    <div className="flex justify-center">
                      <Checkbox
                        checked={permission.actions.create}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(permission.id, 'create', checked === true)
                        }
                      />
                    </div>
                    
                    <div className="flex justify-center">
                      <Checkbox
                        checked={permission.actions.edit}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(permission.id, 'edit', checked === true)
                        }
                      />
                    </div>
                    
                    <div className="flex justify-center">
                      <Checkbox
                        checked={permission.actions.delete}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(permission.id, 'delete', checked === true)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
            >
              {text.cancel}
            </Button>
            <Button onClick={handleSaveRole} disabled={!formData.name.trim()}>
              {text.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{text.deleteConfirm}</AlertDialogTitle>
            <AlertDialogDescription>
              {text.deleteDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{text.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole} className="bg-destructive text-destructive-foreground">
              {text.deleteAction}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RolesManagement; 