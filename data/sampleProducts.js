const sampleProducts = [
  // iPhone
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `iPhone ${15 - i} Pro Max`,
    description: `iPhone ${15 - i} Pro Max với chip A${
      17 - i
    }, camera cải tiến và thiết kế sang trọng.`,
    price: 999 + i * 50,
    releaseDate: new Date("2025-02-19T17:00:00.000Z"),
    stock: (100 - i * 5).toString(),
    chip: `A${17 - i} Bionic`,
    ram: "8GB",
    storage: "256GB",
    display: "6.7-inch OLED",
    battery: "4352mAh",
    camera: "48MP + 12MP + 12MP",
    os: "iOS 17",
    productType: "iPhone",
    capacities: ["128GB", "256GB", "512GB", "1TB"],
    colors: [
      {
        colorName: "Titan Xanh",
        colorCode: "#1D3557",
        images: ["iphone_blue.jpg"],
      },
      {
        colorName: "Titan Đen",
        colorCode: "#333333",
        images: ["iphone_black.jpg"],
      },
    ],
  })),

  // iPad
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `iPad Pro ${14 - i} inch`,
    description: `iPad Pro ${14 - i} inch với chip M${
      3 - i
    }, màn hình Retina và hỗ trợ Apple Pencil.`,
    price: 1099 + i * 80,
    releaseDate: new Date("2025-02-19T17:00:00.000Z"),
    stock: (50 - i * 2).toString(),
    chip: `M${3 - i}`,
    ram: "16GB",
    storage: "512GB",
    display: "12.9-inch Liquid Retina XDR",
    battery: "10,000mAh",
    camera: "12MP + LiDAR",
    os: "iPadOS 17",
    productType: "iPad",
    capacities: ["128GB", "256GB", "512GB", "1TB", "2TB"],
    colors: [
      { colorName: "Bạc", colorCode: "#F0F0F0", images: ["ipad_silver.jpg"] },
      {
        colorName: "Xám không gian",
        colorCode: "#3A3A3A",
        images: ["ipad_gray.jpg"],
      },
    ],
  })),

  // Mac
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `MacBook Pro ${16 - i} inch`,
    description: `MacBook Pro ${16 - i} inch với chip M${
      3 - i
    } Max, màn hình Mini-LED và hiệu năng vượt trội.`,
    price: 2499 + i * 100,
    releaseDate: new Date("2025-02-19T17:00:00.000Z"),
    stock: (30 - i).toString(),
    chip: `M${3 - i} Max`,
    ram: "32GB",
    storage: "1TB",
    display: "16-inch Liquid Retina XDR",
    battery: "100Wh",
    camera: "1080p FaceTime HD",
    os: "macOS Sonoma",
    productType: "Mac",
    capacities: ["512GB", "1TB", "2TB", "4TB", "8TB"],
    colors: [
      {
        colorName: "Bạc",
        colorCode: "#C0C0C0",
        images: ["macbook_silver.jpg"],
      },
      {
        colorName: "Xám không gian",
        colorCode: "#333333",
        images: ["macbook_gray.jpg"],
      },
    ],
  })),

  // AirPod
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `AirPods Pro ${3 - i}`,
    description: `AirPods Pro thế hệ ${
      3 - i
    } với chống ồn chủ động và âm thanh không gian.`,
    price: 249 + i * 20,
    releaseDate: new Date("2025-02-19T17:00:00.000Z"),
    stock: (200 - i * 10).toString(),
    chip: `H${3 - i}`,
    battery: "6 giờ sử dụng liên tục",
    os: "iOS, macOS, watchOS",
    productType: "AirPod",
    capacities: [],
    colors: [
      {
        colorName: "Trắng",
        colorCode: "#FFFFFF",
        images: ["airpods_white.jpg"],
      },
    ],
  })),

  // Watch
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Apple Watch Series ${10 - i}`,
    description: `Apple Watch Series ${
      10 - i
    } với màn hình Always-On Retina, đo ECG và chống nước.`,
    price: 399 + i * 30,
    releaseDate: new Date("2025-02-19T17:00:00.000Z"),
    stock: (150 - i * 8).toString(),
    chip: `S${9 - i}`,
    battery: "18 giờ",
    os: "watchOS 10",
    productType: "Watch",
    capacities: [],
    colors: [
      { colorName: "Xanh", colorCode: "#007AFF", images: ["watch_blue.jpg"] },
      { colorName: "Đen", colorCode: "#000000", images: ["watch_black.jpg"] },
    ],
  })),

  // Phụ kiện
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Magic Mouse ${3 - i}`,
    description: `Magic Mouse thế hệ ${
      3 - i
    } với kết nối không dây và cảm ứng đa điểm.`,
    price: 99 + i * 10,
    releaseDate: new Date("2025-02-19T17:00:00.000Z"),
    stock: (500 - i * 20).toString(),
    os: "macOS, iPadOS",
    productType: "Phụ kiện",
    capacities: [],
    colors: [
      {
        colorName: "Trắng",
        colorCode: "#FFFFFF",
        images: ["magicmouse_white.jpg"],
      },
      {
        colorName: "Đen",
        colorCode: "#000000",
        images: ["magicmouse_black.jpg"],
      },
    ],
  })),
];

module.exports = sampleProducts;
