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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import CustomPagination from "@/components/ui/custom-pagination";

interface QuestionTypeManagementProps {
  language: 'en' | 'vi';
}

interface QuestionType {
  id: number;
  name: string;
  template: string;
  team: string;
  title: string;
  link: string;
  description?: string;
}

// Mock data for demonstration
const mockQuestionTypes: QuestionType[] = [
  {
    id: 1,
    name: 'rule',
    template: 'Rule',
    team: '',
    title: 'Bài kiểm tra nội quy và văn hóa',
    link: 'https://tnv.nhi.sg/questions/rule-qs1',
    description: ''
  },
  {
    id: 2,
    name: 'capcut',
    template: 'Default',
    team: 'Editor',
    title: 'Bài kiểm tra Editor',
    link: 'https://tnv.nhi.sg/questions/capcut-qs2'
  },
  {
    id: 3,
    name: 'marketing',
    template: 'Default',
    team: 'Editor',
    title: 'Bài kiểm tra Training Editor',
    link: 'https://tnv.nhi.sg/questions/marketing-qs3'
  }
];

const QuestionTypeManagement = ({ language }: QuestionTypeManagementProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<QuestionType | null>(null);
  const [deletingType, setDeletingType] = useState<QuestionType | null>(null);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(mockQuestionTypes);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Handle search
  const filteredTypes = questionTypes.filter(type => 
    type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    type.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    type.team.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const indexOfLastType = currentPage * rowsPerPage;
  const indexOfFirstType = indexOfLastType - rowsPerPage;
  const paginatedTypes = filteredTypes.slice(indexOfFirstType, indexOfLastType);
  const totalPages = Math.ceil(filteredTypes.length / rowsPerPage);

  // Handle edit
  const handleEdit = (type: QuestionType) => {
    setEditingType(type);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingType) {
      setQuestionTypes(questionTypes.map(type => 
        type.id === editingType.id ? editingType : type
      ));
      setIsEditDialogOpen(false);
      setEditingType(null);
      toast({
        title: language === 'en' ? 'Success' : 'Thành công',
        description: language === 'en' ? 'Question type updated successfully' : 'Cập nhật thành công',
      });
    }
  };

  // Handle delete
  const handleDelete = (type: QuestionType) => {
    setDeletingType(type);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingType) {
      setQuestionTypes(questionTypes.filter(type => type.id !== deletingType.id));
      setIsDeleteDialogOpen(false);
      setDeletingType(null);
      toast({
        title: language === 'en' ? 'Success' : 'Thành công',
        description: language === 'en' ? 'Question type deleted successfully' : 'Xóa thành công',
      });
    }
  };

  // Translations
  const t = {
    en: {
      pageTitle: "Question Types",
      search: "Search by name or title",
      create: "Create",
      name: "Name",
      template: "Template",
      team: "Teams",
      columnTitle: "Title",
      description: "Description",
      link: "Link",
      actions: "Actions",
      createType: "Create Question Type",
      editType: "Edit Question Type",
      deleteType: "Delete Question Type",
      deleteConfirmation: "Are you sure you want to delete this question type?",
      deleteWarning: "This action cannot be undone.",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      required: "Required",
      showing: "Showing",
      of: "of",
      perPage: "per page",
      rowsPerPage: "Rows per page",
    },
    vi: {
      pageTitle: "Loại câu hỏi",
      search: "Tìm kiếm theo tên hoặc tiêu đề",
      create: "Tạo mới",
      name: "Tên",
      template: "Mẫu",
      team: "Nhóm",
      columnTitle: "Tiêu đề",
      description: "Mô tả",
      link: "Liên kết",
      actions: "Thao tác",
      createType: "Tạo loại câu hỏi",
      editType: "Chỉnh sửa loại câu hỏi",
      deleteType: "Xóa loại câu hỏi",
      deleteConfirmation: "Bạn có chắc chắn muốn xóa loại câu hỏi này?",
      deleteWarning: "Hành động này không thể hoàn tác.",
      cancel: "Hủy",
      save: "Lưu",
      delete: "Xóa",
      required: "Bắt buộc",
      showing: "Hiển thị",
      of: "trong số",
      perPage: "mỗi trang",
      rowsPerPage: "Hàng mỗi trang",
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t[language].pageTitle}</h1>
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
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t[language].create}
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">{t[language].name}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].template}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].team}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].columnTitle}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].link}</TableHead>
                <TableHead className="whitespace-nowrap text-right">{t[language].actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="whitespace-nowrap max-w-[150px] truncate">{type.name}</TableCell>
                  <TableCell className="whitespace-nowrap max-w-[150px] truncate">{type.template}</TableCell>
                  <TableCell className="whitespace-nowrap max-w-[150px] truncate">{type.team}</TableCell>
                  <TableCell className="whitespace-nowrap max-w-[200px] truncate">{type.title}</TableCell>
                  <TableCell className="whitespace-nowrap max-w-[200px] truncate">
                    <a
                      href={type.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {type.link}
                    </a>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(type)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(type)}>
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
              {Math.min(currentPage * rowsPerPage, filteredTypes.length)} {t[language].of}{" "}
              {filteredTypes.length}
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

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setEditingType(null);
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isCreateDialogOpen ? t[language].createType : t[language].editType}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  {t[language].name} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={editingType?.name || ''}
                  onChange={(e) => setEditingType(prev => ({ ...prev!, name: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="title">
                  {t[language].columnTitle} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={editingType?.title || ''}
                  onChange={(e) => setEditingType(prev => ({ ...prev!, title: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">
                  {t[language].description}
                </Label>
                <textarea
                  id="description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editingType?.description || ''}
                  onChange={(e) => setEditingType(prev => ({ ...prev!, description: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="template">
                  {t[language].template} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={editingType?.template || ''}
                  onValueChange={(value) => setEditingType(prev => ({ ...prev!, template: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rule">Rule</SelectItem>
                    <SelectItem value="Default">Default</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="team">
                  {t[language].team}
                </Label>
                <Input
                  id="team"
                  value={editingType?.team || ''}
                  onChange={(e) => setEditingType(prev => ({ ...prev!, team: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              setEditingType(null);
            }}>
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
            <DialogTitle>{t[language].deleteType}</DialogTitle>
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
    </div>
  );
};

export default QuestionTypeManagement; 