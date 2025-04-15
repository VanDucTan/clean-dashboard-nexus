import React, { useState, useRef } from 'react';
import { Search, Edit2, Plus, Download, Upload, Check, X, Trash2 } from "lucide-react";
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

interface InterviewManagementProps {
  language: 'en' | 'vi';
}

interface Interview {
  id: number;
  email: string;
  fullName: string;
  infoSecurity: boolean;
  dateInterview: string;
  result: string;
  positionAssign: string;
  meetingLink: string;
  registrationDate: string;
}

// Mock data for demonstration
const mockInterviews = [
  {
    id: 1,
    email: 'john.doe@example.com',
    fullName: 'John Doe',
    infoSecurity: true,
    dateInterview: '2024-03-25',
    result: 'Passed',
    positionAssign: 'Senior Frontend Developer',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    registrationDate: '2024-03-20'
  },
  {
    id: 2,
    email: 'jane.smith@example.com',
    fullName: 'Jane Smith',
    infoSecurity: false,
    dateInterview: '2024-03-26',
    result: 'Pending',
    positionAssign: 'UI/UX Designer',
    meetingLink: 'https://meet.google.com/xyz-uvwx-yz',
    registrationDate: '2024-03-21'
  },
  // Add more mock data as needed
];

const InterviewManagement = ({ language }: InterviewManagementProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [deletingInterview, setDeletingInterview] = useState<Interview | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>(mockInterviews);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Handle search
  const filteredInterviews = interviews.filter(interview => 
    interview.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interview.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const indexOfLastInterview = currentPage * rowsPerPage;
  const indexOfFirstInterview = indexOfLastInterview - rowsPerPage;
  const paginatedInterviews = filteredInterviews.slice(indexOfFirstInterview, indexOfLastInterview);
  const totalPages = Math.ceil(filteredInterviews.length / rowsPerPage);

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
          setInterviews([...interviews, ...importedData]);
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
    const exportData = JSON.stringify(interviews, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interviews_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle edit
  const handleEdit = (interview: Interview) => {
    setEditingInterview(interview);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingInterview) {
      setInterviews(interviews.map(interview => 
        interview.id === editingInterview.id ? editingInterview : interview
      ));
      setIsEditDialogOpen(false);
      setEditingInterview(null);
      toast({
        title: language === 'en' ? 'Success' : 'Thành công',
        description: language === 'en' ? 'Interview updated successfully' : 'Cập nhật thành công',
      });
    }
  };

  // Handle delete
  const handleDeleteClick = (interview: Interview) => {
    setDeletingInterview(interview);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingInterview) {
      setInterviews(interviews.filter(interview => interview.id !== deletingInterview.id));
      setIsDeleteDialogOpen(false);
      setDeletingInterview(null);
      toast({
        title: language === 'en' ? 'Success' : 'Thành công',
        description: language === 'en' ? 'Interview deleted successfully' : 'Xóa thành công',
      });
    }
  };

  // Translations
  const t = {
    en: {
      title: "Interview Management",
      search: "Search by name or email",
      import: "Import",
      export: "Export",
      addWebhook: "Add Webhook",
      email: "Email",
      fullName: "Full Name",
      infoSecurity: "Information Security",
      dateInterview: "Date Interview",
      result: "Result",
      positionAssign: "Position Assign",
      meetingLink: "Link Meeting",
      registrationDate: "Registration Date",
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
      yes: "Yes",
      no: "No",
      passed: "Passed",
      pending: "Pending",
      failed: "Failed",
      editInterview: "Edit Interview",
      deleteInterview: "Delete Interview",
      deleteConfirmation: "Are you sure you want to delete this interview?",
      deleteWarning: "This action cannot be undone.",
      delete: "Delete",
      joinMeeting: "Join Meeting",
    },
    vi: {
      title: "Quản lý phỏng vấn",
      search: "Tìm kiếm theo tên hoặc email",
      import: "Nhập",
      export: "Xuất",
      addWebhook: "Thêm Webhook",
      email: "Email",
      fullName: "Họ và tên",
      infoSecurity: "Bảo mật thông tin",
      dateInterview: "Ngày phỏng vấn",
      result: "Kết quả",
      positionAssign: "Vị trí phân công",
      meetingLink: "Link họp",
      registrationDate: "Ngày đăng ký",
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
      yes: "Có",
      no: "Không",
      passed: "Đạt",
      pending: "Đang chờ",
      failed: "Không đạt",
      editInterview: "Chỉnh sửa phỏng vấn",
      deleteInterview: "Xóa phỏng vấn",
      deleteConfirmation: "Bạn có chắc chắn muốn xóa cuộc phỏng vấn này?",
      deleteWarning: "Hành động này không thể hoàn tác.",
      delete: "Xóa",
      joinMeeting: "Tham gia họp",
    }
  };

  const getResultBadgeColor = (result: string) => {
    switch (result.toLowerCase()) {
      case 'passed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">{t[language].email}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].fullName}</TableHead>
                <TableHead className="whitespace-nowrap text-center">{t[language].infoSecurity}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].dateInterview}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].result}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].positionAssign}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].meetingLink}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].registrationDate}</TableHead>
                <TableHead className="whitespace-nowrap text-right">{t[language].actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInterviews.map((interview) => (
                <TableRow key={interview.id}>
                  <TableCell className="whitespace-nowrap max-w-[200px] truncate">{interview.email}</TableCell>
                  <TableCell className="whitespace-nowrap max-w-[200px] truncate">{interview.fullName}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">{interview.infoSecurity ? t[language].yes : t[language].no}</TableCell>
                  <TableCell className="whitespace-nowrap">{interview.dateInterview}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getResultBadgeColor(interview.result)}`}>
                      {t[language][interview.result.toLowerCase() as keyof typeof t.en]}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap max-w-[200px] truncate">{interview.positionAssign}</TableCell>
                  <TableCell className="whitespace-nowrap max-w-[200px] truncate">
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center gap-1"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(interview.meetingLink, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      {t[language].joinMeeting}
                    </a>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{interview.registrationDate}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(interview)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(interview)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
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
              {Math.min(currentPage * rowsPerPage, filteredInterviews.length)} {t[language].of}{" "}
              {filteredInterviews.length}
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
            <DialogTitle>{t[language].editInterview}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">
                  {t[language].email} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  value={editingInterview?.email || ''}
                  onChange={(e) => setEditingInterview({ ...editingInterview!, email: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fullName">
                  {t[language].fullName} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={editingInterview?.fullName || ''}
                  onChange={(e) => setEditingInterview({ ...editingInterview!, fullName: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label>{t[language].infoSecurity}</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="securityYes"
                      checked={editingInterview?.infoSecurity === true}
                      onChange={() => setEditingInterview({ ...editingInterview!, infoSecurity: true })}
                    />
                    <Label htmlFor="securityYes">{t[language].yes}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="securityNo"
                      checked={editingInterview?.infoSecurity === false}
                      onChange={() => setEditingInterview({ ...editingInterview!, infoSecurity: false })}
                    />
                    <Label htmlFor="securityNo">{t[language].no}</Label>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dateInterview">
                  {t[language].dateInterview} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dateInterview"
                  type="date"
                  value={editingInterview?.dateInterview || ''}
                  onChange={(e) => setEditingInterview({ ...editingInterview!, dateInterview: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="result">
                  {t[language].result} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={editingInterview?.result || ''}
                  onValueChange={(value) => setEditingInterview({ ...editingInterview!, result: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Passed">{t[language].passed}</SelectItem>
                    <SelectItem value="Pending">{t[language].pending}</SelectItem>
                    <SelectItem value="Failed">{t[language].failed}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="positionAssign">
                  {t[language].positionAssign} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="positionAssign"
                  value={editingInterview?.positionAssign || ''}
                  onChange={(e) => setEditingInterview({ ...editingInterview!, positionAssign: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="meetingLink">
                  {t[language].meetingLink} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="meetingLink"
                  value={editingInterview?.meetingLink || ''}
                  onChange={(e) => setEditingInterview({ ...editingInterview!, meetingLink: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="registrationDate">
                  {t[language].registrationDate} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="registrationDate"
                  type="date"
                  value={editingInterview?.registrationDate || ''}
                  onChange={(e) => setEditingInterview({ ...editingInterview!, registrationDate: e.target.value })}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t[language].deleteInterview}</DialogTitle>
            <DialogDescription>
              {t[language].deleteConfirmation}
              <br />
              <span className="text-red-500">{t[language].deleteWarning}</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t[language].cancel}
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              {t[language].delete}
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

export default InterviewManagement; 