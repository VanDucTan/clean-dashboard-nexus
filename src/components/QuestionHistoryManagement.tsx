import React, { useState, useEffect } from 'react';
import { Search } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomPagination from "@/components/ui/custom-pagination";
import { Badge } from "@/components/ui/badge";

interface QuestionHistoryManagementProps {
  language: 'en' | 'vi';
}

interface TestHistory {
  id: number;
  date_test: string;
  email: string;
  full_name: string;
  result: 'passed' | 'failed';
  correct_answers: number;
  total_questions: number;
  assessment_type: string;
  created_at: string;
  updated_at: string;
}

const QuestionHistoryManagement = ({ language }: QuestionHistoryManagementProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('rule');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [historyData, setHistoryData] = useState<TestHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Calculate pagination values
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        // First get the total count
        const { count, error: countError } = await supabase
          .from('test_history')
          .select('*', { count: 'exact', head: true })
          .eq('assessment_type', selectedType)
          .ilike('email', `%${searchQuery}%`);

        if (countError) {
          console.error('Error fetching count:', countError);
        } else {
          setTotalCount(count || 0);
        }

        // Then get the paginated data
        const { data, error } = await supabase
          .from('test_history')
          .select('*')
          .eq('assessment_type', selectedType)
          .ilike('email', `%${searchQuery}%`)
          .order('date_test', { ascending: false })
          .range(indexOfFirstItem, indexOfLastItem - 1);

        if (error) {
          console.error('Error fetching history:', error);
          toast.error(language === 'en' ? 'Failed to load test history' : 'Không thể tải lịch sử bài thi');
        } else {
          setHistoryData(data || []);
        }
      } catch (err) {
        console.error('Error in fetchHistory:', err);
        toast.error(language === 'en' ? 'Failed to load test history' : 'Không thể tải lịch sử bài thi');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [language, currentPage, rowsPerPage, indexOfFirstItem, indexOfLastItem, selectedType, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(totalCount / rowsPerPage);

  // Translations
  const t = {
    en: {
      pageTitle: "History of tests",
      search: "Search by email",
      dateTest: "Date Test",
      email: "Email",
      fullName: "Full Name",
      result: "Result",
      correctAnswers: "Number Of Correct Answers",
      assessmentType: "Assessment Type",
      passed: "Passed",
      failed: "Failed",
      import: "Import",
      export: "Export",
      selectType: "Select assessment type",
      showing: "Showing",
      of: "of",
      perPage: "per page",
      rowsPerPage: "Rows per page"
    },
    vi: {
      pageTitle: "Lịch sử làm bài",
      search: "Tìm kiếm theo email",
      dateTest: "Ngày thi",
      email: "Email",
      fullName: "Họ và tên",
      result: "Kết quả",
      correctAnswers: "Số câu đúng",
      assessmentType: "Loại bài thi",
      passed: "Đạt",
      failed: "Không đạt",
      import: "Nhập",
      export: "Xuất",
      selectType: "Chọn loại bài thi",
      showing: "Hiển thị",
      of: "trong số",
      perPage: "mỗi trang",
      rowsPerPage: "Hàng mỗi trang"
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t[language].pageTitle}</h1>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t[language].search}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t[language].selectType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rule">Rule</SelectItem>
                <SelectItem value="default">Default</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* History Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">{t[language].dateTest}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].email}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].fullName}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].result}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].correctAnswers}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].assessmentType}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    {language === 'en' ? 'Loading...' : 'Đang tải...'}
                  </TableCell>
                </TableRow>
              ) : historyData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    {language === 'en' ? 'No records found' : 'Không tìm thấy dữ liệu'}
                  </TableCell>
                </TableRow>
              ) : (
                historyData.map((history) => (
                  <TableRow key={history.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(history.date_test).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="whitespace-nowrap max-w-[200px] truncate">
                      {history.email}
                    </TableCell>
                    <TableCell className="whitespace-nowrap max-w-[200px] truncate">
                      {history.full_name}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={history.result === 'passed' ? 'default' : 'destructive'}
                      >
                        {history.result === 'passed' ? t[language].passed : t[language].failed}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {history.correct_answers}/{history.total_questions}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{history.assessment_type}</TableCell>
                  </TableRow>
                ))
              )}
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
              {Math.min(currentPage * rowsPerPage, totalCount)} {t[language].of}{" "}
              {totalCount}
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
    </div>
  );
};

export default QuestionHistoryManagement;