/**
 * TypeScript types for GraphQL API responses (Consultant Portal)
 * Aligned with Keystone schema.
 */

export interface FileFieldOutput {
  filename: string;
  filesize: number;
  url: string;
}

export interface ConsultantRef {
  id: string;
  name?: string | null;
}

export interface UserRef {
  id: string;
  name?: string | null;
  email?: string | null;
}

export interface UniversityRef {
  id: string;
  name?: string | null;
  country?: string | null;
}

export interface ProgramRef {
  id: string;
  name?: string | null;
  level?: string | null;
  field?: string | null;
  tuitionFeePerYear?: number | null;
  currency?: string | null;
  university?: UniversityRef | null;
}

export interface StudentListItem {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  currentStage: string | null;
  countryOfResidence: string | null;
  createdAt: string | null;
  tenant?: ConsultantRef | null;
}

export interface Student {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  countryOfResidence: string | null;
  targetCountry: string | null;
  currentStage: string | null;
  educationLevel: string | null;
  workExperience: number | null;
  englishTestScore: string | null;
  englishTestType: string | null;
  parentMonthlyIncome: number | null;
  notes: string | null;
  isDeleted: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
  applications?: ApplicationListItem[];
  loanApplications?: LoanListItem[];
  documents?: StudentDocumentListItem[];
  tasks?: TaskListItem[];
}

export interface ApplicationListItem {
  id: string;
  status: string | null;
  applicationDate: string | null;
  responseDate: string | null;
  program?: ProgramRef | null;
  student?: { id: string; fullName: string | null; email: string | null } | null;
}

export interface Application {
  id: string;
  status: string | null;
  applicationDate: string | null;
  responseDate: string | null;
  gre: number | null;
  gmat: number | null;
  gpa: string | null;
  remarks: string | null;
  student?: StudentListItem | null;
  program?: ProgramRef | null;
  documents?: StudentDocumentListItem[];
}

export interface LoanListItem {
  id: string;
  status: string | null;
  loanAmountRequested: number | null;
  loanAmountApproved: number | null;
  currency: string | null;
  interestRate: string | null;
  emi: number | null;
  approvedAt: string | null;
  disburseDate: string | null;
  consultantRemarks: string | null;
  fulfilmentRemarks: string | null;
  createdAt: string | null;
  updatedAt?: string | null;
  student?: { id: string; fullName: string | null; email: string | null; phone?: string | null } | null;
  tenant?: ConsultantRef | null;
}

export interface LoanApplication {
  id: string;
  status: string | null;
  loanAmountRequested: number | null;
  loanAmountApproved: number | null;
  currency: string | null;
  loanTenure: number | null;
  interestRate: string | null;
  emi: number | null;
  consultantRemarks: string | null;
  fulfilmentRemarks: string | null;
  approvedAt: string | null;
  disburseDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  student?: StudentListItem | null;
  application?: ApplicationListItem | null;
  tenant?: ConsultantRef | null;
  documents?: StudentDocumentListItem[];
  reimbursements?: ReimbursementListItem[];
}

export interface StudentDocumentListItem {
  id: string;
  documentType: string | null;
  verificationStatus: string | null;
  verificationRemarks?: string | null;
  uploadedAt: string | null;
  file?: FileFieldOutput | null;
  student?: {
    id: string;
    fullName: string | null;
    email: string | null;
    tenant?: ConsultantRef | null;
  } | null;
}

export interface TaskListItem {
  id: string;
  title: string | null;
  status: string | null;
  priority: string | null;
  dueDate: string | null;
  taskType: string | null;
  student?: { id: string; fullName: string | null } | null;
  assignedTo?: UserRef | null;
}

export interface Task {
  id: string;
  title: string | null;
  description: string | null;
  taskType: string | null;
  status: string | null;
  priority: string | null;
  dueDate: string | null;
  student?: StudentListItem | null;
  assignedTo?: UserRef | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ActivityLogItem {
  id: string;
  entityType: string | null;
  entityId: string | null;
  action: string | null;
  createdAt: string | null;
  actor?: UserRef | null;
}

export interface CurrentUser {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  tenant?: ConsultantRef | null;
}

// Fulfilment Portal types
export interface ConsultantListItem {
  id: string;
  name?: string | null;
}

export interface ReimbursementListItem {
  id: string;
  category: string | null;
  amount: number | null;
  currency: string | null;
  status: string | null;
  requestedAt: string | null;
  createdAt?: string | null;
  student?: { id: string; fullName: string | null; email: string | null } | null;
  tenant?: ConsultantRef | null;
}

export interface Reimbursement {
  id: string;
  category: string | null;
  amount: number | null;
  currency: string | null;
  status: string | null;
  requestedAt: string | null;
  approvedAt: string | null;
  reimbursedAt: string | null;
  remarks: string | null;
  receipt?: FileFieldOutput | null;
  student?: StudentListItem | null;
  tenant?: ConsultantRef | null;
  createdAt: string | null;
}

export interface PrepaidCardListItem {
  id: string;
  cardNumber: string | null;
  balance: number | null;
  currency: string | null;
  status: string | null;
  cardProvider?: string | null;
  issuedAt: string | null;
  expiryDate?: string | null;
  createdAt?: string | null;
  student?: { id: string; fullName: string | null; email: string | null } | null;
  tenant?: ConsultantRef | null;
}

export interface PrepaidCard {
  id: string;
  cardNumber: string | null;
  balance: number | null;
  currency: string | null;
  status: string | null;
  cardProvider: string | null;
  issuedAt: string | null;
  expiryDate: string | null;
  student?: StudentListItem | null;
  tenant?: ConsultantRef | null;
  createdAt: string | null;
}

export interface FulfilmentDashboardKPIs {
  loansUnderReview: number;
  loansApproved: number;
  loansDisbursed: number;
  pendingDocuments: number;
  pendingReimbursements: number;
}
