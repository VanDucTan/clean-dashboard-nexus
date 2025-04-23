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
  result: string;
  correct_answers: number;
  total_questions: number;
  type_id: number;
  question_type_title?: string;
  created_at: string;
  updated_at: string;
}

interface QuestionType {
  id: number;
  name: string;
  template: string;
  team: string;
  title: string;
}

const QuestionHistoryManagement = ({ language }: QuestionHistoryManagementProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [historyData, setHistoryData] = useState<TestHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);

  // Calculate pagination values
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;

  // Fetch question types
  useEffect(() => {
    const fetchQuestionTypes = async () => {
      try {
        console.log('Fetching question types...');
        const { data, error } = await supabase
          .from('question_type')
          .select('id, name, template, team, title')
          .order('title');

        if (error) {
          console.error('Error fetching question types:', error);
          throw error;
        }
        
        console.log('Fetched question types:', data);
        setQuestionTypes(data || []);
        // Set default selected type if none is selected
        if (!selectedType && data && data.length > 0) {
          console.log('Setting default question type:', data[0].id);
          setSelectedType(data[0].id);
        }
      } catch (error) {
        console.error('Detailed error fetching question types:', error);
        toast.error(language === 'en' ? 'Failed to load question types' : 'Không thể tải loại câu hỏi');
      }
    };

    fetchQuestionTypes();
  }, []);

  // Sửa lại phần useEffect cho realtime subscription
  useEffect(() => {
    if (!selectedType) {
      console.log('No type selected, skipping subscription...');
      return;
    }

    console.log('Setting up realtime subscription...');
    const channel = supabase
      .channel('test_history_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'test_history',
        },
        async (payload) => {
          console.log('Change received:', payload);
          
          try {
            // Fetch lại tổng số records
            const { count, error: countError } = await supabase
              .from('test_history')
              .select('*', { count: 'exact', head: true })
              .eq('type_id', selectedType)
              .ilike('email', `%${searchQuery}%`);

            if (countError) {
              console.error('Error fetching count in subscription:', countError);
              throw countError;
            }

            console.log('Updated total count:', count);
            if (count !== null) {
              setTotalCount(count);
            }

            // Fetch lại data cho trang hiện tại
            console.log('Fetching updated data...');
            const { data, error } = await supabase
              .from('test_history')
              .select(`
                *,
                question_type!inner (
                  id,
                  title
                )
              `)
              .eq('type_id', selectedType)
              .ilike('email', `%${searchQuery}%`)
              .order('created_at', { ascending: false })
              .range(indexOfFirstItem, indexOfLastItem - 1);

            if (error) {
              console.error('Error fetching data in subscription:', error);
              throw error;
            }

            console.log('Fetched updated data:', data);

            if (data) {
              const mappedData = data.map(item => ({
                ...item,
                question_type_title: item.question_type?.title || 'Unknown'
              }));

              console.log('Mapped updated data:', mappedData);
              setHistoryData(mappedData);
              toast.success(
                language === 'en' 
                  ? 'Test history updated successfully'
                  : 'Dữ liệu đã được cập nhật'
              );
            }
          } catch (error) {
            console.error('Error in subscription handler:', error);
            if (error instanceof Error) {
              console.error('Error message:', error.message);
              console.error('Error stack:', error.stack);
            }
            toast.error(
              language === 'en'
                ? 'Failed to update test history'
                : 'Không thể cập nhật dữ liệu'
            );
          }
        }
      );

    channel.subscribe((status) => {
      console.log('Subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to test_history changes');
      }
    });

    return () => {
      console.log('Cleaning up subscription...');
      supabase.removeChannel(channel);
    };
  }, [selectedType, searchQuery, indexOfFirstItem, indexOfLastItem, language]);

  // Separate useEffect for initial data fetching
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching history with params:', {
          selectedType,
          searchQuery,
          indexOfFirstItem,
          indexOfLastItem,
          currentPage,
          rowsPerPage
        });

        // Get the total count first
        const { count, error: countError } = await supabase
          .from('test_history')
          .select('*', { count: 'exact', head: true })
          .eq('type_id', selectedType)
          .ilike('email', `%${searchQuery}%`);

        if (countError) {
          console.error('Error fetching count:', countError);
          throw countError;
        }

        console.log('Total count:', count);
        setTotalCount(count || 0);

        // Then fetch the paginated data
        console.log('Fetching paginated data...');
        const { data, error } = await supabase
          .from('test_history')
          .select(`
            *,
            question_type!inner (
              id,
              title
            )
          `)
          .eq('type_id', selectedType)
          .ilike('email', `%${searchQuery}%`)
          .order('created_at', { ascending: false })
          .range(indexOfFirstItem, indexOfLastItem - 1);

        if (error) {
          console.error('Error fetching data:', error);
          throw error;
        }

        console.log('Fetched data:', data);

        // Map the data to include the question type title
        const mappedData = data.map(item => ({
          ...item,
          question_type_title: item.question_type?.title || 'Unknown'
        }));

        console.log('Mapped data:', mappedData);
        setHistoryData(mappedData);

      } catch (error) {
        console.error('Detailed error in fetchHistory:', error);
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
        toast.error(
          language === 'en' 
            ? 'Failed to load test history' 
            : 'Không thể tải lịch sử bài thi'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedType) {
      console.log('Initiating fetch history...');
      fetchHistory();
    } else {
      console.log('No type selected, skipping fetch...');
    }
  }, [language, currentPage, rowsPerPage, selectedType, searchQuery, indexOfFirstItem, indexOfLastItem]);

  // Format date function
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

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
      questionType: "Question Type",
      passed: "Passed",
      failed: "Failed",
      import: "Import",
      export: "Export",
      selectType: "Select question type",
      showing: "Showing",
      of: "of",
      perPage: "per page",
      rowsPerPage: "Rows per page",
      createdAt: "Created At",
      updatedAt: "Updated At"
    },
    vi: {
      pageTitle: "Lịch sử làm bài",
      search: "Tìm kiếm theo email",
      dateTest: "Ngày thi",
      email: "Email",
      fullName: "Họ và tên",
      result: "Kết quả",
      correctAnswers: "Số câu đúng",
      questionType: "Loại câu hỏi",
      passed: "Đạt",
      failed: "Không đạt",
      import: "Nhập",
      export: "Xuất",
      selectType: "Chọn loại câu hỏi",
      showing: "Hiển thị",
      of: "trong số",
      perPage: "mỗi trang",
      rowsPerPage: "Hàng mỗi trang",
      createdAt: "Ngày tạo",
      updatedAt: "Ngày cập nhật"
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
            <Select 
              value={selectedType?.toString() || ''} 
              onValueChange={(value) => setSelectedType(Number(value))}
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
                <TableHead className="whitespace-nowrap">{t[language].questionType}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].createdAt}</TableHead>
                <TableHead className="whitespace-nowrap">{t[language].updatedAt}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    {language === 'en' ? 'Loading...' : 'Đang tải...'}
                  </TableCell>
                </TableRow>
              ) : historyData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    {language === 'en' ? 'No records found' : 'Không tìm thấy dữ liệu'}
                  </TableCell>
                </TableRow>
              ) : (
                historyData.map((history) => (
                  <TableRow key={history.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(history.date_test)}
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
                    <TableCell className="whitespace-nowrap">{history.question_type_title}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(history.created_at)}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(history.updated_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end">
          <CustomPagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalCount / rowsPerPage)}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={setRowsPerPage}
            totalItems={totalCount}
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