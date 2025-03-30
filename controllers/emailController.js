const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const emailOrder = (req, res) => {
  const {
    email,
    username,
    products,
    price,
    orderId,
    selected,
    delivery,
    phone,
    ward,
    district,
    province,
    note,
    store,
    statusPayment,
  } = req.body;

  const productRows = products
    .map(
      (product) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${product.name}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${product.quantity}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${product.price.toLocaleString()} VNĐ</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${
        product.colorName
      }</td>
    </tr>
  `
    )
    .join(""); // Ghép các chuỗi lại với nhau
  const emailTemplate = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2 style="color: #4CAF50;">Cảm ơn bạn đã đặt sản phẩm tại cửa hàng chúng tôi!</h2>
    <p>Xin chào <strong>${username}</strong>,</p>
    <p>Chúng tôi rất vui mừng thông báo rằng bạn đã đặt thành công sản phẩm với thông tin chi tiết như sau:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    
    <tr>
        <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Mã đơn</th>
        <td style="padding: 8px; border: 1px solid #ddd;">${orderId}</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Hình thức thanh toán</th>
        <td style="padding: 8px; border: 1px solid #ddd;">${selected}</td>
      </tr>
        <tr>
        <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Tổng tiền</th>
        <td style="padding: 8px; border: 1px solid #ddd;">${price}</td>
      </tr>
        <tr>
        <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Số điện thoại</th>
        <td style="padding: 8px; border: 1px solid #ddd;">${phone}</td>
      </tr>  
        <tr>
        <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">${delivery}</th>
        <td style="padding: 8px; border: 1px solid #ddd;">${
          delivery === "Giao tận nơi"
            ? `Địa chỉ: ${note}, ${ward}, ${district}, ${province}`
            : `Cửa hàng: ${store} `
        }
        </td>
      </tr>
        <tr>
        <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Thanh toán</th>
        <td style="padding: 8px; border: 1px solid #ddd;">${statusPayment}</td>
      </tr>  
    </table>

    <h3>Chi tiết sản phẩm:</h3>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Tên sản phẩm</th>
        <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Số lượng</th>
        <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Giá tiền</th>
        <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Màu sắc</th>
      </tr>
      ${productRows} 
    </table>

    <p>Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận thêm chi tiết.</p>
    <p>Trân trọng,</p>
    <p><strong>Đội ngũ hỗ trợ của chúng tôi</strong></p>
  </div>
`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Xác nhận đặt hàng thành công",
    html: emailTemplate,
  };

  // Gửi email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Lỗi khi gửi email:", error);
      res.status(500).send("Gửi email thất bại");
    } else {
      console.log("Email gửi thành công:", info.response);
      res.status(200).send("Email đã được gửi");
    }
  });
};

const emailStatus = (req, res) => {
  const { email, username, status, orderId } = req.body;

  try {
    let message = "";

    switch (status) {
      case "Chờ xác nhận":
        message = `Đơn hàng của bạn đang chờ xác nhận. Chúng tôi sẽ xử lý trong thời gian sớm nhất.`;
        break;
      case "Đã xác nhận":
        message = `Đơn hàng của bạn đã được xác nhận và sẽ sớm được chuẩn bị để giao hàng.`;
        break;
      case "Đang giao":
        message = `Đơn hàng của bạn đang trên đường vận chuyển. Vui lòng theo dõi điện thoại để nhận hàng.`;
        break;
      case "Hoàn thành":
        message = `Cảm ơn bạn đã mua hàng! Đơn hàng của bạn đã hoàn tất. Hy vọng bạn hài lòng với sản phẩm của chúng tôi.`;
        break;
      case "Hủy bỏ":
        message = `Đơn hàng của bạn đã bị hủy. Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.`;
        break;
      case "Trả hàng":
        message = `Chúng tôi đã nhận yêu cầu trả hàng của bạn. Đơn hàng sẽ được xử lý theo chính sách hoàn trả.`;
        break;
      default:
        message = `Trạng thái đơn hàng chưa được xác định.`;
        break;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Đơn đặt tour của bạn đã được cập nhập !",
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #4CAF50;">Thông báo về đơn hàng của bạn</h2>
        <p>Xin chào <strong>${username}</strong>,</p>
        <p>Chúng tôi muốn cập nhật cho bạn về đơn hàng <strong>#${orderId}</strong>:</p>
        <p><strong>Trạng thái hiện tại:</strong> ${status}</p>
        <p>${message}</p>
        <p>Xin cảm ơn và chúc bạn một ngày tốt lành!</p>
        <p><strong>Đội ngũ hỗ trợ của chúng tôi</strong></p>
      </div>
    `,
    };

    // Gửi email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Lỗi khi gửi email:", error);
        res.status(500).send("Gửi email thất bại");
      } else {
        console.log("Email gửi thành công:", info.response);
        res.status(200).send("Email đã được gửi");
      }
    });
  } catch (error) {
    console.log("Lỗi khi gửi email:", error);
    res.status(500).send("Gửi email thất bại");
  }
};
module.exports = {
  emailOrder,
  emailStatus,
};
