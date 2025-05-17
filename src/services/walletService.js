/* eslint-disable class-methods-use-this */
/* eslint-disable object-shorthand */
/* eslint-disable no-underscore-dangle */
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

import User from "../models/user";
import Transaction from "../models/transaction";

class WallectService {
  // get wallet balance
  async getBalance(userId) {
    try {
      const user = await User.findById(userId).populate("wallet");
      return { balance: user.wallet.balance };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // add money to wallet
  async addMoney(userId, payload) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { amount } = payload;
      if (!amount || amount <= 0) {
        throw new Error("Invalid amount");
      }

      const transaction = new Transaction({
        user: userId,
        type: "credit",
        amount,
        description: "Wallet top-up",
        reference: uuidv4(),
      });

      await transaction.save({ session });

      const user = await User.findById(userId).session(session);
      user.walletBalance += amount;
      await user.save();

      await session.commitTransaction();
      return {
        message: "Money added successfully",
        balance: user.walletBalance,
        transaction: transaction,
      };
    } catch (error) {
      await session.abortTransaction();
      throw new Error({ error: error.message });
    } finally {
      session.endSession();
    }
  }

  // transfer money
  async transfer(userId, payload) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { recipientUsername, amount } = payload;
      if (!amount || amount <= 0) {
        throw new Error("Invalid amount");
      }

      const sender = await User.findById(userId).session(session);
      if (sender.walletBalance < amount) {
        throw new Error("Insufficient balance");
      }

      const recipient = await User.findOne({
        username: recipientUsername,
      }).session(session);
      if (!recipient) {
        throw new Error("Recipient not found");
      }

      // create debit transaction for sender
      const debitTransaction = new Transaction({
        userId: sender._id,
        type: "debit",
        amount,
        description: `Transfer to ${recipientUsername}`,
        reference: uuidv4(),
      });

      // create credit transaction for recipient
      const creditTransaction = new Transaction({
        userId: recipient._id,
        type: "credit",
        amount,
        description: `Transfer from ${sender.username}`,
        reference: uuidv4(),
      });

      await debitTransaction.save({ session });
      await creditTransaction.save({ session });

      // Update balances
      sender.walletBalance -= amount;
      recipient.walletBalance += amount;

      await sender.save();
      await recipient.save();

      await session.commitTransaction();
      return {
        message: "Transfer successful",
        balance: sender.walletBalance,
        transaction: debitTransaction,
      };
    } catch (error) {
      await session.abortTransaction();
      throw new Error({ error: error.message });
    } finally {
      session.endSession();
    }
  }

  // Get transaction history
  async getTransactions(userId) {
    try {
      const transactions = await Transaction.find({
        userId,
      })
        .sort({ createdAt: -1 })
        .limit(20);

      return transactions;
    } catch (error) {
      throw new Error(
        { error: "Error fetching transactions" } || error.message
      );
    }
  }
}

export default new WallectService();
