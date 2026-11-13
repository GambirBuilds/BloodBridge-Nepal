import { getPrismaClient } from '../config/database.js';

export async function createInvitation(req, res) {
  try {
    const { id: bloodRequestId } = req.params;
    const { donorProfileId, note } = req.body;
    const prisma = await getPrismaClient();

    const request = await prisma.bloodRequest.findUnique({ where: { id: bloodRequestId } });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Blood request not found.' });
    }

    // Donor must exist and have notifications active
    const donor = await prisma.donorProfile.findUnique({
      where: { id: donorProfileId },
      include: { user: true },
    });
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor profile not found.' });
    }

    const invitation = await prisma.donorRequest.create({
      data: {
        bloodRequestId: request.id,
        donorProfileId: donor.id,
        status: 'SENT',
        responseNote: note || null,
      },
    });

    // Notify donor
    await prisma.notification.create({
      data: {
        userId: donor.userId,
        title: `Urgent blood donor invitation (${request.requestCode})`,
        message: `${request.hospitalName} verified a ${request.unitsRequired}u need compatible with your blood group.`,
        category: 'Urgent Match',
        actionPath: '/dashboard/donor?tab=requests',
      },
    });

    // Advance request status to DONOR_COORDINATION if currently VERIFIED
    if (request.status === 'VERIFIED') {
      await prisma.bloodRequest.update({
        where: { id: request.id },
        data: { status: 'DONOR_COORDINATION' },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Donor invitation recorded and alert dispatched.',
      data: invitation,
    });
  } catch (err) {
    console.error('[CreateInvitationError]', err);
    return res.status(500).json({ success: false, message: 'Failed to dispatch donor invitation.' });
  }
}

export async function getMyInvitations(req, res) {
  try {
    const prisma = await getPrismaClient();
    if (req.user.role !== 'DONOR' || !req.user.donorProfile) {
      return res.json({ success: true, count: 0, data: [] });
    }

    const invitations = await prisma.donorRequest.findMany({
      where: { donorProfileId: req.user.donorProfile.id },
      include: { bloodRequest: true },
    });

    return res.json({
      success: true,
      count: invitations.length,
      data: invitations,
    });
  } catch (err) {
    console.error('[GetMyInvitationsError]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve invitations.' });
  }
}

export async function respondToInvitation(req, res) {
  try {
    const { id: invitationId } = req.params;
    const { status, note } = req.body;
    const prisma = await getPrismaClient();

    if (!['ACCEPTED', 'DECLINED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be ACCEPTED or DECLINED.' });
    }

    const invitation = await prisma.donorRequest.findMany({
      where: { id: invitationId },
    });

    const target = invitation[0];
    if (!target) {
      return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }

    const updated = await prisma.donorRequest.update({
      where: { id: target.id },
      data: {
        status,
        responseNote: note || (status === 'ACCEPTED' ? 'Donor confirmed visit to hospital transfusion desk.' : 'Donor unable to attend.'),
      },
    });

    return res.json({
      success: true,
      message: `Invitation ${status.toLowerCase()} successfully.`,
      data: updated,
    });
  } catch (err) {
    console.error('[RespondInvitationError]', err);
    return res.status(500).json({ success: false, message: 'Failed to respond to invitation.' });
  }
}
