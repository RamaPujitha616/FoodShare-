import Certificate from '../models/Certificate.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Donation from '../models/Donation.js';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

// Helper to check and award certificate
const checkAndAward = async (user, certificateType, mealsAchieved, points) => {
  const existing = await Certificate.findOne({ userId: user._id, certificateType });
  if (!existing) {
    const rolePrefix = user.role === 'donor' ? 'DON' : 'NGO';
    const typeAbbreviation = certificateType
      .split(' ')
      .filter(w => w.toLowerCase() !== 'of' && w.toLowerCase() !== 'and')
      .map(w => w[0])
      .join('')
      .toUpperCase(); // e.g. "Certificate of Contribution" -> "CC"

    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const certificateId = `CERT-${rolePrefix}-${typeAbbreviation}-${rand}`;

    const cert = await Certificate.create({
      userId: user._id,
      role: user.role,
      certificateType,
      certificateId,
      mealsAchieved,
      impactPoints: points,
      pdfUrl: `/api/certificates/${certificateId}/download`
    });

    // Create notification
    await Notification.create({
      recipient: user._id,
      title: '🏆 New Certificate Awarded!',
      message: `Congratulations! You have been awarded the "${certificateType}" for your contribution of ${mealsAchieved} meals and ${points} impact points.`,
      type: 'Badge'
    });

    return cert;
  }
  return null;
};

// @desc    Check certificate milestones for a user
// @access  Internal
export const checkCertificateMilestones = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    if (user.role === 'donor') {
      // 1. Certificate of Contribution (500 meals)
      if (user.mealsDonated >= 500) {
        await checkAndAward(user, 'Certificate of Contribution', user.mealsDonated, user.impactPoints);
      }
      // 2. Certificate of Community Impact (1000 meals)
      if (user.mealsDonated >= 1000) {
        await checkAndAward(user, 'Certificate of Community Impact', user.mealsDonated, user.impactPoints);
      }
      // 3. Gold Donor Recognition Certificate (Gold badge - 1000 impact points)
      if (user.impactPoints >= 1000) {
        await checkAndAward(user, 'Gold Donor Recognition Certificate', user.mealsDonated, user.impactPoints);
      }
    } else if (user.role === 'ngo') {
      // Calculate meals distributed from delivered donations
      const result = await Donation.aggregate([
        { $match: { ngo: user._id, status: 'Delivered' } },
        { $group: { _id: null, totalMeals: { $sum: '$mealsCount' } } }
      ]);
      const mealsDistributed = result.length > 0 ? result[0].totalMeals : 0;

      // 1. Community Impact Partner Certificate (500 meals distributed)
      if (mealsDistributed >= 500) {
        await checkAndAward(user, 'Community Impact Partner Certificate', mealsDistributed, user.impactPoints);
      }
      // 2. Hunger Relief Excellence Certificate (100 deliveries completed)
      if (user.deliveriesCompleted >= 100) {
        await checkAndAward(user, 'Hunger Relief Excellence Certificate', mealsDistributed, user.impactPoints);
      }
      // 3. Top NGO Recognition Certificate (150 deliveries completed OR 2500 impact points)
      if (user.deliveriesCompleted >= 150 || user.impactPoints >= 2500) {
        await checkAndAward(user, 'Top NGO Recognition Certificate', mealsDistributed, user.impactPoints);
      }
    }
  } catch (error) {
    console.error('Error checking milestones:', error);
  }
};

