// ملف الحجوزات لمنصة سكة
// Requires Firebase to be initialized globally as `db`

function renderBookingSection(bizId, container) {
    if (!container) return;
    
    let currentDate = new Date();
    
    container.innerHTML = `
        <div class="booking-widget" style="background: #111827; border-radius: 12px; padding: 2rem; color: white; font-family: Tahoma, sans-serif; direction: rtl;">
            <h3 style="font-size: 1.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid #374151; padding-bottom: 1rem;">احجز موعد</h3>
            
            <div id="calendar-container"></div>
            
            <div id="timeslot-container" style="display: none; margin-top: 1.5rem;">
                <h4 style="margin-bottom: 1rem; color: #D1D5DB;">المواعيد المتاحة:</h4>
                <div id="slots-grid" style="display: flex; flex-wrap: wrap; gap: 0.5rem;"></div>
            </div>
            
            <div id="booking-form-container" style="display: none; margin-top: 1.5rem; border-top: 1px solid #374151; padding-top: 1.5rem;">
                <h4 style="margin-bottom: 1rem; color: #D1D5DB;">تفاصيل الحجز:</h4>
                <input type="text" id="book-name" placeholder="الاسم بالكامل" style="width: 100%; padding: 0.75rem; margin-bottom: 1rem; border-radius: 6px; border: 1px solid #374151; background: #1F2937; color: white; box-sizing: border-box;">
                <input type="tel" id="book-phone" placeholder="رقم الموبايل" style="width: 100%; padding: 0.75rem; margin-bottom: 1rem; border-radius: 6px; border: 1px solid #374151; background: #1F2937; color: white; box-sizing: border-box;">
                <textarea id="book-notes" placeholder="ملاحظات (اختياري)" rows="3" style="width: 100%; padding: 0.75rem; margin-bottom: 1rem; border-radius: 6px; border: 1px solid #374151; background: #1F2937; color: white; box-sizing: border-box;"></textarea>
                <button id="submit-booking" style="width: 100%; padding: 1rem; background: #3B82F6; color: white; border: none; border-radius: 6px; font-weight: bold; font-size: 1.1rem; cursor: pointer; transition: background 0.3s;">تأكيد الحجز</button>
            </div>
        </div>
    `;

    function renderCalendar(date) {
        const calContainer = document.getElementById('calendar-container');
        const month = date.getMonth();
        const year = date.getFullYear();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
        
        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <button onclick="changeMonth(-1)" style="background: none; border: none; color: white; cursor: pointer; padding: 0.5rem;">&lt;</button>
                <span style="font-weight: bold; font-size: 1.2rem;">${monthNames[month]} ${year}</span>
                <button onclick="changeMonth(1)" style="background: none; border: none; color: white; cursor: pointer; padding: 0.5rem;">&gt;</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; text-align: center;">
                <div style="color: #9CA3AF; padding: 5px;">أحد</div>
                <div style="color: #9CA3AF; padding: 5px;">اثنين</div>
                <div style="color: #9CA3AF; padding: 5px;">ثلاثاء</div>
                <div style="color: #9CA3AF; padding: 5px;">أربعاء</div>
                <div style="color: #9CA3AF; padding: 5px;">خميس</div>
                <div style="color: #9CA3AF; padding: 5px;">جمعة</div>
                <div style="color: #9CA3AF; padding: 5px;">سبت</div>
        `;
        
        // Blank days
        for(let i=0; i<firstDay.getDay(); i++) {
            html += `<div></div>`;
        }
        
        const today = new Date();
        today.setHours(0,0,0,0);

        // Days
        for(let i=1; i<=daysInMonth; i++) {
            const thisDate = new Date(year, month, i);
            const isPast = thisDate < today;
            html += `
                <div onclick="${isPast ? '' : `selectDate(${year}, ${month}, ${i})`}" 
                     class="cal-day ${isPast ? 'past' : ''}"
                     style="padding: 10px 5px; border-radius: 6px; cursor: ${isPast ? 'not-allowed' : 'pointer'}; background: ${isPast ? 'transparent' : '#1F2937'}; color: ${isPast ? '#4B5563' : 'white'}; transition: background 0.2s;">
                    ${i}
                </div>
            `;
        }
        html += `</div>`;
        calContainer.innerHTML = html;
        
        // Add hover effect via JS since inline hover is hard
        document.querySelectorAll('.cal-day:not(.past)').forEach(el => {
            el.addEventListener('mouseover', () => el.style.background = '#374151');
            el.addEventListener('mouseout', () => el.style.background = '#1F2937');
        });
    }

    let selectedDateStr = '';
    let selectedTimeStr = '';

    window.changeMonth = function(offset) {
        currentDate.setMonth(currentDate.getMonth() + offset);
        renderCalendar(currentDate);
        document.getElementById('timeslot-container').style.display = 'none';
        document.getElementById('booking-form-container').style.display = 'none';
    };

    window.selectDate = function(y, m, d) {
        selectedDateStr = `${y}-${(m+1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
        
        // Mock slots
        const slots = ['10:00 ص', '11:00 ص', '12:30 م', '02:00 م', '04:00 م', '06:00 م'];
        const slotsGrid = document.getElementById('slots-grid');
        slotsGrid.innerHTML = slots.map(time => `
            <button class="time-slot" onclick="selectTime(this, '${time}')" style="background: #1F2937; border: 1px solid #374151; color: white; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; transition: all 0.2s;">${time}</button>
        `).join('');
        
        document.getElementById('timeslot-container').style.display = 'block';
        document.getElementById('booking-form-container').style.display = 'none';
    };

    window.selectTime = function(btn, time) {
        selectedTimeStr = time;
        document.querySelectorAll('.time-slot').forEach(el => {
            el.style.background = '#1F2937';
            el.style.borderColor = '#374151';
        });
        btn.style.background = '#3B82F6';
        btn.style.borderColor = '#3B82F6';
        
        document.getElementById('booking-form-container').style.display = 'block';
    };

    renderCalendar(currentDate);

    // Event listener for submit
    document.getElementById('submit-booking')?.addEventListener('click', () => {
        const name = document.getElementById('book-name').value;
        const phone = document.getElementById('book-phone').value;
        const notes = document.getElementById('book-notes').value;
        
        if(!name || !phone) {
            alert('الاسم ورقم الموبايل مطلوبين!');
            return;
        }
        
        saveBooking(bizId, selectedDateStr, selectedTimeStr, name, phone, notes);
    });
}

async function saveBooking(bizId, date, time, name, phone, notes) {
    const bookingData = {
        bizId,
        date,
        time,
        name,
        phone,
        notes,
        status: 'pending',
        createdAt: new Date().toISOString(),
        id: 'bk_' + Date.now()
    };
    
    try {
        // Save to LocalStorage for fallback
        let localBookings = JSON.parse(localStorage.getItem('sikka_bookings') || '[]');
        localBookings.push(bookingData);
        localStorage.setItem('sikka_bookings', JSON.stringify(localBookings));
        
        // Save to Firestore if db is available
        if (typeof db !== 'undefined') {
            await db.collection('bookings').doc(bookingData.id).set(bookingData);
        }
        
        alert('تم الحجز بنجاح! هنتواصل معاك في أقرب وقت.');
        // Reset form
        document.getElementById('booking-form-container').style.display = 'none';
        document.getElementById('timeslot-container').style.display = 'none';
        document.getElementById('book-name').value = '';
        document.getElementById('book-phone').value = '';
        document.getElementById('book-notes').value = '';
        
    } catch(e) {
        console.error("Error saving booking", e);
        alert('حصل مشكلة في الحجز، جرب تاني.');
    }
}

async function renderBusinessBookings(bizId, container) {
    if (!container) return;
    
    container.innerHTML = '<div style="color: white;">جاري تحميل الحجوزات...</div>';
    
    let bookings = [];
    
    try {
        if (typeof db !== 'undefined') {
            const snapshot = await db.collection('bookings').where('bizId', '==', bizId).get();
            snapshot.forEach(doc => bookings.push(doc.data()));
        } else {
            const local = JSON.parse(localStorage.getItem('sikka_bookings') || '[]');
            bookings = local.filter(b => b.bizId === bizId);
        }
        
        if (bookings.length === 0) {
            container.innerHTML = '<div style="color: #9CA3AF; background: #1F2937; padding: 2rem; border-radius: 8px; text-align: center;">مفيش حجوزات للنشاط ده لسه.</div>';
            return;
        }
        
        // Sort by date descending
        bookings.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        let html = `
            <div style="direction: rtl; font-family: Tahoma, sans-serif;">
                <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1.5rem;">حجوزات العملاء</h3>
                <div style="display: grid; gap: 1rem;">
        `;
        
        bookings.forEach(bk => {
            html += `
                <div id="booking-${bk.id}" style="background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <div style="color: white; font-weight: bold; font-size: 1.1rem; margin-bottom: 0.5rem;">${bk.name}</div>
                        <div style="color: #9CA3AF; font-size: 0.9rem; margin-bottom: 0.25rem;">
                            <span style="display: inline-block; width: 20px;">📅</span> ${bk.date} الساعة ${bk.time}
                        </div>
                        <div style="color: #9CA3AF; font-size: 0.9rem; margin-bottom: 0.25rem;">
                            <span style="display: inline-block; width: 20px;">📱</span> ${bk.phone}
                        </div>
                        ${bk.notes ? `<div style="color: #6B7280; font-size: 0.9rem; margin-top: 0.5rem; background: #1F2937; padding: 0.5rem; border-radius: 4px;">📝 ${bk.notes}</div>` : ''}
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        ${bk.status !== 'cancelled' ? `
                            <button onclick="cancelBooking('${bk.id}')" style="background: #EF4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">إلغاء الحجز</button>
                        ` : `<span style="background: #4B5563; color: white; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.9rem;">ملغي</span>`}
                    </div>
                </div>
            `;
        });
        
        html += `</div></div>`;
        container.innerHTML = html;
        
    } catch(e) {
        console.error("Error fetching bookings", e);
        container.innerHTML = '<div style="color: #EF4444;">حصل خطأ في تحميل الحجوزات.</div>';
    }
}

async function cancelBooking(bookingId) {
    if(!confirm('متأكد إنك عايز تلغي الحجز ده؟')) return;
    
    try {
        if (typeof db !== 'undefined') {
            await db.collection('bookings').doc(bookingId).update({ status: 'cancelled' });
        }
        
        // Update local storage too
        let localBookings = JSON.parse(localStorage.getItem('sikka_bookings') || '[]');
        const idx = localBookings.findIndex(b => b.id === bookingId);
        if (idx !== -1) {
            localBookings[idx].status = 'cancelled';
            localStorage.setItem('sikka_bookings', JSON.stringify(localBookings));
        }
        
        // Update UI
        const btn = document.querySelector(`#booking-${bookingId} button`);
        if (btn) {
            const parent = btn.parentElement;
            parent.innerHTML = `<span style="background: #4B5563; color: white; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.9rem;">ملغي</span>`;
        }
        alert('تم إلغاء الحجز.');
        
    } catch(e) {
        console.error("Error cancelling booking", e);
        alert('حصل مشكلة في الإلغاء.');
    }
}

// Export for global usage
window.renderBookingSection = renderBookingSection;
window.saveBooking = saveBooking;
window.renderBusinessBookings = renderBusinessBookings;
window.cancelBooking = cancelBooking;
