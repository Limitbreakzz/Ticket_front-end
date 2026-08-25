import { useState, useEffect } from 'react';

export default function HelpModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('roles');
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tabs = [
    { id: 'roles', label: 'แนะนำบทบาท', icon: 'fa-user-gear' },
    { id: 'lifecycle', label: 'ขั้นตอน Ticket', icon: 'fa-list-ol' },
    { id: 'guide', label: 'คู่มือการใช้งาน', icon: 'fa-book-open' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, padding: isMobile ? 0 : 16, alignItems: isMobile ? 'flex-end' : 'center' }}>
      <div 
        className="modal help-modal-fixed-container" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: '640px', 
          width: '100%', 
          maxHeight: isMobile ? '85dvh' : '600px',
          height: isMobile ? '85dvh' : '600px', 
          minHeight: isMobile ? '85dvh' : '600px',
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: isMobile ? '20px 20px 0 0' : 'var(--radius-xl)',
          overflow: 'hidden',
          animation: isMobile 
            ? 'iosSlideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1) forwards' 
            : 'iosScaleIn 0.28s cubic-bezier(0.32, 0.72, 0, 1) forwards'
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: isMobile ? '14px 16px' : '20px 24px' }}>
          <div className="modal-title-wrap">
            <div className="modal-icon-title">
              <div className="modal-header-icon" style={{ width: isMobile ? 28 : 34, height: isMobile ? 28 : 34, fontSize: isMobile ? 14 : 16 }}>
                <i className="fa-solid fa-circle-question" style={{ color: 'var(--primary)' }}></i>
              </div>
              <span className="modal-title" style={{ fontSize: isMobile ? 15 : 17, fontWeight: 800 }}>คู่มือการใช้งาน (Help Hub)</span>
            </div>
            <span className="modal-subtitle" style={{ fontSize: isMobile ? 11.5 : 13, marginTop: 2 }}>ข้อมูลการใช้งานระบบช่วยเหลือ Ticket Hub สำหรับผู้ใช้ทุกบทบาท</span>
          </div>
          <button className="modal-close" onClick={onClose} id="close-help-modal">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Tab Buttons */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-light)',
          background: 'var(--bg-card)',
          padding: isMobile ? '0 6px' : '0 24px',
          gap: isMobile ? 2 : 16,
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              id={`help-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isMobile ? 5 : 8,
                padding: isMobile ? '12px 4px' : '14px 12px',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                background: 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: isMobile ? 12 : 13.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'color 0.15s ease, border-color 0.15s ease',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
                flex: isMobile ? '1 1 0px' : 'initial',
                minWidth: 0,
                textAlign: 'center'
              }}
            >
              <i className={`fa-solid ${tab.icon}`} style={{ fontSize: isMobile ? 12 : 14, flexShrink: 0 }}></i>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Body content */}
        <div className="modal-body" style={{ background: 'var(--bg-main)', padding: isMobile ? '14px 14px' : '24px 28px', flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <style>{`
            @keyframes iosTabSwitch {
              0% {
                opacity: 0;
                transform: translateY(14px) scale(0.982);
              }
              60% {
                opacity: 0.85;
                transform: translateY(-1px) scale(1.002);
              }
              100% {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
            .help-tab-animated {
              animation: iosTabSwitch 0.32s cubic-bezier(0.32, 0.72, 0, 1) both;
              will-change: transform, opacity;
            }
          `}</style>

          {activeTab === 'roles' && (
            <div key="tab-roles" className="help-tab-animated" style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 16 }}>
              {/* Introduction */}
              <div style={{ fontSize: isMobile ? 12.5 : 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                ระบบ Ticket Hub แบ่งบทบาทหน้าที่การทำงานออกเป็น 3 บทบาทหลัก เพื่อให้ขั้นตอนการดำเนินการขอความช่วยเหลือทาง IT เป็นไปอย่างเป็นระบบและปลอดภัย:
              </div>

              {/* Roles list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 12 }}>
                {/* User */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: isMobile ? '12px' : '16px',
                  display: 'flex',
                  gap: isMobile ? 10 : 14,
                  alignItems: 'flex-start'
                }}>
                  <div style={{
                    width: isMobile ? 32 : 38, height: isMobile ? 32 : 38, borderRadius: 'var(--radius-md)',
                    background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isMobile ? 14 : 16, flexShrink: 0
                  }}>
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: isMobile ? 13 : 14, color: 'var(--text-primary)', marginBottom: 2 }}>
                      ผู้ใช้งานทั่วไป (USER)
                    </div>
                    <div style={{ fontSize: isMobile ? 12 : 13, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      ยื่นแจ้งปัญหาหรือส่งคำขอช่วยเหลือ ติดตามสถานะความคืบหน้าของ Ticket ของตนเอง ส่งแชทข้อความพร้อมภาพแนบตอบโต้กับเจ้าหน้าที่ และสามารถยกเลิก Ticket ของตนเองได้เมื่อยังไม่มีผู้รับเคส
                    </div>
                  </div>
                </div>

                {/* Manager */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: isMobile ? '12px' : '16px',
                  display: 'flex',
                  gap: isMobile ? 10 : 14,
                  alignItems: 'flex-start'
                }}>
                  <div style={{
                    width: isMobile ? 32 : 38, height: isMobile ? 32 : 38, borderRadius: 'var(--radius-md)',
                    background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isMobile ? 14 : 16, flexShrink: 0
                  }}>
                    <i className="fa-solid fa-user-tie"></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: isMobile ? 13 : 14, color: 'var(--text-primary)', marginBottom: 2 }}>
                      หัวหน้างาน / ผู้จัดการ (MANAGER)
                    </div>
                    <div style={{ fontSize: isMobile ? 12 : 13, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      เข้าถึง Ticket ระดับแผนก ตรวจสอบพิจารณาและอนุมัติ/ปฏิเสธ Ticket ที่รอการอนุมัติ (Wait Approve) ของลูกทีม ดูแลติดตามระดับประสิทธิภาพเวลาแก้ไข (SLA) และเข้าดูรายงานสถิติต่างๆ
                    </div>
                  </div>
                </div>

                {/* Admin */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: isMobile ? '12px' : '16px',
                  display: 'flex',
                  gap: isMobile ? 10 : 14,
                  alignItems: 'flex-start'
                }}>
                  <div style={{
                    width: isMobile ? 32 : 38, height: isMobile ? 32 : 38, borderRadius: 'var(--radius-md)',
                    background: 'rgba(124, 58, 237, 0.1)', color: 'rgb(124, 58, 237)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isMobile ? 14 : 16, flexShrink: 0
                  }}>
                    <i className="fa-solid fa-user-shield"></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: isMobile ? 13 : 14, color: 'var(--text-primary)', marginBottom: 2 }}>
                      ผู้ดูแลระบบ (ADMIN)
                    </div>
                    <div style={{ fontSize: isMobile ? 12 : 13, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      สิทธิ์สูงสุดในการจัดการระบบ บริหารจัดการรายชื่อผู้ใช้ แผนกโครงสร้างองค์กร หมวดหมู่ Ticket ปัญหา จัดการตั้งค่าระบบและคู่มือ และเข้าดูแดชบอร์ดรายงานผลวิเคราะห์ข้อมูลเชิงลึกทั้งหมดของระบบ
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lifecycle' && (
            <div key="tab-lifecycle" className="help-tab-animated" style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 16 }}>
              {/* Introduction */}
              <div style={{ fontSize: isMobile ? 12.5 : 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Ticket แต่ละใบจะดำเนินตามขั้นตอนต่อไปนี้ตามลำดับ จนกว่าจะได้รับการแก้ไขเสร็จสิ้น:
              </div>

              {/* Status List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 6 : 8 }}>
                {[
                  { label: 'รอดำเนินการ (Pending)', desc: 'Ticket ถูกสร้างใหม่เรียบร้อย รอคัดแยกประเภท คาดคะเนระดับความสำคัญ และส่งต่อหรือมอบหมายงานให้กับช่างเทคนิค', color: 'rgb(59, 130, 246)', icon: 'fa-clock' },
                  { label: 'กำลังดำเนินการ (In Progress)', desc: 'ช่างเทคนิคหรือผู้ดูแลระบบที่ได้รับมอบหมายกำลังดำเนินการเข้าช่วยเหลือตรวจสอบและแก้ไขปัญหา', color: 'rgb(245, 158, 11)', icon: 'fa-screwdriver-wrench' },
                  { label: 'รออนุมัติ (Wait Approve)', desc: 'Ticket ที่มีการร้องขออุปกรณ์ หรือสิทธิ์เข้าใช้งานระบบ ซึ่งจำเป็นต้องได้รับการตรวจสอบและอนุมัติจากหัวหน้าแผนกก่อนเริ่มงาน', color: 'rgb(124, 58, 237)', icon: 'fa-hourglass-half' },
                  { label: 'อนุมัติแล้ว (Approved)', desc: 'การร้องขอหรือ Ticket ได้รับการพิจารณาอนุมัติจากหัวหน้าแผนก/ผู้จัดการแล้ว พร้อมสำหรับการดำเนินการต่อ', color: 'rgb(16, 185, 129)', icon: 'fa-thumbs-up' },
                  { label: 'แก้ไขเสร็จสิ้น (Resolved)', desc: 'ช่างเทคนิคได้ทำการแก้ไขปัญหาและทดสอบการใช้งานเสร็จสิ้นแล้ว เพื่อบันทึกประเมินค่าประสิทธิภาพการบริการ (SLA)', color: 'rgb(16, 185, 129)', icon: 'fa-circle-check' },
                  { label: 'ยกเลิก (Cancelled)', desc: 'Ticket ถูกยกเลิกโดยผู้แจ้งเรื่อง (ทำได้เฉพาะตอนไม่มีช่างรับงาน) หรือเจ้าหน้าที่ระบบระบุเหตุผลขัดข้อง Ticket จะไม่ได้รับการดำเนินการต่อ', color: 'rgb(239, 68, 68)', icon: 'fa-ban' }
                ].map((s, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: isMobile ? 10 : 12,
                    padding: isMobile ? '10px 12px' : '12px 16px',
                    background: 'var(--bg-card)',
                    border: '1.5px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{
                      width: isMobile ? 24 : 28, height: isMobile ? 24 : 28, borderRadius: '50%',
                      background: `${s.color}18`, color: s.color,
                      fontSize: isMobile ? 11 : 12, flexShrink: 0, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <i className={`fa-solid ${s.icon}`}></i>
                    </div>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: isMobile ? 12.5 : 13.5, color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>
                        {s.label}
                      </span>
                      <span style={{ fontSize: isMobile ? 11.5 : 12.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {s.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div key="tab-guide" className="help-tab-animated" style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 16 }}>
              {/* Step By Step Guide */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 14 }}>
                {/* Step 1 */}
                <div style={{ display: 'flex', gap: isMobile ? 10 : 12, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 800, color: 'var(--primary)', width: 22, textAlign: 'center' }}>01</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: isMobile ? 13 : 13.5, color: 'var(--text-primary)', marginBottom: 2 }}>การแจ้งและสร้าง Ticket ใหม่</div>
                    <div style={{ fontSize: isMobile ? 12 : 12.5, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      ไปที่เมนู "สร้าง Ticket" กรอกรายละเอียด อธิบายปัญหาและเลือกหมวดหมู่ที่เหมาะสม พร้อมระดับความเร่งด่วน แนบภาพหลักฐานความเสียหายเพื่อให้ผู้ดูแลเข้าใจปัญหาได้รวดเร็วขึ้น
                    </div>
                  </div>
                </div>

                <div style={{ height: 1, background: 'var(--border-light)' }} />

                {/* Step 2 */}
                <div style={{ display: 'flex', gap: isMobile ? 10 : 12, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 800, color: 'var(--primary)', width: 22, textAlign: 'center' }}>02</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: isMobile ? 13 : 13.5, color: 'var(--text-primary)', marginBottom: 2 }}>ติดตามสถานะและตอบโต้กับเจ้าหน้าที่</div>
                    <div style={{ fontSize: isMobile ? 12 : 12.5, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      คุณสามารถตรวจสอบความคืบหน้าของปัญหากดที่ Ticket ของตนเองในหน้า "ติดตามสถานะ" และแชทเพื่อแจ้งข้อมูลเพิ่มเติมส่งรูปแนบ หรือดูประวัติความเคลื่อนไหวระบบได้ทันที โดยแบ่งออกเป็นแท็บ "แชทสนทนา" และ "ประวัติระบบ" แยกกันอย่างชัดเจน
                    </div>
                  </div>
                </div>

                <div style={{ height: 1, background: 'var(--border-light)' }} />

                {/* Step 3 */}
                <div style={{ display: 'flex', gap: isMobile ? 10 : 12, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 800, color: 'var(--primary)', width: 22, textAlign: 'center' }}>03</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: isMobile ? 13 : 13.5, color: 'var(--text-primary)', marginBottom: 2 }}>การยกเลิกเคสและการเสร็จสิ้นงาน</div>
                    <div style={{ fontSize: isMobile ? 12 : 12.5, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      หากต้องการยกเลิก Ticket สามารถทำได้เฉพาะในตอนที่ **ยังไม่มีเจ้าหน้าที่ไอทีรับมอบหมาย/กดรับงาน** เท่านั้น และเมื่อแก้สำเร็จสถานะจะเป็น แก้ไขเสร็จสิ้น (Resolved)
                    </div>
                  </div>
                </div>
              </div>

              {/* Note callout */}
              <div style={{
                background: 'var(--primary-bg)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: isMobile ? '10px 12px' : '12px 16px',
                marginTop: 4,
                display: 'flex',
                gap: 10,
                alignItems: 'center'
              }}>
                <i className="fa-solid fa-circle-info" style={{ color: 'var(--primary)', fontSize: 14, flexShrink: 0 }}></i>
                <div style={{ fontSize: isMobile ? 11.5 : 12, color: 'var(--primary)', fontWeight: 600, lineHeight: 1.4 }}>
                  หากมีข้อสงสัยหรือข้อขัดข้องเกี่ยวกับระบบ กรุณาติดต่อสายด่วน IT Service Desk โทร. 1234
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
