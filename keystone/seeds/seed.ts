/**
 * Phase 2 seed data: consultants, users, students, universities, programs, applications, loans, etc.
 * Run: npm run seed (from keystone folder)
 */

import { keystoneContext } from "../context";

export async function seed() {
  const context = keystoneContext;

  const consultantA = await context.sudo().query.Consultant.createOne({
    data: {
      name: "ABC Consultants",
      slug: "abc-consultants",
      contactEmail: "admin@abc.com",
      status: "active",
    },
  });

  const consultantB = await context.sudo().query.Consultant.createOne({
    data: {
      name: "XYZ Education",
      slug: "xyz-education",
      contactEmail: "admin@xyz.com",
      status: "active",
    },
  });

  await context.sudo().query.User.createOne({
    data: {
      clerkUserId: "seed_super_admin_1",
      email: "superadmin@abroadkart.com",
      name: "Super Admin",
      role: "superAdmin",
      tenant: undefined,
      isActive: true,
    },
  });

  await context.sudo().query.User.createOne({
    data: {
      clerkUserId: "seed_fulfilment_1",
      email: "fulfilment@abroadkart.com",
      name: "Fulfilment User",
      role: "fulfilment",
      tenant: undefined,
      isActive: true,
    },
  });

  await context.sudo().query.User.createOne({
    data: {
      clerkUserId: "seed_consultant_admin_abc",
      email: "admin@abc.com",
      name: "ABC Admin",
      role: "consultantAdmin",
      tenant: { connect: { id: consultantA.id } },
      isActive: true,
    },
  });

  await context.sudo().query.User.createOne({
    data: {
      clerkUserId: "seed_consultant_agent_xyz",
      email: "agent@xyz.com",
      name: "XYZ Agent",
      role: "consultantAgent",
      tenant: { connect: { id: consultantB.id } },
      isActive: true,
    },
  });

  const uni1 = await context.sudo().query.University.createOne({
    data: {
      name: "University of Example",
      slug: "university-of-example",
      country: "UK",
      city: "London",
      isActive: true,
    },
  });

  const uni2 = await context.sudo().query.University.createOne({
    data: {
      name: "Sample State University",
      slug: "sample-state-university",
      country: "USA",
      city: "Boston",
      isActive: true,
    },
  });

  const prog1 = await context.sudo().query.Program.createOne({
    data: {
      name: "MSc Computer Science",
      university: { connect: { id: uni1.id } },
      level: "master",
      field: "Computer Science",
      currency: "GBP",
      isActive: true,
    },
  });

  const prog2 = await context.sudo().query.Program.createOne({
    data: {
      name: "MBA",
      university: { connect: { id: uni2.id } },
      level: "master",
      field: "Business",
      currency: "USD",
      isActive: true,
    },
  });

  await context.sudo().query.Student.createOne({
    data: {
      tenant: { connect: { id: consultantA.id } },
      fullName: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      countryOfResidence: "IN",
      targetCountry: "AUS",
      currentStage: "lead",
      qualification: "bachelors",
      targetYear: "2027",
      budgetPerYear: "20to30k",
      programDisciplines: ["computerScience", "dataScience"],
      openForScholarshipsLoans: true,
      ieltsScore: "7.5",
      greScore: "315",
      finalScore: "8.3",
      workExperience: "1",
    },
  });

  const student2 = await context.sudo().query.Student.createOne({
    data: {
      tenant: { connect: { id: consultantA.id } },
      fullName: "Jane Smith",
      email: "jane@example.com",
      phone: "+1987654321",
      countryOfResidence: "IN",
      targetCountry: "UK",
      currentStage: "applied",
      qualification: "masters",
      targetYear: "2026",
      budgetPerYear: "30to40k",
      programDisciplines: ["business", "law"],
      openForScholarshipsLoans: false,
      toeflScore: "104",
      gmatScore: "690",
      finalScore: "82",
      workExperience: "3",
    },
  });

  await context.sudo().query.Student.createOne({
    data: {
      tenant: { connect: { id: consultantB.id } },
      fullName: "Alice Brown",
      email: "alice@example.com",
      phone: "+1122334455",
      countryOfResidence: "IN",
      targetCountry: "IRL",
      currentStage: "prospect",
      qualification: "intermediate",
      targetYear: "2028",
      budgetPerYear: "lt20k",
      programDisciplines: ["engineering", "medicine"],
      openForScholarshipsLoans: true,
      pteScore: "72",
      satScore: "1320",
      finalScore: "91",
      workExperience: "0",
    },
  });

  await context.sudo().query.Application.createOne({
    data: {
      tenant: { connect: { id: consultantA.id } },
      student: { connect: { id: student2.id } },
      program: { connect: { id: prog1.id } },
      status: "submitted",
    },
  });

  await context.sudo().query.LoanApplication.createOne({
    data: {
      tenant: { connect: { id: consultantA.id } },
      student: { connect: { id: student2.id } },
      status: "initiated",
      currency: "INR",
    },
  });

  await context.sudo().query.AccommodationBooking.createOne({
    data: {
      tenant: { connect: { id: consultantA.id } },
      student: { connect: { id: student2.id } },
      city: "London",
      accommodationType: "sharedApartment",
      status: "inquiry",
      currency: "GBP",
    },
  });

  await context.sudo().query.Reimbursement.createOne({
    data: {
      tenant: { connect: { id: consultantA.id } },
      student: { connect: { id: student2.id } },
      category: "applicationFee",
      amount: 5000,
      currency: "INR",
      status: "pending",
    },
  });

  console.log("Seed data created successfully.");
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
