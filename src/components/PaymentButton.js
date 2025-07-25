import axios from "axios";

function PaymentButton({ amount, user }) {
  const handlePay = async () => {
    const res = await axios.post("http://localhost:9090/api/payment/create-order", { amount });
    const order = res.data; // <-- Use directly, no JSON.parse

    const options = {
      key: "rzp_test_bmXXAclygUWgTk",
      amount: order.amount,
      currency: order.currency,
      name: "ATO",
      description: "Order Payment",
      order_id: order.id,
      handler: async function (response) {
        await axios.post("http://localhost:9090/api/payment/save-payment", {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: order.id,
          status: "Completed"
        });
        alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
      },
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phone
      },
      method: {
        upi: true
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <button onClick={handlePay} className="px-4 py-2 bg-green-600 text-white rounded">
      Pay via UPI
    </button>
  );
}

export default PaymentButton;