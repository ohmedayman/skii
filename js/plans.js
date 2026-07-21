// ملف الخطط والأسعار لمنصة سكة
const PLANS = {
    free: {
        id: 'free',
        name: 'مجاني',
        priceMonthly: 0,
        priceYearly: 0,
        features: ['إضافة نشاط تجاري واحد', 'رفع لحد 3 صور', 'إحصائيات أساسية', 'دعم فني عادي'],
        limits: {
            businesses: 1,
            photos: 3,
            basicStats: true,
            analytics: false,
            booking: false,
            replyReviews: false,
            verifiedBadge: false,
            prioritySearch: false,
            apiAccess: false
        }
    },
    pro: {
        id: 'pro',
        name: 'برو',
        priceMonthly: 99,
        priceYearly: 950,
        features: ['إضافة نشاط تجاري واحد', 'رفع لحد 20 صورة', 'إحصائيات متقدمة (Analytics)', 'نظام الحجوزات', 'الرد على التقييمات', 'علامة التوثيق', 'دعم فني سريع'],
        limits: {
            businesses: 1,
            photos: 20,
            basicStats: true,
            analytics: true,
            booking: true,
            replyReviews: true,
            verifiedBadge: true,
            prioritySearch: false,
            apiAccess: false
        }
    },
    business: {
        id: 'business',
        name: 'أعمال',
        priceMonthly: 299,
        priceYearly: 2870,
        features: ['إضافة لحد 5 فروع/أنشطة', 'عدد صور غير محدود', 'إحصائيات متقدمة', 'نظام الحجوزات', 'الرد على التقييمات', 'علامة التوثيق', 'أولوية في نتائج البحث', 'ربط برمجي (API)', 'مدير حساب شخصي'],
        limits: {
            businesses: 5,
            photos: 99999,
            basicStats: true,
            analytics: true,
            booking: true,
            replyReviews: true,
            verifiedBadge: true,
            prioritySearch: true,
            apiAccess: true
        }
    }
};

function renderPlansPage(container) {
    if (!container) return;
    
    container.innerHTML = `
        <div class="plans-container" style="background-color: #111827; padding: 4rem 1rem; font-family: Tahoma, Arial, sans-serif; direction: rtl;">
            <div style="text-align: center; margin-bottom: 3rem;">
                <h2 style="color: #fff; font-size: 2.5rem; margin-bottom: 1rem;">اختار الخطة المناسبة لشغلك</h2>
                <p style="color: #9CA3AF; font-size: 1.1rem; margin-bottom: 2rem;">باقات تناسب كل الأنشطة التجارية في مصر</p>
                
                <div class="billing-toggle" style="display: flex; align-items: center; justify-content: center; gap: 1rem;">
                    <span id="monthly-label" style="color: #fff; font-weight: bold;">شهري</span>
                    <label class="switch" style="position: relative; display: inline-block; width: 60px; height: 34px;">
                        <input type="checkbox" id="billing-switch" onchange="toggleBilling(this)" style="opacity: 0; width: 0; height: 0;">
                        <span class="slider round" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #374151; transition: .4s; border-radius: 34px;"></span>
                    </label>
                    <span id="yearly-label" style="color: #9CA3AF;">سنوي <span style="background: #10B981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; margin-right: 5px;">وفر 20%</span></span>
                </div>
            </div>
            
            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 2rem; max-width: 1200px; margin: 0 auto;">
                ${Object.values(PLANS).map(plan => `
                    <div class="plan-card ${plan.id === 'pro' ? 'pro-card' : ''}" style="background: ${plan.id === 'pro' ? 'linear-gradient(135deg, #1F2937, #111827)' : '#1F2937'}; border: ${plan.id === 'pro' ? '2px solid #3B82F6' : '1px solid #374151'}; border-radius: 16px; padding: 2rem; width: 100%; max-width: 350px; position: relative; transition: transform 0.3s ease;">
                        ${plan.id === 'pro' ? '<div style="position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: #3B82F6; color: white; padding: 4px 16px; border-radius: 20px; font-size: 0.875rem; font-weight: bold;">الأكثر طلباً</div>' : ''}
                        
                        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 0.5rem; text-align: center;">${plan.name}</h3>
                        <div style="text-align: center; margin-bottom: 2rem;">
                            <span class="price-monthly" style="color: white; font-size: 2.5rem; font-weight: bold;" data-monthly="${plan.priceMonthly}" data-yearly="${plan.priceYearly}">
                                ${plan.priceMonthly}
                            </span>
                            <span style="color: #9CA3AF;">جنية / <span class="billing-period">شهر</span></span>
                        </div>
                        
                        <ul style="list-style: none; padding: 0; margin: 0 0 2rem 0;">
                            ${plan.features.map(feature => `
                                <li style="color: #D1D5DB; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                                    <svg style="width: 20px; height: 20px; color: #10B981;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    ${feature}
                                </li>
                            `).join('')}
                        </ul>
                        
                        <button onclick="upgradePlan('${plan.id}')" style="width: 100%; padding: 1rem; border: none; border-radius: 8px; background: ${plan.id === 'pro' ? '#3B82F6' : '#374151'}; color: white; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: background 0.3s;">
                            ${plan.id === 'free' ? 'ابدأ مجاناً' : 'اشترك دلوقتي'}
                        </button>
                    </div>
                `).join('')}
            </div>
            <style>
                .slider:before { position: absolute; content: ""; height: 26px; width: 26px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
                input:checked + .slider { background-color: #3B82F6; }
                input:checked + .slider:before { transform: translateX(26px); }
                .plan-card:hover { transform: translateY(-5px); }
            </style>
        </div>
    `;
    
    // Add global toggle function
    window.toggleBilling = function(checkbox) {
        const isYearly = checkbox.checked;
        document.getElementById('monthly-label').style.color = isYearly ? '#9CA3AF' : '#fff';
        document.getElementById('monthly-label').style.fontWeight = isYearly ? 'normal' : 'bold';
        document.getElementById('yearly-label').style.color = isYearly ? '#fff' : '#9CA3AF';
        document.getElementById('yearly-label').style.fontWeight = isYearly ? 'bold' : 'normal';
        
        const priceElements = document.querySelectorAll('.price-monthly');
        const periodElements = document.querySelectorAll('.billing-period');
        
        priceElements.forEach(el => {
            el.innerText = isYearly ? el.getAttribute('data-yearly') : el.getAttribute('data-monthly');
        });
        
        periodElements.forEach(el => {
            el.innerText = isYearly ? 'سنة' : 'شهر';
        });
    };
}

