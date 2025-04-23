import React, { useState, useRef, useEffect } from 'react';
import { Search, Edit2, Plus, Download, Upload, Check } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import CustomPagination from "@/components/ui/custom-pagination";
import { createClient } from '@supabase/supabase-js';

interface AppliesManagementProps {
  language: 'en' | 'vi';
}

interface Apply {
  id: number;
  email: string;
  fullname: string;
  phone: string;
  date_of_birth: string;
  time_of_birth: string;
  place_of_birth: string;
  telegram_username: string;
  facebook_link: string;
  position_apply: string;
  sun_sign: string;
  moon_sign: string;
  asc_sign: string;
  current_address: string;
}

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Mock data for demonstration
const mockApplies = [
  {
    id: 1,
    dateApply: '2024-03-20',
    email: 'john.doe@example.com',
    fullname: 'John Doe',
    infoSecurity: true,
    phone: '+84 123 456 789',
    dateOfBirth: '1995-05-15',
    timeOfBirth: '08:30',
    placeOfBirth: 'Ho Chi Minh City',
    deviceWorking: ['Laptop', 'Mobile'],
    telegram: '@johndoe',
    facebook: 'john.doe.fb',
    positionApply: 'Developer',
    sun: 'Taurus',
    moon: 'Leo',
    asc: 'Virgo',
    currentAddress: 'District 1, Ho Chi Minh City'
  },
  {
    id: 2,
    dateApply: '2024-03-19',
    email: 'jane.smith@example.com',
    fullname: 'Jane Smith',
    infoSecurity: false,
    phone: '+84 987 654 321',
    dateOfBirth: '1998-08-22',
    timeOfBirth: '14:15',
    placeOfBirth: 'Ha Noi',
    deviceWorking: ['Laptop'],
    telegram: '@janesmith',
    facebook: 'jane.smith.fb',
    positionApply: 'Designer',
    sun: 'Leo',
    moon: 'Cancer',
    asc: 'Libra',
    currentAddress: 'Ba Dinh District, Ha Noi'
  },
  // Add more mock data as needed
];

