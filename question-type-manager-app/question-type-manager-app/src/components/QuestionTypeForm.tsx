
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuestionType } from "@/types/question-type";

// Form validation schema
const formSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  template: z.enum(["Default", "Rule"]),
  team: z.string().optional(),
  title: z.string().optional(),
  link: z.string().url("Link must be a valid URL"),
});

type FormValues = z.infer<typeof formSchema>;

interface QuestionTypeFormProps {
  initialData?: QuestionType | null;
  onSubmit: (data: QuestionType) => void;
  onCancel: () => void;
  existingIds: number[];
}

const QuestionTypeForm: React.FC<QuestionTypeFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  existingIds,
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      template: "Default",
      team: "",
      title: "",
      link: "",
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({
        name: "",
        template: "Default",
        team: "",
        title: "",
        link: "",
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values: FormValues) => {
    // Generate a new ID if it doesn't exist (for new items)
    if (!values.id) {
      // Find the maximum existing ID and add 1
      const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
      values.id = maxId + 1;
    }
    
    onSubmit(values as QuestionType);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="template"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Default">Default</SelectItem>
                  <SelectItem value="Rule">Rule</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="team"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Update" : "Create"} Question Type
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QuestionTypeForm;
