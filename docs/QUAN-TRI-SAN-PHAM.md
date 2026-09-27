# Quản trị toàn bộ website bằng Pages CMS

Website có 8 trang: trang chủ, giới thiệu, dịch vụ, sản phẩm, tin tức, tuyển dụng,
hồ sơ năng lực và liên hệ. Nội dung được sửa bằng biểu mẫu tiếng Việt trên
https://app.pagescms.org. Không cần sửa `.pages.yml` khi đăng nội dung.

## Kích hoạt bản mới — làm một lần

Bản mới có bước build để chuyển dữ liệu CMS thành các trang HTML hoàn chỉnh.
**Không dùng lại cách xuất bản trực tiếp thư mục gốc từ một nhánh.**

1. Commit và push toàn bộ thay đổi, gồm `.pages.yml`, `data/`, `scripts/`, `tests/`, `package.json`, `package-lock.json`, `.github/workflows/pages.yml`, HTML, CSS và JavaScript.
2. Trong repository GitHub → **Settings → Pages → Build and deployment → Source**, chọn **GitHub Actions**.
3. Vào **Actions → Publish website from CMS**, chạy **Run workflow** trên nhánh `main` nếu lượt chạy đầu chưa thành công. Đợi cả `build` và `deploy` xanh.
4. Vào Pages CMS, đăng nhập GitHub, cấp quyền cho đúng repository và chọn nhánh `main`.
5. Tải lại CMS. Thanh bên có **Thông tin chung & liên hệ**, **Sản phẩm**, **Danh mục sản phẩm**, **Danh sách dịch vụ**, **Bài viết**, **Vị trí tuyển dụng**, **Nội dung các trang**.
6. Thử đổi tiêu đề trong **Nội dung các trang → Trang chủ**, lưu, đợi workflow hoàn tất rồi tải lại website.

File `dist/` được tạo tự động và không cần commit. Các file HTML ở thư mục gốc là
mẫu giao diện; bản đã ghép nội dung để xuất bản nằm trong `dist/`.

## Chọn đúng nơi để sửa

| Mục trong CMS | Nội dung | File lưu |
| --- | --- | --- |
| Thông tin chung & liên hệ | Logo, tên công ty, điện thoại, email nhận tư vấn, địa chỉ, Zalo, mạng xã hội, ngân hàng, chân trang, hồ sơ PDF | `data/site.json` |
| Sản phẩm | Tên, model, giá, ảnh, thông số, mô tả, danh mục, ẩn/hiện, nổi bật | `data/products.json` |
| Danh mục sản phẩm | Thêm, đổi tên, sắp xếp, xóa danh mục | `data/categories/*.json` |
| Danh sách dịch vụ | Thêm/sửa/xóa dịch vụ, hạng mục thực hiện, ảnh, ẩn/hiện; dùng chung cho trang chủ và form | `data/services.json` |
| Bài viết | Tiêu đề, chuyên mục, ngày, ảnh, tóm tắt, nội dung, ẩn/hiện | `data/news.json` |
| Vị trí tuyển dụng | Vị trí, địa điểm, yêu cầu, lương, ẩn/hiện | `data/jobs.json` |
| Nội dung các trang | Tiêu đề, mô tả, số liệu, các khối nội dung, đường dẫn, ảnh nền và gợi ý nhập form của từng trang | `data/pages/*.json` |

Mục **Configuration** chỉ thay đổi biểu mẫu CMS (`.pages.yml`), không đổi nội dung
sản phẩm hoặc bài viết. `label` là nhãn trong CMS; `name` là khóa dùng trong code.

## Sản phẩm và danh mục

- Tạo danh mục trước, rồi chọn danh mục đó ở ô **Danh mục** trong sản phẩm.
- **Mã danh mục** chỉ dùng chữ thường không dấu, số, dấu gạch ngang. Ví dụ: `tu-dien`.
- Muốn đổi tên, chỉ sửa **Tên danh mục**, giữ nguyên mã. Menu và bộ lọc tự cập nhật.
- **Thứ tự hiển thị** nhỏ hơn sẽ đứng trước.
- Trước khi xóa danh mục, chuyển tất cả sản phẩm (kể cả sản phẩm đang ẩn) sang danh mục khác và lưu.
- Nếu còn sản phẩm tham chiếu danh mục đã xóa, CMS vẫn có thể lưu commit nhưng bước build sẽ báo lỗi và **không xuất bản bản mới**. Khôi phục danh mục hoặc sửa danh mục sản phẩm rồi lưu lại. Bản website đã xuất bản trước đó vẫn hoạt động.
- **Hiển thị trên website**: bật để xuất bản; **Nổi bật trên trang chủ**: bật để giới thiệu ở trang chủ (vẫn cần bật hiển thị).
- Card hiện tối đa 3 thông số đầu tiên cho gọn; cửa sổ **Xem thông số** hiện toàn bộ.
- Giá là văn bản hiển thị, ví dụ `1.500.000 VNĐ` hoặc `Liên hệ báo giá`.

