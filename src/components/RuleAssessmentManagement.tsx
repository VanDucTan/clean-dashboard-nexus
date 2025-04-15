import React, { useState, useRef } from 'react';
import { Search, Edit2, Plus, Download, Upload, Trash2 } from "lucide-react";
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
import { toast } from "@/components/ui/use-toast";
import CustomPagination from "@/components/ui/custom-pagination";

interface RuleAssessmentManagementProps {
  language: 'en' | 'vi';
}

interface Assessment {
  id: number;
  firstDateTest: string;
  infoSecurity: boolean;
  email: string;
  fullName: string;
  totalTested: number;
  totalPassed: number;
  firstTimePassed: string;
  lastTimePassed: string;
  lastTimeTested: string;
}

// Mock data for demonstration
const mockAssessments: Assessment[] = [
  {
    id: 1,
    firstDateTest: '2024-03-20',
    infoSecurity: true,
    email: 'john.doe@example.com',
    fullName: 'John Doe',
    totalTested: 5,
    totalPassed: 4,
    firstTimePassed: '2024-03-20 10:00',
    lastTimePassed: '2024-03-22 14:30',
    lastTimeTested: '2024-03-22 14:30'
  },
  {
    id: 2,
    firstDateTest: '2024-03-19',
    infoSecurity: false,
    email: 'jane.smith@example.com',
    fullName: 'Jane Smith',
    totalTested: 3,
    totalPassed: 2,
    firstTimePassed: '2024-03-19 09:15',
    lastTimePassed: '2024-03-21 11:45',
    lastTimeTested: '2024-03-21 16:20'
  },
];

