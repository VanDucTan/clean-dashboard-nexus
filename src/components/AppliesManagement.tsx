import React, { useState, useRef } from 'react';
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

interface AppliesManagementProps {
  language: 'en' | 'vi';
}

interface Apply {
  id: number;
  dateApply: string;
  email: string;
  fullname: string;
  infoSecurity: boolean;
  phone: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  deviceWorking: string[];
  telegram: string;
  facebook: string;
  positionApply: string;
  sun: string;
  moon: string;
  asc: string;
  currentAddress: string;
}

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
  const [applies, setApplies] = useState<Apply[]>(mockApplies);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Handle search
  const filteredApplies = applies.filter(apply => 
    apply.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apply.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apply.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apply.telegram.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle import
  const handleImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importedData = JSON.parse(content);
          setApplies([...applies, ...importedData]);
          toast({
            title: language === 'en' ? 'Success' : 'Thành công',
            description: language === 'en' ? 'Data imported successfully' : 'Nhập dữ liệu thành công',
          });
        } catch (error) {
          toast({
            title: language === 'en' ? 'Error' : 'Lỗi',
            description: language === 'en' ? 'Invalid file format' : 'Định dạng file không hợp lệ',
            variant: 'destructive',
          });
        }
      };
      reader.readAsText(file);
    }
  };

  // Handle export
  const handleExport = () => {
    const exportData = JSON.stringify(applies, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `applies_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle edit
  const handleEdit = (apply: Apply) => {
    setEditingApply(apply);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingApply) {
      setApplies(applies.map(apply => 
        apply.id === editingApply.id ? editingApply : apply
      ));
      setIsEditDialogOpen(false);
      setEditingApply(null);
      toast({
        title: language === 'en' ? 'Success' : 'Thành công',
        description: language === 'en' ? 'Apply updated successfully' : 'Cập nhật thành công',
      });
    }
  };

  // Pagination
  const indexOfLastApply = currentPage * rowsPerPage;
  const indexOfFirstApply = indexOfLastApply - rowsPerPage;
  const paginatedApplies = filteredApplies.slice(indexOfFirstApply, indexOfLastApply);
  const totalPages = Math.ceil(filteredApplies.length / rowsPerPage);

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
                <TableHead className="whitespace-nowrap">{t[language].dateApply}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].email}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].fullname}</TableHead>
                <TableHead className="whitespace-nowrap text-center">{t[language].infoSecurity}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].phone}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].dateOfBirth}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].timeOfBirth}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].placeOfBirth}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].deviceWorking}</TableHead>
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
              {paginatedApplies.map((apply) => (
                <TableRow key={apply.id}>
                  <TableCell className="whitespace-nowrap">{apply.dateApply}</TableCell>
                  <TableCell className="whitespace-nowrap max-w-[200px] truncate">{apply.email}</TableCell>
                  <TableCell className="whitespace-nowrap max-w-[200px] truncate">{apply.fullname}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    {apply.infoSecurity && (
                      <div className="flex justify-center">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{apply.phone}</TableCell>
                  <TableCell className="whitespace-nowrap">{apply.dateOfBirth}</TableCell>
                  <TableCell className="whitespace-nowrap">{apply.timeOfBirth}</TableCell>
                  <TableCell className="whitespace-nowrap max-w-[200px] truncate">{apply.placeOfBirth}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex gap-1">
                      {apply.deviceWorking.map((device, index) => (
                        <Badge key={index} variant="outline">
                          {device}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <a
                      href={`https://t.me/${apply.telegram.substring(1)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {apply.telegram}
                    </a>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <a
                      href={`https://facebook.com/${apply.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {apply.facebook}
                    </a>
                  </TableCell>
                  <TableCell className="whitespace-nowrap max-w-[200px] truncate">{apply.positionApply}</TableCell>
                  <TableCell className="whitespace-nowrap">{apply.sun}</TableCell>
                  <TableCell className="whitespace-nowrap">{apply.moon}</TableCell>
                  <TableCell className="whitespace-nowrap">{apply.asc}</TableCell>
                  <TableCell className="whitespace-nowrap max-w-[200px] truncate">{apply.currentAddress}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(apply)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
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
                    {pageSize} {t[language].perPage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {t[language].showing} {((currentPage - 1) * rowsPerPage) + 1}-
              {Math.min(currentPage * rowsPerPage, filteredApplies.length)} {t[language].of}{" "}
              {filteredApplies.length}
            </span>
          </div>
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={setRowsPerPage}
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
                  onChange={(e) => setEditingApply({ ...editingApply, email: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fullname">
                  {t[language].fullname} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullname"
                  value={editingApply?.fullname || ''}
                  onChange={(e) => setEditingApply({ ...editingApply, fullname: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">
                  {t[language].phone} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  value={editingApply?.phone || ''}
                  onChange={(e) => setEditingApply({ ...editingApply, phone: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dateOfBirth">
                  {t[language].dateOfBirth} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={editingApply?.dateOfBirth || ''}
                  onChange={(e) => setEditingApply({ ...editingApply, dateOfBirth: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="timeOfBirth">
                  {t[language].timeOfBirth} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="timeOfBirth"
                  type="time"
                  value={editingApply?.timeOfBirth || ''}
                  onChange={(e) => setEditingApply({ ...editingApply, timeOfBirth: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="placeOfBirth">
                  {t[language].placeOfBirth} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="placeOfBirth"
                  value={editingApply?.placeOfBirth || ''}
                  onChange={(e) => setEditingApply({ ...editingApply, placeOfBirth: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label>{t[language].deviceWorkingOptions}</Label>
                <div className="flex flex-wrap gap-4">
                  {['Laptop', 'Mobile', 'Desktop', 'Tablet'].map((device) => (
                    <div key={device} className="flex items-center space-x-2">
                      <Checkbox
                        id={device}
                        checked={editingApply?.deviceWorking?.includes(device)}
                        onCheckedChange={(checked) => {
                          const devices = editingApply?.deviceWorking || [];
                          setEditingApply({
                            ...editingApply,
                            deviceWorking: checked
                              ? [...devices, device]
                              : devices.filter((d: string) => d !== device),
                          });
                        }}
                      />
                      <Label htmlFor={device}>{t[language][device.toLowerCase()]}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="telegram">
                  {t[language].telegram} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="telegram"
                  value={editingApply?.telegram || ''}
                  onChange={(e) => setEditingApply({ ...editingApply, telegram: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label>{t[language].infoSecurity}</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="securityYes"
                      checked={editingApply?.infoSecurity === true}
                      onChange={() => setEditingApply({ ...editingApply, infoSecurity: true })}
                    />
                    <Label htmlFor="securityYes">{t[language].yes}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="securityNo"
                      checked={editingApply?.infoSecurity === false}
                      onChange={() => setEditingApply({ ...editingApply, infoSecurity: false })}
                    />
                    <Label htmlFor="securityNo">{t[language].no}</Label>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="facebook">
                  {t[language].facebook} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="facebook"
                  value={editingApply?.facebook || ''}
                  onChange={(e) => setEditingApply({ ...editingApply, facebook: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="positionApply">
                  {t[language].positionApply} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="positionApply"
                  value={editingApply?.positionApply || ''}
                  onChange={(e) => setEditingApply({ ...editingApply, positionApply: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sun">
                  {t[language].sun} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sun"
                  value={editingApply?.sun || ''}
                  onChange={(e) => setEditingApply({ ...editingApply, sun: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="moon">
                  {t[language].moon} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="moon"
                  value={editingApply?.moon || ''}
                  onChange={(e) => setEditingApply({ ...editingApply, moon: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="asc">
                  {t[language].asc} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="asc"
                  value={editingApply?.asc || ''}
                  onChange={(e) => setEditingApply({ ...editingApply, asc: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="currentAddress">
                  {t[language].currentAddress} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="currentAddress"
                  value={editingApply?.currentAddress || ''}
                  onChange={(e) => setEditingApply({ ...editingApply, currentAddress: e.target.value })}
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