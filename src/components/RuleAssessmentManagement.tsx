import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
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
import { supabase } from '@/lib/supabase';

interface RuleAssessmentManagementProps {
  language: 'en' | 'vi';
}

interface Assessment {
  id: number;
  email: string;
  fullName: string;
  infoSecurity: boolean;
  result: boolean;
  passedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TestHistoryRecord {
  created_at: string;
  result: boolean;
}

interface RuleAssessmentRecord {
  id: number;
  email: string;
  full_name: string;
  info_security: boolean;
  test_history: TestHistoryRecord[];
}

const RuleAssessmentManagement = ({ language }: RuleAssessmentManagementProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [deletingAssessment, setDeletingAssessment] = useState<Assessment | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Wrap fetchAssessments in useCallback
  const fetchAssessments = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('rule_assessment')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        // Transform the data to match our Assessment interface
        const transformedData = data.map(item => ({
          id: item.id,
          email: item.email,
          fullName: item.full_name,
          infoSecurity: item.info_security,
          result: item.result,
          passedAt: item.passed_at,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));

        setAssessments(transformedData);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Lỗi',
        description: language === 'en' ? 'Failed to fetch assessments' : 'Không thể tải dữ liệu đánh giá',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  // Update useEffect to include fetchAssessments in dependency array
  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const importedData = JSON.parse(content);
          
          // Transform data for Supabase
          const transformedData = importedData.map((item: Assessment) => ({
            email: item.email,
            full_name: item.fullName,
            info_security: item.infoSecurity,
            result: item.result,
            passed_at: item.passedAt
          }));

          const { data, error } = await supabase
            .from('rule_assessment')
            .insert(transformedData)
            .select();

          if (error) {
            throw error;
          }

          await fetchAssessments();
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

  const handleSaveEdit = async () => {
    if (editingAssessment) {
      try {
        const updateData = {
          email: editingAssessment.email,
          full_name: editingAssessment.fullName,
          info_security: editingAssessment.infoSecurity,
          result: editingAssessment.result,
          passed_at: editingAssessment.passedAt
        };

        const { data, error } = await supabase
          .from('rule_assessment')
          .update(updateData)
          .eq('id', editingAssessment.id)
          .select();

        if (error) {
          throw error;
        }

        await fetchAssessments();
        setIsEditDialogOpen(false);
        setEditingAssessment(null);
        toast({
          title: language === 'en' ? 'Success' : 'Thành công',
          description: language === 'en' ? 'Assessment updated successfully' : 'Cập nhật thành công',
        });
      } catch (error) {
        console.error('Error updating assessment:', error);
        toast({
          title: language === 'en' ? 'Error' : 'Lỗi',
          description: language === 'en' ? 'Failed to update assessment' : 'Không thể cập nhật đánh giá',
          variant: 'destructive',
        });
      }
    }
  };

  // Handle delete
  const handleDeleteClick = (assessment: Assessment) => {
    setDeletingAssessment(assessment);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingAssessment) {
      try {
        const { error } = await supabase
          .from('rule_assessment')
          .delete()
          .eq('id', deletingAssessment.id);

        if (error) {
          throw error;
        }

        await fetchAssessments();
        setIsDeleteDialogOpen(false);
        setDeletingAssessment(null);
        toast({
          title: language === 'en' ? 'Success' : 'Thành công',
          description: language === 'en' ? 'Assessment deleted successfully' : 'Xóa thành công',
        });
      } catch (error) {
        console.error('Error deleting assessment:', error);
        toast({
          title: language === 'en' ? 'Error' : 'Lỗi',
          description: language === 'en' ? 'Failed to delete assessment' : 'Không thể xóa đánh giá',
          variant: 'destructive',
        });
      }
    }
  };

  // Pagination
  const indexOfLastAssessment = currentPage * rowsPerPage;
  const indexOfFirstAssessment = indexOfLastAssessment - rowsPerPage;
  const paginatedAssessments = filteredAssessments.slice(indexOfFirstAssessment, indexOfLastAssessment);
  const totalPages = Math.ceil(filteredAssessments.length / rowsPerPage);

  // Format date and time
  const formatDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return '';
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString(language === 'en' ? 'en-US' : 'vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
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
      email: "Email",
      fullName: "Full Name",
      infoSecurity: "Information Security",
      result: "Result",
      passedAt: "Passed At",
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
      editAssessment: "Edit Assessment",
      yes: "Yes",
      no: "No",
      pass: "Pass",
      fail: "Fail",
      deleteAssessment: "Delete Assessment",
      deleteConfirmation: "Are you sure you want to delete this assessment?",
      deleteWarning: "This action cannot be undone.",
      delete: "Delete",
    },
    vi: {
      title: "Đánh giá quy tắc",
      search: "Tìm kiếm theo email",
      import: "Nhập",
      export: "Xuất",
      addWebhook: "Thêm Webhook",
      email: "Email",
      fullName: "Họ và tên",
      infoSecurity: "Bảo mật thông tin",
      result: "Kết quả",
      passedAt: "Thời gian đạt",
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
      editAssessment: "Chỉnh sửa đánh giá",
      yes: "Có",
      no: "Không",
      pass: "Đạt",
      fail: "Không đạt",
      deleteAssessment: "Xóa đánh giá",
      deleteConfirmation: "Bạn có chắc chắn muốn xóa đánh giá này?",
      deleteWarning: "Hành động này không thể hoàn tác.",
      delete: "Xóa",
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
                <TableHead className="whitespace-nowrap">{t[language].infoSecurity}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].result}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].passedAt}</TableHead>
                <TableHead className="whitespace-nowrap text-right">{t[language].actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedAssessments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    {language === 'en' ? 'No assessments found' : 'Không tìm thấy đánh giá nào'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAssessments.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell className="whitespace-nowrap">{assessment.email}</TableCell>
                    <TableCell className="whitespace-nowrap">{assessment.fullName}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {assessment.infoSecurity ? t[language].yes : t[language].no}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {assessment.result ? t[language].pass : t[language].fail}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDateTime(assessment.passedAt)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(assessment)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(assessment)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t[language].editAssessment}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
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

              <div className="grid gap-2">
                <Label>{t[language].result}</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="resultPass"
                      checked={editingAssessment?.result === true}
                      onChange={() => setEditingAssessment({ ...editingAssessment!, result: true })}
                    />
                    <Label htmlFor="resultPass">{t[language].pass}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="resultFail"
                      checked={editingAssessment?.result === false}
                      onChange={() => setEditingAssessment({ ...editingAssessment!, result: false })}
                    />
                    <Label htmlFor="resultFail">{t[language].fail}</Label>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="passedAt">
                  {t[language].passedAt}
                </Label>
                <Input
                  id="passedAt"
                  type="datetime-local"
                  value={editingAssessment?.passedAt?.split('.')[0] || ''}
                  onChange={(e) => setEditingAssessment({ ...editingAssessment!, passedAt: e.target.value })}
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
            <DialogTitle>{t[language].deleteAssessment}</DialogTitle>
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

export default RuleAssessmentManagement; 