const RuleAssessmentManagement = ({ language }: RuleAssessmentManagementProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>(mockAssessments);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Handle search
  const filteredAssessments = assessments.filter(assessment => 
    assessment.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assessment.fullName.toLowerCase().includes(searchQuery.toLowerCase())
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
          setAssessments([...assessments, ...importedData]);
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
    const exportData = JSON.stringify(assessments, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rule_assessments_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle edit
  const handleEdit = (assessment: Assessment) => {
    setEditingAssessment(assessment);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingAssessment) {
      setAssessments(assessments.map(assessment => 
        assessment.id === editingAssessment.id ? editingAssessment : assessment
      ));
      setIsEditDialogOpen(false);
      setEditingAssessment(null);
      toast({
        title: language === 'en' ? 'Success' : 'Thành công',
        description: language === 'en' ? 'Assessment updated successfully' : 'Cập nhật thành công',
      });
    }
  };

  // Pagination
  const indexOfLastAssessment = currentPage * rowsPerPage;
  const indexOfFirstAssessment = indexOfLastAssessment - rowsPerPage;
  const paginatedAssessments = filteredAssessments.slice(indexOfFirstAssessment, indexOfLastAssessment);
  const totalPages = Math.ceil(filteredAssessments.length / rowsPerPage);

  // Add a helper function to format timestamps
  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString(language === 'en' ? 'en-US' : 'vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return dateTimeString;
    }
  };

  // Translations
  const t = {
    en: {
      title: "Rule Assessments",
      search: "Search by email",
      import: "Import",
      export: "Export",
      addWebhook: "Add Webhook",
      firstDateTest: "First Date Test",
      infoSecurity: "Information Security",
      email: "Email",
      fullName: "Full Name",
      totalTested: "Total Tested",
      totalPassed: "Total Passed",
      firstTimePassed: "First Time Passed",
      lastTimePassed: "Last Time Passed",
      lastTimeTested: "Last Time Tested",
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
      editAssessment: "Edit Assessment",
      yes: "Yes",
      no: "No",
    },
    vi: {
      title: "Đánh giá quy tắc",
      search: "Tìm kiếm theo email",
      import: "Nhập",
      export: "Xuất",
      addWebhook: "Thêm Webhook",
      firstDateTest: "Ngày kiểm tra đầu tiên",
      infoSecurity: "Bảo mật thông tin",
      email: "Email",
      fullName: "Họ và tên",
      totalTested: "Tổng số lần kiểm tra",
      totalPassed: "Tổng số lần đạt",
      firstTimePassed: "Lần đầu đạt",
      lastTimePassed: "Lần cuối đạt",
      lastTimeTested: "Lần kiểm tra cuối",
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
      editAssessment: "Chỉnh sửa đánh giá",
      yes: "Có",
      no: "Không",
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
                <TableHead className="whitespace-nowrap">{t[language].firstDateTest}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].infoSecurity}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].email}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].fullName}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].totalTested}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].totalPassed}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].firstTimePassed}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].lastTimePassed}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].lastTimeTested}</TableHead>
                <TableHead className="whitespace-nowrap text-right">{t[language].actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAssessments.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell className="whitespace-nowrap max-w-[200px] truncate">{assessment.firstDateTest}</TableCell>
                  <TableCell className="whitespace-nowrap max-w-[200px] truncate">{assessment.infoSecurity ? t[language].yes : t[language].no}</TableCell>
                  <TableCell className="whitespace-nowrap max-w-[200px] truncate">{assessment.email}</TableCell>
                  <TableCell className="whitespace-nowrap max-w-[200px] truncate">{assessment.fullName}</TableCell>
                  <TableCell className="whitespace-nowrap">{assessment.totalTested}</TableCell>
                  <TableCell className="whitespace-nowrap">{assessment.totalPassed}</TableCell>
                  <TableCell className="whitespace-nowrap">{assessment.firstTimePassed}</TableCell>
                  <TableCell className="whitespace-nowrap">{assessment.lastTimePassed}</TableCell>
                  <TableCell className="whitespace-nowrap">{assessment.lastTimeTested}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(assessment)}>
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
              {Math.min(currentPage * rowsPerPage, filteredAssessments.length)} {t[language].of}{" "}
              {filteredAssessments.length}
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
            <DialogTitle>{t[language].editAssessment}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstDateTest">
                  {t[language].firstDateTest} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstDateTest"
                  type="datetime-local"
                  value={editingAssessment?.firstDateTest || ''}
                  onChange={(e) => setEditingAssessment({ ...editingAssessment!, firstDateTest: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">
                  {t[language].email} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  value={editingAssessment?.email || ''}
                  onChange={(e) => setEditingAssessment({ ...editingAssessment!, email: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fullName">
                  {t[language].fullName} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={editingAssessment?.fullName || ''}
                  onChange={(e) => setEditingAssessment({ ...editingAssessment!, fullName: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="totalTested">
                  {t[language].totalTested} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="totalTested"
                  type="number"
                  value={editingAssessment?.totalTested || 0}
                  onChange={(e) => setEditingAssessment({ ...editingAssessment!, totalTested: parseInt(e.target.value) })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="totalPassed">
                  {t[language].totalPassed} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="totalPassed"
                  type="number"
                  value={editingAssessment?.totalPassed || 0}
                  onChange={(e) => setEditingAssessment({ ...editingAssessment!, totalPassed: parseInt(e.target.value) })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="firstTimePassed">
                  {t[language].firstTimePassed}
                </Label>
                <Input
                  id="firstTimePassed"
                  value={formatDateTime(editingAssessment?.firstTimePassed || '')}
                  readOnly
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="lastTimePassed">
                  {t[language].lastTimePassed}
                </Label>
                <Input
                  id="lastTimePassed"
                  value={formatDateTime(editingAssessment?.lastTimePassed || '')}
                  readOnly
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="lastTimeTested">
                  {t[language].lastTimeTested}
                </Label>
                <Input
                  id="lastTimeTested"
                  value={formatDateTime(editingAssessment?.lastTimeTested || '')}
                  readOnly
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="grid gap-2">
                <Label>{t[language].infoSecurity}</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="securityYes"
                      checked={editingAssessment?.infoSecurity === true}
                      onChange={() => setEditingAssessment({ ...editingAssessment!, infoSecurity: true })}
                    />
                    <Label htmlFor="securityYes">{t[language].yes}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="securityNo"
                      checked={editingAssessment?.infoSecurity === false}
                      onChange={() => setEditingAssessment({ ...editingAssessment!, infoSecurity: false })}
                    />
                    <Label htmlFor="securityNo">{t[language].no}</Label>
                  </div>
                </div>
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

export default RuleAssessmentManagement; 