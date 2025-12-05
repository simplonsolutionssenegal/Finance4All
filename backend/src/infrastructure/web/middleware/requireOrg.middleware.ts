import type { NextFunction, Request, Response } from 'express';
import { clerkClient, getAuth } from '@clerk/express';

export async function requireSameActiveOrg(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, orgId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }
    const requestedOrgId = String(
      (req.body?.organizationId ?? req.query?.organizationId ?? req.params?.organizationId) || ''
    ).trim();

    if (!requestedOrgId) {
      return res.status(400).json({ success: false, message: 'organizationId manquant' });
    }

    if (orgId && orgId === requestedOrgId) return next();
    const { data } = await clerkClient.users.getOrganizationMembershipList({
      userId,
      limit: 200,
    });

    const isMember = data.some(
      (m: any) => (m?.organization?.id ?? m?.organizationId) === requestedOrgId
    );

    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Forbidden (organization)' });
    }

    return next();
  } catch (e) {
    return next(e);
  }
}
