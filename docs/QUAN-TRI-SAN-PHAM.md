# Quản trị sản phẩm bằng Pages CMS

Website dùng chung dữ liệu tại `data/products.json` cho trang chủ và trang sản phẩm.
Ảnh upload nằm trong `images/products/`. Cấu hình biểu mẫu nằm ở `.pages.yml`.
Không có tài khoản GitHub, mật khẩu hoặc token trong cấu hình này.

## Kích hoạt lần đầu

1. Đưa các thay đổi trong dự án này lên repository GitHub của website, bao gồm `.pages.yml`, `data/`, `js/products.js`, các trang HTML và CSS đã sửa.
2. Trong GitHub → Settings → Pages, kiểm tra nhánh xuất bản và thư mục gốc `/ (root)` của website. Giữ cách triển khai hiện có nếu đã hoạt động; nếu dùng workflow riêng, bảo đảm artifact chứa `data/products.json` và `images/products/`.
3. Vào https://app.pagescms.org và đăng nhập bằng GitHub.
4. Cài GitHub App của Pages CMS, chọn **Only select repositories**, cấp quyền cho repository website.
5. Mở repository và chọn đúng nhánh dùng để xuất bản website. CMS tự đọc `.pages.yml` và hiện mục **Sản phẩm**.
6. Thử sửa một sản phẩm, lưu rồi kiểm tra commit trên GitHub và lượt triển khai Pages. Chỉ khi triển khai hoàn tất thì website công khai mới nhận thay đổi.

Đăng nhập và cấp quyền ứng dụng phải do chủ tài khoản thực hiện. Mã nguồn đã chuẩn bị không đồng nghĩa tài khoản đã được kết nối.

## Đăng và chỉnh sửa sản phẩm

- Mở **Sản phẩm → Danh sách sản phẩm**, thêm một mục hoặc mở mục hiện có.
- Điền tên, model, danh mục, thương hiệu, tình trạng hàng, giá và thông số. Giá là nội dung hiển thị, có thể nhập `1.500.000 VNĐ` hoặc `Liên hệ báo giá`.
- Chọn ảnh qua ô **Ảnh sản phẩm**. Nên dùng JPG, PNG hoặc WebP đã nén, khoảng dưới 500 KB để trang tải nhanh.
- Bật **Hiển thị trên website** để đưa sản phẩm vào danh sách. Tắt để ẩn khỏi cả trang chủ và trang sản phẩm.
- Bật **Nổi bật trên trang chủ** cho những sản phẩm muốn giới thiệu ở trang chủ; nên chọn 3 hoặc 6 sản phẩm.
- Mô tả chi tiết hiện trong cửa sổ **Xem thông số**. Thứ tự sản phẩm theo thứ tự trong danh sách.
- Lưu thay đổi, đợi GitHub Pages triển khai xong rồi tải lại website.

Ảnh và dữ liệu trên website tĩnh là nội dung công khai. Nút ẩn chỉ điều khiển hiển thị; không dùng để lưu thông tin riêng tư. Việc xóa sản phẩm khỏi danh sách không tự xóa ảnh đã upload.

## Bàn giao cho khách hàng

1. Chuyển repository hoặc sao chép toàn bộ dự án sang GitHub của khách, bao gồm file ẩn `.pages.yml`.
2. Khách cấu hình GitHub Pages tại repository mới và kết nối Pages CMS bằng tài khoản của họ, chọn đúng repository và nhánh.
3. Không cần sửa tên tài khoản hoặc repository trong mã quản trị. Đường dẫn dữ liệu và ảnh tương đối hỗ trợ cả tên miền riêng và URL dạng `https://tai-khoan.github.io/ten-repository/`.
4. Nếu có tên miền riêng, kiểm tra lại DNS và cấu hình Pages. Kiểm tra tên công ty, số điện thoại, Zalo và các thông tin liên hệ khi bàn giao cho đơn vị khác.
5. Đăng thử một sản phẩm có ảnh, kiểm tra trang chủ, tìm kiếm, bộ lọc và cửa sổ thông số trên website mới.

## Xem thử trên máy

Chạy `python3 -m http.server 8000` từ thư mục dự án rồi mở http://localhost:8000.
Không mở HTML trực tiếp qua `file://`, vì trình duyệt có thể chặn việc đọc JSON.

Nếu không tải được sản phẩm, kiểm tra `data/products.json` có được xuất bản cùng website và có JSON hợp lệ. Nếu ảnh không hiện, kiểm tra file tồn tại trong `images/products/` (tên file phân biệt hoa thường).

## Tài liệu dịch vụ

- https://pagescms.org/docs/quick-start/
- https://pagescms.org/docs/configuration/
- https://pagescms.org/docs/configuration/content/list/
