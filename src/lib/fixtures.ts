export const fixtureApplications = [
  {
    id: "1",
    programName: "MSc Artificial Intelligence",
    institution: "Université Paris-Saclay",
    country: "France",
    status: "preparing" as const,
    deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 5,
    blockers: 2,
  },
  {
    id: "2",
    programName: "MSc Computer Science",
    institution: "ETH Zürich",
    country: "Switzerland",
    status: "exploring" as const,
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 4,
    blockers: 0,
  },
  {
    id: "3",
    programName: "MEng Software Engineering",
    institution: "University of Waterloo",
    country: "Canada",
    status: "submitted" as const,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 3,
    blockers: 0,
  },
  {
    id: "4",
    programName: "MS Computer Science",
    institution: "Stanford University",
    country: "United States",
    status: "exploring" as const,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 4,
    blockers: 3,
  },
];

export const fixtureDeadlines = [
  {
    id: "1",
    title: "Eiffel Scholarship Nomination Deadline",
    type: "funding" as const,
    dueAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
  },
  {
    id: "2",
    title: "ETH Zürich Application Deadline",
    type: "final" as const,
    dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
  },
  {
    id: "3",
    title: "Submit Recommendation Request - Prof. Mensah",
    type: "recommendation" as const,
    dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
  },
  {
    id: "4",
    title: "Upload Updated Transcript",
    type: "document" as const,
    dueAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
  },
];

export const fixtureStats = {
  totalPrograms: 12,
  shortlisted: 5,
  submitted: 3,
  admits: 1,
  daysUntilNextDeadline: 2,
  fundingTarget: "€45,000",
  fundingSecured: "€12,000",
};
