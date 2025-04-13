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
import { Edit2, Trash2 } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database['public']['Tables'];
type Account = Tables['users']['Row'];
type AccountInsert = Tables['users']['Insert'];

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
  const [newAccount, setNewAccount] = useState<Omit<AccountInsert, 'id' | 'created_at' | 'updated_at' | 'avatar_url' | 'password'>>({
    email: '',
    full_name: '',
    role: 'user'
  });

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Thêm states mới để lưu trữ danh sách teams và roles
  const [teams, setTeams] = useState<Team[]>([
    { id: '1', name: 'IT' },
    { id: '2', name: 'HR' },
    { id: '3', name: 'Marketing' },
    { id: '4', name: 'Sales' }
  ]);

  const [roles, setRoles] = useState<Role[]>([
    { id: '1', name: 'user', description: 'Normal user' },
    { id: '2', name: 'admin', description: 'Administrator' },
    { id: '3', name: 'owner', description: 'Owner' }
  ]);

  const translations = {
    en: {
      searchPlaceholder: "Search by name",
      addWebhook: "Add Webhook",
      create: "Create",
      id: "ID",
      email: "Email",
      fullname: "Full Name",
      teams: "Teams",
      role: "Role",
      actions: "Actions",
      createAccount: "Create Account",
      createNewAccount: "Create a new account",
      enterDetails: "Enter the details for the new account.",
      save: "Save",
      cancel: "Cancel",
      selectTeam: "Select team",
      selectRole: "Select role",
      required: "This field is required"
    },
    vi: {
      searchPlaceholder: "Tìm kiếm theo tên",
      addWebhook: "Thêm Webhook",
      create: "Tạo mới",
      id: "ID",
      email: "Email",
      fullname: "Họ và tên",
      teams: "Nhóm",
      role: "Vai trò",
      actions: "Thao tác",
      createAccount: "Tạo Tài Khoản",
      createNewAccount: "Tạo tài khoản mới",
      enterDetails: "Nhập thông tin cho tài khoản mới.",
      save: "Lưu",
      cancel: "Hủy",
      selectTeam: "Chọn nhóm",
      selectRole: "Chọn vai trò",
      required: "Trường này là bắt buộc"
    }
  };

  const t = translations[language];

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setAccounts(data || []);
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

  // Fetch accounts data from Supabase
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
        (payload) => {
          console.log('Real-time update:', payload);
          fetchAccounts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Filter accounts based on search query
  const filteredAccounts = accounts.filter(account => 
    account.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    try {
      const timestamp = new Date().toISOString();
      const { data, error } = await supabase
        .from('users')
        .insert({
          ...newAccount,
          id: crypto.randomUUID(),
          created_at: timestamp,
          updated_at: timestamp
        })
        .select()
        .single();

      if (error) throw error;

      setAccounts(prev => [data, ...prev]);
      setIsCreateDialogOpen(false);
      setNewAccount({
        email: '',
        full_name: '',
        role: 'user'
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
      const { error } = await supabase
        .from('users')
        .update({
          email: editingAccount.email,
          full_name: editingAccount.full_name,
          role: editingAccount.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingAccount.id);

      if (error) throw error;

      setIsEditDialogOpen(false);
      toast({
        title: language === 'en' ? 'Success' : 'Thành công',
        description: language === 'en' ? 'Account updated successfully' : 'Cập nhật tài khoản thành công',
      });
      
      // Refresh the accounts list
      fetchAccounts();
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Lỗi',
        description: language === 'en' ? 'Failed to update account' : 'Không thể cập nhật tài khoản',
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

      setAccounts(accounts.filter(account => account.id !== deletingAccount.id));
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Input
          className="max-w-sm"
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="space-x-2">
          <Button variant="outline">{t.addWebhook}</Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button">{t.create}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.createAccount}</DialogTitle>
                <DialogDescription>{t.enterDetails}</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAccount}>
                <div className="grid gap-4 py-4">
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
                    <Label htmlFor="role" className="text-right">{t.role}</Label>
                    <Select
                      value={newAccount.role}
                      onValueChange={(value) => handleSelectChange(value, 'role')}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder={t.selectRole} />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.name}>
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
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'en' ? "Edit Account" : "Chỉnh sửa tài khoản"}</DialogTitle>
            <DialogDescription>
              {language === 'en' ? "Edit account information." : "Chỉnh sửa thông tin tài khoản."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditAccount}>
            <div className="grid gap-4 py-4">
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
                <Label htmlFor="edit-role" className="text-right">{t.role}</Label>
                <Select
                  value={editingAccount?.role || ''}
                  onValueChange={(value) => handleEditSelectChange(value, 'role')}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t.selectRole} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
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
              <Button type="submit">
                {language === 'en' ? "Save changes" : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'en' ? "Are you sure?" : "Bạn có chắc chắn?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'en' 
                ? `This will permanently delete the account "${deletingAccount?.email}". This action cannot be undone.`
                : `Hành động này sẽ xóa vĩnh viễn tài khoản "${deletingAccount?.email}". Bạn không thể hoàn tác sau khi xóa.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === 'en' ? "Cancel" : "Hủy"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              {language === 'en' ? "Delete" : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.id}</TableHead>
              <TableHead>{t.email}</TableHead>
              <TableHead>{t.fullname}</TableHead>
              <TableHead>{t.role}</TableHead>
              <TableHead>{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  {language === 'en' ? "Loading..." : "Đang tải..."}
                </TableCell>
              </TableRow>
            ) : filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  {language === 'en' ? "No accounts found" : "Không tìm thấy tài khoản nào"}
                </TableCell>
              </TableRow>
            ) : (
              filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>{account.id}</TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>{account.full_name}</TableCell>
                  <TableCell>{account.role}</TableCell>
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
    </div>
  );
};

export default Accounts;