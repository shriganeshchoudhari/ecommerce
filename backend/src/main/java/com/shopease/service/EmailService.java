package com.shopease.service;

import com.shopease.entity.Order;
import com.shopease.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${MAIL_USERNAME:noreply@shopease.com}")
    private String fromAddress;

    @Async
    public void sendWelcomeEmail(User user) {
        String subject = "Welcome to ShopEase, " + user.getName() + "! 🎉";
        String body = buildWelcomeHtml(user.getName());
        sendHtmlEmail(user.getEmail(), subject, body);
    }

    @Async
    public void sendOrderConfirmationEmail(User user, Order order) {
        String subject = "Order Confirmed! #" + order.getId() + " — ShopEase";
        String body = buildOrderConfirmationHtml(user.getName(), order);
        sendHtmlEmail(user.getEmail(), subject, body);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        if (fromAddress == null || fromAddress.isBlank() || fromAddress.equals("noreply@shopease.com")) {
            log.warn("[EmailService] MAIL_USERNAME not configured — skipping email to {}", to);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress, "ShopEase");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("[EmailService] Email sent to {}: {}", to, subject);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("[EmailService] Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    // ─── HTML Templates ───────────────────────────────────────────────────────

    private String buildWelcomeHtml(String name) {
        return """
                <!DOCTYPE html>
                <html><body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0">
                  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
                    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:40px 32px;text-align:center">
                      <h1 style="color:#fff;margin:0;font-size:28px">ShopEase</h1>
                      <p style="color:rgba(255,255,255,.85);margin:8px 0 0">Your modern shopping destination</p>
                    </div>
                    <div style="padding:40px 32px">
                      <h2 style="color:#1e293b;margin-top:0">Welcome, %s! 👋</h2>
                      <p style="color:#475569;line-height:1.7">We're thrilled to have you on board. Your account has been successfully created.</p>
                      <p style="color:#475569;line-height:1.7">Explore thousands of products, save items to your wishlist, and enjoy exclusive promo code offers.</p>
                      <div style="text-align:center;margin:32px 0">
                        <a href="http://localhost:3000/products" style="background:#6366f1;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px">Shop Now</a>
                      </div>
                      <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0"/>
                      <p style="color:#94a3b8;font-size:13px;text-align:center">ShopEase — Best products, best prices.</p>
                    </div>
                  </div>
                </body></html>
                """
                .formatted(name);
    }

    private String buildOrderConfirmationHtml(String name, Order order) {
        StringBuilder itemsHtml = new StringBuilder();
        if (order.getItems() != null) {
            for (var item : order.getItems()) {
                itemsHtml.append("""
                        <tr>
                          <td style="padding:8px 0;color:#475569">%s × %d</td>
                          <td style="padding:8px 0;color:#1e293b;text-align:right;font-weight:600">₹%s</td>
                        </tr>
                        """.formatted(
                        item.getProductName(),
                        item.getQuantity(),
                        item.getUnitPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity()))
                                .toPlainString()));
            }
        }
        return """
                <!DOCTYPE html>
                <html><body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0">
                  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
                    <div style="background:linear-gradient(135deg,#10b981,#059669);padding:40px 32px;text-align:center">
                      <h1 style="color:#fff;margin:0;font-size:28px">✓ Order Confirmed</h1>
                      <p style="color:rgba(255,255,255,.85);margin:8px 0 0">Thank you for shopping with ShopEase!</p>
                    </div>
                    <div style="padding:40px 32px">
                      <h2 style="color:#1e293b;margin-top:0">Hi %s,</h2>
                      <p style="color:#475569">Your order <strong>#%d</strong> has been placed successfully.</p>
                      <div style="background:#f8fafc;border-radius:8px;padding:20px;margin:24px 0">
                        <table style="width:100%%">
                          %s
                          <tr><td colspan="2"><hr style="border:none;border-top:1px solid #e2e8f0"/></td></tr>
                          <tr>
                            <td style="padding:8px 0;font-weight:700;color:#1e293b">Total</td>
                            <td style="padding:8px 0;font-weight:700;color:#1e293b;text-align:right;font-size:18px">₹%s</td>
                          </tr>
                        </table>
                      </div>
                      <div style="text-align:center;margin:32px 0">
                        <a href="http://localhost:3000/profile" style="background:#10b981;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px">Track My Order</a>
                      </div>
                      <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0"/>
                      <p style="color:#94a3b8;font-size:13px;text-align:center">ShopEase — Best products, best prices.</p>
                    </div>
                  </div>
                </body></html>
                """
                .formatted(name, order.getId(), itemsHtml, order.getTotalAmount().toPlainString());
    }
}