// @desc    Get all certificates for logged-in user (or filter if admin)
// @route   GET /api/certificates
// @access  Private
export const getCertificates = async (req, res) => {
  try {
    // Automatically trigger milestone evaluation to sync pre-seeded or recently updated statistics
    if (req.user.role !== 'admin') {
      await checkCertificateMilestones(req.user._id);
    }

    let query = {};
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    } else {
      const { userId, certificateType } = req.query;
      if (userId) query.userId = userId;
      if (certificateType) query.certificateType = { $regex: certificateType, $options: 'i' };
    }

    const certificates = await Certificate.find(query)
      .populate('userId', 'name email orgName role impactPoints mealsDonated deliveriesCompleted')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: certificates.length, data: certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get certificate details
// @route   GET /api/certificates/:id
// @access  Private
export const getCertificateById = async (req, res) => {
  try {
    let certificate;
    if (req.params.id.startsWith('CERT-')) {
      certificate = await Certificate.findOne({ certificateId: req.params.id }).populate('userId', 'name email orgName role impactPoints mealsDonated deliveriesCompleted');
    } else {
      certificate = await Certificate.findById(req.params.id).populate('userId', 'name email orgName role impactPoints mealsDonated deliveriesCompleted');
    }

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    // Authorization check: only owner or admin
    if (req.user.role !== 'admin' && certificate.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this certificate' });
    }

    res.status(200).json({ success: true, data: certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify certificate authenticity (Public)
// @route   GET /api/certificates/:id/verify
// @access  Public
export const verifyCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.id })
      .populate('userId', 'name email orgName role impactPoints');

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate is invalid or does not exist.' });
    }

    res.status(200).json({ success: true, data: certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to draw dynamic landscape PDF certificates using PDFKit
const generatePDFBuffer = async (certificate, user, req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 40
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      const w = 841.89; // landscape A4 width
      const h = 595.28; // landscape A4 height

      // 1. Draw Outer Green/Emerald Border (line width 5)
      doc.rect(20, 20, w - 40, h - 40)
        .lineWidth(5)
        .stroke('#059669');

      // 2. Draw Inner Gold/Amber Border (line width 1.5)
      doc.rect(28, 28, w - 56, h - 56)
        .lineWidth(1.5)
        .stroke('#D97706');

      // 3. Draw Corner Decorations (Gold circles and lines)
      const drawCorner = (cx, cy) => {
        doc.circle(cx, cy, 6).fill('#D97706');
      };
      drawCorner(28, 28);
      drawCorner(w - 28, 28);
      drawCorner(28, h - 28);
      drawCorner(w - 28, h - 28);

      // 4. Draw Header Logo Vector & Brand Text
      // Draw Emerald Circular Badge
      const badgeY = 55;
      doc.circle(w / 2, badgeY, 24).fill('#10B981');
      // Draw white leaf/cross symbol inside the badge
      doc.moveTo(w / 2, badgeY - 12)
        .lineTo(w / 2, badgeY + 12)
        .lineWidth(4)
        .stroke('#ffffff');
      doc.moveTo(w / 2 - 12, badgeY)
        .lineTo(w / 2 + 12, badgeY)
        .lineWidth(4)
        .stroke('#ffffff');

      // Brand Title
      doc.font('Helvetica-Bold')
        .fontSize(22)
        .fillColor('#047857')
        .text('FOODSHARE+', 0, badgeY + 32, { align: 'center', width: w });

      // Achievement Label
      doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#D97706')
        .text('CERTIFICATE OF MILESTONE ACHIEVEMENT', 0, badgeY + 62, { align: 'center', width: w, characterSpacing: 2 });

      // 5. Certificate Title
      doc.font('Helvetica-Bold')
        .fontSize(30)
        .fillColor('#1E293B')
        .text(certificate.certificateType, 0, badgeY + 95, { align: 'center', width: w });

      // 6. Recipient Subtext
      doc.font('Helvetica')
        .fontSize(11)
        .fillColor('#64748B')
        .text('PROUDLY PRESENTED TO', 0, badgeY + 148, { align: 'center', width: w });

      // 7. Recipient Name
      const recipientName = user.role === 'ngo' ? (user.orgName || user.name) : user.name;
      doc.font('Helvetica-Bold')
        .fontSize(28)
        .fillColor('#0F172A')
        .text(recipientName, 0, badgeY + 172, { align: 'center', width: w });

      // Gold-like underline for name
      doc.moveTo(w / 2 - 180, badgeY + 208)
        .lineTo(w / 2 + 180, badgeY + 208)
        .lineWidth(1.5)
        .stroke('#E2E8F0');

      // 8. Description Text (Custom text based on type)
      let description = '';
      const meals = certificate.mealsAchieved;
      const points = certificate.impactPoints;

      if (certificate.certificateType === 'Certificate of Contribution') {
        description = `This Certificate of Contribution is proudly awarded to ${recipientName} for helping serve over ${meals} meals through FOODSHARE+ and contributing towards the mission of reducing food waste and fighting hunger.`;
      } else if (certificate.certificateType === 'Certificate of Community Impact') {
        description = `This Certificate of Community Impact is proudly awarded to ${recipientName} for helping serve over ${meals} meals through FOODSHARE+ and contributing towards the mission of reducing food waste and fighting hunger.`;
      } else if (certificate.certificateType === 'Gold Donor Recognition Certificate') {
        description = `This Gold Donor Recognition Certificate is proudly awarded to ${recipientName} for reaching the Gold Donor Badge level, delivering ${meals} meals, and earning ${points} impact points.`;
      } else if (certificate.certificateType === 'Community Impact Partner Certificate') {
        description = `This Community Impact Partner Certificate is proudly awarded to ${recipientName} for successfully distributing over ${meals} meals through FOODSHARE+ and supporting local hungry communities.`;
      } else if (certificate.certificateType === 'Hunger Relief Excellence Certificate') {
        description = `This Hunger Relief Excellence Certificate is proudly awarded to ${recipientName} for completing over 100 successful surplus food deliveries and ensuring nutritional security.`;
      } else { // Top NGO Recognition Certificate
        description = `This Top NGO Recognition Certificate is proudly awarded to ${recipientName} for outstanding delivery performance, completing ${user.deliveriesCompleted || 150} deliveries, and distributing ${meals} meals.`;
      }

      doc.font('Helvetica')
        .fontSize(14)
        .fillColor('#334155')
        .text(description, 100, badgeY + 230, { align: 'center', width: w - 200, lineGap: 6 });

      // 9. Footer: Left QR Code, Middle SDGs, Right Digital Signature

      // Left: Verification QR Code
      const verificationHost = req.get('host').replace(':5000', ':5173');
      const verificationUrl = `${req.protocol}://${verificationHost}/verify-certificate/${certificate.certificateId}`;
      const qrBuffer = await QRCode.toBuffer(verificationUrl, { margin: 1, width: 80 });

      const footerY = h - 145;
      doc.image(qrBuffer, 65, footerY, { width: 75 });
      doc.font('Helvetica')
        .fontSize(8)
        .fillColor('#64748B')
        .text('Scan to verify authenticity', 55, footerY + 80, { width: 95, align: 'center' });

      // Center: SDG Goals Vectors
      doc.font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#64748B')
        .text('IN SUPPORT OF UNITED NATIONS SDGs', 0, footerY - 5, { align: 'center', width: w });

      const drawSDG = (x, color, number, textLine1, textLine2) => {
        // Draw square background
        doc.rect(x, footerY + 12, 54, 54).fill(color);
        // Add white text
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(14).text(number, x + 5, footerY + 17);
        doc.fontSize(7).font('Helvetica-Bold').text(textLine1, x + 5, footerY + 34);
        doc.text(textLine2, x + 5, footerY + 44);
      };

      const centerStart = w / 2 - 90;
      drawSDG(centerStart, '#D14124', '2', 'ZERO', 'HUNGER');
      drawSDG(centerStart + 62, '#4C9F38', '3', 'GOOD HEALTH', '& WELL-BEING');
      drawSDG(centerStart + 124, '#BF8B2E', '12', 'RESPONSIBLE', 'CONSUMPTION');

      // Right: Digital Signature
      const sigX = w - 170;
      // Draw a gold seal circle
      doc.circle(sigX - 35, footerY + 35, 20).fillOpacity(0.08).fill('#D97706');
      doc.fillOpacity(1); // Reset opacity

      // Draw signature cursive representation
      doc.font('Times-Italic')
        .fontSize(18)
        .fillColor('#1E293B')
        .text('FoodShare+ Board', sigX - 25, footerY + 18, { width: 140, align: 'center' });

      // Underline signature
      doc.moveTo(sigX - 25, footerY + 42)
        .lineTo(sigX + 115, footerY + 42)
        .lineWidth(1)
        .stroke('#94A3B8');

      doc.font('Helvetica')
        .fontSize(8)
        .fillColor('#64748B')
        .text('Authorized Representative', sigX - 25, footerY + 48, { width: 140, align: 'center' });

      // 10. Bottom Metadata details
      doc.font('Helvetica')
        .fontSize(8)
        .fillColor('#94A3B8')
        .text(`Certificate ID: ${certificate.certificateId}`, 60, h - 38);

      const issueDateFormatted = new Date(certificate.issueDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Issue Date: ${issueDateFormatted}`, w - 200, h - 38, { width: 140, align: 'right' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

// @desc    Download PDF Certificate
// @route   GET /api/certificates/:id/download
// @access  Private
export const downloadCertificate = async (req, res) => {
  try {
    let certificate;
    if (req.params.id.startsWith('CERT-')) {
      certificate = await Certificate.findOne({ certificateId: req.params.id }).populate('userId');
    } else {
      certificate = await Certificate.findById(req.params.id).populate('userId');
    }

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    // Owner or Admin check
    if (req.user.role !== 'admin' && certificate.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to download this certificate' });
    }

    const user = certificate.userId;
    const pdfBuffer = await generatePDFBuffer(certificate, user, req);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=certificate_${certificate.certificateId}.pdf`,
      'Content-Length': pdfBuffer.length
    });

    res.end(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
