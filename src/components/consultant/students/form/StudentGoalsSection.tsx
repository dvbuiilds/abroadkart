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
import { Checkbox } from '@app/components/ui/checkbox';
import {
  TARGET_COUNTRY_OPTIONS,
  STUDY_LEVEL_OPTIONS,
  PREFERRED_INTAKE_OPTIONS,
  TARGET_YEAR_OPTIONS,
} from '@app/lib/students/options';
import type { StudentCreateInput } from '@app/lib/validations/student';

interface StudentGoalsSectionProps {
  form: UseFormReturn<StudentCreateInput>;
}

export function StudentGoalsSection({ form }: StudentGoalsSectionProps) {
  const selectedCountries = form.watch('targetCountries') || [];

  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-sm font-semibold text-foreground">Study Goals</h3>

      <FormField
        control={form.control}
        name="targetCountries"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target Countries</FormLabel>
            <div className="space-y-2">
              {TARGET_COUNTRY_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedCountries.includes(option.value)}
                    onCheckedChange={(checked) => {
                      const updated = checked
                        ? [...selectedCountries, option.value]
                        : selectedCountries.filter((c) => c !== option.value);
                      field.onChange(updated);
                    }}
                    id={`country-${option.value}`}
                  />
                  <label htmlFor={`country-${option.value}`} className="text-sm font-medium cursor-pointer">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="targetCourses"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target Courses (comma-separated)</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Master of Computer Science, Data Science"
                value={field.value?.join(', ') || ''}
                onChange={(e) => field.onChange(e.target.value.split(',').map((s) => s.trim()))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="studyLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Study Level</FormLabel>
              <Select value={field.value || ''} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {STUDY_LEVEL_OPTIONS.map((option) => (
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
          name="preferredIntake"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Intake</FormLabel>
              <Select value={field.value || ''} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select intake" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PREFERRED_INTAKE_OPTIONS.map((option) => (
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
      </div>

      <FormField
        control={form.control}
        name="targetYear"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target Year</FormLabel>
            <Select value={field.value || ''} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {TARGET_YEAR_OPTIONS.map((option) => (
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
    </div>
  );
}
