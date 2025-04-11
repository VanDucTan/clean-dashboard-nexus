
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { QuestionType } from "@/types/question-type";
import QuestionTypesTable from "@/components/QuestionTypesTable";
import QuestionTypeForm from "@/components/QuestionTypeForm";
import DeleteConfirmation from "@/components/DeleteConfirmation";

// Sample initial data
const initialQuestionTypes: QuestionType[] = [
  {
    id: 1,
    name: "General Knowledge",
    template: "Default",
    team: "Science",
    title: "Basic Facts",
    link: "https://example.com/general",
  },
  {
    id: 2,
    name: "Mathematical Reasoning",
    template: "Rule",
    team: "Math",
    title: "Advanced Problem Solving",
    link: "https://example.com/math-reasoning",
  },
  {
    id: 3,
    name: "Vocabulary Test",
    template: "Default",
    team: "Language",
    title: "Word Definitions",
    link: "https://example.com/vocabulary",
  },
  {
    id: 4,
    name: "Programming Logic",
    template: "Rule",
    team: "Computer Science",
    title: "Coding Challenges",
    link: "https://example.com/programming",
  },
  {
    id: 5,
    name: "Historical Events",
    template: "Default",
    team: "History",
    title: "Timeline Analysis",
    link: "https://example.com/history",
  },
  {
    id: 6,
    name: "Scientific Method",
    template: "Rule",
    team: "Science",
    title: "Experiment Design",
    link: "https://example.com/scientific-method",
  },
  {
    id: 7,
    name: "Literary Analysis",
    template: "Default",
    team: "Literature",
    title: "Text Interpretation",
    link: "https://example.com/literary-analysis",
  },
  {
    id: 8,
    name: "Geographic Coordinates",
    template: "Rule",
    team: "Geography",
    title: "Map Reading",
    link: "https://example.com/geography",
  },
  {
    id: 9,
    name: "Art Appreciation",
    template: "Default",
    team: "Arts",
    title: "Style Recognition",
    link: "https://example.com/art",
  },
  {
    id: 10,
    name: "Music Theory",
    template: "Rule",
    team: "Music",
    title: "Composition Rules",
    link: "https://example.com/music",
  },
  {
    id: 11,
    name: "Physical Fitness",
    template: "Default",
    team: "Health",
    title: "Exercise Assessment",
    link: "https://example.com/fitness",
  },
  {
    id: 12,
    name: "Logical Reasoning",
    template: "Rule",
    team: "Philosophy",
    title: "Argument Analysis",
    link: "https://example.com/logic",
  },
];

const Index = () => {
  // State for question types data
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(() => {
    const savedData = localStorage.getItem("questionTypes");
    return savedData ? JSON.parse(savedData) : initialQuestionTypes;
  });

  // State for form dialog
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QuestionType | null>(null);

  // State for delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // Save question types to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("questionTypes", JSON.stringify(questionTypes));
  }, [questionTypes]);

  // Handle creating or updating a question type
  const handleSubmit = (data: QuestionType) => {
    if (editingItem) {
      // Update existing item
      setQuestionTypes(
        questionTypes.map((item) => (item.id === data.id ? data : item))
      );
      toast({
        title: "Question Type Updated",
        description: `"${data.name}" has been updated successfully.`,
      });
    } else {
      // Add new item
      setQuestionTypes([...questionTypes, data]);
      toast({
        title: "Question Type Created",
        description: `"${data.name}" has been created successfully.`,
      });
    }
    
    setIsFormOpen(false);
    setEditingItem(null);
  };

  // Handle edit button click
  const handleEdit = (item: QuestionType) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (id: number) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (itemToDelete !== null) {
      const itemName = questionTypes.find(item => item.id === itemToDelete)?.name;
      
      setQuestionTypes(questionTypes.filter((item) => item.id !== itemToDelete));
      
      toast({
        title: "Question Type Deleted",
        description: `"${itemName}" has been deleted successfully.`,
      });
      
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Question Types</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Question Type
        </Button>
      </div>

      <QuestionTypesTable
        questionTypes={questionTypes}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit" : "Create"} Question Type
            </DialogTitle>
          </DialogHeader>
          <QuestionTypeForm
            initialData={editingItem}
            onSubmit={handleSubmit}
            onCancel={handleFormCancel}
            existingIds={questionTypes.map(item => item.id)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmation
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={questionTypes.find(item => item.id === itemToDelete)?.name}
      />
    </div>
  );
};

export default Index;
