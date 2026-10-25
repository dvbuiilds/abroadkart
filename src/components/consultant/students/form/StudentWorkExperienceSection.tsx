import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@app/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';
import { Input } from '@app/components/ui/input';
import { WORK_EXPERIENCE_OPTIONS } from '@app/lib/students/options';
import type { StudentCreateInput } from '@app/lib/validations/student';

interface StudentWorkExperienceSectionProps {
  form: UseFormReturn<StudentCreateInput>;
}

export function StudentWorkExperienceSection({ form }: StudentWorkExperienceSectionProps) {
  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-sm font-semibold text-foreground">Work Experience</h3>

      <FormField
        control={form.control}
        name="workExperience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Years of Experience</FormLabel>
            <Select value={field.value || ''} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {WORK_EXPERIENCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="employer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Employer</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Infosys" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="designation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Designation</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Software Engineer" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="gapExplanation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Employment Gap Explanation</FormLabel>
            <FormControl>
              <textarea
                placeholder="Explain any gaps in employment..."
                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
