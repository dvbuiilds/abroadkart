import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@app/components/ui/form';
import { Input } from '@app/components/ui/input';
import { Checkbox } from '@app/components/ui/checkbox';
import { TARGET_COUNTRY_OPTIONS } from '@app/lib/students/options';
import type { StudentCreateInput } from '@app/lib/validations/student';

interface StudentVisaSectionProps {
  form: UseFormReturn<StudentCreateInput>;
}

export function StudentVisaSection({ form }: StudentVisaSectionProps) {
  const selectedRefusalCountries = form.watch('refusalCountries') || [];

  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-sm font-semibold text-foreground">Visa & Travel History</h3>

      <FormField
        control={form.control}
        name="priorVisaRefusals"
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <Checkbox checked={field.value || false} onCheckedChange={field.onChange} id="priorVisaRefusals" />
            </FormControl>
            <label htmlFor="priorVisaRefusals" className="text-sm font-medium cursor-pointer">
              Prior Visa Refusals
            </label>
          </FormItem>
        )}
      />

      {form.watch('priorVisaRefusals') && (
        <>
          <FormField
            control={form.control}
            name="refusalCountries"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Refusal Countries</FormLabel>
                <div className="space-y-2">
                  {TARGET_COUNTRY_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedRefusalCountries.includes(option.value)}
                        onCheckedChange={(checked) => {
                          const updated = checked
                            ? [...selectedRefusalCountries, option.value]
                            : selectedRefusalCountries.filter((c) => c !== option.value);
                          field.onChange(updated);
                        }}
                        id={`refusal-${option.value}`}
                      />
                      <label htmlFor={`refusal-${option.value}`} className="text-sm font-medium cursor-pointer">
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
            name="refusalReason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason for Refusal</FormLabel>
                <FormControl>
                  <textarea
                    placeholder="Explain the reason for visa refusal..."
                    className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      <FormField
        control={form.control}
        name="passportAvailable"
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <Checkbox checked={field.value || false} onCheckedChange={field.onChange} id="passportAvailable" />
            </FormControl>
            <label htmlFor="passportAvailable" className="text-sm font-medium cursor-pointer">
              Passport Available
            </label>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="passportExpiry"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Passport Expiry Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} value={field.value ? field.value.toISOString().split('T')[0] : ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
