import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "password123";

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // --- Blocks + flats (the property is a set of blocks, each with flats) ---
  const blockData = [
    { name: "Belvedere House", floors: 2, flats: ["Flat 1", "Flat 2", "Flat 3"] },
    { name: "Belvedere Court", floors: 2, flats: ["Flat 1", "Flat 2"] },
  ];

  const flatByKey: Record<string, string> = {};
  for (const b of blockData) {
    const block = await prisma.block.upsert({
      where: { name: b.name },
      update: {},
      create: { name: b.name },
    });
    for (let i = 0; i < b.flats.length; i++) {
      const label = b.flats[i];
      const flat = await prisma.flat.upsert({
        where: { blockId_label: { blockId: block.id, label } },
        update: {},
        create: {
          label,
          blockId: block.id,
          floor: `Floor ${Math.ceil((i + 1) / 2)}`,
        },
      });
      flatByKey[`${b.name}/${label}`] = flat.id;
    }
  }

  // --- Users ---
  const people: Array<{
    name: string;
    email: string;
    role: string;
    flatKey?: string;
    phone?: string;
    preferredContact?: string;
    commsNotes?: string;
    key?: string;
  }> = [
    { name: "Dana Director", email: "director@belvedere.test", role: "DIRECTOR", flatKey: "Belvedere House/Flat 1", preferredContact: "EMAIL", key: "DIRECTOR" },
    { name: "Sam Secretary", email: "secretary@belvedere.test", role: "SECRETARY", flatKey: "Belvedere House/Flat 2", preferredContact: "WHATSAPP", key: "SECRETARY" },
    { name: "Laura Landlord", email: "landlord@belvedere.test", role: "LANDLORD", flatKey: "Belvedere House/Flat 3", preferredContact: "PHONE", phone: "07700 900123", commsNotes: "Prefers a phone call to email.", key: "LANDLORD" },
    { name: "Rob Renter", email: "renter@belvedere.test", role: "RENTER", flatKey: "Belvedere Court/Flat 1", preferredContact: "EMAIL", key: "RENTER" },
    { name: "Harry Helper", email: "helper@belvedere.test", role: "HELPER", preferredContact: "WHATSAPP", key: "HELPER" },
    { name: "Edna Mews", email: "edna@belvedere.test", role: "RENTER", flatKey: "Belvedere Court/Flat 2", preferredContact: "POST", commsNotes: "Does not use email or a smartphone — please post a letter or call her son.", key: "EDNA" },
  ];

  const users: Record<string, { id: string }> = {};
  for (const p of people) {
    const flatId = p.flatKey ? flatByKey[p.flatKey] ?? null : null;
    const u = await prisma.user.upsert({
      where: { email: p.email },
      update: {
        role: p.role,
        flatId,
        preferredContact: p.preferredContact ?? "EMAIL",
        commsNotes: p.commsNotes ?? null,
        phone: p.phone ?? null,
      },
      create: {
        name: p.name,
        email: p.email,
        role: p.role,
        flatId,
        phone: p.phone ?? null,
        preferredContact: p.preferredContact ?? "EMAIL",
        commsNotes: p.commsNotes ?? null,
        passwordHash,
        active: true,
        invitedAt: new Date(),
      },
    });
    if (p.key) users[p.key] = { id: u.id };
  }

  const director = users["DIRECTOR"].id;
  const secretary = users["SECRETARY"].id;
  const helper = users["HELPER"].id;

  // --- Announcements ---
  if ((await prisma.announcement.count()) === 0) {
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

  // --- Meeting + decision ---
  if ((await prisma.meeting.count()) === 0) {
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

  // --- Projects ---
  if ((await prisma.project.count()) === 0) {
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
        updates: { create: [{ body: "Contractor B scheduled to start on the 15th.", authorId: director }] },
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

  // --- "New to Belvedere" welcome pages ---
  if ((await prisma.infoPage.count({ where: { section: "WELCOME" } })) === 0) {
    await prisma.infoPage.createMany({
      data: [
        {
          section: "WELCOME",
          category: "Facilities",
          title: "Building facilities",
          body: "Shared facilities include the ground-floor common room (bookable via the secretary), bike store in the basement, and bin store by the side entrance. The lift serves all floors.",
          order: 1,
          visibility: "PUBLIC",
          createdById: secretary,
        },
        {
          section: "WELCOME",
          category: "Rules",
          title: "House rules",
          body: "Quiet hours are 10pm–8am. No smoking in common areas. Please break down cardboard before recycling. Communal doors must be kept closed for security.",
          order: 2,
          visibility: "PUBLIC",
          createdById: secretary,
        },
        {
          section: "WELCOME",
          category: "Access & keys",
          title: "Access, keys and fobs",
          body: "Each flat is issued two entry fobs. Replacements can be requested from the secretary (a charge applies). The tradesperson intercom code changes annually — current residents are notified by announcement.",
          order: 3,
          visibility: "PUBLIC",
          createdById: secretary,
        },
        {
          section: "WELCOME",
          category: "Emergencies & contacts",
          title: "Emergencies & key contacts",
          body: "For building emergencies (water leaks, lift entrapment, power), call the managing contacts listed here. For life-threatening emergencies always call 999 first.",
          order: 4,
          visibility: "PUBLIC",
          createdById: secretary,
        },
      ],
    });
  }

  // --- Finance: strategy & statements pages ---
  if ((await prisma.infoPage.count({ where: { section: "FINANCE" } })) === 0) {
    await prisma.infoPage.createMany({
      data: [
        {
          section: "FINANCE",
          category: "Strategy",
          title: "Financial strategy 2024–2027",
          body: "Our aim is to build the reserve fund to cover the next major works cycle (roof, external decoration, lift refurbishment) without special levies. Service charges are reviewed annually at the AGM.",
          order: 1,
          visibility: "PUBLIC",
          createdById: director,
        },
        {
          section: "FINANCE",
          category: "Financial statements",
          title: "Year-end accounts 2023",
          body: "The audited service charge accounts for the year ending 31 December 2023 were approved at the AGM. A copy can be linked here once uploaded to the document library.",
          order: 2,
          visibility: "PUBLIC",
          createdById: director,
        },
      ],
    });
  }

  // --- Finance: reserve fund ledger ---
  if ((await prisma.reserveFundEntry.count()) === 0) {
    await prisma.reserveFundEntry.createMany({
      data: [
        { date: new Date("2024-01-01"), description: "Opening balance", amount: 18500, createdById: director },
        { date: new Date("2024-04-01"), description: "Q1 reserve contributions", amount: 3200, createdById: secretary },
        { date: new Date("2024-07-01"), description: "Q2 reserve contributions", amount: 3200, createdById: secretary },
        { date: new Date("2024-08-15"), description: "Gutter repairs", amount: -1250, createdById: director },
        { date: new Date("2024-10-01"), description: "Q3 reserve contributions", amount: 3200, createdById: secretary },
      ],
    });
  }

  // --- Finance: a budget with lines ---
  if ((await prisma.budget.count()) === 0) {
    await prisma.budget.create({
      data: {
        year: 2025,
        title: "Service charge budget 2025",
        note: "Draft budget to be approved at the AGM.",
        visibility: "PUBLIC",
        createdById: director,
        lines: {
          create: [
            { category: "Buildings insurance", budgeted: 6200, actual: 0, order: 1 },
            { category: "Cleaning", budgeted: 3600, actual: 0, order: 2 },
            { category: "Gardening", budgeted: 1800, actual: 0, order: 3 },
            { category: "Lift maintenance", budgeted: 1500, actual: 0, order: 4 },
            { category: "Electricity (communal)", budgeted: 1200, actual: 0, order: 5 },
            { category: "Reserve fund contribution", budgeted: 12000, actual: 0, order: 6 },
            { category: "Management & accountancy", budgeted: 2400, actual: 0, order: 7 },
          ],
        },
      },
    });
  }

  // --- Settings (WhatsApp group links — placeholders) ---
  for (const [key, value] of [
    ["whatsapp_residents_url", "https://chat.whatsapp.com/EXAMPLE-residents"],
    ["whatsapp_board_url", "https://chat.whatsapp.com/EXAMPLE-board"],
  ] as const) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
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
