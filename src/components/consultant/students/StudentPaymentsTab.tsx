import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  paymentCreateSchema,
  type PaymentCreateInput,
} from "@app/lib/validations/payment";
import {
  FEE_TYPE_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  CURRENCY_OPTIONS,
  feeTypeLabelMap,
  paymentStatusLabelMap,
  paymentMethodLabelMap,
  currencyLabelMap,
} from "@app/lib/payments/options";
import { Card, CardContent, CardHeader } from "@app/components/ui/card";
import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@app/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { Input } from "@app/components/ui/input";
import type { PaymentListItem } from "@app/graphql/types";
import { format } from "date-fns";
import { Plus, DollarSign } from "lucide-react";

const PAYMENT_STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "success" | "warning" | "destructive"
> = {
  pending: "warning",
  partial: "outline",
  paid: "success",
};

export function StudentPaymentsTab({
  payments,
  studentId,
  onLogClick,
}: {
  payments?: PaymentListItem[];
  studentId: string;
  onLogClick?: () => void;
}) {
  const list = payments ?? [];
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PaymentCreateInput>({
    resolver: zodResolver(paymentCreateSchema),
    defaultValues: {
      studentId,
      feeType: "consultationFee",
      currency: "INR",
      paymentStatus: "pending",
      amount: 0,
      paymentDate: new Date(),
    },
  });

  const onSubmit = async (data: PaymentCreateInput) => {
    setIsSubmitting(true);
    try {
      console.log("Would submit payment:", data);
      form.reset({
        studentId,
        feeType: "consultationFee",
        currency: "INR",
        paymentStatus: "pending",
        amount: 0,
        paymentDate: new Date(),
      });
      setShowForm(false);
      onLogClick?.();
    } catch (error) {
      console.error(error);
      form.setError("root", { message: "Failed to log payment" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPaid = list
    .filter((p) => p.paymentStatus === "paid")
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);

  const totalPending = list
    .filter((p) => p.paymentStatus !== "paid")
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {list.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground mb-1">Total Entries</p>
              <p className="text-2xl font-bold">{list.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground mb-1">Pending/Partial</p>
              <p className="text-2xl font-bold text-orange-600">₹{totalPending.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground mb-1">Avg Transaction</p>
              <p className="text-2xl font-bold">
                ₹{list.length > 0 ? Math.round(list.reduce((sum, p) => sum + (p.amount ?? 0), 0) / list.length).toLocaleString() : 0}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Log Form */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Log Payment</h3>
            <Button
              size="sm"
              variant={showForm ? "outline" : "default"}
              onClick={() => setShowForm(!showForm)}
            >
              <Plus className="mr-2 h-4 w-4" />
              {showForm ? "Cancel" : "Quick Log"}
            </Button>
          </div>
        </CardHeader>
        {showForm && (
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="feeType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fee Type</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FEE_TYPE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
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
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CURRENCY_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
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
                    name="paymentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PAYMENT_STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="paymentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={
                              field.value instanceof Date
                                ? field.value.toISOString().split("T")[0]
                                : field.value || ""
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method (Optional)</FormLabel>
                        <Select
                          value={field.value || ""}
                          onValueChange={(value) =>
                            field.onChange(value || undefined)
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {PAYMENT_METHOD_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.formState.errors.root && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.root.message}
                  </p>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Logging..." : "Log Payment"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        )}
      </Card>

      {/* Payment History */}
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">No payments yet.</p>
      ) : (
        <div className="space-y-3">
          {list.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mt-1">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {feeTypeLabelMap[payment.feeType ?? ""] ||
                            payment.feeType ||
                            "—"}
                        </span>
                        <Badge
                          variant={
                            PAYMENT_STATUS_VARIANTS[payment.paymentStatus ?? ""] ||
                            "secondary"
                          }
                        >
                          {paymentStatusLabelMap[payment.paymentStatus ?? ""] ||
                            payment.paymentStatus}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          {payment.paymentDate
                            ? format(new Date(payment.paymentDate), "MMM d, yyyy")
                            : "—"}
                        </span>
                        {payment.paymentMethod && (
                          <>
                            <span>•</span>
                            <span>
                              {paymentMethodLabelMap[payment.paymentMethod]}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold">
                      {payment.amount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currencyLabelMap[payment.currency ?? "INR"]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
