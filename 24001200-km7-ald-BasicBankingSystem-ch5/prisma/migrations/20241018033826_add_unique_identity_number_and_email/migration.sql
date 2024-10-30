/*
  Warnings:

  - A unique constraint covering the columns `[identity_number]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "profiles_identity_number_key" ON "profiles"("identity_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
