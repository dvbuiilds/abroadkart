import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  interactionCreateSchema,
  type InteractionCreateInput,
  INTERACTION_TYPE_OPTIONS,
  INTERACTION_DIRECTION_OPTIONS,
  interactionTypeLabelMap,
  interactionDirectionLabelMap,
} from "@app/lib/validations/interaction";
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
import type { InteractionListItem } from "@app/graphql/types";
import { format } from "date-fns";
import { Phone, MessageSquare, Mail, Users, Plus, ChevronDown } from "lucide-react";

const INTERACTION_ICONS: Record<string, React.ReactNode> = {
  call: <Phone className="h-4 w-4" />,
  whatsapp: <MessageSquare className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  inPersonMeeting: <Users className="h-4 w-4" />,
  reddit: <MessageSquare className="h-4 w-4" />,
  walkIn: <Users className="h-4 w-4" />,
  other: <MessageSquare className="h-4 w-4" />,
};

const DIRECTION_COLORS: Record<string, string> = {
  inbound: "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
  outbound: "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100",
};

export function StudentInteractionsTab({
  interactions,
  studentId,
  onLogClick,
}: {
  interactions?: InteractionListItem[];
  studentId: string;
  onLogClick?: () => void;
}) {
  const list = interactions ?? [];
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InteractionCreateInput>({
    resolver: zodResolver(interactionCreateSchema),
    defaultValues: {
      studentId,
      type: "call",
      direction: "outbound",
      notes: "",
      nextAction: "",
    },
  });

  const onSubmit = async (data: InteractionCreateInput) => {
    setIsSubmitting(true);
    try {
      console.log("Would submit interaction:", data);
      form.reset({ studentId, type: "call", direction: "outbound", notes: "" });
      setShowForm(false);
      onLogClick?.();
    } catch (error) {
      console.error(error);
      form.setError("root", { message: "Failed to log interaction" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Log Form */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Log Interaction</h3>
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
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
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
                            {INTERACTION_TYPE_OPTIONS.map((opt) => (
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
                    name="direction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Direction</FormLabel>
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
                            {INTERACTION_DIRECTION_OPTIONS.map((opt) => (
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

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <textarea
                          placeholder="What was discussed..."
                          className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="nextAction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next Action</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Send SOP documents" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nextActionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Follow-up Date</FormLabel>
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
                    {isSubmitting ? "Logging..." : "Log Interaction"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        )}
      </Card>

      {/* Timeline */}
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">No interactions yet.</p>
      ) : (
        <div className="space-y-4">
          {list.map((interaction, index) => (
            <Card key={interaction.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Timeline dot and line */}
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {INTERACTION_ICONS[interaction.type ?? ""] || (
                        <MessageSquare className="h-4 w-4" />
                      )}
                    </div>
                    {index < list.length - 1 && (
                      <div className="mt-2 w-0.5 h-12 bg-border" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {interactionTypeLabelMap[interaction.type ?? ""] ||
                            interaction.type ||
                            "—"}
                        </span>
                        <Badge
                          variant="outline"
                          className={DIRECTION_COLORS[interaction.direction ?? ""]}
                        >
                          {interactionDirectionLabelMap[
                            interaction.direction ?? ""
                          ] || interaction.direction}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {interaction.createdAt
                          ? format(new Date(interaction.createdAt), "MMM d, yyyy HH:mm")
                          : "—"}
                      </span>
                    </div>

                    {interaction.counsellor?.name && (
                      <p className="text-xs text-muted-foreground mb-2">
                        by {interaction.counsellor.name}
                      </p>
                    )}

                    <p className="text-sm whitespace-pre-wrap mb-3">
                      {interaction.notes}
                    </p>

                    {interaction.nextAction && (
                      <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-3 border border-blue-200 dark:border-blue-800">
                        <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Next Action
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {interaction.nextAction}
                        </p>
                        {interaction.nextActionDate && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Due: {format(new Date(interaction.nextActionDate), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                    )}
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
