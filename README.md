# Kiểm tra Hóa 10 – Cấu tạo nguyên tử

## Nguyên nhân lỗi cũ

Bản cũ chỉ lưu `results` bằng `localStorage`. Đây là bộ nhớ riêng của từng trình duyệt, nên bài nộp trên điện thoại/máy của học sinh không thể xuất hiện trên máy giáo viên. `SHEET_WEB_APP_URL` cũng đang để trống.

## Bản sửa

- Ghi bài nộp vào máy học sinh **trước khi** gửi mạng.
- Mỗi bài có `id` riêng; gửi lại bài chưa đồng bộ khi giáo viên mở dashboard.
- Có dữ liệu cũ trong `localStorage` vẫn được giữ nguyên và tự chuyển sang định dạng mới.
- Dashboard giáo viên tải dữ liệu trung tâm, gộp theo `id` để không nhân đôi bài.
- Nếu mạng/endpoint tạm lỗi, dashboard vẫn hiện bản cục bộ thay vì làm mất bài.
- Xuất CSV UTF-8 có BOM, mở được trực tiếp bằng Excel.

## Bật lưu tập trung để nhiều thiết bị cùng thấy kết quả

1. Tạo một Google Sheet mới.
2. Mở **Extensions → Apps Script**, dán toàn bộ nội dung `apps-script.gs` vào.
3. Chọn hàm `setup` và bấm **Run** một lần để tạo sheet `Submissions`.
4. Chọn **Deploy → New deployment → Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Sao chép URL `/exec` nhận được.
6. Dán URL đó vào biến `SHEET_WEB_APP_URL` ở đầu `index.html` rồi commit/push lại.

Không xóa Google Sheet hoặc localStorage khi cập nhật mã. Nút **Xóa dữ liệu** trong dashboard chỉ nên dùng khi giáo viên chủ động kết thúc một đợt kiểm tra.

## Bảo toàn dữ liệu cũ

Trước khi sửa, mã nguồn đã được sao lưu tại `index.html.pre-fix-backup`. Các bài đã nộp trước đây không thể tự thu hồi từ GitHub Pages vì chúng chưa từng được gửi lên máy chủ; chúng chỉ còn trên thiết bị/trình duyệt nơi học sinh nộp bài. Bản sửa không xóa dữ liệu đó. Nếu cần cứu các bài cũ, mở dashboard trên đúng thiết bị/trình duyệt đã nộp và xuất CSV hoặc cấu hình endpoint rồi mở lại dashboard để đồng bộ.
