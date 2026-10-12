import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "password123";

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // --- Flats ---
  const flatLabels = ["Flat 1", "Flat 2", "Flat 3", "Flat 4", "Flat 5"];
  const flats = await Promise.all(
    flatLabels.map((label, i) =>
      prisma.flat.upsert({
        where: { label },
        update: {},
        create: { label, floor: `Floor ${Math.ceil((i + 1) / 2)}` },
      }),
    ),
  );

  // --- Users (all active with the default password for easy testing) ---
  const people: Array<{
    name: string;
    email: string;
    role: string;
    flatId?: string;
  }> = [
    { name: "Dana Director", email: "director@belvedere.test", role: "DIRECTOR", flatId: flats[0].id },
    { name: "Sam Secretary", email: "secretary@belvedere.test", role: "SECRETARY", flatId: flats[1].id },
    { name: "Laura Landlord", email: "landlord@belvedere.test", role: "LANDLORD", flatId: flats[2].id },
    { name: "Rob Renter", email: "renter@belvedere.test", role: "RENTER", flatId: flats[3].id },
    { name: "Harry Helper", email: "helper@belvedere.test", role: "HELPER" },
  ];

  const users: Record<string, { id: string }> = {};
  for (const p of people) {
    const u = await prisma.user.upsert({
      where: { email: p.email },
      update: { role: p.role, flatId: p.flatId ?? null },
      create: {
        name: p.name,
        email: p.email,
        role: p.role,
        flatId: p.flatId ?? null,
        passwordHash,
        active: true,
        invitedAt: new Date(),
      },
    });
    users[p.role] = { id: u.id };
  }

  const director = users["DIRECTOR"].id;
  const secretary = users["SECRETARY"].id;
  const helper = users["HELPER"].id;

  // --- Announcements ---
  const announcementCount = await prisma.announcement.count();
  if (announcementCount === 0) {
    await prisma.announcement.createMany({
      data: [
        {
          title: "Welcome to the Belvedere portal",
          body: "This is where you'll find building announcements, meeting minutes, decisions and documents. Please keep your contact details up to date.",
          audience: "ALL",
          authorId: secretary,
          publishedAt: new Date(),
        },
        {
          title: "Bin collection now on Thursdays",
          body: "The council has changed our collection day. Please put bins out by 7am on Thursday.",
          audience: "RESIDENTS",
          authorId: secretary,
          publishedAt: new Date(),
        },
      ],
    });
  }

  // --- Meeting with attendees + minutes + a decision ---
  const meetingCount = await prisma.meeting.count();
  if (meetingCount === 0) {
    const meeting = await prisma.meeting.create({
      data: {
        title: "Q3 Board Meeting",
        kind: "BOARD",
        scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        location: "Ground floor common room",
        agenda: "1. Roof repairs\n2. Service charge review\n3. Garden maintenance contract",
        minutes:
          "Attendees discussed the roof repair quotes. Agreed to proceed with contractor B. Service charge to be reviewed at the AGM.",
        status: "HELD",
        visibility: "PUBLIC",
        createdById: secretary,
        attendees: {
          create: [
            { userId: director, present: true },
            { userId: secretary, present: true },
          ],
        },
      },
    });

    await prisma.decision.create({
      data: {
        title: "Appoint Contractor B for roof repairs",
        detail:
          "The board agreed to appoint Contractor B for the roof repairs at a cost of £4,200, works to start next month.",
        decidedAt: meeting.scheduledAt,
        visibility: "PUBLIC",
        meetingId: meeting.id,
        createdById: secretary,
      },
    });

    // Upcoming meeting
    await prisma.meeting.create({
      data: {
        title: "Annual General Meeting",
        kind: "AGM",
        scheduledAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        location: "Ground floor common room",
        agenda: "1. Annual accounts\n2. Election of directors\n3. Service charge budget",
        status: "SCHEDULED",
        visibility: "PUBLIC",
        createdById: secretary,
      },
    });
  }

  // --- Projects / cases ---
  const projectCount = await prisma.project.count();
  if (projectCount === 0) {
    await prisma.project.create({
      data: {
        title: "Roof repairs",
        description: "Replace damaged tiles and repair flashing on the east side.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        visibility: "PUBLIC",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        assigneeId: helper,
        createdById: director,
        updates: {
          create: [
            {
              body: "Contractor B scheduled to start on the 15th.",
              authorId: director,
            },
          ],
        },
        tasks: {
          create: [
            { title: "Accept quote", done: true },
            { title: "Agree start date", done: true },
            { title: "Works complete", done: false },
          ],
        },
      },
    });

    await prisma.project.create({
      data: {
        title: "Review garden maintenance contract",
        description: "Current contract expires in December; get three quotes.",
        status: "OPEN",
        priority: "MED",
        visibility: "INTERNAL",
        createdById: secretary,
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log(
    `Seed complete. Log in with any of these (password: ${DEFAULT_PASSWORD}):\n` +
      people.map((p) => `  ${p.role.padEnd(10)} ${p.email}`).join("\n"),
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
