/* eslint-disable class-methods-use-this */
import ReferralService from "../services/referralServices";

class ReferralController {

  async completeReferral(req, res) {
    try {
      const { referralId } = req.params;
      const { rewardAmount } = req.body;
      const completedReferral = await ReferralService.completeReferral(
        referralId,
        rewardAmount
      );
      res.status(200).json(completedReferral);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getReferralStats(req, res) {
    try {
      const stats = await ReferralService.getReferralStats(req.user.id);
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async listReferrals(req, res) {
    try {
      const { page, limit } = req.query;
      const referrals = await ReferralService.listReferrals(
        req.user.id,
        parseInt(page, 10) || 1,
        parseInt(limit, 10) || 10
      );
      res.status(200).json(referrals);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new ReferralController();