## Chỉnh trang chủ

Vào **Nội dung các trang → Trang chủ**. Các khối được sắp theo thứ tự trên website:
đầu trang và form, số liệu, giới thiệu dịch vụ, dự án, lý do lựa chọn, sản phẩm nổi bật,
liên hệ cuối trang. Mỗi ô có nhãn tiếng Việt kèm gợi ý nội dung hiện tại.

Danh sách dịch vụ lấy từ **Danh sách dịch vụ** (tối đa 4 dịch vụ đang hiển thị).
Sản phẩm nổi bật lấy từ **Sản phẩm**. Thông tin liên hệ dùng chung từ **Thông tin chung & liên hệ**.
Các khối bố cục cố định cho phép sửa nội dung; thay cấu trúc thiết kế hoặc thêm một loại khối mới vẫn cần sửa mẫu HTML.

## Form yêu cầu tư vấn

Trang chủ chỉ bắt buộc **họ tên** và **số điện thoại**. Nhu cầu và mô tả là tùy chọn.
Nút **Soạn yêu cầu qua email** mở ứng dụng email với thông tin đã điền và địa chỉ nhận
trong **Thông tin chung & liên hệ → Email nhận yêu cầu tư vấn**.

**Khách phải kiểm tra và bấm gửi trong ứng dụng email. Website không tự gửi, không
lưu yêu cầu vào CMS và không báo đã nhận thành công.** Nếu chưa có ứng dụng email,
khách có thể sao chép nội dung để gửi qua webmail, hoặc liên hệ điện thoại/Zalo.
Để tự động nhận form và lưu danh sách khách hàng cần kết nối thêm dịch vụ xử lý form.

## Tin tức, tuyển dụng và hồ sơ năng lực

- Trong **Bài viết**, thêm mục, nhập mã duy nhất không dấu, tiêu đề, ảnh và nội dung.
  Xuống dòng để chia đoạn. Bài có nội dung sẽ có nút **Đọc bài viết** để mở rộng ngay trên trang.
- Tắt **Hiển thị** để gỡ bài/vị trí khỏi website mà giữ nội dung trong CMS.
- Nút ứng tuyển soạn email đến địa chỉ liên hệ chung.
- Upload PDF tại **Thông tin chung & liên hệ → File hồ sơ năng lực PDF**. Nếu để trống,
  website hiện nút yêu cầu hồ sơ qua Zalo (hoặc email nếu chưa có Zalo).

## Ảnh và tài liệu

Thư viện **Hình ảnh** lưu trong `images/`, thư viện **Tài liệu PDF** lưu trong
`assets/documents/`. Ảnh sản phẩm cũ trong `images/products/` vẫn hoạt động.
Nên nén ảnh JPG/WebP/PNG trước khi upload. Không nhập đường dẫn chứa tên tài khoản
GitHub; dùng file chọn từ thư viện để có đường dẫn tương đối.

Không xóa ảnh/PDF đang được nội dung sử dụng. Bước build kiểm tra file bị thiếu để
tránh xuất bản trang có ảnh hỏng. Nội dung lưu trong repository công khai vẫn có thể
được đọc dù đã ẩn trên website; không dùng CMS này để lưu dữ liệu riêng tư.

## Khi chưa thấy thay đổi

1. Đã bấm **Lưu** trong mục nội dung, không phải Configuration?
2. Commit đã xuất hiện trên đúng repository, nhánh `main`?
3. Workflow **Publish website from CMS** đã chạy xong cả build và deploy?
4. Nếu lỗi đỏ, mở bước bị lỗi để xem thông báo (ví dụ danh mục không tồn tại, thiếu ảnh, mã bài trùng).
5. Nếu deploy xanh, tải lại website. File trong VS Code cần **Pull** để nhận chỉnh sửa từ CMS.

Nếu workflow không chạy khi lưu CMS, kiểm tra quyền GitHub App và cấu hình Actions của repository;
có thể chạy **Run workflow** để xuất bản bản nội dung đã lưu.

## Bàn giao và xem thử trên máy

Khi chuyển GitHub cho khách: chuyển toàn bộ repository, bật Pages dùng GitHub Actions,
kết nối Pages CMS bằng tài khoản khách và chọn đúng nhánh. Không cần sửa tài khoản
trong code. Nếu đổi tên nhánh, sửa `on.push.branches` trong workflow. Nếu có tên miền
riêng, giữ file `CNAME` và kiểm tra DNS/Pages sau khi chuyển.

Cần Node.js 22 trở lên và Python 3 để xem thử:

```sh
npm ci
npm test
npm run dev
```

Mở http://localhost:8000. Sau mỗi lần sửa dữ liệu trên máy, chạy lại `npm run build`.
Không mở HTML qua `file://`; không xem trực tiếp mẫu HTML ở thư mục gốc để đánh giá nội dung CMS.

Tài liệu: https://pagescms.org/docs/ và https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
