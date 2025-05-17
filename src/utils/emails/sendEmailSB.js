/* eslint-disable no-console */
import axios from "axios";
import SibApiV3Sdk from "./index";

const sendEmail = async (
  email,
  payload,
  templateId,
  subject = undefined,
  messageVersions = undefined,
  scheduledAt = undefined
) => {
  try {
    let response;
    if (scheduledAt) {
      // Use API Request
      response = await axios({
        method: "POST",
        url: "https://api.sendinblue.com/v3/smtp/email",
        headers: {
          accept: "application/json",
          "api-key": process.env.SIB_API_KEY,
          "content-type": "application/json",
        },
        data: {
          sender: {
            email: process.env.SIB_SENDER_EMAIL,
            name: process.env.SIB_SENDER_NAME,
          },
          ...(subject && { subject }),
          ...(!messageVersions && { to: [{ email }] }),
          params: payload,
          scheduledAt,
          templateId,
          ...(messageVersions && { messageVersions }),
        },
      });
    } else {
      // Use  SDK
      response =
        await new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail({
          ...(subject && { subject }),
          sender: {
            email: process.env.SIB_SENDER_EMAIL,
            name: process.env.SIB_SENDER_NAME,
          },
          ...(!messageVersions && { to: [{ email }] }),
          params: payload,
          templateId,
          ...(messageVersions && { messageVersions }),
        });
    }

    console.log("Email successful ✔", response?.data || response?.body);
  } catch (err) {
    console.log("Error => ", err);
  }
};

export default sendEmail;
