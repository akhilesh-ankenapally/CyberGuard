import type { Platform } from '../types';

export const sampleMessages: Record<Platform, string[]> = {
  WhatsApp: [
    'Hey, check this payment update from your bank',
    'Can you verify this delivery link before it expires?',
    'Urgent: your account will be blocked unless you tap here',
    'Look at the photo I just sent you',
    'Free gift card available, claim in 5 minutes',
  ],
  Instagram: [
    'New collab opportunity with a brand partner',
    'We noticed suspicious login, confirm immediately',
    'Tap to see your exclusive creator payout',
    'Your reel is going viral, view analytics now',
    'Verify your profile to keep the blue badge',
  ],
  Email: [
    'Invoice attached for your review',
    'Password reset required: verify your identity',
    'Security alert: sign-in from a new device',
    'Quarterly report and team summary enclosed',
    'Wire transfer approval needs immediate action',
  ],
  SMS: [
    'Package held at depot, confirm address now',
    'Your OTP is 482193 for login',
    'Prize alert: claim your refund here',
    'Bank notice: unusual activity detected',
    'Missed call from courier, tap to reschedule',
  ],
};

export const senderPool = {
  WhatsApp: ['Unknown Contact', 'Priya', 'Mom', 'Delivery Bot', 'Support Desk'],
  Instagram: ['Brand Partner', 'Creator Hub', 'Unknown DM', 'Verified Seller', 'Influencer Team'],
  Email: ['security@bank-alerts.com', 'billing@cloudsuite.io', 'hr@company-mail.com', 'noreply@service-update.org'],
  SMS: ['Bank Alert', 'Courier Service', 'System OTP', 'Promo Desk', 'Verification Code'],
};