function getUserPlan(userId) {
    // In a real app, fetch from Firestore. Here we check localStorage
    try {
        const userStr = localStorage.getItem('sikka_user_' + userId);
        if (userStr) {
            const user = JSON.parse(userStr);
            return user.plan || 'free';
        }
    } catch(e) {
        console.error("Error parsing user data", e);
    }
    return 'free';
}

function upgradePlan(planId) {
    if (planId === 'free') {
        alert("إنت على الخطة المجانية فعلاً يا ريس!");
        return;
    }
    
    const plan = PLANS[planId];
    if (!plan) return;
    
    // Create and show modal
    const modalHTML = `
        <div id="upgrade-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; justify-content: center; align-items: center; direction: rtl; font-family: Tahoma, sans-serif;">
            <div style="background: #1F2937; width: 90%; max-width: 500px; border-radius: 16px; padding: 2rem; color: white; position: relative;">
                <button onclick="document.getElementById('upgrade-modal').remove()" style="position: absolute; top: 1rem; left: 1rem; background: none; border: none; color: #9CA3AF; font-size: 1.5rem; cursor: pointer;">&times;</button>
                <h3 style="margin-bottom: 1rem; font-size: 1.5rem;">ترقية لخطة ${plan.name}</h3>
                <p style="color: #9CA3AF; margin-bottom: 2rem;">اختار طريقة الدفع اللي تريحك</p>
                
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <button class="payment-btn" onclick="processPayment('${planId}', 'fawry')" style="background: white; border: 2px solid #FCD34D; border-radius: 8px; padding: 1rem; display: flex; align-items: center; justify-content: center; gap: 1rem; cursor: pointer; transition: transform 0.2s;">
                        <span style="color: #1F2937; font-weight: bold; font-size: 1.2rem;">فوري</span>
                    </button>
                    <button class="payment-btn" onclick="processPayment('${planId}', 'paymob')" style="background: white; border: 2px solid #3B82F6; border-radius: 8px; padding: 1rem; display: flex; align-items: center; justify-content: center; gap: 1rem; cursor: pointer; transition: transform 0.2s;">
                        <span style="color: #1F2937; font-weight: bold; font-size: 1.2rem;">بطاقة بنكية (Paymob)</span>
                    </button>
                </div>
            </div>
            <style>.payment-btn:hover { transform: scale(1.02); }</style>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    window.processPayment = function(pId, method) {
        alert(`جاري التحويل لصفحة الدفع عن طريق ${method === 'fawry' ? 'فوري' : 'Paymob'}...`);
        // Mock successful payment
        setTimeout(() => {
            alert('تم الدفع بنجاح! مبروك ترقية حسابك.');
            document.getElementById('upgrade-modal').remove();
            // In real app, update user record in firestore
        }, 1500);
    };
}

function checkPlanLimit(feature, userId) {
    const userPlanId = getUserPlan(userId);
    const plan = PLANS[userPlanId] || PLANS.free;
    
    if (plan.limits && plan.limits[feature] !== undefined) {
        return plan.limits[feature];
    }
    return false; // Feature not found or allowed
}

function renderPlanBadge(planId) {
    const plan = PLANS[planId] || PLANS.free;
    let bgColor, color;
    
    switch(planId) {
        case 'pro':
            bgColor = '#DBEAFE';
            color = '#1D4ED8';
            break;
        case 'business':
            bgColor = '#FEF3C7';
            color = '#B45309';
            break;
        case 'free':
        default:
            bgColor = '#E5E7EB';
            color = '#374151';
            break;
    }
    
    return `<span style="background-color: ${bgColor}; color: ${color}; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: bold;">${plan.name}</span>`;
}

// Export for global usage
window.PLANS = PLANS;
window.renderPlansPage = renderPlansPage;
window.getUserPlan = getUserPlan;
window.upgradePlan = upgradePlan;
window.checkPlanLimit = checkPlanLimit;
window.renderPlanBadge = renderPlanBadge;
