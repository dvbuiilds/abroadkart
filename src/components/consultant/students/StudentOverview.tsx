import { Card, CardContent, CardHeader } from "@app/components/ui/card";
import { Badge } from "@app/components/ui/badge";
import type { Student } from "@app/graphql/types";
import { format } from "date-fns";
import {
  stageLabelMap,
  priorityLabelMap,
  genderLabelMap,
  sourceLabelMap,
  qualificationLabelMap,
  academicScoreTypeLabelMap,
  studyLevelLabelMap,
  preferredIntakeLabelMap,
  targetYearLabelMap,
  fundingTypeLabelMap,
  workExperienceLabelMap,
} from "@app/lib/students/options";

const STAGE_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "success" | "warning" | "destructive"
> = {
  lead: "secondary",
  contacted: "secondary",
  counsellingDone: "secondary",
  docsCollection: "outline",
  applied: "outline",
  offerReceived: "success",
  visaFiled: "success",
  enrolled: "success",
  lost: "destructive",
};

const PRIORITY_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "destructive" | "warning"
> = {
  hot: "destructive",
  warm: "warning",
  cold: "secondary",
};

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value ?? "—"}</p>
    </div>
  );
}

export function StudentOverview({ student }: { student: Student }) {
  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-foreground">
            Contact Information
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <InfoRow label="Email" value={student.email} />
          <InfoRow label="Phone" value={student.phone} />
          <InfoRow
            label="Country of Residence"
            value={student.countryOfResidence}
          />
          <InfoRow
            label="Created"
            value={
              student.createdAt
                ? format(new Date(student.createdAt), "MMM d, yyyy")
                : undefined
            }
          />
        </CardContent>
      </Card>

      {/* Identity */}
      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-foreground">Identity</p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <InfoRow
            label="Gender"
            value={
              student.gender ? genderLabelMap[student.gender] : undefined
            }
          />
          <InfoRow label="City" value={student.city} />
          <InfoRow label="State" value={student.state} />
          <InfoRow
            label="Source"
            value={student.source ? sourceLabelMap[student.source] : undefined}
          />
        </CardContent>
      </Card>

      {/* Academic Background */}
      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-foreground">
            Academic Background
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <InfoRow
            label="Qualification"
            value={
              student.qualification
                ? qualificationLabelMap[student.qualification]
                : undefined
            }
          />
          <InfoRow label="Institution" value={student.institutionName} />
          <InfoRow label="Stream" value={student.stream} />
          <InfoRow
            label="Subjects"
            value={
              Array.isArray(student.subjects) && student.subjects.length
                ? student.subjects.join(", ")
                : undefined
            }
          />
          <InfoRow
            label="Academic Score"
            value={
              student.academicScore
                ? `${Number(student.academicScore)} ${student.academicScoreType ? academicScoreTypeLabelMap[student.academicScoreType] : ""}`
                : undefined
            }
          />
          <InfoRow label="Year of Passing" value={student.yearOfPassing?.toString()} />
          <InfoRow label="Backlog Count" value={student.backlogCount?.toString()} />
        </CardContent>
      </Card>

      {/* Test Scores */}
      {[
        student.ieltsScore,
        student.toeflScore,
        student.pteScore,
        student.gmatScore,
        student.greScore,
        student.satScore,
        student.actScore,
        student.duolingoScore,
      ].some((score) => score != null) && (
        <Card>
          <CardHeader>
            <p className="text-sm font-medium text-foreground">Test Scores</p>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {student.ieltsScore != null && (
              <InfoRow
                label="IELTS"
                value={Number(student.ieltsScore).toFixed(2)}
              />
            )}
            {student.toeflScore != null && (
              <InfoRow
                label="TOEFL"
                value={Number(student.toeflScore).toFixed(2)}
              />
            )}
            {student.pteScore != null && (
              <InfoRow label="PTE" value={Number(student.pteScore).toFixed(2)} />
            )}
            {student.gmatScore != null && (
              <InfoRow
                label="GMAT"
                value={Number(student.gmatScore).toFixed(2)}
              />
            )}
            {student.greScore != null && (
              <InfoRow label="GRE" value={Number(student.greScore).toFixed(2)} />
            )}
            {student.satScore != null && (
              <InfoRow label="SAT" value={Number(student.satScore).toFixed(2)} />
            )}
            {student.actScore != null && (
              <InfoRow label="ACT" value={Number(student.actScore).toFixed(2)} />
            )}
            {student.duolingoScore != null && (
              <InfoRow
                label="Duolingo"
                value={Number(student.duolingoScore).toFixed(2)}
              />
            )}
            {student.testAppearingDate && (
              <InfoRow
                label="Test Appearing Date"
                value={format(new Date(student.testAppearingDate), "MMM d, yyyy")}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Work Experience */}
      {(student.employer ||
        student.designation ||
        student.gapExplanation ||
        student.workExperience) && (
        <Card>
          <CardHeader>
            <p className="text-sm font-medium text-foreground">
              Work Experience
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow
                label="Experience"
                value={
                  student.workExperience
                    ? workExperienceLabelMap[student.workExperience]
                    : undefined
                }
              />
              <InfoRow label="Employer" value={student.employer} />
              <InfoRow label="Designation" value={student.designation} />
            </div>
            {student.gapExplanation && (
              <div>
                <p className="text-xs text-muted-foreground">Gap Explanation</p>
                <p className="text-sm">{student.gapExplanation}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Study Goals */}
      {(student.targetCountries?.length ||
        student.targetCourses?.length ||
        student.studyLevel ||
        student.preferredIntake) && (
        <Card>
          <CardHeader>
            <p className="text-sm font-medium text-foreground">Study Goals</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.isArray(student.targetCountries) &&
              student.targetCountries.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Target Countries
                  </p>
                  <p className="font-medium">
                    {student.targetCountries.join(", ")}
                  </p>
                </div>
              )}
            {Array.isArray(student.targetCourses) &&
              student.targetCourses.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Target Courses
                  </p>
                  <p className="font-medium">
                    {student.targetCourses.join(", ")}
                  </p>
                </div>
              )}
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow
                label="Study Level"
                value={
                  student.studyLevel
                    ? studyLevelLabelMap[student.studyLevel]
                    : undefined
                }
              />
              <InfoRow
                label="Preferred Intake"
                value={
                  student.preferredIntake
                    ? preferredIntakeLabelMap[student.preferredIntake]
                    : undefined
                }
              />
              <InfoRow
                label="Target Year"
                value={
                  student.targetYear
                    ? targetYearLabelMap[student.targetYear]
                    : undefined
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Profile */}
      {(student.budgetTuition ||
        student.budgetLiving ||
        student.fundingType ||
        student.loanPreApproved) && (
        <Card>
          <CardHeader>
            <p className="text-sm font-medium text-foreground">
              Financial Profile
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <InfoRow
              label="Tuition Budget"
              value={
                student.budgetTuition
                  ? `${student.budgetTuition} ${student.budgetCurrency || "USD"}`
                  : undefined
              }
            />
            <InfoRow
              label="Living Budget"
              value={
                student.budgetLiving
                  ? `${student.budgetLiving} ${student.budgetCurrency || "USD"}`
                  : undefined
              }
            />
            <InfoRow
              label="Funding Type"
              value={
                student.fundingType
                  ? fundingTypeLabelMap[student.fundingType]
                  : undefined
              }
            />
            <InfoRow
              label="Loan Pre-Approved"
              value={student.loanPreApproved ? "Yes" : "No"}
            />
            {student.parentMonthlyIncome && (
              <InfoRow
                label="Parent Monthly Income"
                value={`₹${student.parentMonthlyIncome}`}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Visa & Travel */}
      {(student.priorVisaRefusals ||
        student.passportAvailable ||
        student.passportExpiry) && (
        <Card>
          <CardHeader>
            <p className="text-sm font-medium text-foreground">
              Visa & Travel
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow
                label="Prior Visa Refusals"
                value={student.priorVisaRefusals ? "Yes" : "No"}
              />
              <InfoRow
                label="Passport Available"
                value={student.passportAvailable ? "Yes" : "No"}
              />
              {student.passportExpiry && (
                <InfoRow
                  label="Passport Expiry"
                  value={format(new Date(student.passportExpiry), "MMM d, yyyy")}
                />
              )}
            </div>
            {student.priorVisaRefusals && (
              <>
                {Array.isArray(student.refusalCountries) &&
                  student.refusalCountries.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Refusal Countries
                      </p>
                      <p className="font-medium">
                        {student.refusalCountries.join(", ")}
                      </p>
                    </div>
                  )}
                {student.refusalReason && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Refusal Reason
                    </p>
                    <p className="text-sm">{student.refusalReason}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* CRM Status */}
      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-foreground">CRM Status</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Current Stage</p>
              <Badge
                variant={
                  STAGE_VARIANTS[student.currentStage ?? ""] ?? "secondary"
                }
              >
                {stageLabelMap[student.currentStage ?? ""] ?? "—"}
              </Badge>
            </div>
            {student.priority && (
              <div>
                <p className="text-xs text-muted-foreground">Priority</p>
                <Badge variant={PRIORITY_VARIANTS[student.priority] ?? "secondary"}>
                  {priorityLabelMap[student.priority] ?? "—"}
                </Badge>
              </div>
            )}
            {student.assignedCounsellor?.name && (
              <InfoRow
                label="Assigned Counsellor"
                value={student.assignedCounsellor.name}
              />
            )}
          </div>
          {student.currentStage === "lost" && student.lostReason && (
            <div>
              <p className="text-xs text-muted-foreground">Reason for Lost</p>
              <p className="text-sm">{student.lostReason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {student.notes && (
        <Card>
          <CardHeader>
            <p className="text-sm font-medium text-foreground">Notes</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{student.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
