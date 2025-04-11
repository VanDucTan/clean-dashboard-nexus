
export type Template = "Default" | "Rule";

export interface QuestionType {
  id: number;
  name: string;
  template: Template;
  team: string;
  title: string;
  link: string;
}
