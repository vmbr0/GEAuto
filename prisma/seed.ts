import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Hash password
  const hashedPassword = await bcrypt.hash("password123", 12);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@geautoimport.fr" },
    update: {},
    create: {
      email: "admin@geautoimport.fr",
      name: "Admin GE Auto Import",
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  console.log("✅ Admin user created:", admin.email);

  // Create regular users
  const users = [
    {
      email: "user1@example.com",
      name: "Jean Dupont",
      password: hashedPassword,
    },
    {
      email: "user2@example.com",
      name: "Marie Martin",
      password: hashedPassword,
    },
    {
      email: "user3@example.com",
      name: "Pierre Durand",
      password: hashedPassword,
    },
  ];

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
    console.log("✅ User created:", user.email);
  }

  // GlobalSettings: une seule ligne (singleton)
  await prisma.globalSettings.upsert({
    where: { key: "default" },
    update: {},
    create: {
      key: "default",
      regionPricePerCV: 46.15,
      defaultTransportCost: 800,
      germanTempPlateCost: 150,
    },
  });
  console.log("✅ Global settings initialized");

  // Prix COC exemples (optionnel)
  const cocBrands = ["BMW", "MERCEDES", "AUDI", "VOLKSWAGEN", "PORSCHE"];
  for (const brand of cocBrands) {
    await prisma.cocPrice.upsert({
      where: { brand },
      update: {},
      create: { brand, price: 200 },
    });
  }
  console.log("✅ COC prices seeded for:", cocBrands.join(", "));

  // Default availability: Mon (1) to Fri (5), 09:00-18:00, 30 min slots
  for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek++) {
    await prisma.availability.upsert({
      where: { dayOfWeek },
      update: {},
      create: {
        dayOfWeek,
        startTime: "09:00",
        endTime: "18:00",
        slotDuration: 30,
        isActive: true,
      },
    });
  }
  console.log("✅ Default availability (Mon-Fri 9h-18h, 30 min slots)");

  console.log("\n🎉 Seeding completed!");
  console.log("\n📋 Identifiants de test:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("👤 ADMIN:");
  console.log("   Email: admin@geautoimport.fr");
  console.log("   Password: password123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("👤 UTILISATEURS:");
  users.forEach((u) => {
    console.log(`   Email: ${u.email}`);
    console.log(`   Password: password123`);
  });
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
