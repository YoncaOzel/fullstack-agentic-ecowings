import apiClient from "../../../shared/services/apiClient";

const couponService = {
  getMyCoupons: () => apiClient.get("/api/User/my-coupons"),

  giftCoupon: (data) => apiClient.post("/api/Coupon/gift", data),

  getAllCoupons: () => apiClient.get("/api/Coupon"),
};

export default couponService;
