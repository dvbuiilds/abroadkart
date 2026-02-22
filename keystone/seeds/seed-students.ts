import { keystoneContext } from "../context";

const STUDENT_ROWS = [
  {
    fullName: "Aarav Mehta",
    email: "aarav.mehta@example.com",
    phone: "+918888000001",
    countryOfResidence: "IN",
    targetCountry: "AUS",
    currentStage: "lead",
    qualification: "bachelors",
    targetYear: "2026",
    budgetPerYear: "20to30k",
    programDisciplines: ["computerScience", "dataScience"],
    openForScholarshipsLoans: true,
    ieltsScore: "7.0",
    finalScore: "8.1",
    workExperience: "1",
  },
  {
    fullName: "Riya Sharma",
    email: "riya.sharma@example.com",
    phone: "+918888000002",
    countryOfResidence: "IN",
    targetCountry: "UK",
    currentStage: "prospect",
    qualification: "masters",
    targetYear: "2027",
    budgetPerYear: "30to40k",
    programDisciplines: ["business", "law"],
    openForScholarshipsLoans: false,
    toeflScore: "102",
    gmatScore: "680",
    finalScore: "79",
    workExperience: "3",
  },
  {
    fullName: "Kabir Singh",
    email: "kabir.singh@example.com",
    phone: "+918888000003",
    countryOfResidence: "IN",
    targetCountry: "GER",
    currentStage: "applied",
    qualification: "bachelors",
    targetYear: "2028",
    budgetPerYear: "lt20k",
    programDisciplines: ["engineering"],
    openForScholarshipsLoans: true,
    ieltsScore: "6.5",
    greScore: "310",
    finalScore: "7.8",
    workExperience: "2",
  },
  {
    fullName: "Ananya Iyer",
    email: "ananya.iyer@example.com",
    phone: "+918888000004",
    countryOfResidence: "IN",
    targetCountry: "FR",
    currentStage: "lead",
    qualification: "intermediate",
    targetYear: "2029",
    budgetPerYear: "20to30k",
    programDisciplines: ["artsAndDesign", "socialSciences"],
    openForScholarshipsLoans: true,
    pteScore: "68",
    satScore: "1290",
    finalScore: "88",
    workExperience: "0",
  },
  {
    fullName: "Dev Patel",
    email: "dev.patel@example.com",
    phone: "+918888000005",
    countryOfResidence: "IN",
    targetCountry: "NZ",
    currentStage: "prospect",
    qualification: "bachelors",
    targetYear: "2026",
    budgetPerYear: "40to50k",
    programDisciplines: ["computerScience"],
    openForScholarshipsLoans: false,
    ieltsScore: "7.5",
    actScore: "31",
    finalScore: "8.6",
    workExperience: "4plus",
  },
  {
    fullName: "Sara Khan",
    email: "sara.khan@example.com",
    phone: "+918888000006",
    countryOfResidence: "IN",
    targetCountry: "IRL",
    currentStage: "inLoanProcess",
    qualification: "masters",
    targetYear: "2027",
    budgetPerYear: "gt50k",
    programDisciplines: ["medicine"],
    openForScholarshipsLoans: true,
    toeflScore: "109",
    greScore: "325",
    finalScore: "84",
    workExperience: "4",
  },
  {
    fullName: "Neel Joshi",
    email: "neel.joshi@example.com",
    phone: "+918888000007",
    countryOfResidence: "IN",
    targetCountry: "POL",
    currentStage: "lead",
    qualification: "intermediate",
    targetYear: "2028",
    budgetPerYear: "lt20k",
    programDisciplines: ["agriculture", "engineering"],
    openForScholarshipsLoans: true,
    pteScore: "64",
    satScore: "1240",
    finalScore: "76",
    workExperience: "0",
  },
  {
    fullName: "Mira Das",
    email: "mira.das@example.com",
    phone: "+918888000008",
    countryOfResidence: "IN",
    targetCountry: "AUS",
    currentStage: "applied",
    qualification: "bachelors",
    targetYear: "2029",
    budgetPerYear: "30to40k",
    programDisciplines: ["education", "socialSciences"],
    openForScholarshipsLoans: true,
    ieltsScore: "7.0",
    gmatScore: "640",
    finalScore: "8.0",
    workExperience: "2",
  },
  {
    fullName: "Arjun Verma",
    email: "arjun.verma@example.com",
    phone: "+918888000009",
    countryOfResidence: "IN",
    targetCountry: "UK",
    currentStage: "enrolled",
    qualification: "masters",
    targetYear: "2026",
    budgetPerYear: "gt50k",
    programDisciplines: ["business", "dataScience"],
    openForScholarshipsLoans: false,
    toeflScore: "101",
    gmatScore: "710",
    finalScore: "86",
    workExperience: "4plus",
  },
  {
    fullName: "Isha Reddy",
    email: "isha.reddy@example.com",
    phone: "+918888000010",
    countryOfResidence: "IN",
    targetCountry: "GER",
    currentStage: "graduated",
    qualification: "bachelors",
    targetYear: "2027",
    budgetPerYear: "40to50k",
    programDisciplines: ["engineering", "computerScience"],
    openForScholarshipsLoans: true,
    ieltsScore: "7.5",
    greScore: "322",
    finalScore: "8.9",
    workExperience: "3",
  },
] as const;

async function seedStudents() {
  const context = keystoneContext;
  const consultants = await context.sudo().query.Consultant.findMany({
    query: "id name",
  });

  if (!consultants.length) {
    throw new Error(
      "No consultants found. Create at least one consultant before running seed:students."
    );
  }

  const tenantId = consultants[0].id;

  for (const row of STUDENT_ROWS) {
    await context.sudo().query.Student.createOne({
      data: {
        tenant: { connect: { id: tenantId } },
        ...row,
      },
    });
  }

  console.log(`Inserted ${STUDENT_ROWS.length} student rows.`);
}

seedStudents().catch((error) => {
  console.error("Student seed failed:", error);
  process.exit(1);
});
