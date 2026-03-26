'use client';

import React, { useState, useEffect } from 'react';
import styles from './business-plan.module.css';
import { toast } from 'sonner';

interface BudgetItem {
  category: string;
  detail: string;
  amount: string;
}

interface FormData {
  companyName: string;
  bizNo: string;
  ceo: string;
  establishmentDate: string;
  address: string;
  website: string;
  managerName: string;
  managerTel: string;
  managerEmail: string;
  sales2023: string;
  sales2024: string;
  sales2025: string;
  export2023: string;
  export2024: string;
  export2025: string;
  itemParams: string;
  hscode: string;
  overview: string;
  productDetails: string;
  marketAnalysis: string;
  marketingPlan: string;
  budgetItems: BudgetItem[];
}

export default function BusinessPlanPage() {
  const [formData, setFormData] = useState<FormData>({
    companyName: 'MY AI PRINT SHOP',
    bizNo: '',
    ceo: '',
    establishmentDate: '',
    address: '',
    website: 'https://goodzz.co.kr',
    managerName: '',
    managerTel: '',
    managerEmail: '',
    
    // Financials
    sales2023: '',
    sales2024: '',
    sales2025: '',
    export2023: '',
    export2024: '',
    export2025: '',
    
    // Status
    itemParams: 'AI 기반 맞춤형 프린팅 굿즈 (티셔츠, 에코백, 머그컵 등)',
    hscode: '',
    
    // Sections
    overview: `MY AI PRINT SHOP은 생성형 AI 기술을 활용한 맞춤형 프린팅 굿즈 제작 플랫폼입니다.

당사는 Google Vertex AI 기반의 이미지 생성 기술을 활용하여, 고객이 텍스트 프롬프트만으로 독창적인 디자인을 생성하고, 이를 다양한 굿즈(티셔츠, 에코백, 머그컵, 스티커 등)에 즉시 적용하여 주문할 수 있는 서비스를 제공합니다.

기술적 핵심 역량:
- AI 이미지 생성 및 편집 시스템
- 실시간 상품 미리보기 캔버스 기술
- 고품질 DTG(Direct to Garment) 프린팅 연동`,
    productDetails: `주력 상품: AI 커스텀 디자인 굿즈

1. AI 디자인 오버핏 티셔츠
   - 100% 면 프리미엄 원단
   - AI 생성 디자인 프린팅
   - 가격대: 35,000원 ~ 45,000원

2. 프리미엄 캔버스 에코백
   - 두꺼운 캔버스 원단
   - 대형 프린팅 영역
   - 가격대: 25,000원 ~ 35,000원

3. 세라믹 머그컵
   - 고해상도 승화전사 프린팅
   - 식기세척기 사용 가능
   - 가격대: 18,000원 ~ 25,000원

경쟁력:
- AI 디자인 생성으로 디자인 비용 절감
- 1개부터 주문 가능한 소량 생산 시스템
- 빠른 제작 및 배송 (3-5일 이내)`,
    marketAnalysis: '',
    marketingPlan: '',
    
    // Budget
    budgetItems: [
      { category: '홍보/광고', detail: '글로벌 SNS 마케팅 (Instagram, TikTok)', amount: '10,000' },
      { category: '브랜드 개발', detail: '외국어 웹사이트 및 카탈로그 제작', amount: '8,000' },
      { category: '해외 전시', detail: '해외 굿즈/프린팅 박람회 참가', amount: '15,000' },
      { category: '', detail: '', amount: '' },
    ]
  });

  const [statusMessage, setStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load data from API (or localStorage as fallback) on mount
  useEffect(() => {
    async function loadData() {
      try {
        // 먼저 API에서 데이터 가져오기 시도
        const response = await fetch('/api/export-voucher/save');
        if (response.ok) {
          const data = await response.json();
          if (data && data.companyName) {
            setFormData(data);
            setStatusMessage(`AI 협업 데이터 불러옴 (${data._savedAtKorean || '시간 미상'})`);
            return;
          }
        }
      } catch (error) {
        console.log('API load failed, trying localStorage');
      }
      
      // API 실패 시 localStorage에서 로드
      const savedData = localStorage.getItem('exportVoucherPlan');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData(parsed);
          setStatusMessage('로컬 데이터를 불러왔습니다.');
        } catch (e) {
          console.error('Failed to parse saved data', e);
        }
      }
    }
    loadData();
  }, []);

  // 로컬 임시 저장 (브라우저 전용)
  const handleLocalSave = () => {
    try {
      localStorage.setItem('exportVoucherPlan', JSON.stringify(formData));
      toast.success('브라우저에 임시 저장되었습니다.');
    } catch (error) {
      toast.error('임시 저장 실패');
    }
  };

  // AI 협업용 저장 (파일 시스템에 저장 - AI가 읽을 수 있음)
  const handleAiSave = async () => {
    setIsSaving(true);
    setStatusMessage('AI 협업용 저장 중...');
    
    try {
      const response = await fetch('/api/export-voucher/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setStatusMessage(`✅ AI 협업 저장 완료! (${result.savedAt})`);
        toast.success('AI 협업용 저장 완료! AI가 이제 내용을 확인할 수 있습니다.', {
          duration: 4000,
          icon: '🤖'
        });
        // 로컬에도 백업
        localStorage.setItem('exportVoucherPlan', JSON.stringify(formData));
      } else {
        throw new Error(result.error || 'Save failed');
      }
    } catch (error) {
      console.error('Error saving:', error);
      setStatusMessage('저장 중 오류 발생');
      toast.error('AI 협업 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBudgetChange = (index: number, field: keyof BudgetItem, value: string) => {
    const newBudget = [...formData.budgetItems];
    newBudget[index] = { ...newBudget[index], [field]: value };
    setFormData(prev => ({ ...prev, budgetItems: newBudget }));
  };

  const addBudgetRow = () => {
    setFormData(prev => ({
      ...prev,
      budgetItems: [...prev.budgetItems, { category: '', detail: '', amount: '' }]
    }));
  };

  const calcPercentage = (part: string, total: string): number => {
    const p = Number(part) || 0;
    const t = Number(total) || 0;
    return t > 0 ? Math.round((p / t) * 100) : 0;
  };

  const totalBudget = formData.budgetItems.reduce((acc, curr) => {
    return acc + (Number(curr.amount.replace(/,/g, '')) || 0);
  }, 0);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>2026년 수출지원기반활용사업 사업계획서</h1>
        <p className={styles.subtitle}>[서식 제3호] 수출바우처사업 사업계획서</p>
        <div style={{marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap'}}>
          <button onClick={handleLocalSave} className={styles.saveButton} style={{background: '#6b7280'}}>
            💾 임시 저장
          </button>
          <button 
            onClick={handleAiSave} 
            disabled={isSaving}
            className={styles.saveButton}
            style={{background: isSaving ? '#93c5fd' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'}}
          >
            {isSaving ? '⏳ 저장 중...' : '🤖 AI 협업용 저장'}
          </button>
        </div>
        {statusMessage && (
          <p style={{textAlign: 'center', fontSize: '13px', color: '#3b82f6', marginTop: '10px'}}>{statusMessage}</p>
        )}
      </header>

      {/* 1. 기본정보 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. 신청기업 일반현황</h2>
        <div className={styles.formGrid}>
          <div className={styles.label}>기업명</div>
          <div className={styles.value}>
            <input 
              className={styles.input} 
              name="companyName" 
              value={formData.companyName} 
              onChange={handleChange}
              placeholder="(주)예시기업"
            />
          </div>
          <div className={styles.label}>사업자등록번호</div>
          <div className={styles.value}>
            <input 
              className={styles.input} 
              name="bizNo" 
              value={formData.bizNo} 
              onChange={handleChange}
              placeholder="000-00-00000"
            />
          </div>

          <div className={styles.label}>대표자명</div>
          <div className={styles.value}>
            <input 
              className={styles.input} 
              name="ceo" 
              value={formData.ceo} 
              onChange={handleChange}
            />
          </div>
          <div className={styles.label}>설립일자</div>
          <div className={styles.value}>
            <input 
              className={styles.input} 
              name="establishmentDate" 
              value={formData.establishmentDate} 
              onChange={handleChange}
              placeholder="YYYY. MM. DD"
            />
          </div>

          <div className={styles.label}>본사 주소</div>
          <div className={`${styles.value} ${styles.fullWidth}`}>
            <input 
              className={styles.input} 
              name="address" 
              value={formData.address} 
              onChange={handleChange}
            />
          </div>

          <div className={styles.label}>홈페이지</div>
          <div className={`${styles.value} ${styles.fullWidth}`}>
            <input 
              className={styles.input} 
              name="website" 
              value={formData.website} 
              onChange={handleChange}
            />
          </div>
        </div>
      </section>

      {/* 2. 매출 및 수출 현황 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>2. 매출 및 수출 실적</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th rowSpan={2}>구분</th>
              <th colSpan={2}>2023년 (확정)</th>
              <th colSpan={2}>2024년 (확정/잠정)</th>
              <th colSpan={2}>2025년 (목표)</th>
            </tr>
            <tr>
              <th>금액 (백만원)</th>
              <th>비중 (%)</th>
              <th>금액 (백만원)</th>
              <th>비중 (%)</th>
              <th>금액 (백만원)</th>
              <th>비중 (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{textAlign: 'center', background: '#f9f9f9', fontWeight: 'bold'}}>전체 매출액</td>
              <td><input className={styles.input} name="sales2023" value={formData.sales2023} onChange={handleChange} style={{textAlign: 'right'}} /></td>
              <td style={{textAlign: 'center'}}>-</td>
              <td><input className={styles.input} name="sales2024" value={formData.sales2024} onChange={handleChange} style={{textAlign: 'right'}} /></td>
              <td style={{textAlign: 'center'}}>-</td>
              <td><input className={styles.input} name="sales2025" value={formData.sales2025} onChange={handleChange} style={{textAlign: 'right'}} /></td>
              <td style={{textAlign: 'center'}}>-</td>
            </tr>
            <tr>
              <td style={{textAlign: 'center', background: '#f9f9f9', fontWeight: 'bold'}}>직수출액</td>
              <td><input className={styles.input} name="export2023" value={formData.export2023} onChange={handleChange} style={{textAlign: 'right'}} /></td>
              <td style={{textAlign: 'center'}}>{calcPercentage(formData.export2023, formData.sales2023)}%</td>
              <td><input className={styles.input} name="export2024" value={formData.export2024} onChange={handleChange} style={{textAlign: 'right'}} /></td>
              <td style={{textAlign: 'center'}}>{calcPercentage(formData.export2024, formData.sales2024)}%</td>
              <td><input className={styles.input} name="export2025" value={formData.export2025} onChange={handleChange} style={{textAlign: 'right'}} /></td>
              <td style={{textAlign: 'center'}}>{calcPercentage(formData.export2025, formData.sales2025)}%</td>
            </tr>
          </tbody>
        </table>
        <div className={styles.helperText}>* 직수출액은 관세청 무역통계(K-Stat) 기준 실적을 기재합니다.</div>
      </section>

      {/* 3. 기업 및 제품 현황 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>3. 기업 및 제품/서비스 상세</h2>
        
        <div style={{marginBottom: '20px'}}>
          <h3 style={{fontSize: '16px', fontWeight: 'bold', marginBottom: '8px'}}>3-1. 기업 개요 (주요 연혁 및 사업내용)</h3>
          <div className={styles.helperText}>* 설립 배경, 주요 기술력, 국내외 인증 현황 등을 중심으로 기술</div>
          <textarea 
            className={styles.textarea} 
            name="overview" 
            value={formData.overview} 
            onChange={handleChange}
            placeholder="당사는 20XX년 설립 이래..."
          />
        </div>

        <div style={{marginBottom: '20px'}}>
          <h3 style={{fontSize: '16px', fontWeight: 'bold', marginBottom: '8px'}}>3-2. 주요 제품/서비스 특징</h3>
          <div className={styles.helperText}>* 주력 수출 품목의 경쟁력(품질, 가격, 기술 등)에 대해 구체적 기술</div>
          <div className={styles.formGrid} style={{marginBottom: '10px', borderBottom: '1px solid #ddd'}}>
             <div className={styles.label}>주력 품목명</div>
             <div className={styles.value}><input className={styles.input} name="itemParams" value={formData.itemParams} onChange={handleChange} /></div>
             <div className={styles.label}>HS CODE</div>
             <div className={styles.value}><input className={styles.input} name="hscode" value={formData.hscode} onChange={handleChange} placeholder="6자리 또는 10자리" /></div>
          </div>
          <textarea 
            className={styles.textarea} 
            name="productDetails" 
            value={formData.productDetails} 
            onChange={handleChange}
          />
        </div>
      </section>

      {/* 4. 해외마케팅 계획 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>4. 해외 마케팅 추진 계획</h2>

        <div style={{marginBottom: '20px'}}>
          <h3 style={{fontSize: '16px', fontWeight: 'bold', marginBottom: '8px'}}>4-1. 목표 시장 분석 및 선정 사유</h3>
          <div className={styles.helperText}>* 주요 타겟 국가/지역 및 해당 시장의 규모, 성장성, 진입 장벽 등 분석</div>
          <textarea 
            className={styles.textarea} 
            name="marketAnalysis" 
            value={formData.marketAnalysis} 
            onChange={handleChange}
            placeholder="예: 미국, 일본, 동남아시아 시장을 주요 타겟으로..."
          />
        </div>

        <div style={{marginBottom: '20px'}}>
          <h3 style={{fontSize: '16px', fontWeight: 'bold', marginBottom: '8px'}}>4-2. 마케팅 실행 전략</h3>
          <div className={styles.helperText}>* 바이어 발굴, 홍보, 유통망 구축 등 구체적인 진출 전략 기술</div>
          <textarea 
            className={styles.textarea} 
            name="marketingPlan" 
            value={formData.marketingPlan} 
            onChange={handleChange}
            placeholder="예: Instagram, TikTok 등 SNS를 통한 글로벌 마케팅..."
          />
        </div>
      </section>

      {/* 5. 바우처 활용 계획 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>5. 수출바우처 활용 계획 (소요 예산)</h2>
        <div className={styles.helperText}>* 메뉴판 서비스 중 활용할 서비스와 예상 소요 비용을 기재 (천원 단위)</div>
        <table className={styles.table}>
           <thead>
             <tr>
               <th style={{width: '20%'}}>서비스 분야</th>
               <th style={{width: '60%'}}>세부 활용 계획 (서비스명 등)</th>
               <th style={{width: '20%'}}>예산 (천원)</th>
             </tr>
           </thead>
           <tbody>
             {formData.budgetItems.map((item, idx) => (
               <tr key={idx}>
                 <td>
                   <input 
                      className={styles.input} 
                      value={item.category} 
                      onChange={(e) => handleBudgetChange(idx, 'category', e.target.value)} 
                      placeholder="예) 디자인개발"
                      style={{textAlign: 'center'}}
                   />
                 </td>
                 <td>
                   <input 
                      className={styles.input} 
                      value={item.detail} 
                      onChange={(e) => handleBudgetChange(idx, 'detail', e.target.value)} 
                      placeholder="상세 내용을 입력하세요"
                   />
                 </td>
                 <td>
                   <input 
                      className={styles.input} 
                      value={item.amount} 
                      onChange={(e) => handleBudgetChange(idx, 'amount', e.target.value)} 
                      placeholder="0"
                      style={{textAlign: 'right'}}
                   />
                 </td>
               </tr>
             ))}
           </tbody>
        </table>
        <div style={{marginTop: '10px', textAlign: 'right'}}>
          <button 
             onClick={addBudgetRow}
             style={{padding: '5px 10px', fontSize: '13px', cursor: 'pointer', background: '#eee', border: '1px solid #ccc', borderRadius: '4px'}}
          >
            + 행 추가
          </button>
        </div>
        
        <div style={{marginTop: '20px', padding: '15px', background: '#f0f9ff', borderRadius: '8px', textAlign: 'right', fontWeight: 'bold', border: '1px solid #bae6fd'}}>
          총 소요 예산: <span style={{color: '#3b82f6', fontSize: '1.2rem'}}>{totalBudget.toLocaleString()}</span> 천원
        </div>
      </section>

      <div className={styles.buttonArea}>
        <button onClick={handleLocalSave} className={styles.saveButton} style={{background: '#6b7280'}}>
          💾 임시 저장
        </button>
        <button 
          onClick={handleAiSave} 
          disabled={isSaving}
          className={styles.saveButton}
          style={{background: isSaving ? '#93c5fd' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'}}
        >
          {isSaving ? '⏳ 저장 중...' : '🤖 AI 협업용 저장'}
        </button>
        <button className={styles.printButton} onClick={() => window.print()}>
          🖨️ PDF 저장 / 인쇄
        </button>
      </div>
    </div>
  );
}
