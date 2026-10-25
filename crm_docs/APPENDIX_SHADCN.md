# Appendix C: ShadCN Components Complete Reference

**Related**: [Master Requirements](./REQUIREMENTS_MASTER.md) | [Phase 3: Consultant Portal](./PHASE_3_CONSULTANT_PORTAL.md) | [Phase 4: Fulfilment Portal](./PHASE_4_FULFILMENT_PORTAL.md)

---

## Overview

This appendix provides a comprehensive reference for all ShadCN UI components used throughout the Abroad Kart platform. Each section includes component descriptions, use cases, props, and implementation examples.

---

## Table of Contents

1. [Data Display Components](#data-display-components)
2. [Form Components](#form-components)
3. [Layout Components](#layout-components)
4. [Navigation Components](#navigation-components)
5. [Feedback Components](#feedback-components)
6. [Data Visualization](#data-visualization)
7. [Accessibility Features](#accessibility-features)
8. [Theming & Customization](#theming--customization)

---

## Data Display Components

### 1. Table

**Purpose**: Display tabular data with sorting, filtering, and pagination

**Used In**: Student list, loan list, document queue, activity logs

**Key Props**:
```typescript
interface TableProps {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  sortable?: boolean;
  filterable?: boolean;
}
```

**Example - Student List**:
```typescript
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function StudentTable({ students }: { students: Student[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Country</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id} hover>
            <TableCell className="font-medium">{student.fullName}</TableCell>
            <TableCell>{student.email}</TableCell>
            <TableCell>{student.countryOfResidence}</TableCell>
            <TableCell>
              <Badge variant={getStageVariant(student.currentStage)}>
                {student.currentStage}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(student.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push(`/students/${student.id}`)}
              >
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function getStageVariant(stage: string) {
  const variants: Record<string, BadgeVariant> = {
    lead: 'secondary',
    prospect: 'secondary',
    applied: 'blue',
    inLoanProcess: 'yellow',
    enrolled: 'green',
    graduated: 'default',
  };
  return variants[stage] || 'default';
}
```

---

### 2. Badge

**Purpose**: Display status, tags, and small categorical information

**Used In**: Status indicators, priority levels, verification status

**Variants**: default, secondary, destructive, outline, success, warning

**Example - Multi-Status Badge**:
```typescript
import { Badge } from '@/components/ui/badge';

interface LoanStatusBadgeProps {
  status: LoanApplicationStatus;
}

export function LoanStatusBadge({ status }: LoanStatusBadgeProps) {
  const config: Record<LoanApplicationStatus, { label: string; variant: BadgeVariant }> = {
    initiated: { label: 'Initiated', variant: 'secondary' },
    documentsPending: { label: 'Documents Pending', variant: 'yellow' },
    underReview: { label: 'Under Review', variant: 'blue' },
    approved: { label: 'Approved', variant: 'green' },
    rejected: { label: 'Rejected', variant: 'destructive' },
    disbursed: { label: 'Disbursed', variant: 'default' },
    closed: { label: 'Closed', variant: 'outline' },
  };

  const { label, variant } = config[status];

  return (
    <Badge variant={variant} className="capitalize">
      {label}
    </Badge>
  );
}
```

---

### 3. Progress

**Purpose**: Show task completion, document upload progress, loan approval stages

**Used In**: Application forms, document uploads, approval workflows

**Example - Loan Approval Progress**:
```typescript
import { Progress } from '@/components/ui/progress';

export function LoanApprovalProgress({ 
  status, 
  currentStep 
}: { 
  status: LoanApplicationStatus;
  currentStep: number;
}) {
  const steps = [
    'initiated',
    'documentsPending',
    'underReview',
    'approved',
    'disbursed',
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">Loan Status Progress</span>
        <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between text-xs text-gray-600">
        {steps.map((step, idx) => (
          <span 
            key={step}
            className={idx <= currentStep ? 'font-semibold text-primary' : ''}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}
```

---

### 4. Card

**Purpose**: Container for related content sections

**Used In**: Dashboard metrics, student profiles, application details

**Example - Dashboard Metric Card**:
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stat } from '@/components/stat';

export function DashboardMetrics({ consultant }: { consultant: Consultant }) {
  const metrics = [
    {
      title: 'Total Students',
      value: consultant.studentsCount,
      trend: '+12%',
    },
    {
      title: 'Loans Approved',
      value: consultant.loansApprovedCount,
      trend: '+8%',
    },
    {
      title: 'Applications',
      value: consultant.applicationsCount,
      trend: '+15%',
    },
    {
      title: 'Conversion Rate',
      value: `${consultant.conversionRate}%`,
      trend: '+3%',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-green-600 pt-2">{metric.trend} from last month</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## Form Components

### 1. Form & Input

**Purpose**: Capture user input with validation

**Used In**: Student creation, loan application, document upload

**Example - Student Creation Form**:
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useMutation } from '@apollo/client';
import { CREATE_STUDENT } from '@/graphql/mutations';

const studentSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[\d\s-()]{10,}$/, 'Invalid phone number'),
  countryOfResidence: z.string().min(1, 'Select a country'),
  targetCountry: z.string().optional(),
  educationLevel: z.enum(['highSchool', 'bachelor', 'master', 'phd']),
});

type StudentFormValues = z.infer<typeof studentSchema>;

export function StudentCreateForm({ onSuccess }: { onSuccess: () => void }) {
  const [createStudent, { loading }] = useMutation(CREATE_STUDENT);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      countryOfResidence: '',
      educationLevel: 'bachelor',
    },
  });

  const onSubmit = async (data: StudentFormValues) => {
    try {
      await createStudent({
        variables: { data },
      });
      form.reset();
      onSuccess();
    } catch (error) {
      form.setError('email', {
        message: 'Email already exists',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="+1 (555) 000-0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="countryOfResidence"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country of Residence</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="IN">India</SelectItem>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="educationLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Education Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="highSchool">High School</SelectItem>
                  <SelectItem value="bachelor">Bachelor</SelectItem>
                  <SelectItem value="master">Master</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating...' : 'Create Student'}
        </Button>
      </form>
    </Form>
  );
}
```

---

### 2. Textarea

**Purpose**: Multi-line text input for remarks, comments, descriptions

**Used In**: Consultant remarks, fulfilment remarks, verification notes

**Example - Remarks Field**:
```typescript
import { Textarea } from '@/components/ui/textarea';

export function LoanRemarksSection({ loan }: { loan: LoanApplication }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      
      {/* Consultant Remarks - Read-only for fulfilment */}
      <div>
        <label className="text-sm font-medium">Consultant Remarks</label>
        <Textarea
          value={loan.consultantRemarks || ''}
          readOnly
          className="mt-1 bg-gray-50"
        />
      </div>

      {/* Fulfilment Remarks - Editable by fulfilment only */}
      <div>
        <label className="text-sm font-medium">Fulfilment Remarks</label>
        <Textarea
          placeholder="Add remarks..."
          defaultValue={loan.fulfilmentRemarks || ''}
          onChange={(e) => updateRemarks(loan.id, e.target.value)}
          className="mt-1"
        />
      </div>

    </div>
  );
}
```

---

### 3. Checkbox & RadioGroup

**Purpose**: Boolean selection and mutually-exclusive choices

**Used In**: Multi-select filters, status selection, preference configuration

**Example - Document Type Selection**:
```typescript
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export function DocumentTypeSelector() {
  return (
    <div className="space-y-4">
      
      {/* Multi-select with Checkbox */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          Document Types to Verify
        </Label>
        <div className="space-y-2">
          {['Passport', 'Transcript', 'Bank Statement', 'Loan Agreement'].map((doc) => (
            <div key={doc} className="flex items-center space-x-2">
              <Checkbox id={doc} />
              <Label htmlFor={doc} className="font-normal cursor-pointer">
                {doc}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Mutually-exclusive with RadioGroup */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          Verification Status
        </Label>
        <RadioGroup defaultValue="pending">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pending" id="pending" />
            <Label htmlFor="pending" className="font-normal cursor-pointer">
              Pending
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="verified" id="verified" />
            <Label htmlFor="verified" className="font-normal cursor-pointer">
              Verified
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="rejected" id="rejected" />
            <Label htmlFor="rejected" className="font-normal cursor-pointer">
              Rejected
            </Label>
          </div>
        </RadioGroup>
      </div>

    </div>
  );
}
```

---

## Layout Components

### 1. Tabs

**Purpose**: Switch between different views or sections

**Used In**: Student profile (applications, loans, documents), dashboard views

**Example - Student Profile Tabs**:
```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function StudentProfile({ student }: { student: Student }) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="applications">
          Applications ({student.applications.length})
        </TabsTrigger>
        <TabsTrigger value="loans">
          Loans ({student.loanApplications.length})
        </TabsTrigger>
        <TabsTrigger value="documents">
          Documents ({student.documents.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{student.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{student.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Stage</p>
                <Badge>{student.currentStage}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Education Level</p>
                <p className="font-medium">{student.educationLevel}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="applications">
        <ApplicationsList applications={student.applications} />
      </TabsContent>

      <TabsContent value="loans">
        <LoansList loans={student.loanApplications} />
      </TabsContent>

      <TabsContent value="documents">
        <DocumentsList documents={student.documents} />
      </TabsContent>
    </Tabs>
  );
}
```

---

### 2. Accordion

**Purpose**: Collapsible content sections to manage visual hierarchy

**Used In**: FAQ sections, advanced filters, detailed logs

**Example - Filter Accordion**:
```typescript
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function AdvancedFilters({ onFilter }: { onFilter: (filters: any) => void }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      
      <AccordionItem value="status">
        <AccordionTrigger>Filter by Status</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {['initiated', 'underReview', 'approved', 'rejected'].map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={status}
                  onChange={(checked) =>
                    onFilter({ status, checked: checked.target.checked })
                  }
                />
                <Label htmlFor={status} className="capitalize cursor-pointer">
                  {status}
                </Label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="date">
        <AccordionTrigger>Filter by Date Range</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <Input type="date" placeholder="From" />
            <Input type="date" placeholder="To" />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="amount">
        <AccordionTrigger>Filter by Loan Amount</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <Input type="number" placeholder="Min amount" />
            <Input type="number" placeholder="Max amount" />
          </div>
        </AccordionContent>
      </AccordionItem>

    </Accordion>
  );
}
```

---

### 3. Dialog & Sheet

**Purpose**: Modal dialogs for forms, confirmations; side sheets for details

**Used In**: Confirmation dialogs, edit forms, viewing details

**Example - Confirm Delete Dialog**:
```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Example - Edit Loan Side Sheet**:
```typescript
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export function EditLoanSheet({
  open,
  onOpenChange,
  loan,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: LoanApplication;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px]">
        <SheetHeader>
          <SheetTitle>Edit Loan Application</SheetTitle>
          <SheetDescription>
            Update loan details for {loan.student.fullName}
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-4 mt-6">
          {/* Form content */}
          <div>
            <Label>Loan Amount (Approved)</Label>
            <Input
              type="number"
              defaultValue={loan.loanAmountApproved}
              onChange={(e) => {
                // Update handler
              }}
            />
          </div>
          
          <div>
            <Label>Interest Rate</Label>
            <Input
              type="number"
              step="0.1"
              defaultValue={loan.interestRate}
              onChange={(e) => {
                // Update handler
              }}
            />
          </div>

          <Button className="w-full">Save Changes</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

---

## Navigation Components

### 1. Sidebar Navigation

**Used In**: Main app layout for all users

**Example - Consultant Sidebar**:
```typescript
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Home,
  LogOut,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export function ConsultantSidebar() {
  const pathname = usePathname();
  async function signOut() {
    await authClient.signOut();
  }

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/consultant/dashboard',
    },
    {
      title: 'Students',
      icon: Users,
      href: '/consultant/students',
    },
    {
      title: 'Applications',
      icon: FileText,
      href: '/consultant/applications',
    },
    {
      title: 'Loans',
      icon: CreditCard,
      href: '/consultant/loans',
    },
    {
      title: 'Accommodation',
      icon: Home,
      href: '/consultant/accommodation',
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="text-lg font-bold">Abroad Kart</h2>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                >
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
```

---

### 2. Breadcrumbs

**Used In**: Navigation hierarchy in detail pages

**Example - Student Detail Breadcrumb**:
```typescript
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';

export function StudentBreadcrumb({ studentName }: { studentName: string }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/consultant/students">Students</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{studentName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
```

---

### 3. Dropdown Menu

**Used In**: Action menus, user profile menu, bulk actions

**Example - Row Action Menu**:
```typescript
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit2, Trash2, Eye } from 'lucide-react';

export function StudentRowActions({ student }: { student: Student }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Eye className="mr-2 h-4 w-4" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Edit2 className="mr-2 h-4 w-4" />
          Edit Student
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## Feedback Components

### 1. Toast Notifications

**Purpose**: Non-blocking notifications for action feedback

**Used In**: Form submissions, loan approvals, document uploads

**Example - Toast on Action**:
```typescript
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

export function ApproveLoanButton({ loanId }: { loanId: string }) {
  const { toast } = useToast();
  const [approveLoan, { loading }] = useMutation(APPROVE_LOAN);

  const handleApprove = async () => {
    try {
      await approveLoan({
        variables: { id: loanId },
      });

      toast({
        title: 'Success',
        description: 'Loan has been approved successfully.',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve loan. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button onClick={handleApprove} disabled={loading}>
      {loading ? 'Approving...' : 'Approve Loan'}
    </Button>
  );
}
```

---

### 2. Alert

**Purpose**: Important information, warnings, or errors

**Used In**: Validation errors, business logic warnings, compliance notices

**Example - Multiple Alert Types**:
```typescript
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

export function LoanStatusAlerts({ loan }: { loan: LoanApplication }) {
  return (
    <div className="space-y-3">
      {/* Warning Alert */}
      {loan.status === 'underReview' && (
        <Alert>
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>Pending Review</AlertTitle>
          <AlertDescription>
            This loan is currently under review by the fulfilment team.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {loan.status === 'rejected' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Application Rejected</AlertTitle>
          <AlertDescription>
            {loan.fulfilmentRemarks || 'No reason provided.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {loan.status === 'approved' && (
        <Alert>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Loan Approved</AlertTitle>
          <AlertDescription>
            Loan amount: ₹{loan.loanAmountApproved.toLocaleString()}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

---

### 3. Skeleton Loaders

**Purpose**: Show loading state while content is fetching

**Used In**: Data tables, detail pages, lists

**Example - Skeleton Loading State**:
```typescript
import { Skeleton } from '@/components/ui/skeleton';

export function StudentTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div key={idx} className="flex items-center space-x-4 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}
```

---

## Data Visualization

### 1. Charts (via Recharts)

**Purpose**: Display trends, analytics, and metrics

**Used In**: Dashboards, reports, analytics pages

**Example - Loan Approval Trend Chart**:
```typescript
'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartData {
  month: string;
  approved: number;
  rejected: number;
  pending: number;
}

export function LoanApprovalTrendChart({ data }: { data: ChartData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Approval Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="approved"
              stroke="#10b981"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="rejected"
              stroke="#ef4444"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="pending"
              stroke="#f59e0b"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

---

## Accessibility Features

### 1. ARIA Labels & Descriptions

```typescript
import { Button } from '@/components/ui/button';

export function AccessibleButton() {
  return (
    <>
      {/* Button with descriptive text */}
      <Button aria-label="Approve loan application">
        Approve
      </Button>

      {/* Form with associated label */}
      <label htmlFor="student-name">Student Name</label>
      <input id="student-name" type="text" />

      {/* Aria-describedby for form hints */}
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        aria-describedby="password-hint"
      />
      <p id="password-hint" className="text-sm text-gray-600">
        Must be at least 8 characters
      </p>
    </>
  );
}
```

### 2. Keyboard Navigation

- All interactive elements accessible via Tab key
- Dialog escape with Esc key
- Menu navigation with arrow keys
- Form submission with Enter key

### 3. Focus Management

```typescript
import { useRef, useEffect } from 'react';

export function FocusedDialog() {
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    firstButtonRef.current?.focus();
  }, []);

  return (
    <Dialog>
      {/* Auto-focus first element */}
      <Button ref={firstButtonRef}>
        Primary Action
      </Button>
    </Dialog>
  );
}
```

---

## Theming & Customization

### Color System

**Primary Colors** (Used for actions):
- Primary: `hsl(var(--primary))`
- Foreground: `hsl(var(--primary-foreground))`

**Status Colors**:
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Amber)
- Destructive: `#ef4444` (Red)
- Info: `#3b82f6` (Blue)

**Neutral Colors**:
- Foreground: `hsl(var(--foreground))`
- Muted Foreground: `hsl(var(--muted-foreground))`
- Border: `hsl(var(--border))`

### Dark Mode Support

```typescript
// globals.css
@media (prefers-color-scheme: dark) {
  :root {
    --background: 0 0% 3%;
    --foreground: 0 0% 98%;
    --primary: 142.4 71.8% 29.2%;
    --primary-foreground: 0 0% 100%;
    /* ... */
  }
}

// Component-level dark support
export function MyComponent() {
  return (
    <div className="dark:bg-slate-900 dark:text-white">
      Content adapts to dark mode
    </div>
  );
}
```

---

## Component Best Practices

### 1. Composition Pattern

```typescript
// ✅ Composable components
export function StudentForm() {
  return (
    <Form>
      <FormSection title="Personal Information">
        <FormField name="fullName" />
        <FormField name="email" />
      </FormSection>
      <FormSection title="Education">
        <FormField name="educationLevel" />
      </FormSection>
    </Form>
  );
}
```

### 2. Loading States

```typescript
// ✅ Always provide loading feedback
export function DataTable({ data, isLoading }) {
  if (isLoading) return <Skeleton />;
  if (!data.length) return <EmptyState />;
  
  return <Table data={data} />;
}
```

### 3. Error Handling

```typescript
// ✅ Show user-friendly errors
try {
  await mutation();
} catch (error) {
  toast({
    title: 'Error',
    description: getErrorMessage(error),
    variant: 'destructive',
  });
}
```

---

**Related Documentation**:
- [Master Requirements](./REQUIREMENTS_MASTER.md)
- [Phase 3: Consultant Portal](./PHASE_3_CONSULTANT_PORTAL.md)
- [Phase 4: Fulfilment Portal](./PHASE_4_FULFILMENT_PORTAL.md)

