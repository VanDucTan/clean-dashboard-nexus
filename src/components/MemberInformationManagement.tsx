import React, { useEffect, useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Textarea } from "@/components/ui/textarea";

interface MemberInformationManagementProps {
  language: 'en' | 'vi';
}

interface MemberInformation {
  id: number;
  created_at: string;
  updated_at: string;
  join_date: string | null;
  email: string;
  full_name: string;
  phone_number: string;
  nlt_id: string | null;
  telegram_username: string | null;
  telegram_user_id: string | null;
  birth_date: string | null;
  sun_sign: string | null;
  moon_sign: string | null;
  ascending_sign: string | null;
  id_address: string | null;
  current_address: string | null;
  applied_position: string | null;
  team_join_date: string | null;
  is_official_member: boolean;
  official_member_date: string | null;
  team_position: string | null;
  team_id: number | null;
  feedback: string | null;
}

const t = {
  en: {
    addMember: "Add Member",
    fullName: "Full Name",
    email: "Email",
    phoneNumber: "Phone Number",
    position: "Position",
    department: "Department",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    confirmDelete: "Confirm Delete",
    deleteConfirmation: "Are you sure you want to delete this member?",
    yes: "Yes",
    no: "No",
    showing: "Showing",
    of: "of",
    perPage: "per page",
    noMembers: "No members found",
    required: "This field is required",
    invalidEmail: "Invalid email address",
    invalidPhone: "Invalid phone number",
    joinDate: "Join Date",
    nltId: "NLT ID",
    telegramUsername: "Telegram Username",
    birthDate: "Birth Date",
    zodiac: "Zodiac",
    idAddress: "ID Address",
    currentAddress: "Current Address",
    appliedPosition: "Applied Position",
    teamJoinDate: "Team Join Date",
    officialMember: "Official Member",
    teamPosition: "Team Position",
    teamId: "Team ID",
    feedback: "Feedback",
    telegramUserId: "Telegram User ID",
    sunSign: "Sun Sign",
    moonSign: "Moon Sign",
    ascendingSign: "Ascending Sign",
    officialMemberDate: "Official Member Date",
    zodiacSigns: "Zodiac Signs",
    personalInfo: "Personal Information",
    contactInfo: "Contact Information",
    teamInfo: "Team Information",
    addresses: "Addresses",
  },
  vi: {
    addMember: "Thêm thành viên",
    fullName: "Họ và tên",
    email: "Email",
    phoneNumber: "Số điện thoại",
    position: "Chức vụ",
    department: "Phòng ban",
    actions: "Thao tác",
    edit: "Sửa",
    delete: "Xóa",
    save: "Lưu",
    cancel: "Hủy",
    confirmDelete: "Xác nhận xóa",
    deleteConfirmation: "Bạn có chắc chắn muốn xóa thành viên này?",
    yes: "Có",
    no: "Không",
    showing: "Hiển thị",
    of: "của",
    perPage: "mỗi trang",
    noMembers: "Không tìm thấy thành viên nào",
    required: "Trường này là bắt buộc",
    invalidEmail: "Địa chỉ email không hợp lệ",
    invalidPhone: "Số điện thoại không hợp lệ",
    joinDate: "Ngày tham gia",
    nltId: "Mã NLT",
    telegramUsername: "Tên Telegram",
    birthDate: "Ngày sinh",
    zodiac: "Cung hoàng đạo",
    idAddress: "Địa chỉ thường trú",
    currentAddress: "Địa chỉ hiện tại",
    appliedPosition: "Vị trí ứng tuyển",
    teamJoinDate: "Ngày vào team",
    officialMember: "Thành viên chính thức",
    teamPosition: "Vị trí trong team",
    teamId: "Mã team",
    feedback: "Phản hồi",
    telegramUserId: "User ID (Telegram)",
    sunSign: "Cung Mặt Trời",
    moonSign: "Cung Mặt Trăng",
    ascendingSign: "Cung Mọc",
    officialMemberDate: "Ngày trở thành thành viên chính thức",
    zodiacSigns: "Cung hoàng đạo",
    personalInfo: "Thông tin cá nhân",
    contactInfo: "Thông tin liên hệ",
    teamInfo: "Thông tin Team",
    addresses: "Địa chỉ",
  }
};

