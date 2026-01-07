import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Initialize Nodemailer (fallback)
const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const from = process.env.EMAIL_FROM || 'Divya Bhakti Store <noreply@divyabhaktistore.com>';

  try {
    // Try Resend first
    if (resend) {
      await resend.emails.send({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    }

    // Fallback to Nodemailer
    if (transporter) {
      await transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    }

    console.error('No email provider configured');
    return false;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Divya Bhakti Store</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f4f0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td align="center" style="padding: 40px 40px 20px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 12px 12px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🙏 Divya Bhakti Store</h1>
                    <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">दिव्य भक्ती स्टोअर</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600; text-align: center;">Verify Your Email</h2>
                    <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6; text-align: center;">
                      Use the following OTP to complete your login. This code is valid for 10 minutes.
                    </p>
                    
                    <!-- OTP Box -->
                    <div style="background: linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%); border: 2px dashed #f97316; border-radius: 12px; padding: 30px; text-align: center; margin: 0 0 30px;">
                      <p style="margin: 0 0 10px; color: #92400e; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Your OTP Code</p>
                      <h1 style="margin: 0; color: #c2410c; font-size: 48px; font-weight: 700; letter-spacing: 8px;">${otp}</h1>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                      If you didn't request this code, please ignore this email or contact our support team.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
                    
                    <p style="margin: 0; color: #999999; font-size: 12px; text-align: center; line-height: 1.6;">
                      This is an automated email from Divya Bhakti Store.<br>
                      Please do not reply to this email.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td align="center" style="padding: 20px 40px 30px; background-color: #fafafa; border-radius: 0 0 12px 12px;">
                    <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                      Made with ❤️ in India
                    </p>
                    <p style="margin: 0; color: #999999; font-size: 12px;">
                      © ${new Date().getFullYear()} Divya Bhakti Store. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `${otp} is your Divya Bhakti Store verification code`,
    html,
    text: `Your OTP for Divya Bhakti Store is: ${otp}. This code is valid for 10 minutes.`,
  });
}

export async function sendOrderConfirmationEmail(
  email: string,
  orderDetails: {
    orderNumber: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    subtotal: number;
    shipping: number;
    discount: number;
    total: number;
    address: string;
  }
): Promise<boolean> {
  const itemsHtml = orderDetails.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #e5e5e5;">
          <p style="margin: 0; color: #1a1a1a; font-weight: 500;">${item.name}</p>
          <p style="margin: 5px 0 0; color: #666666; font-size: 14px;">Qty: ${item.quantity}</p>
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #e5e5e5; text-align: right;">
          <p style="margin: 0; color: #1a1a1a; font-weight: 600;">₹${item.price.toFixed(2)}</p>
        </td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Divya Bhakti Store</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f4f0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td align="center" style="padding: 40px 40px 20px; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border-radius: 12px 12px 0 0;">
                    <div style="width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                      <span style="font-size: 30px;">✓</span>
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Order Confirmed!</h1>
                    <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Thank you for your order</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;">
                      <p style="margin: 0 0 5px; color: #166534; font-size: 14px;">Order Number</p>
                      <p style="margin: 0; color: #15803d; font-size: 20px; font-weight: 700;">${orderDetails.orderNumber}</p>
                    </div>
                    
                    <!-- Order Items -->
                    <h3 style="margin: 0 0 15px; color: #1a1a1a; font-size: 16px; font-weight: 600;">Order Summary</h3>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                      ${itemsHtml}
                    </table>
                    
                    <!-- Totals -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fafafa; border-radius: 8px; padding: 20px;">
                      <tr>
                        <td style="padding: 8px 0; color: #666666;">Subtotal</td>
                        <td style="padding: 8px 0; text-align: right; color: #1a1a1a;">₹${orderDetails.subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666;">Shipping</td>
                        <td style="padding: 8px 0; text-align: right; color: #1a1a1a;">${orderDetails.shipping === 0 ? 'Free' : '₹' + orderDetails.shipping.toFixed(2)}</td>
                      </tr>
                      ${orderDetails.discount > 0 ? `
                      <tr>
                        <td style="padding: 8px 0; color: #16a34a;">Discount</td>
                        <td style="padding: 8px 0; text-align: right; color: #16a34a;">-₹${orderDetails.discount.toFixed(2)}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 12px 0 0; color: #1a1a1a; font-weight: 700; font-size: 18px; border-top: 2px solid #e5e5e5;">Total</td>
                        <td style="padding: 12px 0 0; text-align: right; color: #f97316; font-weight: 700; font-size: 18px; border-top: 2px solid #e5e5e5;">₹${orderDetails.total.toFixed(2)}</td>
                      </tr>
                    </table>
                    
                    <!-- Delivery Address -->
                    <h3 style="margin: 30px 0 15px; color: #1a1a1a; font-size: 16px; font-weight: 600;">Delivery Address</h3>
                    <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6; background-color: #fafafa; padding: 15px; border-radius: 8px;">
                      ${orderDetails.address}
                    </p>
                    
                    <!-- CTA -->
                    <div style="text-align: center; margin-top: 30px;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600;">Track Your Order</a>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td align="center" style="padding: 20px 40px 30px; background-color: #fafafa; border-radius: 0 0 12px 12px;">
                    <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                      🙏 Thank you for choosing Divya Bhakti Store
                    </p>
                    <p style="margin: 0; color: #999999; font-size: 12px;">
                      © ${new Date().getFullYear()} Divya Bhakti Store. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Order Confirmed: ${orderDetails.orderNumber} - Divya Bhakti Store`,
    html,
    text: `Your order ${orderDetails.orderNumber} has been confirmed. Total: ₹${orderDetails.total}. Track your order at ${process.env.NEXT_PUBLIC_APP_URL}/orders`,
  });
}

