import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { FaCcMastercard, FaCcVisa } from "react-icons/fa";
import { SiAmericanexpress } from "react-icons/si";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Accept both: item (from Buy Now) and items (from cart)
  const { items: passedItems, item, userId } = location.state || {};

  const items = passedItems || (item ? [item] : []);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    mobile: "",
  });
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: "",
    city: "",
    postalCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [cardInfo, setCardInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardInfo((prev) => ({ ...prev, [name]: value }));
  };

  const getCardType = (cardNumber) => {
    const clean = cardNumber.replace(/\D/g, "");
    if (/^(5[1-5]|2[2-7])/.test(clean)) return "Mastercard";
    if (/^4/.test(clean)) return "Visa";
    if (/^3[47]/.test(clean)) return "American Express";
    return false;
  };

  const validateForm = () => {
    const phoneRegex = /^0\d{9}$/;
    const nameRegex = /^[A-Za-z\s]+$/;
    const postalRegex = /^\d{5}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!customerInfo.name || !customerInfo.email || !customerInfo.mobile) {
      Swal.fire("Validation Error", "Fill all customer fields", "error");
      return false;
    }
    if (!nameRegex.test(customerInfo.name)) {
      Swal.fire("Invalid Name", "Only letters and spaces allowed", "error");
      return false;
    }
    if (!emailRegex.test(customerInfo.email)) {
      Swal.fire("Invalid Email", "Enter a valid email", "error");
      return false;
    }
    if (!phoneRegex.test(customerInfo.mobile)) {
      Swal.fire("Invalid Mobile", "Start with 0, 10 digits only", "error");
      return false;
    }

    if (!deliveryInfo.address || !deliveryInfo.city || !deliveryInfo.postalCode) {
      Swal.fire("Validation Error", "Fill all delivery fields", "error");
      return false;
    }
    if (!postalRegex.test(deliveryInfo.postalCode)) {
      Swal.fire("Invalid Postal Code", "Must be 5 digits", "error");
      return false;
    }

    if (
      paymentMethod === "Card" &&
      (!cardInfo.cardNumber || !cardInfo.expiryDate || !cardInfo.cvv)
    ) {
      Swal.fire("Card Error", "Fill all card details", "error");
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    setLoading(true);

    const orderData = {
      userId,
      items,
      total,
      customerInfo,
      deliveryInfo,
      paymentMethod,
      cardInfo: paymentMethod === "Card" ? cardInfo : undefined,
    };

    try {
      const response = await axios.post("/api/order/add", orderData);
      localStorage.removeItem("cart");
      setLoading(false);
      Swal.fire("Success", `Order ID: ${response.data.orderId}`, "success").then(() =>
        navigate("/my-orders")
      );
    } catch (error) {
      setLoading(false);
      Swal.fire("Error", "Failed to place order", "error");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen p-8 flex flex-col items-center">
        <div className="w-full lg:w-3/4 flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-10 mt-20">
          {/* Order Summary */}
          <div className="w-full lg:w-1/2 space-y-6">
            <h1 className="text-3xl font-semibold mb-4">Order Summary</h1>
            {items.length > 0 ? (
              items.map((item) => (
                <div
                  key={item.itemId}
                  className="flex justify-between items-center p-4 border-b"
                >
                  <div className="flex gap-2 items-center">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-gray-500">
                        Color:{" "}
                        <button
                          style={{ backgroundColor: item.color }}
                          className="w-5 h-5 rounded-full border-2"
                        />{" "}
                        Size: {item.size}
                      </span>
                    </div>
                  </div>
                  <span>Qty: {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p>No items to display</p>
            )}
            <div className="flex justify-between mt-4 font-semibold">
              <span>Subtotal:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button
              onClick={() => navigate("/cart")}
              className="mt-4 w-full bg-gray-300 text-black py-2 rounded-full hover:bg-gray-400 transition duration-300"
            >
              Back to Cart
            </button>
          </div>

          {/* Customer + Payment Info */}
          <div className="w-full lg:w-1/2 p-6 bg-gray-100 rounded-lg space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Customer Information</h2>
            <input
              name="name"
              placeholder="Name"
              value={customerInfo.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
            <input
              name="email"
              placeholder="Email"
              value={customerInfo.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
            <input
              name="mobile"
              placeholder="Mobile No."
              value={customerInfo.mobile}
              onChange={handleInputChange}
              maxLength={10}
              className="w-full p-2 border rounded"
            />

            <h2 className="text-xl font-semibold mt-4 mb-2">Delivery Information</h2>
            <input
              name="address"
              placeholder="Address"
              value={deliveryInfo.address}
              onChange={handleDeliveryChange}
              className="w-full p-2 border rounded"
            />
            <input
              name="city"
              placeholder="City"
              value={deliveryInfo.city}
              onChange={handleDeliveryChange}
              className="w-full p-2 border rounded"
            />
            <input
              name="postalCode"
              placeholder="Postal Code"
              value={deliveryInfo.postalCode}
              onChange={handleDeliveryChange}
              maxLength={5}
              className="w-full p-2 border rounded"
            />

            <h2 className="text-xl font-semibold mt-4 mb-2">Payment Information</h2>
            <select
              name="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
            </select>

            {paymentMethod === "Card" && (
              <>
                <div className="flex">
                  <input
                    name="cardNumber"
                    placeholder="Card Number"
                    value={cardInfo.cardNumber}
                    onChange={handleCardChange}
                    maxLength={16}
                    className="w-full p-2 border rounded"
                  />
                  <i className="text-3xl ml-5 mt-1">
                    {getCardType(cardInfo.cardNumber) === "Mastercard" && <FaCcMastercard />}
                    {getCardType(cardInfo.cardNumber) === "Visa" && <FaCcVisa />}
                    {getCardType(cardInfo.cardNumber) === "American Express" && <SiAmericanexpress />}
                  </i>
                </div>
                <input
                  name="expiryDate"
                  placeholder="Expiry Date (MM/YY)"
                  value={cardInfo.expiryDate}
                  onChange={handleCardChange}
                  className="w-full p-2 border rounded"
                />
                <input
                  name="cvv"
                  placeholder="CVV"
                  value={cardInfo.cvv}
                  onChange={handleCardChange}
                  maxLength={3}
                  className="w-full p-2 border rounded"
                />
              </>
            )}

            <button
              onClick={handlePlaceOrder}
              className="mt-6 w-full bg-green-500 text-white py-3 rounded-full hover:bg-green-600 transition duration-300"
              disabled={loading}
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
