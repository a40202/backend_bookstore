-- CreateTable
CREATE TABLE "StaffRoleConfig" (
    "id" TEXT NOT NULL,
    "permissions" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffRoleConfig_pkey" PRIMARY KEY ("id")
);
