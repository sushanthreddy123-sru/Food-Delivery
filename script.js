let orderIdCounter = 1;

// Order class
class Order {
  constructor(item, price, category) {
    this.item = item;
    this.price = price;
    this.category = category;
  }
}

// Factories
class FastFoodFactory {
  createOrder(item) {
    if (item === "Burger") return new Order("Burger", 150, "Fast Food");
    if (item === "Fries") return new Order("Fries", 100, "Fast Food");
  }
}
class ItalianFactory {
  createOrder(item) {
    if (item === "Pizza") return new Order("Pizza", 250, "Italian");
    if (item === "Pasta") return new Order("Pasta", 200, "Italian");
  }
}

// Singleton OrderManager
class OrderManager {
  constructor() {
    if (OrderManager.instance) return OrderManager.instance;
    this.orders = this.loadOrders();
    OrderManager.instance = this;
  }

  addOrder(order) {
    this.orders.push(order);
    this.saveOrders();
  }

  getOrders() {
    return this.orders;
  }

  cancelOrder(id) {
    this.orders = this.orders.filter(o => o.id !== id);
    this.saveOrders();
  }

  saveOrders() {
    localStorage.setItem("orders", JSON.stringify(this.orders));
  }

  loadOrders() {
    const data = localStorage.getItem("orders");
    return data ? JSON.parse(data) : [];
  }
}

// Order Booking
class OrderBooking {
  constructor(name, order, payment, isClone = false) {
    this.id = orderIdCounter++;
    this.name = name;
    this.order = order;
    this.payment = payment;
    this.time = new Date().toLocaleTimeString();
    this.isClone = isClone;
  }
}

// Builder
class OrderBookingBuilder {
  setName(name) { this.name = name; return this; }
  setItem(item) { this.item = item; return this; }
  setPayment(payment) { this.payment = payment; return this; }
  build() {
    let factory;
    if (["Burger", "Fries"].includes(this.item)) {
      factory = new FastFoodFactory();
    } else {
      factory = new ItalianFactory();
    }
    const order = factory.createOrder(this.item);
    return new OrderBooking(this.name, order, this.payment);
  }
}

// Prototype
class OrderPrototype {
  constructor(booking) {
    Object.assign(this, booking);
    this.id = orderIdCounter++;
    this.time = new Date().toLocaleTimeString();
    this.isClone = true;
  }
  clone() { return new OrderPrototype(this); }
}

// Globals
const orderManager = new OrderManager();
const form = document.getElementById("orderForm");
const orderList = document.getElementById("orderList");
const orderCount = document.getElementById("orderCount");
const orderStatus = document.getElementById("orderStatus");

// Render orders
function renderOrders(filter = "all") {
  if (!orderList) return;
  orderList.innerHTML = "";
  let orders = orderManager.getOrders();
  if (filter !== "all") {
    orders = orders.filter(o => o.order.category === filter);
  }

  orders.forEach((o) => {
    const card = document.createElement("div");
    card.className = `order-item ${o.order.category.toLowerCase().replace(" ", "-")}`;
    card.innerHTML = `
      <strong>${o.name} ordered ${o.order.item}</strong><br>
      Category: ${o.order.category} | ₹${o.order.price}<br>
      Payment: ${o.payment} | Time: ${o.time}
      ${o.isClone ? "<em>(Cloned)</em>" : ""}<br>
      <button onclick="cancelOrder(${o.id})">❌ Cancel</button>
    `;
    orderList.appendChild(card);
  });

  if (orderCount) {
    orderCount.textContent = `Total Orders: ${orderManager.getOrders().length}`;
  }
}

// Cancel order
function cancelOrder(id) {
  orderManager.cancelOrder(id);
  renderOrders();
}

// Form submit
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("customerName").value;
    const item = document.getElementById("foodItem").value;
    const payment = document.getElementById("payment").value;

    const builder = new OrderBookingBuilder();
    const booking = builder.setName(name).setItem(item).setPayment(payment).build();

    orderManager.addOrder(booking);
    orderStatus.textContent = "✅ Order placed successfully!";
    form.reset();
    renderOrders();
  });
}

// Filters
document.querySelectorAll("#orderFilters button").forEach(btn => {
  btn.addEventListener("click", () => {
    renderOrders(btn.dataset.filter);
  });
});

// Repeat last order
const repeatBtn = document.getElementById("repeatOrder");
if (repeatBtn) {
  repeatBtn.addEventListener("click", () => {
    const orders = orderManager.getOrders();
    if (orders.length > 0) {
      const last = orders[orders.length - 1];
      const clone = new OrderPrototype(last).clone();
      orderManager.addOrder(clone);
      renderOrders();
    }
  });
}

// Clear all orders
const clearBtn = document.getElementById("clearOrders");
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all orders?")) {
      orderManager.orders = [];
      orderManager.saveOrders();
      renderOrders();
    }
  });
}

// Initial render
renderOrders();
