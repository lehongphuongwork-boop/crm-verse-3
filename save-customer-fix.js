// ========================================
// HÀM LƯU KHÁCH HÀNG - CHỈNH SỬA
// ========================================

function saveCustomer(event) {
    event.preventDefault(); // Ngăn chặn reload trang
    
    // Lấy dữ liệu từ các input
    const id = document.getElementById('cust-id').value;
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    const source = document.getElementById('cust-source').value;
    const status = document.getElementById('cust-status').value;
    const sales = document.getElementById('cust-sales').value.trim();
    const categories = document.getElementById('cust-categories').value.trim();
    const budget = document.getElementById('cust-budget').value ? parseInt(document.getElementById('cust-budget').value) : 0;
    const actualValue = document.getElementById('cust-actual').value ? parseInt(document.getElementById('cust-actual').value) : 0;
    const contactDate = document.getElementById('cust-contact-date').value;
    const startDate = document.getElementById('cust-start-date').value;
    const surveyDate = document.getElementById('cust-survey-date').value;
    const depositDate = document.getElementById('cust-deposit-date').value;
    const installDate = document.getElementById('cust-install-date').value;
    const gu = document.getElementById('cust-gu').value.trim();
    const notes = document.getElementById('cust-notes').value.trim();
    
    // Kiểm tra dữ liệu bắt buộc
    if (!name || !phone || !address || !contactDate) {
        showToast('Vui lòng điền đầy đủ thông tin bắt buộc!', 'error');
        return;
    }
    
    // Tạo object khách hàng
    const customer = {
        id: id || generateCustomerId(),
        name,
        phone,
        address,
        source,
        status,
        sales,
        categories,
        budget,
        actualValue,
        contactDate,
        startDate,
        surveyDate,
        depositDate,
        installDate,
        gu,
        notes
    };
    
    // Lấy danh sách khách hàng từ localStorage
    let customers = JSON.parse(localStorage.getItem('customers')) || [];
    
    // Kiểm tra xem có phải chỉnh sửa hay thêm mới
    const existingIndex = customers.findIndex(c => c.id === customer.id);
    
    if (existingIndex >= 0) {
        // Cập nhật khách hàng hiện có
        customers[existingIndex] = customer;
        showToast('Cập nhật khách hàng thành công!', 'success');
    } else {
        // Thêm khách hàng mới
        customers.push(customer);
        showToast('Thêm khách hàng mới thành công!', 'success');
    }
    
    // Lưu vào localStorage
    localStorage.setItem('customers', JSON.stringify(customers));
    
    // Đồng bộ lên Google Sheets nếu có cấu hình
    const sheetUrl = localStorage.getItem('sheet-url');
    if (sheetUrl && localStorage.getItem('sheet-auto-sync') === 'true') {
        syncToGoogleSheet();
    }
    
    // Render lại danh sách
    renderCustomerList();
    renderKanbanBoard();
    updateDashboard();
    
    // Đóng modal sau 1 giây
    setTimeout(() => {
        closeModal();
    }, 1000);
}

// Hàm tạo ID khách hàng mới
function generateCustomerId() {
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const maxNum = customers.reduce((max, c) => {
        const num = parseInt(c.id.replace('CUST-', ''));
        return num > max ? num : max;
    }, 0);
    return `CUST-${String(maxNum + 1).padStart(3, '0')}`;
}

// Hàm hiển thị thông báo Toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast-notification');
    const toastText = document.getElementById('toast-text');
    const toastIcon = document.getElementById('toast-icon');
    
    toastText.textContent = message;
    
    // Đổi màu tùy theo loại thông báo
    if (type === 'error') {
        toast.classList.remove('bg-emerald-500');
        toast.classList.add('bg-rose-500');
        toastIcon.className = 'fa-solid fa-circle-xmark text-lg';
    } else {
        toast.classList.remove('bg-rose-500');
        toast.classList.add('bg-emerald-500');
        toastIcon.className = 'fa-solid fa-circle-check text-lg';
    }
    
    // Hiển thị toast
    toast.classList.remove('translate-x-full', 'opacity-0');
    
    // Ẩn toast sau 3 giây
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
    }, 3000);
}

// Hàm mở modal thêm khách hàng mới
function openAddModal() {
    document.getElementById('customer-form').reset();
    document.getElementById('cust-id').value = '';
    document.getElementById('modal-title').textContent = 'Thêm Khách Hàng Mới';
    document.getElementById('customer-modal').classList.remove('hidden');
    
    // Set thời gian hiện tại mặc định
    const now = new Date().toISOString().slice(0, 16);
    document.getElementById('cust-contact-date').value = now;
}

// Hàm đóng modal
function closeModal() {
    document.getElementById('customer-modal').classList.add('hidden');
    document.getElementById('customer-form').reset();
    document.getElementById('modal-file-list').innerHTML = '';
}

// Hàm mở modal chỉnh sửa khách hàng
function openEditModal(customerId) {
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer) {
        showToast('Không tìm thấy khách hàng!', 'error');
        return;
    }
    
    // Điền dữ liệu vào form
    document.getElementById('cust-id').value = customer.id;
    document.getElementById('cust-name').value = customer.name;
    document.getElementById('cust-phone').value = customer.phone;
    document.getElementById('cust-address').value = customer.address;
    document.getElementById('cust-source').value = customer.source;
    document.getElementById('cust-status').value = customer.status;
    document.getElementById('cust-sales').value = customer.sales;
    document.getElementById('cust-categories').value = customer.categories;
    document.getElementById('cust-budget').value = customer.budget;
    document.getElementById('cust-actual').value = customer.actualValue;
    document.getElementById('cust-contact-date').value = customer.contactDate;
    document.getElementById('cust-start-date').value = customer.startDate;
    document.getElementById('cust-survey-date').value = customer.surveyDate;
    document.getElementById('cust-deposit-date').value = customer.depositDate;
    document.getElementById('cust-install-date').value = customer.installDate;
    document.getElementById('cust-gu').value = customer.gu;
    document.getElementById('cust-notes').value = customer.notes;
    
    document.getElementById('modal-title').textContent = 'Chỉnh Sửa Khách Hàng';
    document.getElementById('customer-modal').classList.remove('hidden');
}

// Hàm xóa khách hàng
function deleteCustomer(customerId) {
    if (!confirm('Bạn chắc chắn muốn xóa khách hàng này?')) {
        return;
    }
    
    let customers = JSON.parse(localStorage.getItem('customers')) || [];
    customers = customers.filter(c => c.id !== customerId);
    localStorage.setItem('customers', JSON.stringify(customers));
    
    showToast('Xóa khách hàng thành công!', 'success');
    renderCustomerList();
    renderKanbanBoard();
    updateDashboard();
}
