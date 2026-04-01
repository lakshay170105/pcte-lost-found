import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email service error:', error.message);
  } else {
    console.log('✅ Email service ready');
  }
});

// Send email function
export const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'PCTE Lost & Found <noreply@pcte.edu>',
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
export const emailTemplates = {
  // When someone finds a match for lost item
  lostItemMatch: (userName, lostItem, foundItem, finderContact) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .item-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 5px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .highlight { color: #667eea; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Great News!</h1>
          <p>Someone may have found your lost item!</p>
        </div>
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          
          <p>We have exciting news! Someone has reported finding an item that matches your lost item report.</p>
          
          <div class="item-box">
            <h3>Your Lost Item:</h3>
            <p><strong>Item:</strong> ${lostItem.name}</p>
            <p><strong>Description:</strong> ${lostItem.description}</p>
            <p><strong>Lost at:</strong> ${lostItem.location}</p>
            <p><strong>Date:</strong> ${new Date(lostItem.date).toLocaleDateString()}</p>
          </div>
          
          <div class="item-box">
            <h3>Found Item Match:</h3>
            <p><strong>Item:</strong> ${foundItem.name}</p>
            <p><strong>Description:</strong> ${foundItem.description}</p>
            <p><strong>Found at:</strong> ${foundItem.location}</p>
            <p><strong>Date:</strong> ${new Date(foundItem.date).toLocaleDateString()}</p>
            ${foundItem.image ? `<p><strong>Image:</strong> <a href="${foundItem.image.url}" style="color: #667eea;">📷 View Image</a></p>` : ''}
          </div>
          
          <div class="item-box" style="background: #e8f5e9; border-left-color: #4caf50;">
            <h3>📍 Collection Location:</h3>
            <p style="font-size: 18px; color: #2e7d32;"><strong>${foundItem.dropLocation || foundItem.location}</strong></p>
            <p style="color: #666; font-size: 14px;">You can collect your item from this location</p>
          </div>
          
          <div class="item-box">
            <h3>📞 Finder's Contact Information:</h3>
            <p><strong>Name:</strong> ${foundItem.reporterName}</p>
            <p><strong>📧 Email:</strong> <a href="mailto:${foundItem.contact}" style="color: #667eea;">${foundItem.contact}</a></p>
            <p><strong>📱 Phone:</strong> <a href="tel:${foundItem.phone}" style="color: #667eea; font-size: 18px;">${foundItem.phone}</a></p>
            <p style="color: #666; font-size: 14px; margin-top: 15px; padding: 10px; background: #fff3cd; border-radius: 5px;">
              ⚠️ <strong>Important:</strong> Please contact the finder to verify item details and arrange collection. Make sure to verify ownership before claiming.
            </p>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Contact the finder using the information above</li>
            <li>Verify the item details</li>
            <li>Arrange a safe meeting place (preferably on campus)</li>
            <li>Bring proof of ownership if possible</li>
          </ol>
          
          <p style="margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Your Dashboard</a>
          </p>
        </div>
        <div class="footer">
          <p>PCTE Lost & Found Portal</p>
          <p>Developed by Lakshay | BCA Student, PCTE</p>
          <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // When someone reports finding an item that matches
  foundItemMatch: (userName, foundItem, lostItem, ownerContact) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .item-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #764ba2; border-radius: 5px; }
        .button { display: inline-block; padding: 12px 30px; background: #764ba2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .highlight { color: #764ba2; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 Match Found!</h1>
          <p>Your found item matches a lost item report!</p>
        </div>
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          
          <p>Thank you for reporting the found item! We found a match with someone who reported losing a similar item.</p>
          
          <div class="item-box">
            <h3>Your Found Item:</h3>
            <p><strong>Item:</strong> ${foundItem.name}</p>
            <p><strong>Description:</strong> ${foundItem.description}</p>
            <p><strong>Found at:</strong> ${foundItem.location}</p>
            <p><strong>Drop Location:</strong> ${foundItem.dropLocation || foundItem.location}</p>
            <p><strong>Date:</strong> ${new Date(foundItem.date).toLocaleDateString()}</p>
          </div>
          
          <div class="item-box">
            <h3>Matching Lost Item Report:</h3>
            <p><strong>Item:</strong> ${lostItem.name}</p>
            <p><strong>Description:</strong> ${lostItem.description}</p>
            <p><strong>Lost at:</strong> ${lostItem.location}</p>
            <p><strong>Date:</strong> ${new Date(lostItem.date).toLocaleDateString()}</p>
          </div>
          
          <div class="item-box">
            <h3>📞 Owner's Contact Information:</h3>
            <p><strong>Name:</strong> ${lostItem.reporterName}</p>
            <p><strong>📧 Email:</strong> <a href="mailto:${lostItem.contact}" style="color: #764ba2;">${lostItem.contact}</a></p>
            <p><strong>📱 Phone:</strong> <a href="tel:${lostItem.phone}" style="color: #764ba2; font-size: 18px;">${lostItem.phone}</a></p>
            <p style="color: #666; font-size: 14px; margin-top: 15px; padding: 10px; background: #fff3cd; border-radius: 5px;">
              ⚠️ <strong>Important:</strong> The owner has been notified and may contact you. Please verify their identity before returning the item. Ask them to describe the item in detail.
            </p>
          </div>
          
          <p><strong>Important:</strong></p>
          <ul>
            <li>Verify the person's identity before returning the item</li>
            <li>Ask them to describe the item in detail</li>
            <li>Request proof of ownership if possible</li>
            <li>Meet in a safe, public place (preferably on campus)</li>
          </ul>
          
          <p style="margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Your Dashboard</a>
          </p>
        </div>
        <div class="footer">
          <p>PCTE Lost & Found Portal</p>
          <p>Developed by Lakshay | BCA Student, PCTE</p>
          <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Welcome email
  welcome: (userName, userEmail) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to PCTE Lost & Found!</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          
          <p>Welcome to the PCTE Lost & Found Portal! Your account has been successfully created.</p>
          
          <p><strong>Your Account Details:</strong></p>
          <ul>
            <li>Email: ${userEmail}</li>
            <li>Role: Student/Staff</li>
          </ul>
          
          <p><strong>What you can do:</strong></p>
          <ul>
            <li>📍 Report lost items</li>
            <li>📦 Report found items with images</li>
            <li>🔔 Get email notifications when matches are found</li>
            <li>📊 View your dashboard</li>
            <li>💬 Send feedback</li>
          </ul>
          
          <p style="margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}/login" class="button">Login Now</a>
          </p>
        </div>
        <div class="footer">
          <p>PCTE Lost & Found Portal</p>
          <p>Developed by Lakshay | BCA Student, PCTE</p>
        </div>
      </div>
    </body>
    </html>
  `
};

export default { sendEmail, emailTemplates };
