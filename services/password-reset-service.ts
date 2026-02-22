import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const TOKEN_EXPIRY_MINUTES = 30;
const TOKEN_BYTES = 32;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const passwordResetService = {
  async createToken(email: string): Promise<{ token: string; userId: string } | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true },
    });
    if (!user?.id) return null;

    const rawToken = crypto.randomBytes(TOKEN_BYTES).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return { token: rawToken, userId: user.id };
  },

  async consumeToken(rawToken: string): Promise<string | null> {
    const tokenHash = hashToken(rawToken);
    const record = await prisma.passwordResetToken.findFirst({
      where: { tokenHash },
      include: { user: { select: { id: true, disabled: true } } },
    });
    if (!record || record.usedAt || record.expiresAt < new Date() || record.user.disabled) {
      return null;
    }
    await prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });
    return record.user.id;
  },

  getExpiryMinutes() {
    return TOKEN_EXPIRY_MINUTES;
  },
};
