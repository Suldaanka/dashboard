const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const roles = [
  { name: "ADMIN", permissions: [
    "dashboard", "rooms", "reservation", "menu", "tables", "orders", "expenses", "users", "employees", "settings"
  ]},
  { name: "WAITER", permissions: ["orders", "profile", "menu", "tables"] },
  { name: "STAFF", permissions: ["rooms", "reservation"] },
  { name: "KITCHEN", permissions: ["orders", "profile", "menu", "tables"] },
];

async function main() {
  for (const role of roles) {
    let dbRole = await prisma.roleModel.upsert({
      where: { name: role.name },
      update: {},
      create: { name: role.name },
    });
    for (const permName of role.permissions) {
      let perm = await prisma.permission.upsert({
        where: { name: permName },
        update: {},
        create: { name: permName },
      });
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: dbRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: dbRole.id, permissionId: perm.id },
      });
    }
  }
  console.log("Seeded roles and permissions.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());