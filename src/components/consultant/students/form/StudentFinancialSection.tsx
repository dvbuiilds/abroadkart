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
import { FUNDING_TYPE_OPTIONS } from '@app/lib/students/options';
import type { StudentCreateInput } from '@app/lib/validations/student';

interface StudentFinancialSectionProps {
  form: UseFormReturn<StudentCreateInput>;
}

export function StudentFinancialSection({ form }: StudentFinancialSectionProps) {
  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-sm font-semibold text-foreground">Financial Profile</h3>

      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="budgetTuition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tuition Budget</FormLabel>
              <FormControl>
                <Input type="number" placeholder="25000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="budgetLiving"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Living Expenses</FormLabel>
              <FormControl>
                <Input type="number" placeholder="15000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="budgetCurrency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <Input placeholder="USD" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="fundingType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Funding Type</FormLabel>
            <Select value={field.value || ''} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select funding type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {FUNDING_TYPE_OPTIONS.map((option) => (
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
        name="loanPreApproved"
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <Checkbox checked={field.value || false} onCheckedChange={field.onChange} id="loanPreApproved" />
            </FormControl>
            <label htmlFor="loanPreApproved" className="text-sm font-medium cursor-pointer">
              Pre-approved for Education Loan
            </label>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="parentMonthlyIncome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Parent Monthly Income (Optional)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="75000" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
