import { storage } from "../server/storage";
import { hashPassword } from "../server/auth";

export async function seedDatabase() {
  console.log("Starting database seeding with Argon2 hashed credentials...");

  try {
    // Default Demo User
    const demoEmail = "demo@example.com";
    let demoUser = await storage.getUserByEmail(demoEmail);
    if (!demoUser) {
      demoUser = await storage.createUser({
        name: "Demo User",
        email: demoEmail,
        passwordHash: await hashPassword("password123"),
        clerkId: "demo_default_user",
        studentIdVerified: true,
      });
      console.log("Created demo user:", demoEmail);
    }

    let user1 = await storage.getUserByEmail("bokdesaurabh802@gmail.com");
    if (!user1) {
      user1 = await storage.createUser({
        name: "Himanshu Bokde",
        email: "bokdesaurabh802@gmail.com",
        passwordHash: await hashPassword("password123456"),
        clerkId: "demo_user_1",
        studentIdVerified: true,
      });
      console.log("Created demo user 1:", user1.email);
    }

    let user2 = await storage.getUserByEmail("divyanimore1234@gmail.com");
    if (!user2) {
      user2 = await storage.createUser({
        name: "Divyani More",
        email: "divyanimore1234@gmail.com",
        passwordHash: await hashPassword("password112233"),
        clerkId: "demo_user_2",
        studentIdVerified: true,
      });
      console.log("Created demo user 2:", user2.email);
    }

    const existingListings = await storage.getListings();
    if (existingListings.length === 0 && user1 && user2) {
      const demoItems = [
        {
          sellerId: user1.id,
          title: "MacBook Pro M2",
          description: "Space gray, 16GB RAM, 512GB SSD. Excellent condition.",
          price: 85000,
          category: "Electronics",
          condition: "Like New",
          images: ["https://picsum.photos/seed/macbook/400/300"],
        },
        {
          sellerId: user2.id,
          title: "iPhone 14 Pro",
          description: "Deep Purple, 128GB. Always used with case and screen protector.",
          price: 65000,
          category: "Electronics",
          condition: "Good",
          images: ["https://picsum.photos/seed/iphone/400/300"],
        },
        {
          sellerId: user1.id,
          title: "Study Table - Wooden",
          description: "Spacious wooden study table with 3 drawers. Perfect for students.",
          price: 3500,
          category: "Furniture",
          condition: "Good",
          images: ["https://picsum.photos/seed/table/400/300"],
        },
        {
          sellerId: user2.id,
          title: "Ergonomic Office Chair",
          description: "Adjustable height and lumbar support. Very comfortable for long study hours.",
          price: 2800,
          category: "Furniture",
          condition: "Like New",
          images: ["https://picsum.photos/seed/chair/400/300"],
        },
        {
          sellerId: user1.id,
          title: "Concepts of Physics - HC Verma",
          description: "Both volumes (1 & 2). Essential for engineering entrance and foundation.",
          price: 600,
          category: "Books",
          condition: "Used",
          images: ["https://picsum.photos/seed/books/400/300"],
        },
        {
          sellerId: user2.id,
          title: "Engineering Mechanics - S.S. Bhavikatti",
          description: "Standard textbook for first year engineering. No markings.",
          price: 400,
          category: "Books",
          condition: "Like New",
          images: ["https://picsum.photos/seed/textbook/400/300"],
        },
        {
          sellerId: user1.id,
          title: "Gear Cycle - Firefox",
          description: "21-speed Shimano gears. Front suspension. Great for campus commuting.",
          price: 12000,
          category: "Bicycles",
          condition: "Used",
          images: ["https://picsum.photos/seed/cycle/400/300"],
        },
        {
          sellerId: user2.id,
          title: "City Hybrid Bicycle",
          description: "Lightweight frame, smooth tires. Includes mudguards and a bell.",
          price: 8000,
          category: "Bicycles",
          condition: "Good",
          images: ["https://picsum.photos/seed/bike2/400/300"],
        },
        {
          sellerId: user1.id,
          title: "Rechargeable LED Desk Lamp",
          description: "3 brightness levels, touch control. Built-in battery for power cuts.",
          price: 750,
          category: "Hostel Essentials",
          condition: "Like New",
          images: ["https://picsum.photos/seed/lamp/400/300"],
        },
        {
          sellerId: user2.id,
          title: "Laundry Basket & Drying Rack",
          description: "Foldable laundry basket and a compact cloth drying rack.",
          price: 900,
          category: "Hostel Essentials",
          condition: "Good",
          images: ["https://picsum.photos/seed/laundry/400/300"],
        },
      ];

      for (const item of demoItems) {
        await storage.createListing(item);
      }
      console.log(`Seeded ${demoItems.length} demo listings.`);
    }

    console.log("Database seeding completed successfully.");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
