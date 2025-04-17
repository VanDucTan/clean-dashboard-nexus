import React, { useState, useRef, useEffect } from 'react';
import { Search, Edit2, Plus, Download, Upload, Trash2, X } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

interface QuestionManagementProps {
  language: 'en' | 'vi';
}

interface Question {
  id: number;
  question: string;
  level: number;
  type_id: number;
  created_at?: string;
  updated_at?: string;
  answers?: Answer[];
}

interface Answer {
  id: number;
  question_id: number;
  text: string;
  is_correct: boolean;
  created_at?: string;
  updated_at?: string;
}

interface QuestionType {
  id: number;
  name: string;
  template: string;
  team: string;
  title: string;
}

const QuestionManagement = ({ language }: QuestionManagementProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch question types
  const fetchQuestionTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('question_type')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        setQuestionTypes(data);
        // Set first question type as default if none selected
        if (!selectedTypeId && data.length > 0) {
          setSelectedTypeId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching question types:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Lỗi',
        description: language === 'en' ? 'Failed to fetch question types' : 'Không thể tải loại câu hỏi',
        variant: 'destructive',
      });
    }
  };

  // Fetch questions and question types on component mount
  useEffect(() => {
    fetchQuestionTypes();
  }, []);

  useEffect(() => {
    if (selectedTypeId) {
      fetchQuestions();
    }
  }, [selectedTypeId]);

  // Update fetchQuestions to filter by type_id
  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const { data: questionsData, error: questionsError } = await supabase
        .from('question')
        .select('*')
        .eq('type_id', selectedTypeId)
        .order('created_at', { ascending: false });

      if (questionsError) throw questionsError;

      const { data: answersData, error: answersError } = await supabase
        .from('answer')
        .select('*');

      if (answersError) throw answersError;

      const questionsWithAnswers = questionsData.map(question => ({
        ...question,
        answers: answersData
          .filter(answer => answer.question_id === question.id)
          .map(answer => ({
            id: answer.id,
            question_id: answer.question_id,
            text: answer.text,
            is_correct: answer.is_correct,
            created_at: answer.created_at,
            updated_at: answer.updated_at
          }))
      }));

      setQuestions(questionsWithAnswers);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Lỗi',
        description: language === 'en' ? 'Failed to fetch questions' : 'Không thể tải câu hỏi',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file import
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedQuestions = JSON.parse(e.target?.result as string);
          
          // Insert questions and get their new IDs
          const { data: insertedQuestions, error: questionsError } = await supabase
            .from('question')
            .insert(importedQuestions.map((q: Question) => ({
              question: q.question,
              level: q.level,
              type_id: q.type_id
            })))
            .select();

          if (questionsError) throw questionsError;

          // Insert answers with new question IDs
          for (let i = 0; i < importedQuestions.length; i++) {
            const { error: answersError } = await supabase
              .from('answer')
              .insert(importedQuestions[i].answers.map((a: Answer) => ({
                question_id: insertedQuestions[i].id,
                text: a.text,
                is_correct: a.is_correct
              })));

            if (answersError) throw answersError;
          }

          await fetchQuestions();
          toast({
            title: language === 'en' ? 'Success' : 'Thành công',
            description: language === 'en' ? 'Questions imported successfully' : 'Nhập câu hỏi thành công',
          });
        } catch (error) {
          console.error('Error importing questions:', error);
          toast({
            title: language === 'en' ? 'Error' : 'Lỗi',
            description: language === 'en' ? 'Failed to import questions' : 'Nhập câu hỏi thất bại',
            variant: 'destructive',
          });
        }
      };
      reader.readAsText(file);
    }
  };

  // Handle export
  const handleExport = () => {
    const filteredQuestions = questions.filter(q => q.type_id === selectedTypeId);
    const dataStr = JSON.stringify(filteredQuestions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `questions_${selectedTypeId}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle search
  const filteredQuestions = questions.filter(question => 
    question.type_id === selectedTypeId &&
    question.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const indexOfLastQuestion = currentPage * rowsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - rowsPerPage;
  const paginatedQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(filteredQuestions.length / rowsPerPage);

  // Handle edit
  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setIsEditDialogOpen(true);
  };

  // Handle add answer
  const handleAddAnswer = () => {
    if (editingQuestion) {
      const newAnswer: Answer = {
        id: Date.now(), // Temporary ID for UI only
        question_id: editingQuestion.id || 0,
        text: '',
        is_correct: false
      };
      setEditingQuestion({
        ...editingQuestion,
        answers: [...(editingQuestion.answers || []), newAnswer]
      });
    }
  };

  // Create new question
  const handleCreate = async () => {
    if (!editingQuestion) return;

    try {
      // Get the question type
      const questionType = questionTypes.find(t => t.id === selectedTypeId);
      if (!questionType) {
        toast({
          title: language === 'en' ? 'Error' : 'Lỗi',
          description: language === 'en' ? 'Please select a question type' : 'Vui lòng chọn loại câu hỏi',
          variant: 'destructive',
        });
        return;
      }

      // Create question
      const { data: newQuestion, error: questionError } = await supabase
        .from('question')
        .insert([{
          question: editingQuestion.question.trim(),
          level: editingQuestion.level,
          type: questionType.name,
          type_id: selectedTypeId
        }])
        .select()
        .single();

      if (questionError) throw questionError;
      if (!newQuestion) throw new Error('Failed to create question');

      // Insert answers
      if (editingQuestion.answers && editingQuestion.answers.length > 0) {
        const { error: answersError } = await supabase
          .from('answer')
          .insert(editingQuestion.answers.map(answer => ({
            question_id: newQuestion.id,
            text: answer.text.trim(),
            is_correct: answer.is_correct
          })));

        if (answersError) throw answersError;
      }

      await fetchQuestions();
      setIsEditDialogOpen(false);
      setEditingQuestion(null);
      toast({
        title: language === 'en' ? 'Success' : 'Thành công',
        description: language === 'en' ? 'Question created successfully' : 'Tạo mới thành công',
      });
    } catch (error) {
      console.error('Error creating question:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Lỗi',
        description: error instanceof Error ? error.message : (language === 'en' ? 'Failed to create question' : 'Tạo mới thất bại'),
        variant: 'destructive',
      });
    }
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingQuestion) return;

    try {
      // Validate required fields
      if (!editingQuestion.question?.trim() || !editingQuestion.level) {
        toast({
          title: language === 'en' ? 'Error' : 'Lỗi',
          description: language === 'en' ? 'Please fill in all required fields' : 'Vui lòng điền đầy đủ thông tin bắt buộc',
          variant: 'destructive',
        });
        return;
      }

      // Validate answers
      if (!editingQuestion.answers || editingQuestion.answers.length === 0) {
        toast({
          title: language === 'en' ? 'Error' : 'Lỗi',
          description: language === 'en' ? 'Please add at least one answer' : 'Vui lòng thêm ít nhất một câu trả lời',
          variant: 'destructive',
        });
        return;
      }

      const hasEmptyAnswer = editingQuestion.answers.some(answer => !answer.text.trim());
      if (hasEmptyAnswer) {
        toast({
          title: language === 'en' ? 'Error' : 'Lỗi',
          description: language === 'en' ? 'Please fill in all answer texts' : 'Vui lòng điền đầy đủ nội dung câu trả lời',
          variant: 'destructive',
        });
        return;
      }

      // Get the question type
      const questionType = questionTypes.find(t => t.id === selectedTypeId);
      if (!questionType) {
        toast({
          title: language === 'en' ? 'Error' : 'Lỗi',
          description: language === 'en' ? 'Please select a question type' : 'Vui lòng chọn loại câu hỏi',
          variant: 'destructive',
        });
        return;
      }

      if (!editingQuestion.id) {
        // This is a new question
        await handleCreate();
        return;
      }

      // Update existing question
      const { error: questionError } = await supabase
        .from('question')
        .update({
          question: editingQuestion.question.trim(),
          level: editingQuestion.level,
          type: questionType.name,
          type_id: selectedTypeId,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingQuestion.id);

      if (questionError) throw questionError;

      // Delete existing answers
      const { error: deleteError } = await supabase
        .from('answer')
        .delete()
        .eq('question_id', editingQuestion.id);

      if (deleteError) throw deleteError;

      // Insert new answers
      const { error: answersError } = await supabase
        .from('answer')
        .insert(editingQuestion.answers.map(answer => ({
          question_id: editingQuestion.id,
          text: answer.text.trim(),
          is_correct: answer.is_correct
        })));

      if (answersError) throw answersError;

      await fetchQuestions();
      setIsEditDialogOpen(false);
      setEditingQuestion(null);
      toast({
        title: language === 'en' ? 'Success' : 'Thành công',
        description: language === 'en' ? 'Question updated successfully' : 'Cập nhật thành công',
      });
    } catch (error) {
      console.error('Error saving question:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Lỗi',
        description: error instanceof Error ? error.message : (language === 'en' ? 'Failed to save question' : 'Lưu thất bại'),
        variant: 'destructive',
      });
    }
  };

  // Handle delete
  const handleDelete = (question: Question) => {
    setDeletingQuestion(question);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (deletingQuestion) {
      try {
        const { error } = await supabase
          .from('question')
          .delete()
          .eq('id', deletingQuestion.id);

        if (error) throw error;

        await fetchQuestions();
        setIsDeleteDialogOpen(false);
        setDeletingQuestion(null);
        toast({
          title: language === 'en' ? 'Success' : 'Thành công',
          description: language === 'en' ? 'Question deleted successfully' : 'Xóa thành công',
        });
      } catch (error) {
        console.error('Error deleting question:', error);
        toast({
          title: language === 'en' ? 'Error' : 'Lỗi',
          description: language === 'en' ? 'Failed to delete question' : 'Xóa thất bại',
          variant: 'destructive',
        });
      }
    }
  };

  // Handle remove answer
  const handleRemoveAnswer = (answerId: number) => {
    if (editingQuestion && editingQuestion.answers) {
      setEditingQuestion({
        ...editingQuestion,
        answers: editingQuestion.answers.filter(a => a.id !== answerId)
      });
    }
  };

  // Translations
  const t = {
    en: {
      pageTitle: "Questions",
      search: "Search questions",
      create: "Create",
      import: "Import",
      export: "Export",
      question: "Question",
      level: "Level",
      answers: "Answers",
      actions: "Actions",
      createQuestion: "Create Question",
      editQuestion: "Edit Question",
      deleteQuestion: "Delete Question",
      deleteConfirmation: "Are you sure you want to delete this question?",
      deleteWarning: "This action cannot be undone.",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      required: "Required",
      showing: "Showing",
      of: "of",
      perPage: "per page",
      rowsPerPage: "Rows per page",
      addAnswer: "Add answer",
      selectType: "Select question type",
      correct: "Correct"
    },
    vi: {
      pageTitle: "Câu hỏi",
      search: "Tìm kiếm câu hỏi",
      create: "Tạo mới",
      import: "Nhập",
      export: "Xuất",
      question: "Câu hỏi",
      level: "Cấp độ",
      answers: "Câu trả lời",
      actions: "Thao tác",
      createQuestion: "Tạo câu hỏi",
      editQuestion: "Chỉnh sửa câu hỏi",
      deleteQuestion: "Xóa câu hỏi",
      deleteConfirmation: "Bạn có chắc chắn muốn xóa câu hỏi này?",
      deleteWarning: "Hành động này không thể hoàn tác.",
      cancel: "Hủy",
      save: "Lưu",
      delete: "Xóa",
      required: "Bắt buộc",
      showing: "Hiển thị",
      of: "trong số",
      perPage: "mỗi trang",
      rowsPerPage: "Hàng mỗi trang",
      addAnswer: "Thêm câu trả lời",
      selectType: "Chọn loại câu hỏi",
      correct: "Đúng"
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t[language].pageTitle}</h1>
        </div>

        {/* Type Selection and Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Select
              value={selectedTypeId?.toString()}
              onValueChange={(value) => setSelectedTypeId(parseInt(value))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t[language].selectType} />
              </SelectTrigger>
              <SelectContent>
                {questionTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".json"
              onChange={handleFileChange}
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              {t[language].import}
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              {t[language].export}
            </Button>
          </div>
          <Button onClick={() => {
            setEditingQuestion({
              id: 0, // Remove manual ID generation
              question: '',
              level: 1,
              type_id: selectedTypeId || questionTypes[0]?.id,
              answers: []
            });
            setIsEditDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            {t[language].create}
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t[language].search}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Questions List with Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60%]">{t[language].question}</TableHead>
                  <TableHead>{t[language].level}</TableHead>
                  <TableHead className="text-right">{t[language].actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium">{question.question}</TableCell>
                    <TableCell>{question.level}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(question)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(question)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
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
              {Math.min(currentPage * rowsPerPage, filteredQuestions.length)} {t[language].of}{" "}
              {filteredQuestions.length}
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion?.id ? t[language].editQuestion : t[language].createQuestion}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="question">
                  {t[language].question} <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="question"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editingQuestion?.question || ''}
                  onChange={(e) => setEditingQuestion(prev => ({ ...prev!, question: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="level">
                  {t[language].level} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={editingQuestion?.level.toString()}
                  onValueChange={(value) => setEditingQuestion(prev => ({ ...prev!, level: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <SelectItem key={level} value={level.toString()}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label>{t[language].answers}</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddAnswer}>
                    <Plus className="h-4 w-4 mr-1" />
                    {t[language].addAnswer}
                  </Button>
                </div>
                <div className="space-y-2">
                  {editingQuestion?.answers?.map((answer, index) => (
                    <div key={answer.id} className="flex items-center gap-2">
                      <Input
                        value={answer.text}
                        onChange={(e) => {
                          if (editingQuestion.answers) {
                            const newAnswers = [...editingQuestion.answers];
                            newAnswers[index] = { ...answer, text: e.target.value };
                            setEditingQuestion({ ...editingQuestion, answers: newAnswers });
                          }
                        }}
                        placeholder={`${t[language].answers} ${index + 1}`}
                      />
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={answer.is_correct}
                          onCheckedChange={(checked) => {
                            if (editingQuestion.answers) {
                              const newAnswers = [...editingQuestion.answers];
                              newAnswers[index] = { ...answer, is_correct: checked };
                              setEditingQuestion({ ...editingQuestion, answers: newAnswers });
                            }
                          }}
                        />
                        <span className="text-sm">{t[language].correct}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAnswer(answer.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t[language].deleteQuestion}</DialogTitle>
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

export default QuestionManagement; 