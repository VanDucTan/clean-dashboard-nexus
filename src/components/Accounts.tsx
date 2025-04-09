import React, { useState } from 'react';
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

interface Account {
  id: number;
  email: string;
  fullname: string;
  teams: string;
  role: string;
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
  const [newAccount, setNewAccount] = useState({
    email: '',
    fullname: '',
    teams: '',
    role: 'user'
  });

  // Convert mock data to state
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: 3,
      email: 'nduylong9501@gmail.com', 
      fullname: 'Nguyen Duy Long',
      teams: '',
      role: 'owner'
    },
    {
      id: 5,
      email: 'bakasi1910@gmail.com',
      fullname: 'Duy Long',
      teams: '',
      role: 'owner'
    },
    {
      id: 6,
      email: 'hr@nhi.sg',
      fullname: 'HR Nhi Le Team',
      teams: '',
      role: 'owner'
    },
    {
      id: 10,
      email: 'nhileteamweb@gmail.com',
      fullname: 'Website',
      teams: '',
      role: 'admin'
    },
    {
      id: 9,
      email: 'lehuynhanhtai@gmail.com',
      fullname: 'le huynh anh tai',
      teams: '',
      role: 'admin'
    }
  ]);

  const translations = {
    en: {
      searchPlaceholder: "Search by name",
      addWebhook: "Add Webhook",
      create: "Create",
      id: "ID",
      email: "Email",
      fullname: "Fullname",
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

  // Filter accounts based on search query
  const filteredAccounts = accounts.filter(account => 
    account.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      // Generate a new unique ID (in a real app, this would come from the backend)
      const newId = Math.max(...accounts.map(a => a.id), 0) + 1;
      
      // Create the new account object
      const createdAccount: Account = {
        ...newAccount,
        id: newId
      };

      // Update the accounts list
      setAccounts(prevAccounts => [...prevAccounts, createdAccount]);
      
      // Show success toast
      toast({
        title: language === 'en' ? "Account created" : "Tạo tài khoản thành công",
        description: language === 'en' ? 
          "The account has been created successfully" : 
          "Tài khoản đã được tạo thành công",
      });

      setIsCreateDialogOpen(false);
      // Reset form
      setNewAccount({
        email: '',
        fullname: '',
        teams: '',
        role: 'user'
      });
    } catch (error) {
      // Show error toast
      toast({
        variant: "destructive",
        title: language === 'en' ? "Error" : "Lỗi",
        description: language === 'en' ? 
          "Failed to create account. Please try again." : 
          "Không thể tạo tài khoản. Vui lòng thử lại.",
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
      // Update the account in the accounts list
      setAccounts(prevAccounts => 
        prevAccounts.map(account => 
          account.id === editingAccount.id ? editingAccount : account
        )
      );
      
      // Show success toast
      toast({
        title: language === 'en' ? "Account updated" : "Cập nhật tài khoản thành công",
        description: language === 'en' ? 
          "The account has been updated successfully" : 
          "Tài khoản đã được cập nhật thành công",
      });

      setIsEditDialogOpen(false);
      setEditingAccount(null);
    } catch (error) {
      // Show error toast
      toast({
        variant: "destructive",
        title: language === 'en' ? "Error" : "Lỗi",
        description: language === 'en' ? 
          "Failed to update account. Please try again." : 
          "Không thể cập nhật tài khoản. Vui lòng thử lại.",
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
      // Remove the account from the accounts list
      setAccounts(prevAccounts => 
        prevAccounts.filter(account => account.id !== deletingAccount.id)
      );
      
      // Show success toast
      toast({
        title: language === 'en' ? "Account deleted" : "Xóa tài khoản thành công",
        description: language === 'en' ? 
          "The account has been deleted successfully" : 
          "Tài khoản đã được xóa thành công",
      });

      setIsDeleteDialogOpen(false);
      setDeletingAccount(null);
    } catch (error) {
      // Show error toast
      toast({
        variant: "destructive",
        title: language === 'en' ? "Error" : "Lỗi",
        description: language === 'en' ? 
          "Failed to delete account. Please try again." : 
          "Không thể xóa tài khoản. Vui lòng thử lại.",
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
                    <Label htmlFor="fullname" className="text-right">{t.fullname}</Label>
                    <Input
                      id="fullname"
                      name="fullname"
                      value={newAccount.fullname}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="teams" className="text-right">{t.teams}</Label>
                    <Select
                      value={newAccount.teams}
                      onValueChange={(value) => handleSelectChange(value, 'teams')}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder={t.selectTeam} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
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
                <Label htmlFor="edit-fullname" className="text-right">{t.fullname}</Label>
                <Input
                  id="edit-fullname"
                  name="fullname"
                  value={editingAccount?.fullname || ''}
                  onChange={handleEditInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-teams" className="text-right">{t.teams}</Label>
                <Select
                  value={editingAccount?.teams || ''}
                  onValueChange={(value) => handleEditSelectChange(value, 'teams')}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t.selectTeam} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
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
              <TableHead>{t.teams}</TableHead>
              <TableHead>{t.role}</TableHead>
              <TableHead>{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>{account.id}</TableCell>
                <TableCell>{account.email}</TableCell>
                <TableCell>{account.fullname}</TableCell>
                <TableCell>{account.teams}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Accounts;