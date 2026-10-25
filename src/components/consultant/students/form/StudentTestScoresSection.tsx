import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@app/components/ui/form';
import { Input } from '@app/components/ui/input';
import type { StudentCreateInput } from '@app/lib/validations/student';

interface StudentTestScoresSectionProps {
  form: UseFormReturn<StudentCreateInput>;
}

export function StudentTestScoresSection({ form }: StudentTestScoresSectionProps) {
  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-sm font-semibold text-foreground">Test Scores</h3>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="ieltsScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IELTS</FormLabel>
              <FormControl>
                <Input type="number" step="0.5" placeholder="7.0" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="toeflScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>TOEFL</FormLabel>
              <FormControl>
                <Input type="number" placeholder="100" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pteScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PTE</FormLabel>
              <FormControl>
                <Input type="number" placeholder="70" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duolingoScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duolingo</FormLabel>
              <FormControl>
                <Input type="number" placeholder="110" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="greScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GRE</FormLabel>
              <FormControl>
                <Input type="number" placeholder="320" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gmatScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GMAT</FormLabel>
              <FormControl>
                <Input type="number" placeholder="700" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="satScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SAT</FormLabel>
              <FormControl>
                <Input type="number" placeholder="1500" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="actScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ACT</FormLabel>
              <FormControl>
                <Input type="number" placeholder="36" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="testAppearingDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Appearing Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value ? field.value.toISOString().split('T')[0] : ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="finalScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Final Score</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder="8.5" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
