const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config');

handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return arg1 === arg2 ? options.fn(this) : options.inverse(this);
});

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport(config.smtp);
    this.templates = {};
  }

  /**
   * Load và compile email template
   */
  async loadTemplate(templateName) {
    if (this.templates[templateName]) {
      return this.templates[templateName];
    }

    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const compiled = handlebars.compile(templateContent);
    
    this.templates[templateName] = compiled;
    return compiled;
  }

  /**
   * Gửi email chung
   */
  async sendEmail(to, subject, html, text = null) {
    try {
      const mailOptions = {
        from: `"${config.email.fromName}" <${config.email.from}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Email xác thực tài khoản
   */
  async sendVerificationEmail(email, username, verificationToken) {
    const template = await this.loadTemplate('verification');
    const verificationLink = `${config.frontend.url}/verify-email?token=${verificationToken}`;
    
    const html = template({
      username,
      verificationLink,
      frontendUrl: config.frontend.url
    });

    return this.sendEmail(
      email,
      'Xác thực tài khoản của bạn',
      html
    );
  }

  /**
   * Email chào mừng sau khi đăng ký
   */
  async sendWelcomeEmail(email, username) {
    const template = await this.loadTemplate('welcome');
    
    const html = template({
      username,
      frontendUrl: config.frontend.url
    });

    return this.sendEmail(
      email,
      'Chào mừng bạn đến với Shop',
      html
    );
  }

  /**
   * Email thông báo đổi mật khẩu thành công
   */
  async sendPasswordChangedEmail(email, username) {
    const template = await this.loadTemplate('password-changed');
    
    const html = template({
      username,
      changeTime: new Date().toLocaleString('vi-VN'),
      frontendUrl: config.frontend.url
    });

    return this.sendEmail(
      email,
      'Mật khẩu của bạn đã được thay đổi',
      html
    );
  }

  /**
   * Email yêu cầu reset mật khẩu
   */
  async sendPasswordResetEmail(email, username, resetToken) {
    const template = await this.loadTemplate('password-reset');
    
    const html = template({
      username,
      resetToken,
      frontendUrl: config.frontend.url
    });

    return this.sendEmail(
      email,
      'Yêu cầu đặt lại mật khẩu',
      html
    );
  }

  /**
   * Email xác nhận đơn hàng
   */
  async sendOrderConfirmationEmail(email, orderData) {
    const template = await this.loadTemplate('order-confirmation');
    
    const html = template({
      customerName: orderData.customerName,
      orderId: orderData.orderId,
      orderDate: new Date(orderData.createdAt).toLocaleString('vi-VN'),
      items: orderData.items,
      subtotal: this.formatCurrency(orderData.subtotal),
      shippingFee: this.formatCurrency(orderData.shippingFee || 0),
      total: this.formatCurrency(orderData.total),
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      trackingUrl: `${config.frontend.url}/orders/${orderData.orderId}`,
      frontendUrl: config.frontend.url
    });

    return this.sendEmail(
      email,
      `Đơn hàng #${orderData.orderId} đã được xác nhận`,
      html
    );
  }

  /**
   * Email cập nhật trạng thái đơn hàng
   */
  async sendOrderStatusEmail(email, orderData, status) {
    const template = await this.loadTemplate('order-status');
    
    const statusText = {
      'CONFIRMED': 'Đã xác nhận',
      'SHIPPED': 'Đang giao hàng',
      'DELIVERED': 'Đã giao hàng',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy'
    };

    const html = template({
      customerName: orderData.customerName,
      orderId: orderData.orderId,
      status: statusText[status] || status,
      statusMessage: this.getStatusMessage(status),
      trackingCode: orderData.trackingCode,
      carrier: orderData.carrier,
      trackingUrl: `${config.frontend.url}/fulfillment-tracking/${orderData.orderId}`,
      frontendUrl: config.frontend.url
    });

    return this.sendEmail(
      email,
      `Cập nhật đơn hàng #${orderData.orderId}: ${statusText[status]}`,
      html
    );
  }

  /**
   * Helper: Format tiền tệ
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  /**
   * Helper: Lấy message theo trạng thái
   */
  getStatusMessage(status) {
    const messages = {
      'CONFIRMED': 'Người bán đã xác nhận đơn hàng của bạn và đang chuẩn bị hàng.',
      'SHIPPED': 'Đơn hàng của bạn đã được giao cho đơn vị vận chuyển.',
      'DELIVERED': 'Đơn hàng đã được giao thành công đến địa chỉ của bạn.',
      'COMPLETED': 'Đơn hàng đã hoàn tất. Cảm ơn bạn đã mua hàng!',
      'CANCELLED': 'Đơn hàng của bạn đã bị hủy.'
    };
    return messages[status] || 'Trạng thái đơn hàng của bạn đã được cập nhật.';
  }

  /**
   * Test connection
   */
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified');
      return true;
    } catch (error) {
      console.error('❌ SMTP connection failed:', error.message);
      return false;
    }
  }
}

module.exports = new EmailService();