export async function sendOrderStatusEmail(
  email: string,
  orderNumber: string,
  status: string,
  trackingUrl?: string
): Promise<boolean> {
  const statusMessages: Record<string, { title: string; description: string; emoji: string }> = {
    CONFIRMED: {
      title: 'Order Confirmed',
      description: 'We have received your order and it is being processed.',
      emoji: '✓',
    },
    PROCESSING: {
      title: 'Order Processing',
      description: 'Your order is being prepared with care and devotion.',
      emoji: '⚙️',
    },
    PACKED: {
      title: 'Order Packed',
      description: 'Your order has been carefully packed and is ready for shipping.',
      emoji: '📦',
    },
    SHIPPED: {
      title: 'Order Shipped',
      description: 'Your order is on its way! Track it using the link below.',
      emoji: '🚚',
    },
    OUT_FOR_DELIVERY: {
      title: 'Out for Delivery',
      description: 'Your order is out for delivery and will reach you soon.',
      emoji: '🏃',
    },
    DELIVERED: {
      title: 'Order Delivered',
      description: 'Your order has been delivered. May it bring divine blessings to your home!',
      emoji: '🙏',
    },
    CANCELLED: {
      title: 'Order Cancelled',
      description: 'Your order has been cancelled. If you have any questions, please contact us.',
      emoji: '❌',
    },
  };

  const statusInfo = statusMessages[status] || {
    title: 'Order Update',
    description: `Your order status has been updated to: ${status}`,
    emoji: '📋',
  };

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${statusInfo.title} - Divya Bhakti Store</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f4f0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td align="center" style="padding: 40px 40px 20px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 12px 12px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🙏 Divya Bhakti Store</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px; text-align: center;">
                    <div style="width: 80px; height: 80px; background-color: #fff7ed; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 40px;">
                      ${statusInfo.emoji}
                    </div>
                    <h2 style="margin: 0 0 10px; color: #1a1a1a; font-size: 24px; font-weight: 600;">${statusInfo.title}</h2>
                    <p style="margin: 0 0 20px; color: #666666; font-size: 16px;">Order: <strong>${orderNumber}</strong></p>
                    <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                      ${statusInfo.description}
                    </p>
                    
                    ${trackingUrl ? `
                    <a href="${trackingUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; margin-bottom: 20px;">Track Your Order</a>
                    ` : ''}
                    
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders" style="display: inline-block; color: #f97316; text-decoration: none; font-weight: 500;">View Order Details →</a>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td align="center" style="padding: 20px 40px 30px; background-color: #fafafa; border-radius: 0 0 12px 12px;">
                    <p style="margin: 0; color: #999999; font-size: 12px;">
                      © ${new Date().getFullYear()} Divya Bhakti Store. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `${statusInfo.title}: ${orderNumber} - Divya Bhakti Store`,
    html,
    text: `${statusInfo.title}: ${orderNumber}. ${statusInfo.description}`,
  });
}

