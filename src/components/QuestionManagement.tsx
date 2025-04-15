import React, { useState, useRef } from 'react';
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

interface QuestionManagementProps {
  language: 'en' | 'vi';
}

interface Question {
  id: number;
  question: string;
  level: number;
  answers: Answer[];
  type: string;
}

interface Answer {
  id: number;
  text: string;
  isCorrect: boolean;
}

// Mock data for demonstration
const mockQuestions: Question[] = [
  {
    id: 1,
    question: 'Khi nào là lúc bạn đặt câu hỏi cho kênh Youtube NhiLe. CHỌN 1 CÂU ĐÚNG.',
    level: 1,
    type: 'rule',
    answers: [
      { id: 1, text: 'Xem hết tất cả các Livestream', isCorrect: true },
      { id: 2, text: 'Xem đến Livestream số 100', isCorrect: false },
      { id: 3, text: 'Khi có câu hỏi trong đầu và chưa xem hết livestream', isCorrect: false },
      { id: 4, text: 'Khi nào cũng được', isCorrect: false }
    ]
  }
];

const QuestionManagement = ({ language }: QuestionManagementProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('rule');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Handle file import
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedQuestions = JSON.parse(e.target?.result as string);
          setQuestions([...questions, ...importedQuestions]);
          toast({
            title: language === 'en' ? 'Success' : 'Thành công',
            description: language === 'en' ? 'Questions imported successfully' : 'Nhập câu hỏi thành công',
          });
        } catch (error) {
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
    const filteredQuestions = questions.filter(q => q.type === selectedType);
    const dataStr = JSON.stringify(filteredQuestions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `questions_${selectedType}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle search
  const filteredQuestions = questions.filter(question => 
    question.type === selectedType &&
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

  const handleSaveEdit = () => {
    if (editingQuestion) {
      setQuestions(questions.map(question => 
        question.id === editingQuestion.id ? editingQuestion : question
      ));
      setIsEditDialogOpen(false);
      setEditingQuestion(null);
      toast({
        title: language === 'en' ? 'Success' : 'Thành công',
        description: language === 'en' ? 'Question updated successfully' : 'Cập nhật thành công',
      });
    }
  };

  // Handle delete
  const handleDelete = (question: Question) => {
    setDeletingQuestion(question);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingQuestion) {
      setQuestions(questions.filter(question => question.id !== deletingQuestion.id));
      setIsDeleteDialogOpen(false);
      setDeletingQuestion(null);
      toast({
        title: language === 'en' ? 'Success' : 'Thành công',
        description: language === 'en' ? 'Question deleted successfully' : 'Xóa thành công',
      });
    }
  };

  // Handle add answer
  const handleAddAnswer = () => {
    if (editingQuestion) {
      const newAnswer: Answer = {
        id: Math.max(...editingQuestion.answers.map(a => a.id), 0) + 1,
        text: '',
        isCorrect: false
      };
      setEditingQuestion({
        ...editingQuestion,
        answers: [...editingQuestion.answers, newAnswer]
      });
    }
  };

  // Handle remove answer
  const handleRemoveAnswer = (answerId: number) => {
    if (editingQuestion) {
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
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t[language].selectType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rule">Rule</SelectItem>
                <SelectItem value="default">Default</SelectItem>
              </SelectContent>
            </Select>
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
          </div>
          <Button onClick={() => {
            setEditingQuestion({
              id: Math.max(...questions.map(q => q.id), 0) + 1,
              question: '',
              level: 1,
              type: selectedType,
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

        {/* Questions List */}
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
                  {editingQuestion?.answers.map((answer, index) => (
                    <div key={answer.id} className="flex items-center gap-2">
                      <Input
                        value={answer.text}
                        onChange={(e) => {
                          const newAnswers = [...editingQuestion.answers];
                          newAnswers[index] = { ...answer, text: e.target.value };
                          setEditingQuestion({ ...editingQuestion, answers: newAnswers });
                        }}
                        placeholder={`${t[language].answers} ${index + 1}`}
                      />
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={answer.isCorrect}
                          onCheckedChange={(checked) => {
                            const newAnswers = [...editingQuestion.answers];
                            newAnswers[index] = { ...answer, isCorrect: checked };
                            setEditingQuestion({ ...editingQuestion, answers: newAnswers });
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