/**
 * WowPress 스펙 매퍼
 *
 * GOODZZ 주문 형식을 WowPress 9-섹션 스펙으로 변환
 *
 * WowPress 9-섹션 스펙:
 * 1. coverinfo  - 표지 정보 (앞/뒤표지 인쇄 여부, 색도)
 * 2. ordqty     - 주문 수량 (수량, 단가, 총액)
 * 3. sizeinfo   - 크기 정보 (완성 크기, 원단 크기)
 * 4. paperinfo  - 용지 정보 (앞표지, 뒷표지, 내지 용지)
 * 5. colorinfo  - 색상 정보 (앞표지, 뒷표지, 내지 색상)
 * 6. optioninfo - 옵션 정보 (제본, 코팅, 접지)
 * 7. prsjobinfo - 인쇄 작업 정보 (작업 구분, 인쇄면)
 * 8. awkjobinfo - 후가공 정보 (재단, 타공, 엠보싱)
 * 9. deliverinfo - 배송 정보 (수령인, 연락처, 주소)
 */

/**
 * WowPress 9-섹션 스펙 타입 정의
 */
export interface WowPressProductSpec {
  // 1. 표지 정보
  coverinfo: {
    frontcover: 'Y' | 'N';       // 앞표지 인쇄 여부
    backcover: 'Y' | 'N';        // 뒷표지 인쇄 여부
    frontcolortype: string;      // 앞표지 색도 (4도, 1도 등)
    backcolortype: string;       // 뒷표지 색도
  };

  // 2. 주문 수량
  ordqty: {
    qty: number;                 // 주문 수량
    unitprice: number;           // 단가
    totalprice: number;          // 총 금액
  };

  // 3. 크기 정보
  sizeinfo: {
    finwidth: number;            // 완성 가로 (mm)
    finheight: number;           // 완성 세로 (mm)
    rawwidth: number;            // 원단 가로 (mm)
    rawheight: number;           // 원단 세로 (mm)
  };

  // 4. 용지 정보
  paperinfo: {
    frontpaper: string;          // 앞표지 용지
    backpaper: string;           // 뒷표지 용지
    contentpaper: string;        // 내지 용지
  };

  // 5. 색상 정보
  colorinfo: {
    frontcolor: string;          // 앞표지 색상
    backcolor: string;           // 뒷표지 색상
    contentcolor: string;        // 내지 색상
  };

  // 6. 옵션 정보
  optioninfo: {
    binding: string;             // 제본 방식 (중철, 무선제본 등)
    coating: string;             // 코팅 방식 (무코팅, 유광코팅 등)
    folding: string;             // 접지 방식 (없음, 2단접지 등)
  };

  // 7. 인쇄 작업 정보
  prsjobinfo: {
    jobtype: string;             // 작업 구분 (dtg, offset 등)
    printside: string;           // 인쇄면 (양면, 단면)
  };

  // 8. 후가공 정보
  awkjobinfo: {
    cutting: 'Y' | 'N';          // 재단 여부
    punching: 'Y' | 'N';         // 타공 여부
    embossing: 'Y' | 'N';        // 엠보싱 여부
  };

  // 9. 배송 정보
  deliverinfo: {
    receiver: string;            // 받는 사람
    phone: string;               // 연락처
    address: string;             // 주소
    zipcode: string;             // 우편번호
    memo: string;                // 배송 메모
  };
}

/**
 * GOODZZ 주문을 WowPress 스펙으로 변환
 *
 * @param order - GOODZZ 주문 객체
 * @param product - 상품 정보
 * @returns WowPress 9-섹션 스펙
 */
export function mapOrderToWowPressSpec(
  order: any,
  product: any
): WowPressProductSpec {
  // 주문 아이템에서 옵션 추출
  const orderItem = order.items?.find((item: any) => item.productId === product.id);
  const selectedOptions = orderItem?.options || {};
  const quantity = orderItem?.quantity || 1;

  return {
    // 1. 표지 정보
    coverinfo: {
      frontcover: 'Y',
      backcover: 'Y',
      frontcolortype: selectedOptions.frontColorType || '4도',
      backcolortype: selectedOptions.backColorType || '4도',
    },

    // 2. 주문 수량
    ordqty: {
      qty: quantity,
      unitprice: product.price,
      totalprice: product.price * quantity,
    },

    // 3. 크기 정보
    sizeinfo: {
      finwidth: selectedOptions.width || 90,        // 기본값: 명함 크기
      finheight: selectedOptions.height || 50,
      rawwidth: selectedOptions.rawWidth || 92,      // 재단 여유 +2mm
      rawheight: selectedOptions.rawHeight || 52,
    },

    // 4. 용지 정보
    paperinfo: {
      frontpaper: selectedOptions.frontPaper || '백색모조지 200g',
      backpaper: selectedOptions.backPaper || '백색모조지 200g',
      contentpaper: selectedOptions.contentPaper || '',
    },

    // 5. 색상 정보
    colorinfo: {
      frontcolor: selectedOptions.frontColor || '4도',
      backcolor: selectedOptions.backColor || '4도',
      contentcolor: selectedOptions.contentColor || '',
    },

    // 6. 옵션 정보
    optioninfo: {
      binding: selectedOptions.binding || '없음',
      coating: selectedOptions.coating || '무코팅',
      folding: selectedOptions.folding || '없음',
    },

    // 7. 인쇄 작업 정보
    prsjobinfo: {
      jobtype: product.printMethod || 'dtg',
      printside: selectedOptions.printSide || '양면',
    },

    // 8. 후가공 정보
    awkjobinfo: {
      cutting: selectedOptions.cutting || 'Y',
      punching: selectedOptions.punching || 'N',
      embossing: selectedOptions.embossing || 'N',
    },

    // 9. 배송 정보
    deliverinfo: {
      receiver: order.shippingInfo?.name || '',
      phone: order.shippingInfo?.phone || '',
      address: `${order.shippingInfo?.address || ''} ${order.shippingInfo?.addressDetail || ''}`.trim(),
      zipcode: order.shippingInfo?.postalCode || '',
      memo: order.shippingInfo?.memo || '',
    },
  };
}

