/** Shared public settings and a truthful, client-side email handoff. */
document.addEventListener('DOMContentLoaded', () => {
  const config = document.getElementById('site-config');
  window.EpicSite = config ? JSON.parse(config.textContent) : {};
  const form = document.getElementById('contact-form');
  if (!form) return;
  const phone = form.querySelector('[name="phone"]');
  const name = form.querySelector('[name="contact_person"]');
  function validate() {
    const digits = (phone?.value || '').replace(/\D/g, '');
    phone?.setCustomValidity(digits.length >= 8 && digits.length <= 15 ? '' : 'Vui lòng nhập số điện thoại từ 8 đến 15 chữ số.');
    name?.setCustomValidity(name.value.trim() ? '' : 'Vui lòng nhập họ và tên.');
  }
  form.addEventListener('input', validate);
  form.addEventListener('submit', event => {
    event.preventDefault();
    validate();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const fields = {contact_person:'Người liên hệ',phone:'Điện thoại',company:'Công ty',email:'Email',location:'Địa điểm',service:'Nhu cầu',notes:'Mô tả'};
    const body = Object.entries(fields).map(([key,label]) => values.get(key)?.trim() ? `${label}: ${values.get(key).trim()}` : '').filter(Boolean).join('\n');
    const email=window.EpicSite.email;
    const status=form.querySelector('.form-status');
    status.hidden=false;
    if (!email) {status.textContent='Chưa có email tiếp nhận. Vui lòng gọi điện hoặc liên hệ Zalo.';return;}
    const url=`mailto:${email}?subject=${encodeURIComponent('Yêu cầu tư vấn kỹ thuật')}&body=${encodeURIComponent(body)}`;
    status.replaceChildren();
    const note=document.createElement('span');
    note.textContent='Yêu cầu chưa được gửi tự động. Hãy bấm gửi trong ứng dụng email. Nếu ứng dụng không mở, bạn có thể sao chép nội dung và gửi đến '+email+'. ';
    const copy=document.createElement('button');copy.type='button';copy.className='copy-enquiry';copy.textContent='Sao chép nội dung';
    const draft=document.createElement('textarea');draft.readOnly=true;draft.value=body;draft.hidden=true;draft.setAttribute('aria-label','Nội dung yêu cầu để sao chép');
    copy.addEventListener('click',async()=>{
      try {await navigator.clipboard.writeText(body);copy.textContent='Đã sao chép';}
      catch {draft.hidden=false;draft.focus();draft.select();copy.textContent='Chọn và sao chép nội dung bên dưới';}
    });
    status.append(note,copy,draft);
    window.location.href=url;
  });
});
