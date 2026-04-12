"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./AdminComponents.module.css";
import { toast } from "sonner";
import { Loader2, ExternalLink, RefreshCw, Search, Package, XCircle } from "lucide-react";
import { Order, OrderStatus } from "@/lib/payment";
import { useAuth } from "@/context/AuthContext";

const statusLabels: Record<string, string> = {
  All: "전체",
  PENDING: "결제대기",
  PAID: "결제완료",
  PREPARING: "제작중",
  SHIPPED: "배송중",
  DELIVERED: "배송완료",
  CANCELLED: "취소됨",
};

export default function OrderManager() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleCancelOrder = async (order: Order) => {
    const reason = prompt('환불 사유를 입력하세요:');
    if (!reason) return;
    setIsUpdating(order.id);
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/payment/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId: order.id, cancelReason: reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || '환불 처리 실패');
    } finally {
      setIsUpdating(null);
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const url = filter === "All" ? "/api/orders" : `/api/orders?status=${filter}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error(data.error || "주문 목록을 가져오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("주문 목록을 가져오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const getStatusLabel = (status: string) => statusLabels[status] || status;

  const updateStatus = async (id: string, newStatus: OrderStatus) => {
    setIsUpdating(id);
    try {
      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id, status: newStatus }),
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success("주문 상태가 업데이트되었습니다.");
        setOrders(orders.map((o) => (o.id === id ? { ...o, orderStatus: newStatus } : o)));
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
        }
      } else {
        toast.error(data.error || "상태 업데이트에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("오류가 발생했습니다.");
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const searchMatch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingInfo.name.toLowerCase().includes(searchTerm.toLowerCase());
    return searchMatch;
  });

  const getStatusBadgeClass = (status: string) => {
    const classMap: Record<string, string> = {
      PAID: styles.badgePaid,
      PENDING: styles.badgePending,
      PREPARING: styles.badgeProcessing,
      SHIPPED: styles.badgeShipped,
      DELIVERED: styles.badgeCompleted,
      CANCELLED: styles.badgeCancelled,
    };
    return classMap[status] || "";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.componentContainer}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={styles.title}>주문 관리</h2>
          <p className={styles.desc}>실시간 주문 현황을 관리하고 배송 상태를 변경합니다.</p>
        </div>
        <button 
          onClick={fetchOrders} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="새로고침"
        >
          <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className={styles.filterBar + " flex-1"}>
          {["All", "PENDING", "PAID", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"].map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.activeFilter : ""}`}
              onClick={() => setFilter(f)}
            >
              {getStatusLabel(f)}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="주문번호 또는 이름 검색"
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>주문번호</th>
              <th>주문자</th>
              <th>상품수</th>
              <th>결제금액</th>
              <th>일자</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                    <p className="text-gray-500">주문 데이터를 불러오는 중...</p>
                  </div>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-20 text-center text-gray-400">
                  주문 내역이 없습니다.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="font-mono text-sm">{order.id}</td>
                  <td>{order.shippingInfo.name}</td>
                  <td>{order.items.length}개</td>
                  <td>{(order.totalAmount + order.shippingFee).toLocaleString()}원</td>
                  <td className="text-xs text-gray-500">{formatDate(order.createdAt)}</td>
                  <td>
                    <span className={`${styles.badge} ${getStatusBadgeClass(order.orderStatus)}`}>
                      {getStatusLabel(order.orderStatus)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionCell}>
                      <select
                        className={styles.actionSelect}
                        disabled={isUpdating === order.id}
                        value={order.orderStatus}
                        onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                      >
                        {Object.entries(statusLabels).filter(([k]) => k !== 'All').map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                      <button
                        className={styles.viewBtn}
                        onClick={() => setSelectedOrder(order)}
                      >
                        상세
                      </button>
                      {order.paymentStatus === 'PAID' && (
                        <button
                          className={styles.viewBtn}
                          style={{ color: '#ef4444', borderColor: '#fecaca' }}
                          onClick={() => handleCancelOrder(order)}
                          disabled={isUpdating === order.id}
                        >
                          환불
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className="text-xl font-bold">주문 상세 정보</h3>
                <p className="text-sm text-gray-500 font-mono mt-1">{selectedOrder.id}</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedOrder(null)}>&times;</button>
            </div>
            <div className={styles.modalBody}>
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="font-bold border-b pb-2 mb-3">📦 배송 정보</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">수령인:</span> {selectedOrder.shippingInfo.name}</p>
                    <p><span className="text-gray-500">연락처:</span> {selectedOrder.shippingInfo.phone}</p>
                    <p><span className="text-gray-500">이메일:</span> {selectedOrder.shippingInfo.email}</p>
                    <p><span className="text-gray-500">주소:</span> ({selectedOrder.shippingInfo.postalCode}) {selectedOrder.shippingInfo.address} {selectedOrder.shippingInfo.addressDetail}</p>
                    {selectedOrder.shippingInfo.memo && (
                      <p><span className="text-gray-500">메모:</span> {selectedOrder.shippingInfo.memo}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold border-b pb-2 mb-3">💳 결제 정보</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">상태:</span> {getStatusLabel(selectedOrder.paymentStatus)}</p>
                    <p><span className="text-gray-500">결제 ID:</span> <span className="font-mono">{selectedOrder.paymentId || "-"}</span></p>
                    <p><span className="text-gray-500">총 결제금액:</span> <span className="font-bold text-blue-600">{(selectedOrder.totalAmount + selectedOrder.shippingFee).toLocaleString()}원</span></p>
                    <p className="text-xs text-gray-400">(상품 {selectedOrder.totalAmount.toLocaleString()}원 + 배송비 {selectedOrder.shippingFee.toLocaleString()}원)</p>
                  </div>
                </div>
              </div>

              <div className={styles.modalItemsSection}>
                <h4 className="font-bold mb-3">🛒 주문 상품</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-white rounded border flex items-center justify-center shrink-0">
                        {item.options?.customDesign ? (
                          <Image src={item.options.customDesign} alt="Custom" width={40} height={40} className="w-10 h-10 object-contain" unoptimized />
                        ) : (
                          <Package className="text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <p className="font-bold truncate">{item.productName}</p>
                          <p className="font-bold">{item.price.toLocaleString()}원</p>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <p>
                            {item.options?.color && `${item.options.color} / `}
                            {item.options?.size && `${item.options.size} / `}
                            {item.quantity}개
                          </p>
                          {item.options?.customDesign && (
                            <a 
                              href={item.options.customDesign} 
                              target="_blank" 
                              className="text-blue-500 flex items-center gap-1 hover:underline"
                            >
                              디자인 보기 <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                        {item.options?.customOptions && item.options.customOptions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {item.options.customOptions.map((opt, oIdx) => (
                              <span key={oIdx} className="bg-white border border-gray-200 text-[10px] px-2 py-0.5 rounded-md text-gray-600">
                                <b className="text-gray-400">{opt.groupLabel}:</b> {opt.valueLabel}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <div className="flex gap-3">
                  <select
                    className="p-2 border rounded-lg text-sm bg-white"
                    value={selectedOrder.orderStatus}
                    onChange={(e) => updateStatus(selectedOrder.id, e.target.value as OrderStatus)}
                  >
                    {Object.entries(statusLabels).filter(([k]) => k !== 'All').map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                  <button className={styles.confirmBtn} onClick={() => setSelectedOrder(null)}>닫기</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
