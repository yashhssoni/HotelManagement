const brevo = require('@getbrevo/brevo');
require('dotenv').config();

const TransactionalEmailsApi = 
  brevo.TransactionalEmailsApi || 
  (brevo.default && brevo.default.TransactionalEmailsApi) ||
  brevo;

const apiInstance = new TransactionalEmailsApi();

if (apiInstance.authentications && apiInstance.authentications['apiKey']) {
  apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY || '';
}

module.exports = {
  apiInstance,
  brevo,
};