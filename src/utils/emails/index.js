import SibApiV3Sdk from "sib-api-v3-sdk";

SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey =
  process.env.SIB_API_KEY;

export default SibApiV3Sdk;
