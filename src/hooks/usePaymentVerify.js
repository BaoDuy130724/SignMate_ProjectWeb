import { useState, useRef, useCallback, useEffect } from 'react';
import { subscriptionApi } from '../services/api';

/**
 * Hook for verifying PayOS payments with anti-spam / debounce cooldown.
 */
export const usePaymentVerify = (onSuccess) => {
  const [verifyingCode, setVerifyingCode] = useState(null);
  const [cooldowns, setCooldowns] = useState({}); // { [orderCode]: secondsRemaining }
  const timersRef = useRef({});

  // Cleanup timers on unmount
  useEffect(() => {
    const activeTimers = timersRef.current;
    return () => {
      Object.values(activeTimers).forEach(timer => clearInterval(timer));
    };
  }, []);

  const verifyPayment = useCallback(async (orderCode) => {
    if (!orderCode) return { success: false, message: 'Mã đơn hàng không hợp lệ' };
    if (cooldowns[orderCode] > 0 || verifyingCode === orderCode) {
      return { success: false, message: `Vui lòng chờ ${cooldowns[orderCode] || 5}s trước khi kiểm tra lại.` };
    }

    try {
      setVerifyingCode(orderCode);
      const res = await subscriptionApi.verifyPayment(orderCode);

      // Start 10s cooldown
      setCooldowns(prev => ({ ...prev, [orderCode]: 10 }));
      if (timersRef.current[orderCode]) clearInterval(timersRef.current[orderCode]);
      timersRef.current[orderCode] = setInterval(() => {
        setCooldowns(prev => {
          const current = prev[orderCode];
          if (!current || current <= 1) {
            clearInterval(timersRef.current[orderCode]);
            const updated = { ...prev };
            delete updated[orderCode];
            return updated;
          }
          return { ...prev, [orderCode]: current - 1 };
        });
      }, 1000);

      if (onSuccess) await onSuccess(res, orderCode);
      return { success: true, message: res?.message || 'Đã kiểm tra và kích hoạt thành công!', data: res };
    } catch (err) {
      // Set 5s cooldown on error to avoid spamming
      setCooldowns(prev => ({ ...prev, [orderCode]: 5 }));
      if (timersRef.current[orderCode]) clearInterval(timersRef.current[orderCode]);
      timersRef.current[orderCode] = setInterval(() => {
        setCooldowns(prev => {
          const current = prev[orderCode];
          if (!current || current <= 1) {
            clearInterval(timersRef.current[orderCode]);
            const updated = { ...prev };
            delete updated[orderCode];
            return updated;
          }
          return { ...prev, [orderCode]: current - 1 };
        });
      }, 1000);

      return { success: false, message: err.message || 'Chưa ghi nhận thanh toán từ PayOS.' };
    } finally {
      setVerifyingCode(null);
    }
  }, [cooldowns, verifyingCode, onSuccess]);

  return {
    verifyPayment,
    verifyingCode,
    cooldowns,
    isVerifying: (code) => verifyingCode === code || (cooldowns[code] && cooldowns[code] > 0),
    getCooldownSeconds: (code) => cooldowns[code] || 0
  };
};

export default usePaymentVerify;