const MemberInformationManagement: React.FC<MemberInformationManagementProps> = ({ language }) => {
  const [members, setMembers] = useState<MemberInformation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberInformation | null>(null);
  const [deletingMember, setDeletingMember] = useState<MemberInformation | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate pagination
  const totalPages = Math.ceil(members.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedMembers = members.slice(startIndex, endIndex);

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching members...'); // Debug log
      const { data, error } = await supabase
        .from('member_information')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error); // Debug log
        throw error;
      }

      console.log('Fetched data:', data); // Debug log
      if (data) {
        setMembers(data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error(language === 'en' ? 'Failed to fetch members' : 'Không thể tải danh sách thành viên');
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  // Set up real-time subscription
  useEffect(() => {
    console.log('Setting up subscription...'); // Debug log
    
    const channel = supabase
      .channel('member_information_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'member_information'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          fetchMembers();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status); // Debug log
      });

    // Initial fetch
    fetchMembers();

    // Cleanup subscription
    return () => {
      console.log('Cleaning up subscription...'); // Debug log
      channel.unsubscribe();
    };
  }, [fetchMembers]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!editingMember?.full_name?.trim()) {
      newErrors.fullName = t[language].required;
    }
    
    if (!editingMember?.email?.trim()) {
      newErrors.email = t[language].required;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(editingMember.email)) {
      newErrors.email = t[language].invalidEmail;
    }
    
    if (!editingMember?.phone_number?.trim()) {
      newErrors.phoneNumber = t[language].required;
    } else if (!/^[0-9]{10,}$/.test(editingMember.phone_number)) {
      newErrors.phoneNumber = t[language].invalidPhone;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = (member: MemberInformation) => {
    setErrors({});
    setEditingMember(member);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMember) return;
    
    if (!validateForm()) {
      return;
    }

    try {
      const isNewMember = editingMember.id === 0;
      const now = new Date().toISOString();
      
      const memberData = {
        full_name: editingMember.full_name,
        email: editingMember.email.toLowerCase(),
        phone_number: editingMember.phone_number,
        nlt_id: editingMember.nlt_id || null,
        telegram_username: editingMember.telegram_username || null,
        telegram_user_id: editingMember.telegram_user_id || null,
        birth_date: editingMember.birth_date || null,
        sun_sign: editingMember.sun_sign || null,
        moon_sign: editingMember.moon_sign || null,
        ascending_sign: editingMember.ascending_sign || null,
        id_address: editingMember.id_address || null,
        current_address: editingMember.current_address || null,
        applied_position: editingMember.applied_position || null,
        team_join_date: editingMember.team_join_date || null,
        is_official_member: editingMember.is_official_member || false,
        official_member_date: editingMember.official_member_date || null,
        team_position: editingMember.team_position || null,
        team_id: editingMember.team_id || null,
        feedback: editingMember.feedback || null,
        join_date: editingMember.join_date || null,
        updated_at: now,
        ...(isNewMember && { created_at: now })
      };

      if (isNewMember) {
        const { error } = await supabase
          .from('member_information')
          .insert([memberData]);

        if (error) throw error;
        toast.success(language === 'en' ? 'Member added successfully' : 'Thêm thành viên thành công');
      } else {
        const { error } = await supabase
          .from('member_information')
          .update(memberData)
          .eq('id', editingMember.id);

        if (error) throw error;
        toast.success(language === 'en' ? 'Member updated successfully' : 'Cập nhật thành viên thành công');
      }

      setIsEditDialogOpen(false);
      await fetchMembers();
    } catch (error) {
      console.error('Error saving member:', error);
      toast.error(language === 'en' ? 'Failed to save member' : 'Không thể lưu thông tin thành viên');
    }
  };

  const handleDeleteClick = (member: MemberInformation) => {
    setDeletingMember(member);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingMember) return;

    try {
      const { error } = await supabase
        .from('member_information')
        .delete()
        .eq('id', deletingMember.id);

      if (error) throw error;

      setIsDeleteDialogOpen(false);
      toast.success(language === 'en' ? 'Member deleted successfully' : 'Xóa thành viên thành công');
      await fetchMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error(language === 'en' ? 'Failed to delete member' : 'Không thể xóa thành viên');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">
          {language === 'en' ? 'Member Information' : 'Thông tin thành viên'}
        </h2>
        <Button onClick={() => handleEdit({ id: 0 } as MemberInformation)}>
          <Plus className="mr-2 h-4 w-4" />
          {t[language].addMember}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">{t[language].joinDate}</TableHead>
              <TableHead className="whitespace-nowrap">{t[language].fullName}</TableHead>
              <TableHead className="whitespace-nowrap">{t[language].email}</TableHead>
              <TableHead className="whitespace-nowrap">{t[language].phoneNumber}</TableHead>
              <TableHead className="whitespace-nowrap">{t[language].nltId}</TableHead>
              <TableHead className="whitespace-nowrap">{t[language].telegramUsername}</TableHead>
              <TableHead className="whitespace-nowrap">{t[language].teamPosition}</TableHead>
              <TableHead className="whitespace-nowrap">{t[language].officialMember}</TableHead>
              <TableHead className="whitespace-nowrap text-right">{t[language].actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10">
                  {t[language].noMembers}
                </TableCell>
              </TableRow>
            ) : (
              paginatedMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="whitespace-nowrap">
                    {member.join_date ? new Date(member.join_date).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{member.full_name}</TableCell>
                  <TableCell className="whitespace-nowrap">{member.email}</TableCell>
                  <TableCell className="whitespace-nowrap">{member.phone_number}</TableCell>
                  <TableCell className="whitespace-nowrap">{member.nlt_id || '-'}</TableCell>
                  <TableCell className="whitespace-nowrap">{member.telegram_username || '-'}</TableCell>
                  <TableCell className="whitespace-nowrap">{member.team_position || '-'}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {member.is_official_member ? t[language].yes : t[language].no}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(member)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(member)}>
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
            {Math.min(currentPage * rowsPerPage, members.length)} {t[language].of} {members.length}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMember?.id === 0 ? t[language].addMember : t[language].edit}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">{t[language].contactInfo}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="full_name">
                    {t[language].fullName} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    value={editingMember?.full_name || ''}
                    onChange={(e) => setEditingMember({ ...editingMember!, full_name: e.target.value })}
                    className={errors.fullName ? "border-red-500" : ""}
                  />
                  {errors.fullName && (
                    <span className="text-sm text-red-500">{errors.fullName}</span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">
                    {t[language].email} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={editingMember?.email || ''}
                    onChange={(e) => setEditingMember({ ...editingMember!, email: e.target.value })}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <span className="text-sm text-red-500">{errors.email}</span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone_number">
                    {t[language].phoneNumber} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone_number"
                    value={editingMember?.phone_number || ''}
                    onChange={(e) => setEditingMember({ ...editingMember!, phone_number: e.target.value })}
                    className={errors.phoneNumber ? "border-red-500" : ""}
                  />
                  {errors.phoneNumber && (
                    <span className="text-sm text-red-500">{errors.phoneNumber}</span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="nlt_id">{t[language].nltId}</Label>
                  <Input
                    id="nlt_id"
                    value={editingMember?.nlt_id || ''}
                    onChange={(e) => setEditingMember({ ...editingMember!, nlt_id: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Telegram Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Telegram</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="telegram_username">{t[language].telegramUsername}</Label>
                  <Input
                    id="telegram_username"
                    value={editingMember?.telegram_username || ''}
                    onChange={(e) => setEditingMember({ ...editingMember!, telegram_username: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="telegram_user_id">{t[language].telegramUserId}</Label>
                  <Input
                    id="telegram_user_id"
                    value={editingMember?.telegram_user_id || ''}
                    onChange={(e) => setEditingMember({ ...editingMember!, telegram_user_id: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">{t[language].personalInfo}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="birth_date">{t[language].birthDate}</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={editingMember?.birth_date?.split('T')[0] || ''}
                    onChange={(e) => setEditingMember({ ...editingMember!, birth_date: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="join_date">{t[language].joinDate}</Label>
                  <Input
                    id="join_date"
                    type="date"
                    value={editingMember?.join_date?.split('T')[0] || ''}
                    onChange={(e) => setEditingMember({ ...editingMember!, join_date: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Zodiac Signs */}
            <div>
              <h3 className="text-lg font-medium mb-4">{t[language].zodiacSigns}</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sun_sign">{t[language].sunSign}</Label>
                  <Input
                    id="sun_sign"
                    value={editingMember?.sun_sign || ''}
                    onChange={(e) => setEditingMember({ ...editingMember!, sun_sign: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="moon_sign">{t[language].moonSign}</Label>
                  <Input
                    id="moon_sign"
                    value={editingMember?.moon_sign || ''}
                    onChange={(e) => setEditingMember({ ...editingMember!, moon_sign: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ascending_sign">{t[language].ascendingSign}</Label>
                  <Input
                    id="ascending_sign"
                    value={editingMember?.ascending_sign || ''}
                    onChange={(e) => setEditingMember({ ...editingMember!, ascending_sign: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div>
              <h3 className="text-lg font-medium mb-4">{t[language].addresses}</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="id_address">{t[language].idAddress}</Label>
                  <Input
                    id="id_address"
                    value={editingMember?.id_address || ''}
                    onChange={(e) => setEditingMember({ ...editingMember!, id_address: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="current_address">{t[language].currentAddress}</Label>
                  <Input
                    id="current_address"
                    value={editingMember?.current_address || ''}
                    onChange={(e) => setEditingMember({ ...editingMember!, current_address: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Team Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">{t[language].teamInfo}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="applied_position">{t[language].appliedPosition}</Label>
                  <Input
                    id="applied_position"
                    value={editingMember?.applied_position || ''}
                    onChange={(e) => setEditingMember({ ...editingMember!, applied_position: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="team_join_date">{t[language].teamJoinDate}</Label>
                  <Input
                    id="team_join_date"
                    type="date"
                    value={editingMember?.team_join_date?.split('T')[0] || ''}
                    onChange={(e) => setEditingMember({ ...editingMember!, team_join_date: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>{t[language].officialMember}</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="official_yes"
                        checked={editingMember?.is_official_member === true}
                        onChange={() => setEditingMember({ ...editingMember!, is_official_member: true })}
                      />
                      <Label htmlFor="official_yes">{t[language].yes}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="official_no"
                        checked={editingMember?.is_official_member === false}
                        onChange={() => setEditingMember({ ...editingMember!, is_official_member: false })}
                      />
                      <Label htmlFor="official_no">{t[language].no}</Label>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="official_member_date">{t[language].officialMemberDate}</Label>
                  <Input
                    id="official_member_date"
                    type="date"
                    value={editingMember?.official_member_date?.split('T')[0] || ''}
                    onChange={(e) => setEditingMember({ ...editingMember!, official_member_date: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="team_position">{t[language].teamPosition}</Label>
                  <Input
                    id="team_position"
                    value={editingMember?.team_position || ''}
                    onChange={(e) => setEditingMember({ ...editingMember!, team_position: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="team_id">{t[language].teamId}</Label>
                  <Input
                    id="team_id"
                    type="number"
                    value={editingMember?.team_id || ''}
                    onChange={(e) => setEditingMember({ ...editingMember!, team_id: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div>
              <Label htmlFor="feedback">{t[language].feedback}</Label>
              <Textarea
                id="feedback"
                value={editingMember?.feedback || ''}
                onChange={(e) => setEditingMember({ ...editingMember!, feedback: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t[language].cancel}
            </Button>
            <Button onClick={handleSaveEdit}>
              {t[language].save}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t[language].confirmDelete}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{t[language].deleteConfirmation}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t[language].cancel}
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              {t[language].delete}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberInformationManagement;