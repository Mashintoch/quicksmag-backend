import SibApiV3Sdk from "./index";

const getEmailTemplates = async (limit = 50) => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const opts = {
    templateStatus: true,
    limit,
    offset: 0,
  };

  const data = await apiInstance.getSmtpTemplates(opts);

  return data;
};

export default getEmailTemplates;
