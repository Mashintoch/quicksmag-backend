import WaitList from "../models/waitlist";
import response from "../helpers/responseHelper";
import HttpError from "../helpers/http-error";

const JoinWaitList = async (req, res) => {
  try {
    const { name, email, phoneNumber, message, country } = req.body;

    if (!name || !email || !phoneNumber) {
      throw new HttpError("Name, email and Phone Number are required!", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HttpError("Invalid email format!", 400);
    }

    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new HttpError("Invalid phone number format!", 400);
    }

    const existingUser = await WaitList.findOne({ email });
    if (existingUser) {
      throw new HttpError("Email already exists in waitlist!", 409);
    }

    const waitlist = new WaitList({
      name: name.trim(),
      email: email.toLowerCase(),
      phoneNumber,
      message,
      country,
    });
    await waitlist.save();

    return response(
      res,
      201,
      "Successfully added to Pozse Waitlist!",
      waitlist
    );
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      return response(res, error.code, error.message, null);
    }
    return response(res, 500, "Internal server error", null);
  }
};

const getWaitLists =  async (req, res) => {
  try {
    const waitlists = await WaitList.find({}).sort({ createdAt: -1 });
    return response(res, 200, "Waitlists retrieved successfully", waitlists);
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      return response(res, error.code, error.message, null);
    }
    return response(res, 500, "Internal server error", null);
  }
}

const deleteWaitList = async (req, res) => {
  try {
    const { id } = req.params;
    const waitlist = await WaitList.findByIdAndDelete(id);
    if (!waitlist) {
      return response(res, 404, "Waitlist not found", null);
    }
    return response(res, 200, "Waitlist deleted successfully", waitlist);
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      return response(res, error.code, error.message, null);
    }
    return response(res, 500, "Internal server error", null);
  }
};

export default {
  JoinWaitList,
  getWaitLists,
  deleteWaitList
};
