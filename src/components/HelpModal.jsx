import { useState } from 'react';

export default function HelpModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('roles');

  const tabs = [
    { id: 'roles', label: 'แนะนำบทบาท', icon: 'fa-user-gear' },
    { id: 'lifecycle', label: 'ขั้นตอน Ticket', icon: 'fa-list-ol' },
    { id: 'guide', label: 'คู่มือการใช้งาน', icon: 'fa-book-open' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', width: '100%', height: '80vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-title">
              <div className="modal-header-icon">
                <i className="fa-solid fa-circle-question" style={{ color: 'var(--primary)' }}></i>
              </div>
              <span className="modal-title">คู่มือและเอกสารช่วยเหลือ (Help Hub)</span>
            </div>
            <span className="modal-subtitle">ข้อมูลการใช้งานระบบช่วยเหลือ Ticket Hub สำหรับผู้ใช้ทุกบทบาท</span>
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
          padding: '0 28px',
          gap: 16
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              id={`help-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 4px',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                background: 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: 13.5,
                fontWeight: activeTab === tab.id ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: 'inherit'
              }}
            >
              <i className={`fa-solid ${tab.icon}`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body content */}
        <div className="modal-body" style={{ background: 'var(--bg-main)', padding: '24px 28px' }}>
          {activeTab === 'roles' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Introduction */}
              <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                ระบบ Ticket Hub แบ่งบทบาทหน้าที่การทำงานออกเป็น 3 บทบาทหลัก เพื่อให้ขั้นตอนการดำเนินการขอความช่วยเหลือทาง IT เป็นไปอย่างเป็นระบบและปลอดภัย:
              </div>

              {/* Roles list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* User */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start'
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 'var(--radius-md)',
                    background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0
                  }}>
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
                      ผู้ใช้งานทั่วไป (USER)
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      ยื่นแจ้งปัญหาหรือส่งคำขอช่วยเหลือ ติดตามสถานะความคืบหน้าของ Ticket ของตนเอง ส่งแชทข้อความพร้อมภาพแนบตอบโต้กับเจ้าหน้าที่ และสามารถยกเลิก Ticket ของตนเองได้เมื่อยังไม่มีผู้รับเคส
                    </div>
                  </div>
                </div>
 
                {/* Manager */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start'
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 'var(--radius-md)',
                    background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0
                  }}>
                    <i className="fa-solid fa-user-tie"></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
                      หัวหน้างาน / ผู้จัดการ (MANAGER)
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      เข้าถึง Ticket ระดับแผนก ตรวจสอบพิจารณาและอนุมัติ/ปฏิเสธ Ticket ที่รอการอนุมัติ (Wait Approve) ของลูกทีม ดูแลติดตามระดับประสิทธิภาพเวลาแก้ไข (SLA) และเข้าดูรายงานสถิติต่างๆ
                    </div>
                  </div>
                </div>
 
                {/* Admin */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start'
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 'var(--radius-md)',
                    background: 'rgba(124, 58, 237, 0.1)', color: 'rgb(124, 58, 237)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0
                  }}>
                    <i className="fa-solid fa-user-shield"></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
                      ผู้ดูแลระบบ (ADMIN)
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      สิทธิ์สูงสุดในการจัดการระบบ บริหารจัดการรายชื่อผู้ใช้ แผนกโครงสร้างองค์กร หมวดหมู่ Ticket ปัญหา จัดการตั้งค่าระบบและคู่มือ และเข้าดูแดชบอร์ดรายงานผลวิเคราะห์ข้อมูลเชิงลึกทั้งหมดของระบบ
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lifecycle' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Introduction */}
              <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Ticket แต่ละใบจะดำเนินตามขั้นตอนต่อไปนี้ตามลำดับ จนกว่าจะได้รับการแก้ไขเสร็จสิ้น:
              </div>

              {/* Status List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                    gap: 12,
                    padding: '12px 16px',
                    background: 'var(--bg-card)',
                    border: '1.5px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: `${s.color}18`, color: s.color,
                      fontSize: 12, flexShrink: 0, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <i className={`fa-solid ${s.icon}`}></i>
                    </div>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>
                        {s.label}
                      </span>
                      <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {s.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Step By Step Guide */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Step 1 */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', width: 24, textAlign: 'center' }}>01</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text-primary)', marginBottom: 2 }}>การแจ้งและสร้าง Ticket ใหม่</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      ไปที่เมนู "สร้าง Ticket" กรอกรายละเอียด อธิบายปัญหาและเลือกหมวดหมู่ที่เหมาะสม พร้อมระดับความเร่งด่วน แนบภาพหลักฐานความเสียหายเพื่อให้ผู้ดูแลเข้าใจปัญหาได้รวดเร็วขึ้น
                    </div>
                  </div>
                </div>

                <div style={{ height: 1, background: 'var(--border-light)' }} />

                {/* Step 2 */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', width: 24, textAlign: 'center' }}>02</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text-primary)', marginBottom: 2 }}>ติดตามสถานะและตอบโต้กับเจ้าหน้าที่</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      คุณสามารถตรวจสอบความคืบหน้าของปัญหากดที่ Ticket ของตนเองในหน้า "ติดตามสถานะ" และแชทเพื่อแจ้งข้อมูลเพิ่มเติมส่งรูปแนบ หรือดูประวัติความเคลื่อนไหวระบบได้ทันที โดยแบ่งออกเป็นแท็บ "แชทสนทนา" และ "ประวัติระบบ" แยกกันอย่างชัดเจน พร้อมพื้นที่เลื่อนแชท (Chat Scroll) ที่เป็นสัดส่วน
                    </div>
                  </div>
                </div>

                <div style={{ height: 1, background: 'var(--border-light)' }} />

                {/* Step 3 */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', width: 24, textAlign: 'center' }}>03</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text-primary)', marginBottom: 2 }}>การยกเลิกเคสและการเสร็จสิ้นงาน</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      หากต้องการยกเลิก Ticket สามารถทำได้เฉพาะในตอนที่ **ยังไม่มีเจ้าหน้าที่ไอทีรับมอบหมาย/กดรับงาน** เท่านั้น (ปุ่มจะซ่อนทันทีเมื่อมีช่างดูแลแล้ว) และเมื่อแก้สำเร็จสถานะจะเป็น แก้ไขเสร็จสิ้น (Resolved) คุณสามารถเข้าไปตรวจสอบความถูกต้องของผลลัพธ์ผ่านระบบได้ทันที
                    </div>
                  </div>
                </div>
              </div>

              {/* Note callout */}
              <div style={{
                background: 'var(--primary-bg)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginTop: 8,
                display: 'flex',
                gap: 10,
                alignItems: 'center'
              }}>
                <i className="fa-solid fa-circle-info" style={{ color: 'var(--primary)', fontSize: 14 }}></i>
                <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                  หากมีข้อสงสัยหรือข้อขัดข้องเกี่ยวกับระบบ กรุณาติดต่อสายด่วน IT Service Desk โทร. 1234
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose} style={{ padding: '8px 20px', fontSize: 13, fontWeight: 700 }} id="close-help-btn">
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
