const { apiInstance, brevo } = require('../config/brevo');

// 1. Send OTP Verification Email
exports.sendOtpEmail = async (toEmail, otpCode, purpose) => {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  const purposeLabels = {
    registration: 'Account Registration',
    forgot_password: 'Password Reset',
    booking_verification: 'Booking Verification',
  };

  const actionName = purposeLabels[purpose] || 'Verification';

  sendSmtpEmail.subject = `Your OTP for ${actionName}: ${otpCode}`;
  sendSmtpEmail.sender = {
    name: process.env.BREVO_SENDER_NAME || 'Hotel Reservations',
    email: process.env.BREVO_SENDER_EMAIL,
  };
  sendSmtpEmail.to = [{ email: toEmail }];
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff;">
      <h2 style="color: #2563eb; text-align: center; margin-bottom: 8px;">Verification Code</h2>
      <p style="color: #475569; font-size: 14px; text-align: center; margin-bottom: 24px;">
        Use the one-time code below to complete your <strong>${actionName}</strong>. This code is valid for 5 minutes.
      </p>
      
      <div style="text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0f172a; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px; display: inline-block;">
          ${otpCode}
        </span>
      </div>
      
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
        If you did not request this OTP, please safely ignore this email.
      </p>
    </div>
  `;

  return apiInstance.sendTransacEmail(sendSmtpEmail);
};

// 2. Send Confirmed Booking Details Email (After Receptionist Allotment)
exports.sendBookingConfirmationEmail = async ({
  customerEmail,
  customerName,
  bookingId,
  roomNumber,
  roomType,
  checkInDate,
  totalAmount,
}) => {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = `Booking Confirmed: Room #${roomNumber} (${bookingId})`;
  sendSmtpEmail.sender = {
    name: process.env.BREVO_SENDER_NAME || 'Hotel Reservations',
    email: process.env.BREVO_SENDER_EMAIL,
  };
  sendSmtpEmail.to = [{ email: customerEmail, name: customerName }];
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="background-color: #dcfce7; color: #15803d; font-weight: bold; padding: 6px 16px; border-radius: 9999px; font-size: 14px;">
          ✓ Reservation Confirmed
        </span>
      </div>
      
      <h2 style="color: #0f172a; text-align: center; margin-top: 10px;">Your Room is Ready!</h2>
      <p style="color: #475569; font-size: 14px; text-align: center;">
        Dear <strong>${customerName}</strong>, your room has been officially assigned by our front desk.
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Booking ID</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${bookingId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Assigned Room</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: #16a34a; font-weight: bold;">
              Room ${roomNumber} (${roomType})
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Check-In Date</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${new Date(checkInDate).toDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Total Paid</strong></td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #0f172a;">Rs. ${totalAmount}</td>
          </tr>
        </table>
      </div>

      <p style="color: #64748b; font-size: 13px; text-align: center; line-height: 1.5;">
        Please present your Booking ID at the reception upon arrival.<br/>We look forward to your stay!
      </p>
    </div>
  `;

  return apiInstance.sendTransacEmail(sendSmtpEmail);
};