const AppliesManagement = ({ language }: AppliesManagementProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingApply, setEditingApply] = useState<Apply | null>(null);
  const [applies, setApplies] = useState<Apply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch applies from Supabase
  const fetchApplies = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('applies')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;

      setApplies(data || []);
    } catch (error) {
      console.error('Error fetching applies:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Lỗi',
        description: language === 'en' ? 'Failed to fetch applies' : 'Không thể tải dữ liệu',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchApplies();
  }, []);

  // Handle search
  const filteredApplies = applies.filter(apply => 
    apply.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apply.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apply.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apply.telegram_username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle import
  const handleImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const importedData = JSON.parse(content);
          
          const { error } = await supabase
            .from('applies')
            .insert(importedData);

          if (error) throw error;

          await fetchApplies();
          toast({
            title: language === 'en' ? 'Success' : 'Thành công',
            description: language === 'en' ? 'Data imported successfully' : 'Nhập dữ liệu thành công',
          });
        } catch (error) {
          console.error('Error importing data:', error);
          toast({
            title: language === 'en' ? 'Error' : 'Lỗi',
            description: language === 'en' ? 'Failed to import data' : 'Không thể nhập dữ liệu',
            variant: 'destructive',
          });
        }
      };
      reader.readAsText(file);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const { data, error } = await supabase
        .from('applies')
        .select('*')
        .order('dateApply', { ascending: false });

      if (error) throw error;

      const exportData = JSON.stringify(data, null, 2);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `applies_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Lỗi',
        description: language === 'en' ? 'Failed to export data' : 'Không thể xuất dữ liệu',
        variant: 'destructive',
      });
    }
  };

  // Handle edit
  const handleEdit = (apply: Apply) => {
    setEditingApply(apply);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (editingApply) {
      try {
        const { error } = await supabase
          .from('applies')
          .update({
            email: editingApply.email,
            fullname: editingApply.fullname,
            phone: editingApply.phone,
            date_of_birth: editingApply.date_of_birth,
            time_of_birth: editingApply.time_of_birth,
            place_of_birth: editingApply.place_of_birth,
            telegram_username: editingApply.telegram_username,
            facebook_link: editingApply.facebook_link,
            position_apply: editingApply.position_apply,
            sun_sign: editingApply.sun_sign,
            moon_sign: editingApply.moon_sign,
            asc_sign: editingApply.asc_sign,
            current_address: editingApply.current_address,
          })
          .eq('id', editingApply.id);

        if (error) throw error;

        await fetchApplies();
        setIsEditDialogOpen(false);
        setEditingApply(null);
        
        toast({
          title: language === 'en' ? 'Success' : 'Thành công',
          description: language === 'en' ? 'Apply updated successfully' : 'Cập nhật thành công',
        });
      } catch (error) {
        console.error('Error updating apply:', error);
        toast({
          title: language === 'en' ? 'Error' : 'Lỗi',
          description: language === 'en' ? 'Failed to update apply' : 'Không thể cập nhật',
          variant: 'destructive',
        });
      }
    }
  };

  // Pagination
  const indexOfLastApply = currentPage * rowsPerPage;
  const indexOfFirstApply = indexOfLastApply - rowsPerPage;
  const paginatedApplies = filteredApplies.slice(indexOfFirstApply, indexOfLastApply);
  const totalPages = Math.ceil(filteredApplies.length / rowsPerPage);

  // Real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('applies_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'applies' 
        }, 
        () => {
          fetchApplies();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Translations
  const t = {
    en: {
      title: "Applies",
      search: "Search by email",
      import: "Import",
      export: "Export",
      addWebhook: "Add Webhook",
      dateApply: "Date Apply",
      email: "Email",
      fullname: "Fullname",
      infoSecurity: "Information Security",
      phone: "Phone",
      dateOfBirth: "Date of Birth",
      timeOfBirth: "Time of Birth",
      placeOfBirth: "Place of Birth",
      deviceWorking: "Device Working",
      telegram: "Telegram",
      actions: "Actions",
      createWebhook: "Create Webhook",
      webhookDescription: "Configure a new webhook for notifications",
      name: "Name",
      triggerEvent: "Trigger Event",
      secretKey: "Secret Key",
      webhookUrl: "Webhook URL",
      description: "Description",
      addCondition: "Add Condition",
      cancel: "Cancel",
      save: "Save",
      required: "Required",
      optional: "Optional",
      showing: "Showing",
      of: "of",
      perPage: "per page",
      rowsPerPage: "Rows per page",
      editApply: "Edit Apply",
      deviceWorkingOptions: "Device Working Options",
      laptop: "Laptop",
      mobile: "Mobile",
      desktop: "Desktop",
      tablet: "Tablet",
      yes: "Yes",
      no: "No",
      facebook: "Facebook",
      positionApply: "Position Apply",
      sun: "Sun",
      moon: "Moon",
      asc: "ASC",
      currentAddress: "Current Address",
    },
    vi: {
      title: "Danh sách ứng tuyển",
      search: "Tìm kiếm theo email",
      import: "Nhập",
      export: "Xuất",
      addWebhook: "Thêm Webhook",
      dateApply: "Ngày ứng tuyển",
      email: "Email",
      fullname: "Họ và tên",
      infoSecurity: "Bảo mật thông tin",
      phone: "Số điện thoại",
      dateOfBirth: "Ngày sinh",
      timeOfBirth: "Giờ sinh",
      placeOfBirth: "Nơi sinh",
      deviceWorking: "Thiết bị làm việc",
      telegram: "Telegram",
      actions: "Thao tác",
      createWebhook: "Tạo Webhook",
      webhookDescription: "Cấu hình webhook mới cho thông báo",
      name: "Tên",
      triggerEvent: "Sự kiện kích hoạt",
      secretKey: "Khóa bí mật",
      webhookUrl: "URL Webhook",
      description: "Mô tả",
      addCondition: "Thêm điều kiện",
      cancel: "Hủy",
      save: "Lưu",
      required: "Bắt buộc",
      optional: "Tùy chọn",
      showing: "Hiển thị",
      of: "trong số",
      perPage: "mỗi trang",
      rowsPerPage: "Hàng mỗi trang",
      editApply: "Chỉnh sửa đơn",
      deviceWorkingOptions: "Tùy chọn thiết bị làm việc",
      laptop: "Laptop",
      mobile: "Di động",
      desktop: "Máy tính để bàn",
      tablet: "Máy tính bảng",
      yes: "Có",
      no: "Không",
      facebook: "Facebook",
      positionApply: "Vị trí ứng tuyển",
      sun: "Mặt trời",
      moon: "Mặt trăng",
      asc: "ASC",
      currentAddress: "Địa chỉ hiện tại",
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t[language].title}</h1>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t[language].search}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".json"
              onChange={handleFileChange}
            />
            <Button variant="outline" onClick={handleImport}>
              <Upload className="mr-2 h-4 w-4" />
              {t[language].import}
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              {t[language].export}
            </Button>
            <Button onClick={() => setIsWebhookDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t[language].addWebhook}
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">{t[language].email}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].fullname}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].phone}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].dateOfBirth}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].timeOfBirth}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].placeOfBirth}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].telegram}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].facebook}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].positionApply}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].sun}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].moon}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].asc}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].currentAddress}</TableHead>
                <TableHead className="whitespace-nowrap text-right">{t[language].actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={14} className="text-center py-10">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedApplies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} className="text-center py-10">
                    {language === 'en' ? 'No applications found' : 'Không tìm thấy đơn ứng tuyển nào'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedApplies.map((apply) => (
                  <TableRow key={apply.id}>
                    <TableCell className="whitespace-nowrap max-w-[200px] truncate">
                      {apply.email}
                    </TableCell>
                    <TableCell className="whitespace-nowrap max-w-[200px] truncate">
                      {apply.fullname}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{apply.phone}</TableCell>
                    <TableCell className="whitespace-nowrap">{apply.date_of_birth}</TableCell>
                    <TableCell className="whitespace-nowrap">{apply.time_of_birth}</TableCell>
                    <TableCell className="whitespace-nowrap max-w-[200px] truncate">
                      {apply.place_of_birth}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <a
                        href={`https://t.me/${apply.telegram_username.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {apply.telegram_username}
                      </a>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <a
                        href={apply.facebook_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {apply.facebook_link}
                      </a>
                    </TableCell>
                    <TableCell className="whitespace-nowrap max-w-[200px] truncate">
                      {apply.position_apply}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{apply.sun_sign}</TableCell>
                    <TableCell className="whitespace-nowrap">{apply.moon_sign}</TableCell>
                    <TableCell className="whitespace-nowrap">{apply.asc_sign}</TableCell>
                    <TableCell className="whitespace-nowrap max-w-[200px] truncate">
                      {apply.current_address}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(apply)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-end">
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={setRowsPerPage}
            totalItems={filteredApplies.length}
            translations={{
              showing: t[language].showing,
              of: t[language].of,
              perPage: t[language].perPage
            }}
          />
          </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t[language].editApply}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">
                  {t[language].email} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  value={editingApply?.email || ''}
                  onChange={(e) => setEditingApply(prev => ({ ...prev!, email: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fullname">
                  {t[language].fullname} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullname"
                  value={editingApply?.fullname || ''}
                  onChange={(e) => setEditingApply(prev => ({ ...prev!, fullname: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">
                  {t[language].phone} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  value={editingApply?.phone || ''}
                  onChange={(e) => setEditingApply(prev => ({ ...prev!, phone: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date_of_birth">
                  {t[language].dateOfBirth} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={editingApply?.date_of_birth || ''}
                  onChange={(e) => setEditingApply(prev => ({ ...prev!, date_of_birth: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="time_of_birth">
                  {t[language].timeOfBirth} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="time_of_birth"
                  type="time"
                  value={editingApply?.time_of_birth || ''}
                  onChange={(e) => setEditingApply(prev => ({ ...prev!, time_of_birth: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="place_of_birth">
                  {t[language].placeOfBirth} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="place_of_birth"
                  value={editingApply?.place_of_birth || ''}
                  onChange={(e) => setEditingApply(prev => ({ ...prev!, place_of_birth: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="telegram_username">
                  {t[language].telegram} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="telegram_username"
                  value={editingApply?.telegram_username || ''}
                  onChange={(e) => setEditingApply(prev => ({ ...prev!, telegram_username: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="facebook_link">
                  {t[language].facebook} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="facebook_link"
                  value={editingApply?.facebook_link || ''}
                  onChange={(e) => setEditingApply(prev => ({ ...prev!, facebook_link: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="position_apply">
                  {t[language].positionApply} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="position_apply"
                  value={editingApply?.position_apply || ''}
                  onChange={(e) => setEditingApply(prev => ({ ...prev!, position_apply: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sun_sign">
                  {t[language].sun} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sun_sign"
                  value={editingApply?.sun_sign || ''}
                  onChange={(e) => setEditingApply(prev => ({ ...prev!, sun_sign: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="moon_sign">
                  {t[language].moon} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="moon_sign"
                  value={editingApply?.moon_sign || ''}
                  onChange={(e) => setEditingApply(prev => ({ ...prev!, moon_sign: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="asc_sign">
                  {t[language].asc} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="asc_sign"
                  value={editingApply?.asc_sign || ''}
                  onChange={(e) => setEditingApply(prev => ({ ...prev!, asc_sign: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="current_address">
                  {t[language].currentAddress} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="current_address"
                  value={editingApply?.current_address || ''}
                  onChange={(e) => setEditingApply(prev => ({ ...prev!, current_address: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t[language].cancel}
            </Button>
            <Button onClick={handleSaveEdit}>
              {t[language].save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Webhook Dialog */}
      <Dialog open={isWebhookDialogOpen} onOpenChange={setIsWebhookDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t[language].createWebhook}</DialogTitle>
            <DialogDescription>
              {t[language].webhookDescription}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                {t[language].name} <span className="text-red-500">*</span>
              </Label>
              <Input id="name" placeholder={t[language].name} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="triggerEvent">
                {t[language].triggerEvent} <span className="text-red-500">*</span>
              </Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={t[language].triggerEvent} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create">On Create</SelectItem>
                  <SelectItem value="update">On Update</SelectItem>
                  <SelectItem value="delete">On Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="secretKey">{t[language].secretKey}</Label>
              <Input id="secretKey" value="abrtozesq5" readOnly />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="webhookUrl">
                {t[language].webhookUrl} <span className="text-red-500">*</span>
              </Label>
              <Input id="webhookUrl" placeholder="https://" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">
                {t[language].description} <span className="text-muted-foreground text-sm">({t[language].optional})</span>
              </Label>
              <Textarea id="description" placeholder={t[language].description} />
            </div>

            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              {t[language].addCondition}
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWebhookDialogOpen(false)}>
              {t[language].cancel}
            </Button>
            <Button type="submit">
              {t[language].save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppliesManagement;