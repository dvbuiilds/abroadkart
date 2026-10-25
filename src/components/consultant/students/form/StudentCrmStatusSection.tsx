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
import { STAGE_OPTIONS, PRIORITY_OPTIONS } from '@app/lib/students/options';
import type { StudentCreateInput } from '@app/lib/validations/student';

interface StudentCrmStatusSectionProps {
  form: UseFormReturn<StudentCreateInput>;
}

export function StudentCrmStatusSection({ form }: StudentCrmStatusSectionProps) {
  const currentStage = form.watch('currentStage');

  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-sm font-semibold text-foreground">CRM Status</h3>

      <FormField
        control={form.control}
        name="currentStage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Current Stage</FormLabel>
            <Select value={field.value || ''} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {STAGE_OPTIONS.map((option) => (
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
        name="priority"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Priority</FormLabel>
            <Select value={field.value || ''} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {PRIORITY_OPTIONS.map((option) => (
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
        name="assignedCounsellor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Assigned Counsellor</FormLabel>
            <FormControl>
              <Input placeholder="Counsellor ID (UUID)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {currentStage === 'lost' && (
        <FormField
          control={form.control}
          name="lostReason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Lost</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Budget constraints, accepted elsewhere" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
