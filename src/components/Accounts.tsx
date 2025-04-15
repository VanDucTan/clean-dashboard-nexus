import React, { useState, useEffect } from 'react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Edit2, Trash2, UserPlus, Search } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import bcrypt from 'bcryptjs';
import CustomPagination from "./ui/custom-pagination";
import { useAccounts } from '@/contexts/AccountContext';

type Tables = Database['public']['Tables'];
type BaseAccount = Tables['users']['Row'];
type Account = BaseAccount & {
  teams?: { name: string } | null;
  roles?: { name: string } | null;
  password_hash?: string;
};
type AccountInsert = Omit<BaseAccount, 'id' | 'created_at' | 'updated_at'> & {
  password_hash: string;
};

interface Team {
  id: string;
  name: string;
  description?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface AccountsProps {
  language: 'en' | 'vi';
}

const Accounts = ({ language }: AccountsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const { toast } = useToast();
  const [newAccount, setNewAccount] = useState<Partial<AccountInsert>>({
    email: '',
    username: '',
    full_name: '',
    team_id: null,
    role_id: null,
    status: 'active',
    last_login: null,
    last_logout: null,
    password_hash: ''
  });

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { setTotalAccounts } = useAccounts();

  const translations = {
    en: {
      searchPlaceholder: "Search by name or email",
      createUser: "Create User",
      create: "Create",
      id: "ID",
      email: "Email",
      username: "Username",
      fullname: "Full Name",
      teams: "Teams",
      role: "Role",
      lastLogin: "Last Login",
      status: "Status",
      actions: "Actions",
      createAccount: "Create Account",
      createNewAccount: "Create a new account",
      enterDetails: "Enter the details for the new account.",
      save: "Save",
      cancel: "Cancel",
      selectTeam: "Select team",
      selectRole: "Select role",
      required: "This field is required",
      invalidEmail: "Invalid email format",
      invalidUsername: "Username must start with @",
      emailExists: "Email already exists",
      deleteConfirmation: "Are you sure you want to delete this account?",
      deleteWarning: "This action cannot be undone.",
      delete: "Delete",
      editAccount: "Edit Account",
      active: "Active",
      inactive: "Inactive",
      password: "Password",
      noTeamAssigned: "No team assigned",
      showing: "Showing",
      of: "of",
      perPage: "per page",
      rowsPerPage: "Rows per page",
    },
    vi: {
      searchPlaceholder: "Tìm kiếm theo tên hoặc email",
      createUser: "Tạo người dùng",
      create: "Tạo mới",
      id: "ID",
      email: "Email",
      username: "Tên đăng nhập",
      fullname: "Họ và tên",
      teams: "Nhóm",
      role: "Vai trò",
      lastLogin: "Lần đăng nhập cuối",
      status: "Trạng thái",
      actions: "Thao tác",
      createAccount: "Tạo Tài Khoản",
      createNewAccount: "Tạo tài khoản mới",
      enterDetails: "Nhập thông tin cho tài khoản mới.",
      save: "Lưu",
      cancel: "Hủy",
      selectTeam: "Chọn nhóm",
      selectRole: "Chọn vai trò",
      required: "Trường này là bắt buộc",
      invalidEmail: "Định dạng email không hợp lệ",
      invalidUsername: "Tên đăng nhập phải bắt đầu bằng @",
      emailExists: "Email đã tồn tại",
      deleteConfirmation: "Bạn có chắc chắn muốn xóa tài khoản này?",
      deleteWarning: "Hành động này không thể hoàn tác.",
      delete: "Xóa",
      editAccount: "Sửa tài khoản",
      active: "Hoạt động",
      inactive: "Không hoạt động",
      password: "Mật khẩu",
      noTeamAssigned: "Chưa có nhóm",
      showing: "Hiển thị",
      of: "trong số",
      perPage: "mỗi trang",
      rowsPerPage: "Hàng mỗi trang",
    }
  };

  const t = translations[language];

  // Validate email format
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validate username format (must start with @)
  const isValidUsername = (username: string) => {
    return username.startsWith('@');
  };

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*, teams(name), roles(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAccounts(data || []);
      setTotalAccounts(data?.length || 0);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Lỗi',
        description: language === 'en' ? 'Failed to fetch accounts' : 'Không thể tải danh sách tài khoản',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchAccounts();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('users_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'users' 
        }, 
        () => {
          fetchAccounts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch teams and roles
  useEffect(() => {
    const fetchTeamsAndRoles = async () => {
      try {
        const [teamsResponse, rolesResponse] = await Promise.all([
          supabase.from('teams').select('*'),
          supabase.from('roles').select('*')
        ]);

        if (teamsResponse.error) throw teamsResponse.error;
        if (rolesResponse.error) throw rolesResponse.error;

        setTeams(teamsResponse.data || []);
        setRoles(rolesResponse.data || []);
      } catch (error) {
        console.error('Error fetching teams and roles:', error);
        toast({
          title: language === 'en' ? 'Error' : 'Lỗi',
          description: language === 'en' ? 'Failed to fetch teams and roles' : 'Không thể tải danh sách nhóm và vai trò',
          variant: 'destructive',
        });
      }
    };

    fetchTeamsAndRoles();
  }, []);

  // Filter accounts based on search query
  const filteredAccounts = accounts.filter(account => 
    account.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const indexOfLastAccount = currentPage * rowsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - rowsPerPage;
  const paginatedAccounts = filteredAccounts.slice(indexOfFirstAccount, indexOfLastAccount);
  const totalPages = Math.ceil(filteredAccounts.length / rowsPerPage);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAccount(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setNewAccount(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating account with data:', newAccount);

    // Validate email format
    if (!isValidEmail(newAccount.email)) {
        console.log('Invalid email format:', newAccount.email);
        toast({
            title: language === 'en' ? 'Error' : 'Lỗi',
            description: t.invalidEmail,
            variant: 'destructive',
        });
        return;
    }

    // Validate username format
    if (!isValidUsername(newAccount.username)) {
        console.log('Invalid username format:', newAccount.username);
        toast({
            title: language === 'en' ? 'Error' : 'Lỗi',
            description: t.invalidUsername,
            variant: 'destructive',
        });
        return;
    }

    try {
        // Check if email already exists
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('email', newAccount.email)
            .single();

        if (checkError) {
            console.log('Error checking existing user:', checkError);
        }

        if (existingUser) {
            console.log('Email already exists:', newAccount.email);
            toast({
                title: language === 'en' ? 'Error' : 'Lỗi',
                description: t.emailExists,
                variant: 'destructive',
            });
            return;
        }

        const timestamp = new Date().toISOString();
        const hashedPassword = await bcrypt.hash(newAccount.password_hash, 10);
        console.log('Password hashed successfully');

        const insertData = {
            ...newAccount,
            password_hash: hashedPassword,
            id: crypto.randomUUID(),
            created_at: timestamp,
            updated_at: timestamp,
            status: 'active'
        };
        console.log('Attempting to insert user with data:', { ...insertData, password_hash: '[REDACTED]' });

        const { data, error } = await supabase
            .from('users')
            .insert(insertData)
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            throw error;
        }

        setIsCreateDialogOpen(false);
        setNewAccount({
            email: '',
            username: '',
            full_name: '',
            team_id: null,
            role_id: null,
            status: 'active',
            last_login: null,
            last_logout: null,
            password_hash: ''
        });

        toast({
            title: language === 'en' ? 'Success' : 'Thành công',
            description: language === 'en' ? 'Account created successfully' : 'Tạo tài khoản thành công',
        });
    } catch (error) {
        console.error('Error creating account:', error);
        toast({
            title: language === 'en' ? 'Error' : 'Lỗi',
            description: language === 'en' ? 'Failed to create account' : 'Không thể tạo tài khoản',
            variant: 'destructive',
        });
    }
  };

  const handleEditClick = (account: Account) => {
    setEditingAccount(account);
    setIsEditDialogOpen(true);
  };

  const handleEditAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    try {
      const updateData: Partial<AccountInsert> = {
        email: editingAccount.email,
        username: editingAccount.username,
        full_name: editingAccount.full_name,
        team_id: editingAccount.team_id,
        role_id: editingAccount.role_id,
        status: editingAccount.status,
        last_login: editingAccount.last_login,
        last_logout: editingAccount.last_logout
      };

      // Only hash and update password if a new password is provided
      if (editingAccount.password_hash) {
        const hashedPassword = await bcrypt.hash(editingAccount.password_hash, 10);
        updateData.password_hash = hashedPassword;
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', editingAccount.id);

      if (error) throw error;

      setIsEditDialogOpen(false);
      toast({
        title: language === 'en' ? 'Success' : 'Thành công',
        description: language === 'en' ? 'Account updated successfully' : 'Cập nhật tài khoản thành công',
      });
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: 'Error',
        description: 'Failed to update account',
        variant: 'destructive',
      });
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingAccount(prev => prev ? {
      ...prev,
      [name]: value
    } : null);
  };

  const handleEditSelectChange = (value: string, field: string) => {
    setEditingAccount(prev => prev ? {
      ...prev,
      [field]: value
    } : null);
  };

  const handleDeleteClick = (account: Account) => {
    setDeletingAccount(account);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAccount) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', deletingAccount.id);

      if (error) throw error;

      setIsDeleteDialogOpen(false);
      setDeletingAccount(null);

      toast({
        title: language === 'en' ? 'Success' : 'Thành công',
        description: language === 'en' ? 'Account deleted successfully' : 'Xóa tài khoản thành công',
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Lỗi',
        description: language === 'en' ? 'Failed to delete account' : 'Không thể xóa tài khoản',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {language === 'en' ? 'Accounts Management' : 'Quản lý tài khoản'}
        </h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          {t.createUser}
        </Button>
      </div>

      {/* Search */}
      {!isLoading && (
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.searchPlaceholder}
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
              <TableHead>{t.id}</TableHead>
              <TableHead>{t.username}</TableHead>
              <TableHead>{t.email}</TableHead>
              <TableHead>{t.fullname}</TableHead>
              <TableHead>{t.teams}</TableHead>
              <TableHead>{t.role}</TableHead>
              <TableHead>{t.lastLogin}</TableHead>
              <TableHead>{t.status}</TableHead>
              <TableHead>{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  {language === 'en' ? "Loading..." : "Đang tải..."}
                </TableCell>
              </TableRow>
            ) : filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  {language === 'en' ? "No accounts found" : "Không tìm thấy tài khoản nào"}
                </TableCell>
              </TableRow>
            ) : (
              paginatedAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-mono text-sm">{account.id}</TableCell>
                  <TableCell>{account.username}</TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>{account.full_name}</TableCell>
                  <TableCell>
                    {account.team_id ? (
                      teams.find(team => team.id === account.team_id)?.name || t.noTeamAssigned
                    ) : (
                      t.noTeamAssigned
                    )}
                  </TableCell>
                  <TableCell className="capitalize">
                    {account.role_id ? (
                      roles.find(role => role.id === account.role_id)?.name || '-'
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {account.last_login 
                      ? new Date(account.last_login).toLocaleString(language === 'en' ? 'en-US' : 'vi-VN')
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      account.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                    }`}>
                      {account.status === 'active' ? t.active : t.inactive}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditClick(account)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteClick(account)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
                  {pageSize} {t.perPage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {t.showing} {((currentPage - 1) * rowsPerPage) + 1}-
            {Math.min(currentPage * rowsPerPage, filteredAccounts.length)} {t.of}{" "}
            {filteredAccounts.length}
          </span>
        </div>
        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          translations={{
            showing: t.showing,
            of: t.of,
            perPage: t.perPage
          }}
        />
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.editAccount}</DialogTitle>
            <DialogDescription>
              {language === 'en' ? "Edit account information." : "Chỉnh sửa thông tin tài khoản."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditAccount}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-username" className="text-right">{t.username}</Label>
                <Input
                  id="edit-username"
                  name="username"
                  value={editingAccount?.username || ''}
                  onChange={handleEditInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">{t.email}</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={editingAccount?.email || ''}
                  onChange={handleEditInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-full_name" className="text-right">{t.fullname}</Label>
                <Input
                  id="edit-full_name"
                  name="full_name"
                  value={editingAccount?.full_name || ''}
                  onChange={handleEditInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-team_id" className="text-right">{t.teams}</Label>
                <Select
                  value={editingAccount?.team_id || ''}
                  onValueChange={(value) => handleEditSelectChange(value, 'team_id')}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t.selectTeam} />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role_id" className="text-right">{t.role}</Label>
                <Select
                  value={editingAccount?.role_id || ''}
                  onValueChange={(value) => handleEditSelectChange(value, 'role_id')}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t.selectRole} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button type="submit">{t.save}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteConfirmation}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.deleteWarning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Account Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.createAccount}</DialogTitle>
            <DialogDescription>{t.enterDetails}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAccount}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">{t.username}</Label>
                <Input
                  id="username"
                  name="username"
                  value={newAccount.username}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                  placeholder="@username"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">{t.email}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newAccount.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">{t.password}</Label>
                <Input
                  id="password"
                  name="password_hash"
                  type="password"
                  value={newAccount.password_hash}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="full_name" className="text-right">{t.fullname}</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={newAccount.full_name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="team_id" className="text-right">{t.teams}</Label>
                <Select
                  value={newAccount.team_id || ''}
                  onValueChange={(value) => handleSelectChange(value, 'team_id')}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t.selectTeam} />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role_id" className="text-right">{t.role}</Label>
                <Select
                  value={newAccount.role_id || ''}
                  onValueChange={(value) => handleSelectChange(value, 'role_id')}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t.selectRole} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsCreateDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button type="submit">{t.save}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Accounts;