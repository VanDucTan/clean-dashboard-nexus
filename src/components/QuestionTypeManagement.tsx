import React, { useState, useRef, useEffect } from 'react';
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

interface QuestionTypeManagementProps {
  language: 'en' | 'vi';
}

interface QuestionType {
  id: number;
  name: string;
  template: string;
  team: string | null;
  title: string;
  link: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  has_questions?: boolean;
}

interface Team {
  id: string;
  name: string;
  description: string | null;
}

const QuestionTypeManagement = ({ language }: QuestionTypeManagementProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<QuestionType | null>(null);
  const [deletingType, setDeletingType] = useState<QuestionType | null>(null);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    template: '',
    team: '',
  });

  // Fetch question types from Supabase
  useEffect(() => {
    fetchQuestionTypes();
    fetchTeams();
  }, []);

  const fetchQuestionTypes = async () => {
    try {
      setIsLoading(true);
      // First fetch all question types
      const { data: types, error: typesError } = await supabase
        .from('question_type')
        .select('*')
        .order('created_at', { ascending: false });

      if (typesError) throw typesError;

      // Then fetch questions to check which types have questions
      const { data: questions, error: questionsError } = await supabase
        .from('question')
        .select('type_id');

      if (questionsError) throw questionsError;

      // Create a Set of type_ids that have questions
      const typeIdsWithQuestions = new Set(questions.map(q => q.type_id));

      // Update question types with has_questions flag and generate links
      const updatedTypes = types.map(type => ({
        ...type,
        has_questions: typeIdsWithQuestions.has(type.id),
        link: typeIdsWithQuestions.has(type.id) ? generateUniqueLink(type.name, type.team || '', type.id) : null
      }));

      setQuestionTypes(updatedTypes);
    } catch (error) {
      console.error('Error fetching question types:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Lỗi',
        description: language === 'en' ? 'Failed to fetch question types' : 'Không thể tải dữ liệu loại câu hỏi',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add fetchTeams function
  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, description')
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Lỗi',
        description: language === 'en' ? 'Failed to fetch teams' : 'Không thể tải danh sách nhóm',
        variant: 'destructive',
      });
    }
  };

  // Handle search
  const filteredTypes = questionTypes.filter(type => 
    type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    type.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    type.team?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const indexOfLastType = currentPage * rowsPerPage;
  const indexOfFirstType = indexOfLastType - rowsPerPage;
  const paginatedTypes = filteredTypes.slice(indexOfFirstType, indexOfLastType);
  const totalPages = Math.ceil(filteredTypes.length / rowsPerPage);

  // Handle create
  const handleCreate = async () => {
    try {
      if (!formData.name || !formData.title || !formData.template || !formData.team) {
        toast({
          title: language === 'en' ? 'Error' : 'Lỗi',
          description: language === 'en' ? 'Please fill in all fields' : 'Vui lòng điền đầy đủ các trường',
          variant: 'destructive',
        });
        return;
      }

      // First insert the record to get the ID
      const { data: newType, error: insertError } = await supabase
        .from('question_type')
        .insert([{ ...formData }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Then update with the link using the new ID
      if (newType) {
        const link = generateUniqueLink(formData.name, formData.team, newType.id);
        const { error: updateError } = await supabase
          .from('question_type')
          .update({ link })
          .eq('id', newType.id);

        if (updateError) throw updateError;
      }

      toast({
        title: language === 'en' ? 'Success' : 'Thành công',
        description: language === 'en' ? 'Question type created successfully' : 'Tạo mới thành công',
      });
      setIsCreateDialogOpen(false);
      setFormData({ name: '', title: '', template: '', team: '' });
      fetchQuestionTypes();
    } catch (error) {
      console.error('Error creating question type:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Lỗi',
        description: language === 'en' ? 'Failed to create question type' : 'Không thể tạo loại câu hỏi',
        variant: 'destructive',
      });
    }
  };

  // Handle edit
  const handleEdit = (type: QuestionType) => {
    setEditingType(type);
    setIsEditDialogOpen(true);
    setFormData({
      name: type.name,
      title: type.title,
      template: type.template,
      team: type.team,
    });
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingType) return;

    try {
      // Validate required fields
      const requiredFields = {
        name: editingType.name,
        template: editingType.template,
        title: editingType.title
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value || value.trim() === '')
        .map(([key]) => key);

      if (missingFields.length > 0) {
        toast({
          title: language === 'en' ? 'Error' : 'Lỗi',
          description: language === 'en' 
            ? `Please fill in the following required fields: ${missingFields.join(', ')}`
            : `Vui lòng điền các trường bắt buộc: ${missingFields.join(', ')}`,
          variant: 'destructive',
        });
        return;
      }

      const link = generateUniqueLink(formData.name, formData.team, editingType.id);

      const questionTypeData = {
        name: editingType.name.trim(),
        template: editingType.template.trim(),
        team: editingType.team?.trim() || null,
        title: editingType.title.trim(),
        link: link,
        description: editingType.description?.trim() || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('question_type')
        .update(questionTypeData)
        .eq('id', editingType.id);

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Success' : 'Thành công',
        description: language === 'en' ? 'Question type updated successfully' : 'Cập nhật thành công',
      });
      setIsEditDialogOpen(false);
      setEditingType(null);
      setFormData({ name: '', title: '', template: '', team: '' });
      fetchQuestionTypes();
    } catch (error) {
      console.error('Error saving question type:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: language === 'en' ? 'Error' : 'Lỗi',
        description: errorMessage || (language === 'en' ? 'Failed to update question type' : 'Không thể cập nhật loại câu hỏi'),
        variant: 'destructive',
      });
    }
  };

  // Handle delete
  const handleDelete = (type: QuestionType) => {
    setDeletingType(type);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingType) {
      try {
        const { error } = await supabase
          .from('question_type')
          .delete()
          .eq('id', deletingType.id);

        if (error) {
          throw error;
        }

        toast({
          title: language === 'en' ? 'Success' : 'Thành công',
          description: language === 'en' ? 'Question type deleted successfully' : 'Xóa thành công',
        });
        setIsDeleteDialogOpen(false);
        setDeletingType(null);
        fetchQuestionTypes();
      } catch (error) {
        console.error('Error deleting question type:', error);
        toast({
          title: language === 'en' ? 'Error' : 'Lỗi',
          description: language === 'en' ? 'Failed to delete question type' : 'Không thể xóa loại câu hỏi',
          variant: 'destructive',
        });
      }
    }
  };

  const generateUniqueLink = (name: string, team: string, typeId: number) => {
    const baseUrl = window.location.origin;
    const sanitizedName = name.toLowerCase().replace(/\s+/g, '-');
    const sanitizedTeam = team.toLowerCase().replace(/\s+/g, '-');
    return `${baseUrl}/test/${sanitizedName}-${sanitizedTeam}-${typeId}`;
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    {language === 'en' ? 'No question types found' : 'Không tìm thấy loại câu hỏi nào'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="whitespace-nowrap max-w-[150px] truncate">{type.name}</TableCell>
                    <TableCell className="whitespace-nowrap max-w-[150px] truncate">{type.template}</TableCell>
                    <TableCell className="whitespace-nowrap max-w-[150px] truncate">{type.team}</TableCell>
                    <TableCell className="whitespace-nowrap max-w-[200px] truncate">{type.title}</TableCell>
                    <TableCell className="whitespace-nowrap max-w-[200px] truncate">
                      {type.has_questions ? (
                        <a
                          href={type.link || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {type.link}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">
                          {language === 'en' ? 'No questions available' : 'Chưa có câu hỏi'}
                        </span>
                      )}
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
          setFormData({ name: '', title: '', template: '', team: '' });
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="title">
                  {t[language].columnTitle} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  value={formData.template}
                  onValueChange={(value) => setFormData({ ...formData, template: value })}
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
                <Select
                  value={formData.team}
                  onValueChange={(value) => setFormData({ ...formData, team: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'en' ? 'Select team' : 'Chọn nhóm'} />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.name}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              setEditingType(null);
              setFormData({ name: '', title: '', template: '', team: '' });
            }}>
              {t[language].cancel}
            </Button>
            <Button onClick={isCreateDialogOpen ? handleCreate : handleSaveEdit}>
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