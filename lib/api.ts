// GOODZZ API 클라이언트
// 백엔드: goodzz.co.kr (Firestore)

const API_BASE_URL = "https://goodzz.co.kr/api";

interface ApiOptions {
  method?: string;
  body?: Record<string, unknown>;
  token?: string;
}

export async function api<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API 오류: ${response.status}`);
  }

  return response.json();
}

// 굿즈 목록 조회
export async function fetchGoods(category?: string) {
  const params = category ? `?category=${category}` : "";
  return api(`/goods${params}`);
}

// 굿즈 상세 조회
export async function fetchGoodsDetail(id: string) {
  return api(`/goods/${id}`);
}

// 장바구니 조회
export async function fetchCart(token: string) {
  return api("/cart", { token });
}

// 주문 목록 조회
export async function fetchOrders(token: string) {
  return api("/orders", { token });
}