/**
 * 옵션 그룹에서 WowPress 스펙 추출
 *
 * GOODZZ 상품 옵션을 WowPress 스펙 형식으로 변환
 *
 * @param optionGroups - 상품 옵션 그룹
 * @returns 부분적 WowPress 스펙
 */
export function extractWowPressSpecFromOptions(optionGroups: any[]): Partial<WowPressProductSpec> {
  const spec: Partial<WowPressProductSpec> = {};

  optionGroups.forEach((group: any) => {
    switch (group.type) {
      case 'size':
        if (!spec.sizeinfo) {
          spec.sizeinfo = {
            finwidth: group.options?.width || 90,
            finheight: group.options?.height || 50,
            rawwidth: group.options?.rawWidth || 92,
            rawheight: group.options?.rawHeight || 52,
          };
        }
        break;

      case 'paper':
        if (!spec.paperinfo) {
          spec.paperinfo = {
            frontpaper: group.options?.frontPaper || '백색모조지 200g',
            backpaper: group.options?.backPaper || '백색모조지 200g',
            contentpaper: group.options?.contentPaper || '',
          };
        }
        break;

      case 'color':
        if (!spec.colorinfo) {
          spec.colorinfo = {
            frontcolor: group.options?.frontColor || '4도',
            backcolor: group.options?.backColor || '4도',
            contentcolor: group.options?.contentColor || '',
          };
        }
        break;

      case 'finishing':
        if (!spec.optioninfo) {
          spec.optioninfo = {
            binding: group.options?.binding || '없음',
            coating: group.options?.coating || '무코팅',
            folding: group.options?.folding || '없음',
          };
        }
        break;
    }
  });

  return spec;
}

/**
 * WowPress 스펙 검증
 *
 * 필수 필드가 모두 채워져 있는지 확인
 *
 * @param spec - WowPress 스펙
 * @returns 유효성 검증 결과
 */
export function validateWowPressSpec(spec: WowPressProductSpec): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 배송 정보 필수 필드 검증
  if (!spec.deliverinfo.receiver) {
    errors.push('받는 사람 이름이 필요합니다');
  }
  if (!spec.deliverinfo.phone) {
    errors.push('연락처가 필요합니다');
  }
  if (!spec.deliverinfo.address) {
    errors.push('주소가 필요합니다');
  }

  // 주문 수량 검증
  if (spec.ordqty.qty <= 0) {
    errors.push('주문 수량은 1개 이상이어야 합니다');
  }
  if (spec.ordqty.unitprice <= 0) {
    errors.push('단가는 0보다 커야 합니다');
  }

  // 크기 정보 검증
  if (spec.sizeinfo.finwidth <= 0 || spec.sizeinfo.finheight <= 0) {
    errors.push('완성 크기는 0보다 커야 합니다');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 스펙 프리뷰 생성 (디버깅/로깅용)
 *
 * @param spec - WowPress 스펙
 * @returns 읽기 쉬운 형식의 스펙 요약
 */
export function formatSpecPreview(spec: WowPressProductSpec): string {
  return `
WowPress 주문 스펙:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 주문 정보
   수량: ${spec.ordqty.qty}개
   단가: ${spec.ordqty.unitprice.toLocaleString()}원
   총액: ${spec.ordqty.totalprice.toLocaleString()}원

📐 크기 정보
   완성: ${spec.sizeinfo.finwidth}mm × ${spec.sizeinfo.finheight}mm
   원단: ${spec.sizeinfo.rawwidth}mm × ${spec.sizeinfo.rawheight}mm

📄 용지/색상
   앞표지: ${spec.paperinfo.frontpaper} / ${spec.colorinfo.frontcolor}
   뒷표지: ${spec.paperinfo.backpaper} / ${spec.colorinfo.backcolor}

🔧 옵션
   제본: ${spec.optioninfo.binding}
   코팅: ${spec.optioninfo.coating}
   후가공: ${spec.awkjobinfo.cutting === 'Y' ? '재단' : ''} ${spec.awkjobinfo.punching === 'Y' ? '타공' : ''} ${spec.awkjobinfo.embossing === 'Y' ? '엠보싱' : ''}

🚚 배송지
   받는 분: ${spec.deliverinfo.receiver}
   연락처: ${spec.deliverinfo.phone}
   주소: ${spec.deliverinfo.address}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();
}
